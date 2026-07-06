import { AppError } from "../../../shared/domain/app-error.js";
import { confirmPackage as defaultConfirmPackage } from "../infrastructure/persistence/payment.repository.js";
import { findCaseById as defaultFindCaseById } from "../../cases/infrastructure/persistence/case.repository.js";
import { auditLogger } from "../../../shared/infrastructure/audit-logger.js";

type ConfirmPackageDeps = {
  findCaseById?: typeof defaultFindCaseById;
  confirmPackage?: typeof defaultConfirmPackage;
};

const defaultDeps = {
  findCaseById: defaultFindCaseById,
  confirmPackage: defaultConfirmPackage,
};

export async function confirmPackageUseCase(
  userId: string,
  caseId: string,
  acceptProposed: boolean,
  deps: ConfirmPackageDeps = {}
) {
  const { findCaseById, confirmPackage } = { ...defaultDeps, ...deps };
  const timer = auditLogger.startTimer();

  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    throw new AppError(400, "VALIDATION_ERROR", "ID hồ sơ không hợp lệ");
  }

  const caseItem = await findCaseById(caseId);
  if (!caseItem) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy hồ sơ");
  }

  // Guard: case belongs to user
  if (caseItem.owner_auth_user_id !== userId) {
    throw new AppError(403, "FORBIDDEN", "Bạn không có quyền truy cập hồ sơ này");
  }

  // Guard: payment_status === awaiting_confirmation
  if (caseItem.payment_status !== "awaiting_confirmation") {
    throw new AppError(409, "INVALID_STATE", "Hồ sơ không ở trạng thái chờ xác nhận gói");
  }

  // Guard: user_facing_stage === triage_accepted
  if (caseItem.user_facing_stage !== "triage_accepted") {
    throw new AppError(409, "INVALID_STATE", "Trạng thái hồ sơ không hợp lệ");
  }

  const result = await confirmPackage(caseId, userId, {
    acceptProposed,
    proposedPackageId: caseItem.proposed_package_id,
    proposedLockedPrice: caseItem.proposed_locked_price,
  });

  auditLogger.log({
    operation: "payments.confirm_package",
    actor_id: userId,
    actor_role: "student",
    case_id: caseId,
    action: "confirmed",
    old_state: { payment_status: caseItem.payment_status },
    new_state: { payment_status: result.payment_status },
    duration_ms: timer(),
  });

  return result;
}
