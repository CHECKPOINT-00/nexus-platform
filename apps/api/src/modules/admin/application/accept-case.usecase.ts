import { AppError } from "../../../shared/domain/app-error.js";
import { acceptCase as defaultAcceptCase, findCaseById as defaultFindCaseById } from "../../cases/infrastructure/persistence/case.repository.js";
import { auditLogger } from "../../../shared/infrastructure/audit-logger.js";
import { prisma } from "../../../db.js";

type AcceptCaseDeps = {
  findCaseById?: typeof defaultFindCaseById;
  acceptCase?: typeof defaultAcceptCase;
};

const defaultDeps = {
  findCaseById: defaultFindCaseById,
  acceptCase: defaultAcceptCase,
};

export async function acceptCaseUseCase(
  adminId: string,
  caseId: string,
  options?: {
    proposedPackageId?: string;
    packageChangeReason?: string;
  },
  deps: AcceptCaseDeps = {}
) {
  const { findCaseById, acceptCase } = { ...defaultDeps, ...deps };
  const timer = auditLogger.startTimer();
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    throw new AppError(400, "VALIDATION_ERROR", "ID dự án không hợp lệ");
  }

  const caseItem = await findCaseById(caseId);
  if (!caseItem) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  if (
    (caseItem.user_facing_stage === "under_review" || caseItem.user_facing_stage === "triage_accepted") &&
    caseItem.internal_status === "accepted_unassigned"
  ) {
    auditLogger.log({
      operation: "admin.accept_case",
      actor_id: adminId,
      actor_role: "admin",
      case_id: caseId,
      action: "no_op",
      old_state: { stage: caseItem.user_facing_stage, status: caseItem.internal_status },
      new_state: { stage: caseItem.user_facing_stage, status: caseItem.internal_status },
      duration_ms: timer(),
    });
    return caseItem;
  }

  let proposedLockedPrice: number | undefined;
  if (options?.proposedPackageId) {
    if (!options.packageChangeReason || options.packageChangeReason.trim().length < 10) {
      throw new AppError(400, "VALIDATION_ERROR", "Lý do thay đổi gói phải tối thiểu 10 ký tự");
    }
    const pkg = await prisma.servicePackage.findUnique({
      where: { id: options.proposedPackageId }
    });
    if (!pkg) {
      throw new AppError(404, "NOT_FOUND", "Gói dịch vụ đề xuất không tồn tại");
    }
    if (!pkg.is_active) {
      throw new AppError(400, "VALIDATION_ERROR", "Gói dịch vụ đề xuất không còn hoạt động");
    }
    proposedLockedPrice = pkg.price;
  }

  const result = await acceptCase(caseId, adminId, {
    proposedPackageId: options?.proposedPackageId,
    proposedLockedPrice,
    packageChangeReason: options?.packageChangeReason,
  });

  auditLogger.log({
    operation: "admin.accept_case",
    actor_id: adminId,
    actor_role: "admin",
    case_id: caseId,
    action: "accepted",
    old_state: { stage: caseItem.user_facing_stage, status: caseItem.internal_status },
    new_state: { stage: result.user_facing_stage, status: result.internal_status },
    duration_ms: timer(),
  });
  return result;
}
