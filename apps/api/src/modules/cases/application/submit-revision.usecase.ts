import { AppError } from "../../../shared/domain/app-error.js";
import { isFinalCaseStage } from "../domain/case.types.js";
import { validateDocumentWriteInputs } from "../../documents/application/validate-document-write.js";
import {
  findCaseByIdWithMembersAndCheckpoints as defaultFindCaseByIdWithMembersAndCheckpoints,
  submitCaseRevision as defaultSubmitCaseRevision,
} from "../infrastructure/persistence/case.repository.js";
import type { SubmitRevisionRequest } from "./cases.dto.js";

type SubmitRevisionDeps = {
  findCaseByIdWithMembersAndCheckpoints?: typeof defaultFindCaseByIdWithMembersAndCheckpoints;
  submitCaseRevision?: typeof defaultSubmitCaseRevision;
};

const defaultDeps = {
  findCaseByIdWithMembersAndCheckpoints: defaultFindCaseByIdWithMembersAndCheckpoints,
  submitCaseRevision: defaultSubmitCaseRevision,
};

function selectCheckpoint(
  caseRecord: any,
): { id: string; latest_version_no: number } | null {
  if (!caseRecord?.checkpoints?.length) return null;
  const checkpoints = caseRecord.checkpoints as Array<{
    id: string;
    checkpoint_code: string;
    latest_version_no: number;
    latest_assessment_no?: number;
  }>;
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

export async function submitRevisionUseCase(
  userId: string,
  caseId: string,
  body: SubmitRevisionRequest,
  deps: SubmitRevisionDeps = {},
) {
  const {
    findCaseByIdWithMembersAndCheckpoints,
    submitCaseRevision,
  } = {
    ...defaultDeps,
    ...deps,
  };

  const caseDetails = await findCaseByIdWithMembersAndCheckpoints(caseId);

  if (!caseDetails) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy dự án");
  }

  const isOwner = caseDetails.owner_auth_user_id === userId;
  const isMember = caseDetails.members.some((m: any) => m.auth_user_id === userId);
  if (!isOwner && !isMember) {
    throw new AppError(403, "FORBIDDEN", "Không có quyền nộp sửa đổi cho dự án này");
  }

  if (isFinalCaseStage(caseDetails.user_facing_stage)) {
    throw new AppError(
      400,
      "INVALID_CASE_STAGE",
      "Dự án đã ở trạng thái cuối, không thể nộp bản sửa đổi",
    );
  }

  const validStages = [
    "report_ready",
    "waiting_for_revision",
    "need_more_information",
  ];
  if (!validStages.includes(caseDetails.user_facing_stage)) {
    throw new AppError(
      400,
      "INVALID_CASE_STAGE",
      "Trạng thái hiện tại của dự án không cho phép nộp bản sửa đổi",
    );
  }

  const { change_summary, documents, remaining_blockers } = body;

  if (typeof change_summary !== "string" || change_summary.trim().length < 10) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Tóm tắt thay đổi tối thiểu phải 10 ký tự",
    );
  }

  const documentValidation = validateDocumentWriteInputs(documents || []);
  if (!documentValidation.ok) {
    throw new AppError(400, "VALIDATION_ERROR", documentValidation.error);
  }

  const checkpoint = selectCheckpoint(caseDetails);
  if (!checkpoint) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy thông tin checkpoint");
  }

  const nextVersion = checkpoint.latest_version_no + 1;

  return await submitCaseRevision({
    caseId,
    checkpointId: checkpoint.id,
    nextVersion,
    userId,
    changeSummary: change_summary,
    documents: documentValidation.inputs,
    remainingBlockers: remaining_blockers,
  });
}
