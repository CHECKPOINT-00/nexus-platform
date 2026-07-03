import { AppError } from "../../../shared/domain/app-error.js";
import { fileStorageService } from "../infrastructure/file-storage.service.js";
import { createPaymentProof } from "../infrastructure/persistence/payment.repository.js";
import { normalizePaymentStatus } from "../domain/payment.types.js";
import { findCaseByIdWithAllRelations } from "../../cases/infrastructure/persistence/case.repository.js";
import { isValidPrice } from "../../cases/domain/case.types.js";
import type { UploadPaymentProofRequest } from "./payments.dto.js";

type SavedProofFile = {
  fileUrl: string;
  publicId: string;
  resourceType: string;
};

type UploadPaymentProofDeps = {
  findCaseByIdWithAllRelations?: typeof findCaseByIdWithAllRelations;
  saveProofFile?: typeof fileStorageService.saveProofFile;
  deleteFile?: typeof fileStorageService.deleteFile;
  createPaymentProof?: typeof createPaymentProof;
};

const defaultDeps = {
  findCaseByIdWithAllRelations,
  saveProofFile: fileStorageService.saveProofFile.bind(fileStorageService),
  deleteFile: fileStorageService.deleteFile.bind(fileStorageService),
  createPaymentProof,
};

export async function uploadPaymentProofUseCase(
  userId: string,
  caseId: string,
  file: UploadPaymentProofRequest["file"],
  deps: UploadPaymentProofDeps = {},
) {
  const {
    findCaseByIdWithAllRelations,
    saveProofFile,
    deleteFile,
    createPaymentProof,
  } = {
    ...defaultDeps,
    ...deps,
  };

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

  const lockedPrice = caseObj.locked_price;
  if (!isValidPrice(lockedPrice)) {
    throw new AppError(
      400,
      "INVALID_LOCKED_PRICE",
      "Dự án thiếu thông tin giá đã khóa hợp lệ để tạo minh chứng thanh toán",
    );
  }

  const amount = lockedPrice as number;
  if (amount === 0) {
    throw new AppError(
      400,
      "INVALID_AMOUNT",
      "Gói dịch vụ không hợp lệ để tạo minh chứng thanh toán (gói miễn phí)",
    );
  }

  const proofFile = (await saveProofFile(file)) as SavedProofFile;

  try {
    const payment = await createPaymentProof({
      caseId,
      packageId,
      amount,
      proofFileUrl: proofFile.fileUrl,
      userId,
    });

    return {
      ...payment,
      status: normalizePaymentStatus(payment.status),
    };
  } catch (dbError) {
    await deleteFile(proofFile.publicId);
    throw dbError;
  }
}
