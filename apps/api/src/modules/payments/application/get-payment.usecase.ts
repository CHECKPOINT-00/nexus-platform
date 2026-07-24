import crypto from "node:crypto";
import { AppError } from "../../../shared/domain/app-error.js";
import { findPaymentById as defaultFindPaymentById } from "../infrastructure/persistence/payment.repository.js";
import type { GetPaymentResponse } from "./payments.dto.js";

type GetPaymentDeps = {
  findPaymentById?: typeof defaultFindPaymentById;
};

const defaultDeps = {
  findPaymentById: defaultFindPaymentById,
};

function getBankInfo(transferContent: string) {
  return {
    bankName: process.env["BANK_NAME"] || "MB Bank (Ngân hàng Quân Đội)",
    bankShortCode: process.env["BANK_SHORT_CODE"] || "MB",
    accountNumber: process.env["BANK_ACCOUNT_NUMBER"] || "0909090909",
    accountName: process.env["BANK_ACCOUNT_NAME"] || "NEXUS PLATFORM",
    transferContent,
  };
}

export async function getPaymentUseCase(
  userId: string,
  paymentId: string,
  deps: GetPaymentDeps = {},
): Promise<GetPaymentResponse> {
  const { findPaymentById } = { ...defaultDeps, ...deps };

  const payment = await findPaymentById(paymentId);

  if (!payment) {
    throw new AppError(404, "PAYMENT_NOT_FOUND", "Không tìm thấy thông tin giao dịch");
  }

  const caseRecord = (payment as any).case;
  const caseCode: string = caseRecord?.case_code ?? "";

  // Read transfer content from stored metadata; fallback to generated
  const SERVICE_PREFIX = "CR";
  const metadataJson = (payment as any).metadata_json as Record<string, unknown> | null;
  const transferContent =
    (metadataJson?.transfer_content as string) ||
    `${SERVICE_PREFIX}${caseCode.toUpperCase()}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

  const bankInfo = getBankInfo(transferContent);

  return {
    id: payment.id,
    case_id: payment.case_id,
    case_code: caseCode,
    package_id: payment.package_id!,
    amount: payment.amount,
    status: payment.status,
    proof_file_url: payment.proof_file_url ?? null,
    metadata_json: (payment as any).metadata_json ?? null,
    rejection_reason: payment.rejection_reason ?? null,
    verified_by_auth_user_id: payment.verified_by_auth_user_id ?? null,
    verified_at: payment.verified_at?.toISOString() ?? null,
    created_at: payment.created_at.toISOString(),
    bankInfo,
  };
}
