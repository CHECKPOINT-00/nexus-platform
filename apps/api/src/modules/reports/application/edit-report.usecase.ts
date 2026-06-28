import { AppError } from "../../../shared/domain/app-error.js";
import { findReportById, updateReportDraftContent } from "../infrastructure/persistence/report.repository.js";

export async function editReportUseCase(
  reportId: string,
  caseId: string,
  contentMd: string,
) {
  const dbReport = await findReportById(reportId);

  if (!dbReport) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy báo cáo");
  }

  if (dbReport.case_id !== caseId) {
    throw new AppError(403, "FORBIDDEN", "Không có quyền chỉnh sửa báo cáo này");
  }

  if (dbReport.status !== "draft") {
    throw new AppError(
      409,
      "INVALID_REPORT_STATUS",
      "Báo cáo đã được xuất bản hoặc đã chốt trạng thái, không thể chỉnh sửa",
    );
  }

  const trimmedContent = typeof contentMd === "string" ? contentMd.trim() : "";
  if (!trimmedContent) {
    throw new AppError(400, "VALIDATION_ERROR", "Nội dung báo cáo không được để trống");
  }

  return await updateReportDraftContent(reportId, trimmedContent);
}
