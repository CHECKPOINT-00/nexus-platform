import type { Context } from "hono";
import {
  requireCaseAccess,
  requireReportCaseAccess,
} from "../../../shared/infrastructure/authorization.js";
import {
  handleError,
  readJsonBody,
} from "../../../shared/infrastructure/http-helpers.js";
import { getDraftReportUseCase } from "../application/get-draft-report.usecase.js";
import { editReportUseCase } from "../application/edit-report.usecase.js";
import { approveReportUseCase } from "../application/approve-report.usecase.js";
import { getLatestReportUseCase } from "../application/get-latest-report.usecase.js";
import { findLatestApprovedReport } from "../infrastructure/persistence/report.repository.js";
import { generateReportPdfBuffer, makeDownloadSlug, resolveReportType } from "../infrastructure/pdf/pdfService.js";
import { AppError } from "../../../shared/domain/app-error.js";
import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { prisma } from "../../../db.js";
import { resolveRepoRoot } from "../../ai-engine/omp-audit.service.js";
import { uploadFile } from "../../../services/cloudinary.js";
import { upsertReportArtifactDocumentRecord } from "../../documents/infrastructure/persistence/document.repository.js";
import logger from "../../../shared/infrastructure/logger.js";
export async function getDraftReportHandler(c: Context) {
  const caseId = c.req.param("caseId") || "";
  const access = await requireCaseAccess(c, caseId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const result = await getDraftReportUseCase(caseId);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

export async function editReportHandler(c: Context) {
  const reportId = c.req.param("id") || "";
  const access = await requireReportCaseAccess(c, reportId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: false,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const body = (await readJsonBody(c)) as { contentMd?: string };
    const contentMd = body?.contentMd || "";
    const result = await editReportUseCase(
      reportId,
      access.caseRecord.id,
      contentMd,
    );
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

export async function approveReportHandler(c: Context) {
  const reportId = c.req.param("id") || "";
  const access = await requireReportCaseAccess(c, reportId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: false,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const result = await approveReportUseCase(access.session.user.id, reportId);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

export async function getLatestReportHandler(c: Context) {
  const caseId = c.req.param("caseId") || "";
  const access = await requireCaseAccess(c, caseId, {
    allowStudent: true,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const result = await getLatestReportUseCase(caseId);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

export async function downloadCaseReportPdfHandler(c: Context) {
  const caseId = c.req.param("caseId") || c.req.param("id") || "";
  const access = await requireCaseAccess(c, caseId, {
    allowStudent: true,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const report = await findLatestApprovedReport(caseId);
    if (!report) {
      throw new AppError(404, "REPORT_NOT_FOUND", "Chưa có báo cáo nào được xuất bản cho hồ sơ này");
    }

    let reportMarkdown = report.content_md;
    let overallScore = 65;
    let verdict = "PARTIALLY READY FOR REALITY CHECK";
    let categoryScores = {
      problemClarity: 65,
      marketViability: 60,
      businessModel: 65,
      competitiveMoat: 60,
      executionFeasibility: 70,
    };
    let parsed: Record<string, unknown> | null = null;

    try {
      const maybeParsed = JSON.parse(report.content_md) as Record<string, unknown>;
      if (maybeParsed && typeof maybeParsed === "object") {
        parsed = maybeParsed;
        if (typeof maybeParsed["reportMarkdown"] === "string") {
          reportMarkdown = maybeParsed["reportMarkdown"] as string;
        }
        if (typeof maybeParsed["overallScore"] === "number") {
          overallScore = maybeParsed["overallScore"] as number;
        }
        if (typeof maybeParsed["verdict"] === "string") {
          verdict = maybeParsed["verdict"] as string;
        }
        if (maybeParsed["categoryScores"] && typeof maybeParsed["categoryScores"] === "object") {
          categoryScores = maybeParsed["categoryScores"] as {
            problemClarity: number;
            marketViability: number;
            businessModel: number;
            competitiveMoat: number;
            executionFeasibility: number;
          };
        }
      }
    } catch {
      // Content is plain markdown
    }

    const rootDir = resolveRepoRoot();
    const storageDir = resolve(rootDir, "storage");

    // 1. Prioritize reading pure Markdown directly from disk output if available
    const diskMdPath = resolve(storageDir, "jobs", caseId, "output", "input_clarification_audit.md");
    if (existsSync(diskMdPath)) {
      try {
        const diskContent = readFileSync(diskMdPath, "utf-8");
        if (diskContent && diskContent.trim().length > 0) {
          reportMarkdown = diskContent;
        }
      } catch {
        // keep fallback
      }
    }

    // 2. Guard: if reportMarkdown still starts with '{', safely unwrap JSON
    if (reportMarkdown.trim().startsWith("{")) {
      try {
        const p = JSON.parse(reportMarkdown);
        if (p && typeof p.reportMarkdown === "string" && p.reportMarkdown.trim().length > 0) {
          reportMarkdown = p.reportMarkdown;
        }
      } catch {
        // keep as is
      }
    }

    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      select: { team_name: true, case_code: true },
    });
    // Prioritize actual project name (e.g. WAYVEE) over student team group name (e.g. Nexus)
    const projectName =
      (parsed && typeof parsed["projectName"] === "string" && parsed["projectName"].trim().length > 0 && parsed["projectName"]) ||
      caseRecord?.team_name ||
      caseRecord?.case_code ||
      "Dự án khởi nghiệp";

    const reportType = resolveReportType({
      reportType: (parsed && typeof parsed["reportType"] === "string" && parsed["reportType"]) || undefined,
      markdown: reportMarkdown,
    });

    const pdfBuffer = await generateReportPdfBuffer({
      markdown: reportMarkdown,
      meta: {
        projectName,
        jobId: caseId,
        agentName: "omp",
        createdAt: report.created_at.toISOString(),
        overallScore,
        verdict,
        categoryScores,
        reportType,
      },
      storageDir,
      force: true,
    });

    try {
      const uploadRes = await uploadFile(
        pdfBuffer,
        `nexus/reports/${caseId}`,
        "audit_report_a4",
        "raw",
        true,
      );
      if (uploadRes?.fileUrl && parsed) {
        parsed["pdfUrl"] = uploadRes.fileUrl;
        parsed["pdfPublicId"] = uploadRes.publicId;
        await prisma.report.update({
          where: { id: report.id },
          data: { content_md: JSON.stringify(parsed) },
        });
        await upsertReportArtifactDocumentRecord(
          caseId,
          report.checkpoint_id,
          report.lifecycle_unit_id,
          null,
          report.id,
          report.created_by,
          prisma,
          {
            fileUrl: uploadRes.fileUrl,
            downloadUrl: uploadRes.fileUrl,
            cloudinaryPublicId: uploadRes.publicId,
            originalName: `${makeDownloadSlug(projectName)}_audit_report.pdf`,
            extension: "pdf",
            mimeType: "application/pdf",
          },
        );
      }
    } catch (uploadErr) {
      logger.warn({ err: uploadErr, caseId }, "Cloudinary sync in download handler");
    }

    const slug = makeDownloadSlug(projectName);
    const filename = `${slug}_audit_report.pdf`;
    const safeFilename = filename.replace(/["\r\n\\]/g, "");

    c.header("Content-Type", "application/pdf");
    c.header("Content-Disposition", `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
    c.header("Content-Length", pdfBuffer.length.toString());
    c.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    return c.body(new Uint8Array(pdfBuffer));
  } catch (error: unknown) {
    return handleError(c, error);
  }
}
