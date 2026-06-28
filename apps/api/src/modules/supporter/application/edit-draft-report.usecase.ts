import { AppError } from "../../../shared/domain/app-error.js";
import { findReportById, updateReportDraftContent } from "../../reports/infrastructure/persistence/report.repository.js";

export async function editDraftReportUseCase(
  reportId: string,
  contentMd: string,
) {
  const report = await findReportById(reportId);

  if (!report) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy báo cáo");
  }

  if (report.status !== "draft") {
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
