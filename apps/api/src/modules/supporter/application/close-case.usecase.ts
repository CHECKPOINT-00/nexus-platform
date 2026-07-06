import { AppError } from "../../../shared/domain/app-error.js";
import { requestCaseMoreInfo } from "../../cases/infrastructure/persistence/case.repository.js";
import { prisma } from "../../../db.js";

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

  return await requestCaseMoreInfo(
    caseId,
    userId,
    "case_closed",
    "",
    "closed",
    "done",
  );
}
