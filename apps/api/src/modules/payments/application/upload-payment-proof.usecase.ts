import { AppError } from "../../../shared/domain/app-error.js";
import { fileStorageService } from "../infrastructure/file-storage.service.js";
import { createPaymentProof } from "../infrastructure/persistence/payment.repository.js";
import { normalizePaymentStatus } from "../domain/payment.types.js";
import { findCaseByIdWithAllRelations } from "../../cases/infrastructure/persistence/case.repository.js";
import type { UploadPaymentProofRequest } from "./payments.dto.js";

export async function uploadPaymentProofUseCase(
  userId: string,
  caseId: string,
  file: UploadPaymentProofRequest["file"],
) {
  const caseObj = await findCaseByIdWithAllRelations(caseId);

  if (!caseObj) {
    throw new AppError(404, "CASE_NOT_FOUND", "Không tìm thấy dự án");
  }

  const packageId = caseObj.package_id;
  if (!packageId || !caseObj.package) {
    throw new AppError(400, "INVALID_PACKAGE", "Dự án chưa có gói dịch vụ hợp lệ");
  }

  if (
    caseObj.payment_status &&
    caseObj.payment_status !== "unpaid" &&
    caseObj.payment_status !== "rejected"
  ) {
    throw new AppError(
      409,
      "INVALID_PAYMENT_STATUS",
      "Dự án đã có trạng thái thanh toán khác, không thể tạo minh chứng mới",
    );
  }

  const amount = caseObj.package.price;
  if (amount <= 0) {
    throw new AppError(
      400,
      "INVALID_AMOUNT",
      "Gói dịch vụ không hợp lệ để tạo minh chứng thanh toán (gói miễn phí)",
    );
  }

  // Save proof file to disk via infrastructure service
  const fileUrl = await fileStorageService.saveProofFile(file);

  try {
    const payment = await createPaymentProof({
      caseId,
      packageId,
      amount,
      proofFileUrl: fileUrl,
      userId,
    });

    return {
      ...payment,
      status: normalizePaymentStatus(payment.status),
    };
  } catch (dbError) {
    // If database transaction fails, clean up the file
    await fileStorageService.deleteFile(fileUrl);
    throw dbError;
  }
}
