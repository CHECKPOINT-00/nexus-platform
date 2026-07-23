import { AppError } from "../../../shared/domain/app-error.js";
import { findCaseByIdWithMembers as defaultFindCaseByIdWithMembers } from "../../cases/infrastructure/persistence/case.repository.js";
import { createUnpaidPayment as defaultCreateUnpaidPayment } from "../infrastructure/persistence/payment.repository.js";
import type { CreatePaymentRequest, CreatePaymentResponse } from "./payments.dto.js";

type CreatePaymentDeps = {
  findCaseByIdWithMembers?: typeof defaultFindCaseByIdWithMembers;
  createUnpaidPayment?: typeof defaultCreateUnpaidPayment;
};

const defaultDeps = {
  findCaseByIdWithMembers: defaultFindCaseByIdWithMembers,
  createUnpaidPayment: defaultCreateUnpaidPayment,
};

function getBankInfo(caseCode: string) {
  return {
    bankName: process.env["BANK_NAME"] || "MB Bank (Ngân hàng Quân Đội)",
    accountNumber: process.env["BANK_ACCOUNT_NUMBER"] || "0909090909",
    accountName: process.env["BANK_ACCOUNT_NAME"] || "NEXUS PLATFORM",
    transferContent: process.env["BANK_TRANSFER_CONTENT"]
      || `${caseCode} thanh toan`,
  };
}

export async function createPaymentUseCase(
  userId: string,
  body: CreatePaymentRequest,
  deps: CreatePaymentDeps = {},
): Promise<CreatePaymentResponse> {
  const { findCaseByIdWithMembers, createUnpaidPayment } = {
    ...defaultDeps,
    ...deps,
  };

  const caseObj = await findCaseByIdWithMembers(body.caseId);

  if (!caseObj) {
    throw new AppError(404, "CASE_NOT_FOUND", "Không tìm thấy dự án");
  }

  if (caseObj.owner_auth_user_id !== userId && !caseObj.members.some((m) => m.auth_user_id === userId)) {
    throw new AppError(403, "FORBIDDEN", "Bạn không có quyền tạo thanh toán cho dự án này");
  }

  if (!caseObj.package_id) {
    throw new AppError(400, "INVALID_PACKAGE", "Dự án chưa có gói dịch vụ hợp lệ");
  }

  const payment = await createUnpaidPayment({
    caseId: body.caseId,
    packageId: caseObj.package_id,
    amount: body.amount,
    metadataJson: body.metadataJson ?? null,
  });

  const bankInfo = getBankInfo(caseObj.case_code);

  return {
    paymentId: payment.id,
    bankInfo,
  };
}
