import { AppError } from "../../../shared/domain/app-error.js";
import { isFinalCaseStage } from "../domain/case.types.js";
import {
  assignCaseSupporter,
  findCaseById,
  findSupporterById,
} from "../infrastructure/persistence/case.repository.js";

export async function assignSupporterUseCase(
  adminId: string,
  caseId: string,
  supporterId: string,
) {
  const existingCase = await findCaseById(caseId);

  if (!existingCase) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  if (isFinalCaseStage(existingCase.user_facing_stage)) {
    throw new AppError(
      400,
      "INVALID_CASE_STAGE",
      "Dự án đã ở trạng thái cuối, không thể gán supporter",
    );
  }

  const unassign = !supporterId || supporterId.trim().length === 0;

  let supporterName = "";
  if (!unassign) {
    const supporterUser = await findSupporterById(supporterId);

    if (
      !supporterUser ||
      (supporterUser.role !== "supporter" && supporterUser.role !== "admin")
    ) {
      throw new AppError(400, "VALIDATION_ERROR", "Supporter được gán không hợp lệ");
    }
    supporterName = supporterUser.name;
  }

  const nextSupporterId = unassign ? null : supporterId;
  if (existingCase.assigned_supporter_auth_user_id === nextSupporterId) {
    return {
      id: existingCase.id,
      assigned_supporter_auth_user_id: existingCase.assigned_supporter_auth_user_id,
      internal_status: existingCase.internal_status,
    };
  }

  return await assignCaseSupporter(
    caseId,
    adminId,
    nextSupporterId,
    nextSupporterId ? "assigned" : "accepted_unassigned",
    unassign ? undefined : supporterName,
  );
}
