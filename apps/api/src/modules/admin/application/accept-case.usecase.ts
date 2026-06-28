import { AppError } from "../../../shared/domain/app-error.js";
import { acceptCase, findCaseById } from "../../cases/infrastructure/persistence/case.repository.js";

export async function acceptCaseUseCase(adminId: string, caseId: string) {
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    throw new AppError(400, "VALIDATION_ERROR", "ID dự án không hợp lệ");
  }

  const caseItem = await findCaseById(caseId);
  if (!caseItem) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  if (
    caseItem.user_facing_stage === "under_review" &&
    caseItem.internal_status === "accepted_unassigned"
  ) {
    return caseItem;
  }

  return await acceptCase(caseId, adminId);
}
