import { AppError } from "../../../shared/domain/app-error.js";
import { findCaseById, rejectCase } from "../../cases/infrastructure/persistence/case.repository.js";

export async function rejectCaseUseCase(
  adminId: string,
  caseId: string,
  reason: string,
) {
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    throw new AppError(400, "VALIDATION_ERROR", "ID dự án không hợp lệ");
  }

  if (reason.length < 10) {
    throw new AppError(400, "VALIDATION_ERROR", "Lý do từ chối tối thiểu phải 10 ký tự");
  }

  const caseItem = await findCaseById(caseId);
  if (!caseItem) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  if (
    caseItem.user_facing_stage === "rejected" &&
    caseItem.internal_status === "cancelled"
  ) {
    return caseItem;
  }

  return await rejectCase(caseId, adminId, reason);
}
