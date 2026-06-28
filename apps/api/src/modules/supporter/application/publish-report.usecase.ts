import { AppError } from "../../../shared/domain/app-error.js";
import { findReportById, publishReport } from "../../reports/infrastructure/persistence/report.repository.js";

export async function publishReportUseCase(userId: string, reportId: string) {
  const report = await findReportById(reportId);

  if (!report) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy báo cáo");
  }

  if (report.status !== "draft") {
    throw new AppError(
      409,
      "INVALID_REPORT_STATUS",
      "Báo cáo đã được xuất bản hoặc đã chốt trạng thái",
    );
  }

  return await publishReport(reportId, report.case_id, userId);
}
