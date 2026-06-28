import { AppError } from "../../../shared/domain/app-error.js";
import { createCaseMessage } from "../infrastructure/persistence/case.repository.js";

export async function sendMessageUseCase(
  userId: string,
  userRole: string,
  caseId: string,
  content: string,
) {
  const trimmedContent = typeof content === "string" ? content.trim() : "";

  if (!trimmedContent) {
    throw new AppError(400, "VALIDATION_ERROR", "Nội dung tin nhắn không được để trống");
  }

  if (trimmedContent.length > 5000) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Độ dài tin nhắn vượt quá giới hạn cho phép (tối đa 5000 ký tự)",
    );
  }

  return await createCaseMessage({
    caseId,
    userId,
    userRole,
    content: trimmedContent,
  });
}
