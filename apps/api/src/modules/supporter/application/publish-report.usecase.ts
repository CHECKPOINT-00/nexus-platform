import { approveReportUseCase } from "../../reports/application/approve-report.usecase.js";

export async function publishReportUseCase(userId: string, reportId: string) {
  return await approveReportUseCase(userId, reportId);
}
