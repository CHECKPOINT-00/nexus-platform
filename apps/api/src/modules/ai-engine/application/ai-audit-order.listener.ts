import { onEvent } from "../../../shared/infrastructure/event-bus.js";
import { DOMAIN_EVENTS, type DomainEvent } from "../../../shared/domain/domain-events.js";
import { runOmpAudit, type OmpAuditInputFile } from "../omp-audit.service.js";
import { prisma } from "../../../db.js";
import logger from "../../../shared/infrastructure/logger.js";
import { findFirstIntakeUnit } from "../../cases/infrastructure/persistence/case.repository.js";
import { findDocumentRecordsByCaseId } from "../../documents/infrastructure/persistence/document.repository.js";

/**
 * Initialize listener for ORDER_PAID domain event.
 * Automatically triggers OMP evaluation and publishes report.
 */
export function initAiAuditOrderListener(): void {
  onEvent(DOMAIN_EVENTS.ORDER_PAID, (event: DomainEvent) => {
    void handleOrderPaidForAiAudit(event).catch((error) => {
      logger.error({ eventId: event.eventId, err: error }, "ai-audit-order listener unhandled error");
    });
  });
}

async function handleOrderPaidForAiAudit(event: DomainEvent): Promise<void> {
  const payload = event.payload as Record<string, unknown> | null;
  if (!payload) return;

  const caseId = typeof payload["caseId"] === "string" ? (payload["caseId"] as string) : undefined;
  const orderId = typeof payload["orderId"] === "string" ? (payload["orderId"] as string) : undefined;

  if (!caseId) {
    logger.debug({ orderId }, "ORDER_PAID event has no associated caseId, skipping AI audit");
    return;
  }

  logger.info({ orderId, caseId }, "AI Audit Listener received ORDER_PAID. Starting audit workflow...");

  try {
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, case_code: true, team_name: true, internal_status: true, user_facing_stage: true },
    });

    if (!caseRecord) {
      logger.warn({ caseId }, "Case not found for AI audit");
      return;
    }

    // Mark case under review
    await prisma.case.update({
      where: { id: caseId },
      data: {
        user_facing_stage: "under_review",
        internal_status: "supporter_working",
      },
    });

    // Assemble input files
    const inputFiles: OmpAuditInputFile[] = [];

    // 1. Intake form data
    const intakeUnit = await findFirstIntakeUnit(caseId);
    if (intakeUnit?.content) {
      inputFiles.push({
        name: "intake_submission.md",
        content: intakeUnit.content,
      });
    }

    // 2. Uploaded documents (pitch decks, slides, reports)
    const documents = await findDocumentRecordsByCaseId(caseId);
    for (const doc of documents) {
      if (doc.download_url) {
        try {
          const res = await fetch(doc.download_url);
          if (res.ok) {
            const arrayBuf = await res.arrayBuffer();
            const fileName = doc.original_name || doc.canonical_name || `document_${doc.id}.${doc.extension || "bin"}`;
            inputFiles.push({
              name: fileName,
              content: Buffer.from(arrayBuf),
            });
          }
        } catch (fetchErr) {
          logger.warn({ docId: doc.id, fetchErr }, "Could not fetch document file for audit input");
        }
      }
    }

    // 3. Run OMP Audit
    const projectName = caseRecord.team_name || caseRecord.case_code || "Dự án khởi nghiệp";
    const auditResult = await runOmpAudit({
      caseId,
      projectName,
      inputFiles,
    });

    // 4. Save report into database
    const contentToStore = JSON.stringify({
      ...auditResult.reportJson,
      reportMarkdown: auditResult.reportMarkdown,
    });

    // Check if draft or existing report exists
    const existingReport = await prisma.report.findFirst({
      where: { case_id: caseId },
      select: { id: true },
    });

    if (existingReport) {
      await prisma.report.update({
        where: { id: existingReport.id },
        data: {
          content_md: contentToStore,
          status: "APPROVED",
          sent_at: new Date(),
        },
      });
    } else {
      await prisma.report.create({
        data: {
          case_id: caseId,
          checkpoint_id: "cp1",
          report_type: "input_clarification",
          content_md: contentToStore,
          status: "APPROVED",
          created_by: "omp_worker",
          sent_at: new Date(),
        },
      });
    }

    // 5. Update case stage to report_ready
    await prisma.case.update({
      where: { id: caseId },
      data: {
        user_facing_stage: "report_ready",
        internal_status: "report_ready_to_publish",
      },
    });

    logger.info({ caseId, orderId }, "AI Audit finished and report saved successfully!");
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.error({ caseId, errMsg }, "AI Audit workflow failed");
  }
}
