import { AppError } from "../../../shared/domain/app-error.js";
import { findPaymentById, verifyPayment } from "../infrastructure/persistence/payment.repository.js";
import {
  isFinalPaymentStatus,
  isValidPaymentDecision,
  normalizePaymentStatus,
} from "../domain/payment.types.js";
import type { VerifyPaymentRequest } from "./payments.dto.js";

export async function verifyPaymentUseCase(
  adminId: string,
  paymentId: string,
  status: VerifyPaymentRequest["status"],
  rejectionReason: string,
) {
  if (!isValidPaymentDecision(status)) {
    throw new AppError(400, "INVALID_DECISION", "Trạng thái phê duyệt không hợp lệ");
  }

  if (status === "rejected" && rejectionReason.length < 10) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Lý do từ chối tối thiểu phải có 10 ký tự",
    );
  }

  const payment = await findPaymentById(paymentId);

  if (!payment) {
    throw new AppError(404, "PAYMENT_NOT_FOUND", "Không tìm thấy thông tin giao dịch");
  }

  if (isFinalPaymentStatus(payment.status)) {
    throw new AppError(
      409,
      "FINAL_STATUS",
      "Giao dịch đã ở trạng thái cuối, không thể cập nhật lại",
    );
  }

  const result = await verifyPayment({
    paymentId,
    caseId: payment.case_id,
    status,
    rejectionReason: status === "rejected" ? rejectionReason : null,
    adminId,
  });

  return {
    ...result,
    status: normalizePaymentStatus(result.status),
  };
}
