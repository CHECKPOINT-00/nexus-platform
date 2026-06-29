import { findDraftReportByCaseId } from "../infrastructure/persistence/report.repository.js";
import { parseReportDraftContent } from "../domain/report.types.js";

export async function getDraftReportUseCase(caseId: string) {
  const report = await findDraftReportByCaseId(caseId);

  if (!report) {
    return null;
  }

  const parsedContent = parseReportDraftContent(report.content_md);
  return parsedContent ? { ...report, content_md: JSON.stringify(parsedContent) } : report;
}
