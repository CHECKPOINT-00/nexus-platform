import type { Context } from "hono";
import {
  requireCaseAccess,
  requireReportCaseAccess,
} from "../../../shared/infrastructure/authorization.js";
import { handleError, readJsonBody } from "../../../shared/infrastructure/http-helpers.js";
import { createDraftReportUseCase } from "../application/create-draft-report.usecase.js";
import { getDraftReportUseCase } from "../application/get-draft-report.usecase.js";
import { editDraftReportUseCase } from "../application/edit-draft-report.usecase.js";
import { publishReportUseCase } from "../application/publish-report.usecase.js";
import { supporterRequestMoreInfoUseCase } from "../application/supporter-request-more-info.usecase.js";
import { closeCaseUseCase } from "../application/close-case.usecase.js";

// ---------------------------------------------------------------------------
// POST /api/supporter/cases/:caseId/reports/draft — Create draft report
// ---------------------------------------------------------------------------

export async function createDraftReportHandler(c: Context) {
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
    const result = await createDraftReportUseCase(
      access.session.user.id,
      caseId,
    );
    return c.json(result, 201);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// GET /api/supporter/cases/:caseId/reports/draft — Get draft report
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// PUT /api/supporter/reports/:reportId — Edit draft report content
// ---------------------------------------------------------------------------

export async function editDraftReportHandler(c: Context) {
  const reportId = c.req.param("reportId") || "";
  const access = await requireReportCaseAccess(c, reportId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const body = await readJsonBody(c) as { contentMd?: string };
    const contentMd = body?.contentMd || "";
    const result = await editDraftReportUseCase(reportId, contentMd);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/supporter/reports/:reportId/publish — Publish draft report
// ---------------------------------------------------------------------------

export async function publishReportHandler(c: Context) {
  const reportId = c.req.param("reportId") || "";
  const access = await requireReportCaseAccess(c, reportId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const result = await publishReportUseCase(access.session.user.id, reportId);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/supporter/cases/:caseId/request-more-info
// ---------------------------------------------------------------------------

export async function supporterRequestMoreInfoHandler(c: Context) {
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
    const body = await readJsonBody(c) as { query?: string };
    const query = body?.query || "";
    const result = await supporterRequestMoreInfoUseCase(
      access.session.user.id,
      caseId,
      query,
    );
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/supporter/cases/:caseId/close — Close case
// ---------------------------------------------------------------------------

export async function closeCaseHandler(c: Context) {
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
    const result = await closeCaseUseCase(access.session.user.id, caseId);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}
