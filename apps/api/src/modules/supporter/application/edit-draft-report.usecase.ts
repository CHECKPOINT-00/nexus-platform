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

  const { findCaseById } = await import("../../cases/infrastructure/persistence/case.repository.js");
  const caseRecord = await findCaseById(report.case_id);
  if (!caseRecord) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case liên quan");
  }
  const { assertPaymentSatisfied } = await import("../../payments/domain/payment-gating.js");
  assertPaymentSatisfied(caseRecord);

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
