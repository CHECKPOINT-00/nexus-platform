import type { Context } from "hono";
import {
  getSession,
  handleError,
  readJsonBody,
} from "../../../shared/infrastructure/http-helpers.js";
import { requireCaseAccess } from "../../../shared/infrastructure/authorization.js";
import { listPaymentsUseCase } from "../application/list-payments.usecase.js";
import { uploadPaymentProofUseCase } from "../application/upload-payment-proof.usecase.js";
import { verifyPaymentUseCase } from "../application/verify-payment.usecase.js";
import { confirmPackageUseCase } from "../application/confirm-package.usecase.js";
import { reactivatePaymentUseCase } from "../application/reactivate-payment.usecase.js";
import { expireOverduePaymentsUseCase } from "../application/expire-overdue-payments.usecase.js";
import { requestRefundUseCase } from "../application/request-refund.usecase.js";
import type { VerifyPaymentRequest } from "../application/payments.dto.js";

// ---------------------------------------------------------------------------
// GET /api/payments — Get all payments (Admin only)
// ---------------------------------------------------------------------------

export async function listPaymentsHandler(c: Context) {
  const session = await getSession(c);
  if (!session || session.user.role !== "admin") {
    return c.json({ code: "FORBIDDEN", message: "Không có quyền quản trị" }, 403);
  }

  try {
    const result = await listPaymentsUseCase();
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/payments/proof — Upload proof of payment (Student only)
// ---------------------------------------------------------------------------

export async function uploadPaymentProofHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  try {
    const body = await c.req.parseBody();
    const file = body["file"] as any;
    const caseId = ((body["case_id"] || body["caseId"]) as string) || "";
    const transferContent = (body["transfer_content"] || body["transferContent"]) as string | undefined;

    if (!file || !caseId) {
      return c.json({ code: "VALIDATION_ERROR", message: "Thiếu tệp minh chứng hoặc ID dự án" }, 400);
    }

    const access = await requireCaseAccess(c, caseId, {
      allowStudent: true,
      allowSupporter: false,
      allowAdmin: true,
    });
    if (!access.ok) {
      return access.response;
    }

    const result = await uploadPaymentProofUseCase(session.user.id, caseId, file, transferContent);
    return c.json(result, 201);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/payments/:id/verify — Approve / Reject payment (Admin only)
// ---------------------------------------------------------------------------

export async function verifyPaymentHandler(c: Context) {
  const session = await getSession(c);
  if (!session || session.user.role !== "admin") {
    return c.json({ code: "FORBIDDEN", message: "Không có quyền quản trị" }, 403);
  }

  const paymentId = c.req.param("id") || "";

  try {
    const body = await readJsonBody(c) as VerifyPaymentRequest;
    const status = body?.status || "";
    const rejection_reason = body?.rejection_reason || "";

    const result = await verifyPaymentUseCase(
      session.user.id,
      paymentId,
      status,
      rejection_reason,
    );
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/payments/cases/:id/confirm-package — Confirm package (Student/Admin)
// ---------------------------------------------------------------------------

export async function confirmPackageHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id") || "";

  try {
    const body = await readJsonBody(c) as { acceptProposed?: boolean } | null;
    const acceptProposed = body?.acceptProposed ?? false;

    const access = await requireCaseAccess(c, caseId, {
      allowStudent: true,
      allowSupporter: false,
      allowAdmin: true,
    });
    if (!access.ok) {
      return access.response;
    }

    const result = await confirmPackageUseCase(session.user.id, caseId, acceptProposed);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/payments/cases/:id/reactivate — Reactivate expired payment
// ---------------------------------------------------------------------------

export async function reactivatePaymentHandler(c: Context) {
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

    const result = await reactivatePaymentUseCase(session.user.id, caseId);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/payments/expire-overdue — Trigger sweep of overdue payments
// ---------------------------------------------------------------------------

export async function expireOverduePaymentsHandler(c: Context) {
  const session = await getSession(c);
  if (!session || session.user.role !== "admin") {
    return c.json({ code: "FORBIDDEN", message: "Không có quyền quản trị" }, 403);
  }

  try {
    const result = await expireOverduePaymentsUseCase(session.user.id);
    return c.json(result);
  } catch (error: any) {
    return handleError(c, error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/payments/cases/:id/refund — Student request refund
// ---------------------------------------------------------------------------

export async function requestRefundHandler(c: Context) {
  const session = await getSession(c);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id") || "";

  try {
    const body = await readJsonBody(c) as { reason?: string } | null;
    const reason = body?.reason || "";

    const access = await requireCaseAccess(c, caseId, {
      allowStudent: true,
      allowSupporter: false,
      allowAdmin: false,
    });
    if (!access.ok) {
      return access.response;
    }

    const result = await requestRefundUseCase(session.user.id, caseId, reason);
    return c.json(result, 201);
  } catch (error: any) {
    return handleError(c, error);
  }
}
