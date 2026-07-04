import { findLatestApprovedReport } from "../infrastructure/persistence/report.repository.js";

export async function getLatestReportUseCase(caseId: string) {
  return await findLatestApprovedReport(caseId);
}
