import { existsSync } from "node:fs";
import { resolve } from "node:path";
import logger from "../../../shared/infrastructure/logger.js";
import { findFirstIntakeUnit } from "../../cases/infrastructure/persistence/case.repository.js";
import { findDocumentRecordsByCaseId } from "../../documents/infrastructure/persistence/document.repository.js";
import {
  dispatchOmpJob,
  cancelOmpJob,
  ompQueueEvents,
} from "../infrastructure/queue/omp-queue.js";
import {
  findCaseForAudit,
  updateCaseAuditStage,
  upsertAiJobQueued,
  updateAiJobStatus,
} from "../infrastructure/persistence/ai-job.repository.js";
import { jobStore } from "../infrastructure/persistence/job-store.repository.js";
import { prepareSandbox, resolveRepoRoot, type OmpAuditInputFile } from "../omp-audit.service.js";
import { finalizeOmpAuditResult } from "./omp-audit-finalizer.js";
import { getCaseAiAuditStatus } from "./omp-audit-status.js";

export { finalizeOmpAuditResult, getCaseAiAuditStatus };

let queueEventsInitialized = false;

/**
 * Initialize QueueEvents listener to handle background job completions.
 */
export function initOmpQueueListener(): void {
  if (queueEventsInitialized) return;
  queueEventsInitialized = true;

  ompQueueEvents.on("completed", async ({ jobId }) => {
    const caseId = jobId.startsWith("omp-") ? jobId.replace("omp-", "") : jobId;
    logger.info({ caseId }, "BullMQ OMP job completed event received. Finalizing report...");
    try {
      await finalizeOmpAuditResult(caseId);
    } catch (err) {
      logger.error({ caseId, err }, "Failed to finalize OMP audit result on completed event");
    }
  });

  ompQueueEvents.on("failed", async ({ jobId, failedReason }) => {
    const caseId = jobId.startsWith("omp-") ? jobId.replace("omp-", "") : jobId;
    logger.error({ caseId, failedReason }, "BullMQ OMP job failed event received");
    try {
      await updateAiJobStatus(caseId, "failed", { error: failedReason });
    } catch (err) {
      logger.warn({ caseId, err }, "Failed to update ai_jobs status to failed");
    }
  });

  logger.info("BullMQ OMP QueueEvents listener initialized");
}

/**
 * Prepare sandbox files and trigger OMP Audit via BullMQ Queue.
 */
export async function triggerOmpAuditForCase(caseId: string): Promise<void> {
  const caseRecord = await findCaseForAudit(caseId);

  if (!caseRecord) {
    throw new Error(`Case ${caseId} not found`);
  }

  // Update case stage to under_review via repository
  await updateCaseAuditStage(caseId, "under_review", "supporter_working");

  // Assemble input files
  const inputFiles: OmpAuditInputFile[] = [];
  const intakeUnit = await findFirstIntakeUnit(caseId);
  if (intakeUnit?.content) {
    inputFiles.push({
      name: "intake_submission.md",
      content: intakeUnit.content,
    });
  }

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
        logger.warn({ docId: doc.id, fetchErr }, "Could not fetch document for audit input");
      }
    }
  }

  const projectRoot = resolveRepoRoot();
  const jobDir = resolve(projectRoot, "storage", "jobs", caseId);
  prepareSandbox(jobDir, inputFiles);

  const sandboxStorage = "E:/Workspace/test-agent-sanbox-web/storage";
  if (existsSync(sandboxStorage)) {
    try {
      prepareSandbox(resolve(sandboxStorage, "jobs", caseId), inputFiles);
    } catch (err) {
      logger.warn({ caseId, err }, "Failed to mirror sandbox to test-agent-sanbox-web/storage");
    }
  }

  // Register in ai_jobs table via repository
  const startedAt = new Date().toISOString();
  await upsertAiJobQueued(caseId, {
    projectName: caseRecord.team_name || caseRecord.case_code,
    inputFilesCount: inputFiles.length,
    startedAt,
  });

  const projectName = caseRecord.team_name || caseRecord.case_code || "Dự án khởi nghiệp";
  const primaryFileName = inputFiles.find((f) => f.name.endsWith(".md") || f.name.endsWith(".pdf"))?.name || "document.md";

  // Dispatch job into BullMQ
  await dispatchOmpJob({
    jobId: caseId,
    documentPath: resolve(jobDir, "input", primaryFileName),
    documentOriginalName: primaryFileName,
    title: projectName,
    ompModel: process.env.OMP_MODEL || "cheapkeyai/gemini-3.8-flash",
    promptMode: "full",
  });

  // Sync into jobStore for real-time SSE logs
  jobStore.set({
    id: caseId,
    title: projectName,
    documentPath: resolve(jobDir, "input", primaryFileName),
    documentOriginalName: primaryFileName,
    requestedAgent: "omp",
    createdAt: startedAt,
    status: "queued",
    ompStatus: "queued",
    results: {},
    logs: [
      {
        timestamp: startedAt,
        agent: "system",
        message: `Khởi tạo job thẩm định ${caseId} cho case ${caseRecord.case_code}: ${projectName}`,
      },
    ],
  });

  logger.info({ caseId, projectName }, "OMP audit job dispatched to BullMQ queue");
}

/**
 * Cancel running/queued OMP audit job.
 */
export async function cancelOmpAuditForCase(caseId: string) {
  const queueResult = await cancelOmpJob(caseId);
  const cancelledJob = jobStore.cancel(caseId);
  await updateAiJobStatus(caseId, "cancelled", { cancelledAt: new Date().toISOString() });
  logger.warn({ caseId, queueResult }, "OMP audit cancelled by user");
  return { success: true, message: "Đã hủy tiến trình thẩm định OMP", job: cancelledJob };
}
