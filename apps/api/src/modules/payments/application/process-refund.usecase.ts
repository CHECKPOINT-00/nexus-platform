import { AppError } from "../../../shared/domain/app-error.js";
import { prisma } from "../../../db.js";
import { fileStorageService } from "../infrastructure/file-storage.service.js";
import { findRefundById } from "../infrastructure/persistence/refund.repository.js";
import { auditLogger } from "../../../shared/infrastructure/audit-logger.js";

type ProcessRefundRequest = {
  decision: "approve" | "reject" | "complete";
  rejectionReason?: string;
  bankTransferRef?: string;
  proofFile?: {
    name: string;
    size: number;
    arrayBuffer: () => Promise<ArrayBuffer>;
  };
};

export async function processRefundUseCase(
  adminId: string,
  refundId: string,
  body: ProcessRefundRequest
) {
  const timer = auditLogger.startTimer();
  const { decision, rejectionReason, bankTransferRef, proofFile } = body;

  const refund = await findRefundById(refundId);
  if (!refund) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy yêu cầu hoàn tiền");
  }

  // Guard: status must be requested or approved
  if (refund.status !== "requested" && refund.status !== "approved") {
    throw new AppError(409, "INVALID_STATE", "Yêu cầu hoàn tiền đã được xử lý xong");
  }

  if (decision === "reject") {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      throw new AppError(400, "VALIDATION_ERROR", "Lý do từ chối tối thiểu phải có 10 ký tự");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.refund.update({
        where: { id: refundId },
        data: {
          status: "rejected",
          processed_by: adminId,
          rejection_reason: rejectionReason,
          processed_at: new Date(),
        },
      });

      await tx.caseEvent.create({
        data: {
          case_id: refund.case_id,
          event_type: "refund_rejected",
          actor_auth_user_id: adminId,
          metadata_json: { refund_id: refundId, reason: rejectionReason },
        },
      });

      return res;
    });

    auditLogger.log({
      operation: "payments.process_refund",
      actor_id: adminId,
      actor_role: "admin",
      case_id: refund.case_id,
      action: "rejected",
      metadata: { refund_id: refundId },
      duration_ms: timer(),
    });

    return updated;
  }

  if (decision === "approve") {
    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.refund.update({
        where: { id: refundId },
        data: {
          status: "approved",
          processed_by: adminId,
          processed_at: new Date(),
        },
      });

      await tx.caseEvent.create({
        data: {
          case_id: refund.case_id,
          event_type: "refund_approved",
          actor_auth_user_id: adminId,
          metadata_json: { refund_id: refundId },
        },
      });

      return res;
    });

    auditLogger.log({
      operation: "payments.process_refund",
      actor_id: adminId,
      actor_role: "admin",
      case_id: refund.case_id,
      action: "approved",
      metadata: { refund_id: refundId },
      duration_ms: timer(),
    });

    return updated;
  }

  if (decision === "complete") {
    if (!bankTransferRef || !bankTransferRef.trim()) {
      throw new AppError(400, "VALIDATION_ERROR", "Mã giao dịch ngân hàng là bắt buộc khi hoàn tất");
    }
    if (!proofFile) {
      throw new AppError(400, "VALIDATION_ERROR", "Tệp minh chứng chuyển khoản là bắt buộc khi hoàn tất");
    }

    // Re-fetch case to assert tier 1 race condition: supporter is still null
    const caseItem = await prisma.case.findUnique({
      where: { id: refund.case_id }
    });

    if (!caseItem) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy hồ sơ");
    }

    if (caseItem.assigned_supporter_auth_user_id !== null) {
      throw new AppError(409, "REFUND_TIER_CHANGED", "Chuyên gia đã được phân công trong lúc xử lý, không thể hoàn tiền tier-1");
    }

    // Upload proof file
    let savedFile: { fileUrl: string; publicId: string } | null = null;
    try {
      savedFile = await fileStorageService.saveProofFile(proofFile);
    } catch (uploadError: any) {
      throw new AppError(500, "UPLOAD_ERROR", "Không thể tải lên ảnh minh chứng hoàn tiền: " + uploadError.message);
    }

    try {
      const updated = await prisma.$transaction(async (tx) => {
        // Re-check race inside tx
        const innerCase = await tx.case.findUnique({ where: { id: refund.case_id } });
        if (innerCase?.assigned_supporter_auth_user_id !== null) {
          throw new AppError(409, "REFUND_TIER_CHANGED", "Chuyên gia đã được phân công trong lúc xử lý, không thể hoàn tiền tier-1");
        }

        const res = await tx.refund.update({
          where: { id: refundId },
          data: {
            status: "completed",
            processed_by: adminId,
            bank_transfer_ref: bankTransferRef,
            proof_file_url: savedFile!.fileUrl,
            transferred_at: new Date(),
            processed_at: new Date(),
          },
        });

        await tx.case.update({
          where: { id: refund.case_id },
          data: {
            payment_status: "refunded",
            user_facing_stage: "closed",
            internal_status: "cancelled",
          },
        });

        await tx.caseEvent.create({
          data: {
            case_id: refund.case_id,
            event_type: "refund_completed",
            actor_auth_user_id: adminId,
            metadata_json: { refund_id: refundId, bank_transfer_ref: bankTransferRef },
          },
        });

        return res;
      });

      auditLogger.log({
        operation: "payments.process_refund",
        actor_id: adminId,
        actor_role: "admin",
        case_id: refund.case_id,
        action: "completed",
        metadata: { refund_id: refundId },
        duration_ms: timer(),
      });

      return updated;
    } catch (dbError) {
      // Clean up uploaded file if DB transaction failed
      if (savedFile) {
        await fileStorageService.deleteFile(savedFile.publicId);
      }
      throw dbError;
    }
  }

  throw new AppError(400, "INVALID_DECISION", "Quyết định xử lý hoàn tiền không hợp lệ");
}
