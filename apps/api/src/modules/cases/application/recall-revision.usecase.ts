import { AppError } from "../../../shared/domain/app-error.js";
import { prisma as defaultPrisma } from "../../../db.js";
import type { Prisma } from "@prisma/client";
import { deleteManagedDocumentFile as defaultDeleteManagedDocumentFile } from "../../documents/application/upload-managed-document-file.js";
import {
  findCaseByIdWithMembersAndCheckpoints as defaultFindCaseByIdWithMembersAndCheckpoints,
  findOpenRequestsForMoreInfo as defaultFindOpenRequestsForMoreInfo,
} from "../infrastructure/persistence/case.repository.js";

type CheckpointLike = {
  id: string;
  checkpoint_code: string;
  latest_version_no: number;
  latest_assessment_no?: number;
};

type CaseMemberLike = {
  auth_user_id: string;
};

type CaseWithCheckpointsLike = {
  current_checkpoint?: string | null;
  checkpoints?: CheckpointLike[];
};

function selectCheckpoint(
  caseRecord: CaseWithCheckpointsLike,
): { id: string; latest_version_no: number } | null {
  if (!caseRecord?.checkpoints?.length) return null;
  const checkpoints = caseRecord.checkpoints;
  if (caseRecord.current_checkpoint) {
    const matched = checkpoints.find(
      (cp) => cp.checkpoint_code === caseRecord.current_checkpoint,
    );
    if (matched) return matched;
  }

  let selected = checkpoints[0] ?? null;
  for (const checkpoint of checkpoints) {
    if (!selected || checkpoint.latest_version_no > selected.latest_version_no) {
      selected = checkpoint;
      continue;
    }

    if (
      checkpoint.latest_version_no === selected.latest_version_no &&
      (checkpoint.latest_assessment_no ?? 0) > (selected.latest_assessment_no ?? 0)
    ) {
      selected = checkpoint;
    }
  }

  return selected;
}

const defaultDeps = {
  findCaseByIdWithMembersAndCheckpoints: defaultFindCaseByIdWithMembersAndCheckpoints,
  findOpenRequestsForMoreInfo: defaultFindOpenRequestsForMoreInfo,
  deleteManagedDocumentFile: defaultDeleteManagedDocumentFile,
  prisma: defaultPrisma,
};

export async function recallRevisionUseCase(
  userId: string,
  caseId: string,
  deps: Partial<typeof defaultDeps> = {},
) {
  const {
    findCaseByIdWithMembersAndCheckpoints,
    findOpenRequestsForMoreInfo,
    deleteManagedDocumentFile,
    prisma,
  } = {
    ...defaultDeps,
    ...deps,
  };

  const caseDetails = await findCaseByIdWithMembersAndCheckpoints(caseId);

  if (!caseDetails) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy dự án");
  }

  const isOwner = caseDetails.owner_auth_user_id === userId;
  const isMember = caseDetails.members.some(
    (member: CaseMemberLike) => member.auth_user_id === userId,
  );
  if (!isOwner && !isMember) {
    throw new AppError(403, "FORBIDDEN", "Không có quyền thu hồi sửa đổi cho dự án này");
  }

  if (caseDetails.user_facing_stage !== "revision_submitted") {
    throw new AppError(
      400,
      "INVALID_CASE_STAGE",
      "Dự án không ở trạng thái chờ duyệt, không thể thu hồi",
    );
  }

  const checkpoint = selectCheckpoint(caseDetails);
  if (!checkpoint) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy thông tin checkpoint");
  }

  if (checkpoint.latest_version_no <= 1) {
    throw new AppError(
      400,
      "INVALID_CASE_STAGE",
      "Không thể thu hồi bản nộp khởi tạo (intake)",
    );
  }

  // Find the latest LifecycleUnit representing this version
  const latestUnit = await prisma.lifecycleUnit.findFirst({
    where: {
      case_id: caseId,
      checkpoint_id: checkpoint.id,
      unit_type: "version",
      version_no: checkpoint.latest_version_no,
    },
  });

  if (!latestUnit) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy thông tin bản nộp hiện tại");
  }

  // Check if supporter has started reviewing (any report linked to this unit)
  const reportsCount = await prisma.report.count({
    where: {
      lifecycle_unit_id: latestUnit.id,
    },
  });

  if (reportsCount > 0) {
    throw new AppError(
      400,
      "SUPPORTER_AUDITING",
      "Supporter đã bắt đầu thẩm định hoặc đã gửi báo cáo phản biện, không thể thu hồi bản nộp này",
    );
  }

  // Get associated document records
  const documentRecords = await prisma.documentRecord.findMany({
    where: {
      lifecycle_unit_id: latestUnit.id,
    },
  });

  // Extract public ids to delete from Cloudinary
  const publicIds = documentRecords
    .map((doc) => doc.cloudinary_public_id)
    .filter((id): id is string => !!id);

  // Delete from Cloudinary
  await Promise.all(publicIds.map((id) => deleteManagedDocumentFile(id)));

  // Determine stage to revert to
  const openRequests = await findOpenRequestsForMoreInfo(caseId);
  const nextStage = openRequests.length > 0 ? "need_more_information" : "waiting_for_revision";
  const nextInternalStatus = openRequests.length > 0 ? "waiting_user" : "report_ready_to_publish";

  // Perform database cleanup in a transaction
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Revert checkpoint version
    await tx.checkpoint.update({
      where: { id: checkpoint.id },
      data: { latest_version_no: checkpoint.latest_version_no - 1 },
    });

    // Revert case stage
    await tx.case.update({
      where: { id: caseId },
      data: {
        user_facing_stage: nextStage,
        internal_status: nextInternalStatus,
      },
    });

    // Delete DocumentRecords
    await tx.documentRecord.deleteMany({
      where: { lifecycle_unit_id: latestUnit.id },
    });

    // Delete LifecycleUnit
    await tx.lifecycleUnit.delete({
      where: { id: latestUnit.id },
    });

    // Log Event
    await tx.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "revision_recalled",
        actor_auth_user_id: userId,
        metadata_json: { version_no: checkpoint.latest_version_no },
      },
    });

    return { success: true };
  });
}
