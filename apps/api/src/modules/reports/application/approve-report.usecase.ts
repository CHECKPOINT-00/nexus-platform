import { AppError } from "../../../shared/domain/app-error.js";
import { findReportById, publishReport } from "../infrastructure/persistence/report.repository.js";
import { auditLogger } from "../../../shared/infrastructure/audit-logger.js";

export async function approveReportUseCase(userId: string, reportId: string) {
  const timer = auditLogger.startTimer();
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
    auditLogger.warn({
      operation: "report.approve",
      actor_id: userId,
      case_id: report.case_id,
      resource_type: "report",
      resource_id: reportId,
      action: "invalid_status",
      old_state: { status: report.status },
      error_code: "INVALID_REPORT_STATUS",
      duration_ms: timer(),
    });
    throw new AppError(
      409,
      "INVALID_REPORT_STATUS",
      "Báo cáo đã được xuất bản hoặc đã chốt trạng thái",
    );
  }

  const result = await publishReport(reportId, report.case_id, userId);
  auditLogger.log({
    operation: "report.approve",
    actor_id: userId,
    case_id: report.case_id,
    resource_type: "report",
    resource_id: reportId,
    action: "published",
    old_state: { status: "draft" },
    new_state: { status: result.status },
    duration_ms: timer(),
  });
  return result;
}
