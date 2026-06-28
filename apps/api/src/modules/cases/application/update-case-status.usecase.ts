import { AppError } from "../../../shared/domain/app-error.js";
import {
  isFinalCaseStage,
  isValidCaseStage,
  isValidInternalStatus,
  isValidStageTransition,
} from "../domain/case.types.js";
import {
  findCaseById,
  updateCaseStatus,
  createCaseEvent,
} from "../infrastructure/persistence/case.repository.js";

export async function updateCaseStatusUseCase(
  userId: string,
  userRole: string,
  caseId: string,
  nextStage: unknown,
  nextStatus: unknown,
) {
  const caseObj = await findCaseById(caseId);

  if (!caseObj) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  if (
    userRole === "supporter" &&
    caseObj.assigned_supporter_auth_user_id !== userId
  ) {
    throw new AppError(403, "FORBIDDEN", "Không được phân công quản lý dự án này");
  }

  if (nextStage !== undefined && !isValidCaseStage(nextStage)) {
    throw new AppError(400, "VALIDATION_ERROR", "user_facing_stage không hợp lệ");
  }

  if (nextStatus !== undefined && !isValidInternalStatus(nextStatus)) {
    throw new AppError(400, "VALIDATION_ERROR", "internal_status không hợp lệ");
  }

  if (nextStage === undefined && nextStatus === undefined) {
    throw new AppError(400, "VALIDATION_ERROR", "Thiếu trạng thái cần cập nhật");
  }

  if (
    nextStage === caseObj.user_facing_stage &&
    nextStatus === caseObj.internal_status
  ) {
    return caseObj;
  }

  if (isFinalCaseStage(caseObj.user_facing_stage)) {
    throw new AppError(
      400,
      "INVALID_CASE_STAGE",
      "Dự án đã ở trạng thái cuối, không thể cập nhật trạng thái",
    );
  }

  if (
    nextStage !== undefined &&
    !isValidStageTransition(caseObj.user_facing_stage, nextStage)
  ) {
    throw new AppError(
      400,
      "INVALID_STAGE_TRANSITION",
      `Không thể chuyển trạng thái từ '${caseObj.user_facing_stage}' sang '${nextStage}'`,
    );
  }

  const updatedCase = await updateCaseStatus(
    caseId,
    userId,
    nextStage,
    nextStatus,
  );

  await createCaseEvent(caseId, userId, "status_updated", {
    user_facing_stage: nextStage,
    internal_status: nextStatus,
  });

  return updatedCase;
}
