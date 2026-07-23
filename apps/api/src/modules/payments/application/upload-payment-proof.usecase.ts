import { AppError } from "../../../shared/domain/app-error.js";
import { fileStorageService } from "../infrastructure/file-storage.service.js";
import { createPaymentProof } from "../infrastructure/persistence/payment.repository.js";
import { normalizePaymentStatus } from "../domain/payment.types.js";
import { findCaseByIdWithAllRelations } from "../../cases/infrastructure/persistence/case.repository.js";
import { prisma } from "../../../db.js";
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

  // Gate on round-level only: find ALL pending rounds (already linked to a Payment from buy flow)
  const auditRounds = await prisma.auditRound.findMany({
    where: { case_id: caseId, status: "pending_payment", payment_id: { not: null } },
  });
  if (auditRounds.length === 0) {
    const awaitingRounds = await prisma.auditRound.findMany({
      where: { case_id: caseId, status: "awaiting_verification" },
    });
    if (awaitingRounds.length > 0) {
      throw new AppError(
        400,
        "ALREADY_SUBMITTED",
        "Minh chứng đã được gửi, đang chờ xác nhận từ Admin",
      );
    }
    throw new AppError(
      400,
      "NO_PENDING_ROUND",
      "Không tìm thấy round đang chờ thanh toán cho dự án này",
    );
  }

  // Read amount from the pending (unpaid) Payment record — not from locked_price
  const pendingPayment = await prisma.payment.findFirst({
    where: { case_id: caseId, status: "unpaid" },
    orderBy: { created_at: "desc" },
  });
  if (!pendingPayment) {
    throw new AppError(
      400,
      "NO_PENDING_PAYMENT",
      "Không tìm thấy thông tin thanh toán đang chờ",
    );
  }
  const amount = pendingPayment.amount;

  const proofFile = (await saveProofFile(file)) as SavedProofFile;

  try {
    const payment = await createPaymentProof({
      caseId,
      packageId,
      amount,
      proofFileUrl: proofFile.fileUrl,
      userId,
      auditRoundIds: auditRounds.map((r) => r.id),
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
