import { AppError } from "../../../shared/domain/app-error.js";
import { requestCaseMoreInfo } from "../../cases/infrastructure/persistence/case.repository.js";
import { prisma } from "../../../db.js";

// Post-closure chat window in hours by package tier
const POST_CLOSURE_CHAT_HOURS_DEFAULT = 24;
const POST_CLOSURE_CHAT_HOURS_GOI2 = 48;

function getPostClosureChatHours(packageName: string): number {
  const name = packageName.toLowerCase();
  if (name.includes("gói 2") || name.includes("goi 2") || name.includes("package 2")) {
    return POST_CLOSURE_CHAT_HOURS_GOI2;
  }
  return POST_CLOSURE_CHAT_HOURS_DEFAULT;
}

export async function closeCaseUseCase(userId: string, caseId: string) {
  const currentCase = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      package: true,
    },
  });

  if (!currentCase) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  if (
    currentCase.user_facing_stage === "closed" &&
    currentCase.internal_status === "done"
  ) {
    return currentCase;
  }

  // Determine required number of supporter-uploaded documents based on package
  const packageName = currentCase.package?.name || "";
  const isGoi2 = packageName.toLowerCase().includes("gói 2") || packageName.toLowerCase().includes("goi 2");
  const requiredDocCount = isGoi2 ? 2 : 1;

  // Count documents uploaded by supporter or admin in this case
  const supporterUploadedDocsCount = await prisma.documentRecord.count({
    where: {
      case_id: caseId,
      OR: [
        { uploaded_by: { role: { in: ["supporter", "admin"] } } },
        { doc_type: { in: ["supporter_output", "supporter_attachment"] } },
      ],
    },
  });

  if (supporterUploadedDocsCount < requiredDocCount) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      `Bạn cần tải lên tối thiểu ${requiredDocCount} tài liệu hỗ trợ để đóng case này (Hiện tại mới tải lên: ${supporterUploadedDocsCount} tài liệu)`
    );
  }

  // Set post-closure chat window
  const chatHours = getPostClosureChatHours(packageName);
  const postClosureChatExpiresAt = new Date(Date.now() + chatHours * 60 * 60 * 1000);

  await prisma.case.update({
    where: { id: caseId },
    data: { post_closure_chat_expires_at: postClosureChatExpiresAt },
  });

  return await requestCaseMoreInfo(
    caseId,
    userId,
    "case_closed",
    "",
    "closed",
    "done",
  );
}
