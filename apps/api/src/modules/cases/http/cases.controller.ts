import type { Context } from "hono";
import {
  getSession,
  readJsonBody,
  handleError,
} from "../../../shared/infrastructure/http-helpers.js";
import { requireCaseAccess } from "../../../shared/infrastructure/authorization.js";
import { listCasesUseCase } from "../application/list-cases.usecase.js";
import { createCaseUseCase } from "../application/create-case.usecase.js";
import { listSupportersUseCase } from "../application/list-supporters.usecase.js";
import { getCaseDetailUseCase, getCaseDocumentWorkspaceUseCase } from "../application/get-case-detail.usecase.js";
import {
  submitRevisionUseCase,
  submitRevisionUploadUseCase,
  submitSupporterOutputUploadUseCase,
  submitExternalFeedbackUploadUseCase,
} from "../application/submit-revision.usecase.js";
import { assignSupporterUseCase } from "../application/assign-supporter.usecase.js";
import { updateCaseStatusUseCase } from "../application/update-case-status.usecase.js";
import { listMessagesUseCase } from "../application/list-messages.usecase.js";
import { sendMessageUseCase } from "../application/send-message.usecase.js";
import { updateCaseSettingsUseCase } from "../application/update-case-settings.usecase.js";
import { deleteCaseUseCase } from "../application/delete-case.usecase.js";
import { cancelCaseUseCase } from "../application/cancel-case.usecase.js";
import { recallRevisionUseCase } from "../application/recall-revision.usecase.js";
import { listDocumentTypesUseCase } from "../../documents/application/list-document-types.usecase.js";
import { uploadManagedDocumentFile, deleteManagedDocumentFile } from "../../documents/application/upload-managed-document-file.js";
import type {
  CreateCaseRequest,
  SubmitRevisionRequest,
  SubmitRevisionUploadRequest,
  SupporterOutputUploadRequest,
  ExternalFeedbackUploadRequest,
  UpdateCaseSettingsRequest,
} from "../application/cases.dto.js";

// ---------------------------------------------------------------------------
// GET /api/cases — List cases based on role
// ---------------------------------------------------------------------------

export async function listCasesHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  try {
    const result = await listCasesUseCase(session);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/cases — Create a new case (Intake submission)
// ---------------------------------------------------------------------------

export async function createCaseHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  try {
    const body = await readJsonBody(c) as CreateCaseRequest;
    const result = await createCaseUseCase(session.user.id, body, {
      skipSpamCheck: session.user.role === "admin",
    });
    return c.json(result, 201);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// GET /api/cases/supporters — List supporters/admins (Admin only)
// ---------------------------------------------------------------------------

export async function listSupportersHandler(c: Context) {
  const session = await getSession(c);
  if (!session || session.user.role !== "admin") {
    return c.json({ code: "FORBIDDEN", message: "Không có quyền quản trị" }, 403);
  }

  try {
    const result = await listSupportersUseCase();
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// GET /api/cases/:id — Get case details (Normalized shape for Workspace)
// ---------------------------------------------------------------------------

export async function getCaseDetailHandler(c: Context) {
  const caseId = c.req.param("id") || "";
  const access = await requireCaseAccess(c, caseId);
  if (!access.ok) {
    return access.response;
  }

  try {
    const result = await getCaseDetailUseCase(
      access.session.user.id,
      (access.session.user as any).role,
      caseId,
    );
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}
// ---------------------------------------------------------------------------
// GET /api/cases/:id/documents — Document workspace only
// ---------------------------------------------------------------------------

export async function getCaseDocumentsHandler(c: Context) {
  const caseId = c.req.param("id") || "";
  const access = await requireCaseAccess(c, caseId);
  if (!access.ok) {
    return access.response;
  }

  try {
    // M3 fix: use lightweight usecase that only loads document workspace data
    const result = await getCaseDocumentWorkspaceUseCase(caseId);
    return c.json({ document_workspace: result.document_workspace });
  } catch (error: any) {
    return handleError(c, error);
  }
}



// ---------------------------------------------------------------------------
// GET /api/cases/document-types — Active document type options for UI
// ---------------------------------------------------------------------------

export async function listDocumentTypesHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  try {
    const flow = c.req.query("flow");
    const unit_scope = c.req.query("unit_scope");
    const result = await listDocumentTypesUseCase({ flow, unit_scope });
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/cases/uploads/managed-document — Shared post-intake upload helper
// ---------------------------------------------------------------------------

export async function uploadManagedDocumentHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  try {
    const body = await c.req.parseBody();
    const file = body["file"] as any;

    if (!file) {
      return c.json({ code: "VALIDATION_ERROR", message: "Thiếu tệp tải lên" }, 400);
    }

    const result = await uploadManagedDocumentFile(file);
    return c.json(result, 201);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/cases/:id/revisions — Student submits a revision
// ---------------------------------------------------------------------------

export async function submitRevisionHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id") || "";

  try {
    const body = await readJsonBody(c) as SubmitRevisionRequest;
    const result = await submitRevisionUseCase(session.user.id, caseId, body);
    return c.json(result, 201);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/cases/:id/revisions/upload — Student submits uploaded revision docs
// ---------------------------------------------------------------------------

function collectUploadedPublicIds(documents: Array<{ cloudinary_public_id?: string }> | undefined) {
  const uploadedPublicIds: string[] = [];
  for (const document of documents || []) {
    if (document?.cloudinary_public_id) {
      uploadedPublicIds.push(document.cloudinary_public_id);
    }
  }
  return uploadedPublicIds;
}

export async function submitRevisionUploadHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id") || "";
  let uploadedPublicIds: string[] = [];

  try {
    const body = await readJsonBody(c) as SubmitRevisionUploadRequest;
    uploadedPublicIds = collectUploadedPublicIds(body?.documents);
    const result = await submitRevisionUploadUseCase(session.user.id, caseId, body);
    return c.json(result, 201);
  } catch (error: any) {
    await Promise.all(uploadedPublicIds.map((publicId) => deleteManagedDocumentFile(publicId)));
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/cases/:id/revisions/recall — Student recalls submitted revision
// ---------------------------------------------------------------------------

export async function recallRevisionHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id") || "";

  try {
    const result = await recallRevisionUseCase(session.user.id, caseId);
    return c.json(result, 200);
  } catch (error: any) {
    return handleError(c, error);
  }
}

export async function submitSupporterOutputUploadHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id") || "";
  let uploadedPublicIds: string[] = [];

  try {
    const body = await readJsonBody(c) as SupporterOutputUploadRequest;
    uploadedPublicIds = collectUploadedPublicIds(body?.documents);
    const result = await submitSupporterOutputUploadUseCase(session.user.id, caseId, body);
    return c.json(result, 201);
  } catch (error: any) {
    await Promise.all(uploadedPublicIds.map((publicId) => deleteManagedDocumentFile(publicId)));
    return handleError(c, error);
  }
}

export async function submitExternalFeedbackUploadHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id") || "";
  let uploadedPublicIds: string[] = [];

  try {
    const body = await readJsonBody(c) as ExternalFeedbackUploadRequest;
    uploadedPublicIds = collectUploadedPublicIds(body?.documents);
    const result = await submitExternalFeedbackUploadUseCase(session.user.id, caseId, body);
    return c.json(result, 201);
  } catch (error: any) {
    await Promise.all(uploadedPublicIds.map((publicId) => deleteManagedDocumentFile(publicId)));
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/cases/:id/assign — Assign supporter (Admin only)
// ---------------------------------------------------------------------------

export async function assignSupporterHandler(c: Context) {
  const session = await getSession(c);
  if (!session || session.user.role !== "admin") {
    return c.json({ code: "FORBIDDEN", message: "Không có quyền quản trị" }, 403);
  }

  const caseId = c.req.param("id") || "";

  try {
    const body = await readJsonBody(c) as { supporter_id?: string };
    const supporterId = body?.supporter_id || "";
    const result = await assignSupporterUseCase(
      session.user.id,
      caseId,
      supporterId,
    );
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/cases/:id/status — Update stage/status (Admin/Supporter only)
// ---------------------------------------------------------------------------

export async function updateCaseStatusHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const role = (session.user as any).role;
  if (role !== "admin" && role !== "supporter") {
    return c.json({ code: "FORBIDDEN", message: "Không có quyền cập nhật trạng thái" }, 403);
  }

  const caseId = c.req.param("id") || "";

  try {
    const body = await readJsonBody(c) as { user_facing_stage?: string; internal_status?: string };
    const nextStage = body?.user_facing_stage;
    const nextStatus = body?.internal_status;

    const result = await updateCaseStatusUseCase(
      session.user.id,
      role,
      caseId,
      nextStage,
      nextStatus,
    );
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// GET /api/cases/:id/messages — Fetch messages
// ---------------------------------------------------------------------------

export async function listMessagesHandler(c: Context) {
  const caseId = c.req.param("id") || "";
  const access = await requireCaseAccess(c, caseId);
  if (!access.ok) {
    return access.response;
  }

  try {
    const result = await listMessagesUseCase(caseId);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/cases/:id/messages — Send message
// ---------------------------------------------------------------------------

export async function sendMessageHandler(c: Context) {
  const caseId = c.req.param("id") || "";
  const access = await requireCaseAccess(c, caseId);
  if (!access.ok) {
    return access.response;
  }

  try {
    const body = await readJsonBody(c) as { content?: string };
    const result = await sendMessageUseCase(
      access.session.user.id,
      (access.session.user as any).role,
      caseId,
      body?.content || "",
    );
    return c.json(result, 201);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/cases/:id/settings — Update case settings
// ---------------------------------------------------------------------------

export async function updateCaseSettingsHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id") || "";

  try {
    const body = await readJsonBody(c) as UpdateCaseSettingsRequest;
    const result = await updateCaseSettingsUseCase(
      session.user.id,
      (session.user as any).role,
      caseId,
      body,
    );
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/cases/:id — Delete a case (Before admin approval)
// ---------------------------------------------------------------------------

export async function deleteCaseHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id") || "";

  try {
    const result = await deleteCaseUseCase(
      session.user.id,
      (session.user as any).role,
      caseId,
    );
    return c.json({ success: true, message: "Đã xóa dự án thành công", data: result });
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/cases/:id/cancel — Student cancel case
// ---------------------------------------------------------------------------

export async function cancelCaseHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id") || "";

  try {
    const access = await requireCaseAccess(c, caseId, {
      allowStudent: true,
      allowSupporter: false,
      allowAdmin: true,
    });
    if (!access.ok) {
      return access.response;
    }

    const result = await cancelCaseUseCase(session.user.id, caseId);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}
