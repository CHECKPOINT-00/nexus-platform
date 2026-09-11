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
import { generateReportPdfBuffer, makeDownloadSlug } from "../infrastructure/pdf/pdfService.js";
import { AppError } from "../../../shared/domain/app-error.js";
import { resolve } from "node:path";
import { prisma } from "../../../db.js";
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

    try {
      const parsed = JSON.parse(report.content_md) as Record<string, unknown>;
      if (parsed && typeof parsed === "object") {
        if (typeof parsed["reportMarkdown"] === "string") {
          reportMarkdown = parsed["reportMarkdown"] as string;
        }
        if (typeof parsed["overallScore"] === "number") {
          overallScore = parsed["overallScore"] as number;
        }
        if (typeof parsed["verdict"] === "string") {
          verdict = parsed["verdict"] as string;
        }
        if (parsed["categoryScores"] && typeof parsed["categoryScores"] === "object") {
          categoryScores = parsed["categoryScores"] as {
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

    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      select: { team_name: true, case_code: true },
    });
    const projectName = caseRecord?.team_name || caseRecord?.case_code || "Dự án khởi nghiệp";
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
        reportType: "input_clarification",
      },
      storageDir: resolve(process.cwd(), "storage"),
      force: false,
    });

    const slug = makeDownloadSlug(projectName);
    c.header("Content-Type", "application/pdf");
    c.header("Content-Disposition", `attachment; filename="${slug}_audit_report.pdf"`);
    return c.body(new Uint8Array(pdfBuffer));
  } catch (error: unknown) {
    return handleError(c, error);
  }
}
