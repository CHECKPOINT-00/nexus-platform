import { AppError } from "../../../shared/domain/app-error.js";
import {
  findCaseByIdWithMembers,
  deleteCase,
} from "../infrastructure/persistence/case.repository.js";

export async function deleteCaseUseCase(
  userId: string,
  userRole: string,
  caseId: string,
) {
  const existingCase = await findCaseByIdWithMembers(caseId);

  if (!existingCase) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  const isOwner = existingCase.owner_auth_user_id === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError(403, "FORBIDDEN", "Không có quyền xóa dự án này");
  }

  if (existingCase.user_facing_stage !== "submitted") {
    throw new AppError(
      400,
      "INVALID_CASE_STAGE",
      "Dự án đã được duyệt hoặc đang xử lý, không thể xóa",
    );
  }

  return await deleteCase(caseId);
}
