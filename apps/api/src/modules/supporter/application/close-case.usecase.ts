import { AppError } from "../../../shared/domain/app-error.js";
import { findCaseById, requestCaseMoreInfo } from "../../cases/infrastructure/persistence/case.repository.js";

export async function closeCaseUseCase(userId: string, caseId: string) {
  const currentCase = await findCaseById(caseId);

  if (!currentCase) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  if (
    currentCase.user_facing_stage === "closed" &&
    currentCase.internal_status === "done"
  ) {
    return currentCase;
  }

  return await requestCaseMoreInfo(
    caseId,
    userId,
    "case_closed",
    "",
    "closed",
    "done",
  );
}
