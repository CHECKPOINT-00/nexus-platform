import { existsSync, readFileSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
import logger from "../../../shared/infrastructure/logger.js";
import { generateReportPdfBuffer, makeDownloadSlug } from "../../reports/infrastructure/pdf/pdfService.js";
import {
  findCaseDetailForPdf,
  updateAiJobStatus,
  updateCaseAuditStage,
} from "../infrastructure/persistence/ai-job.repository.js";
import { saveOmpAuditReport } from "../../reports/infrastructure/persistence/report.repository.js";
import { upsertReportArtifactDocumentRecord } from "../../documents/infrastructure/persistence/document.repository.js";
import { uploadFile } from "../../../services/cloudinary.js";
import { resolveRepoRoot } from "../omp-audit.service.js";
import { prisma } from "../../../db.js";

/**
 * Read OMP outputs from sandbox disk, compile Typst PDF, and persist report in Postgres.
 */
export async function finalizeOmpAuditResult(caseId: string): Promise<boolean> {
  const projectRoot = resolveRepoRoot();
  const jobDir = resolve(projectRoot, "storage", "jobs", caseId);
  const outputDir = resolve(jobDir, "output");
  mkdirSync(outputDir, { recursive: true });

  const candidateDirs = [
    jobDir,
    "E:/Workspace/test-agent-sanbox-web/storage/jobs/" + caseId,
    resolve(projectRoot, "apps", "api", "storage", "jobs", caseId),
  ];

  for (const dir of candidateDirs) {
    if (dir === jobDir) continue;
    const candidateReportJson = resolve(dir, "output", "report.json");
    const candidateReportMd = resolve(dir, "output", "input_clarification_audit.md");
    if (existsSync(candidateReportJson) && existsSync(candidateReportMd)) {
      if (!existsSync(resolve(outputDir, "report.json"))) {
        copyFileSync(candidateReportJson, resolve(outputDir, "report.json"));
      }
      if (!existsSync(resolve(outputDir, "input_clarification_audit.md"))) {
        copyFileSync(candidateReportMd, resolve(outputDir, "input_clarification_audit.md"));
      }
      const candidateTriad = resolve(dir, "output", "triad_handoff_packet.md");
      if (existsSync(candidateTriad) && !existsSync(resolve(outputDir, "triad_handoff_packet.md"))) {
        copyFileSync(candidateTriad, resolve(outputDir, "triad_handoff_packet.md"));
      }
      break;
    }
  }

  const reportJsonPath = resolve(outputDir, "report.json");
  const reportMdPath = resolve(outputDir, "input_clarification_audit.md");

  if (!existsSync(reportJsonPath) || !existsSync(reportMdPath)) {
    logger.error({ caseId }, "OMP output files missing, cannot finalize report");
    return false;
  }

  const reportJsonRaw = readFileSync(reportJsonPath, "utf-8");
  const reportMd = readFileSync(reportMdPath, "utf-8");
  const reportJson = JSON.parse(reportJsonRaw) as Record<string, any>;

  // Compile Typst PDF
  const caseRecord = await findCaseDetailForPdf(caseId);
  const projectName = reportJson.projectName || caseRecord?.team_name || caseRecord?.case_code || "Dự án khởi nghiệp";

  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await generateReportPdfBuffer({
      markdown: reportMd,
      meta: {
        projectName,
        jobId: caseId,
        agentName: "omp",
        createdAt: new Date().toISOString(),
        overallScore: typeof reportJson.overallScore === "number" ? reportJson.overallScore : 70,
        verdict: typeof reportJson.verdict === "string" ? reportJson.verdict : "READY FOR REALITY CHECK",
        categoryScores: reportJson.categoryScores || {
          problemClarity: 70,
          marketViability: 70,
          businessModel: 70,
          competitiveMoat: 70,
          executionFeasibility: 70,
        },
      },
      storageDir: resolve(projectRoot, "storage"),
      force: true,
    });
  } catch (pdfErr) {
    logger.error({ caseId, pdfErr }, "Failed to generate Typst PDF during finalization");
  }

  // Upload PDF to Cloudinary if generated
  let pdfUrl: string | null = null;
  let pdfPublicId: string | null = null;
  if (pdfBuffer) {
    try {
      const uploadRes = await uploadFile(
        pdfBuffer,
        `nexus/reports/${caseId}`,
        "audit_report_a4",
        "raw",
      );
      if (uploadRes?.fileUrl) {
        pdfUrl = uploadRes.fileUrl;
        pdfPublicId = uploadRes.publicId;
        logger.info({ caseId, pdfUrl }, "Uploaded A4 PDF report to Cloudinary");
      }
    } catch (uploadErr) {
      logger.warn({ caseId, uploadErr }, "Cloudinary upload failed during finalization, continuing with local PDF");
    }
  }

  const metadataJson: Record<string, unknown> = {
    ...reportJson,
    pdfUrl,
    pdfPublicId,
  };
  delete metadataJson.reportMarkdown;

  // Save report into Postgres via repository (pure Markdown in content_md, structured stats in metadata_json)
  const savedReport = await saveOmpAuditReport(caseId, reportMd, metadataJson);

  // Sync artifact record so it appears in "Tài liệu" tab
  try {
    const slug = makeDownloadSlug(projectName);
    await upsertReportArtifactDocumentRecord(
      caseId,
      savedReport.checkpoint_id,
      savedReport.lifecycle_unit_id,
      null,
      savedReport.id,
      savedReport.created_by,
      prisma,
      {
        fileUrl: pdfUrl,
        downloadUrl: pdfUrl,
        cloudinaryPublicId: pdfPublicId,
        originalName: `${slug}_audit_report.pdf`,
        extension: "pdf",
        mimeType: "application/pdf",
      },
    );
  } catch (docErr) {
    logger.warn({ caseId, docErr }, "Failed to upsert report artifact document record");
  }

  // Update AI Job status via repository
  await updateAiJobStatus(caseId, "completed", reportJson);

  // Transition case to report_ready via repository
  await updateCaseAuditStage(caseId, "report_ready", "report_ready_to_publish");

  logger.info({ caseId }, "OMP audit finalized successfully and report saved to database!");
  return true;
}
