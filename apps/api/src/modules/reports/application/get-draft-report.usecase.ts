import { findDraftReportByCaseId } from "../infrastructure/persistence/report.repository.js";

export async function getDraftReportUseCase(caseId: string) {
  return await findDraftReportByCaseId(caseId);
}
