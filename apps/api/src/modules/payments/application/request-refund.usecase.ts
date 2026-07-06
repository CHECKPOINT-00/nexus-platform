import { AppError } from "../../../shared/domain/app-error.js";
import { prisma } from "../../../db.js";
import { findCaseById } from "../../cases/infrastructure/persistence/case.repository.js";
import { findActiveRefundByCaseId } from "../infrastructure/persistence/refund.repository.js";
import { auditLogger } from "../../../shared/infrastructure/audit-logger.js";

export async function requestRefundUseCase(
  userId: string,
  caseId: string,
  reason?: string,
) {
  const timer = auditLogger.startTimer();
  const caseItem = await findCaseById(caseId);

  if (!caseItem) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy hồ sơ");
  }

  if (caseItem.owner_auth_user_id !== userId) {
    throw new AppError(403, "FORBIDDEN", "Bạn không có quyền thao tác trên hồ sơ này");
  }

  // Guard: payment_status === paid
  if (caseItem.payment_status !== "paid") {
    throw new AppError(409, "INVALID_STATE", "Hồ sơ chưa được thanh toán hoặc đã được hoàn tiền");
  }

  // Guard: assigned_supporter_auth_user_id IS NULL (tier 1 check)
  if (caseItem.assigned_supporter_auth_user_id !== null) {
    throw new AppError(409, "REFUND_NOT_ALLOWED_TIER2", "Supporter đã được phân công, không hoàn tiền theo chính sách.");
  }

  // Guard duplicate (D8)
  const activeRefund = await findActiveRefundByCaseId(caseId);
  if (activeRefund) {
    throw new AppError(409, "REFUND_ALREADY_PENDING", "Đã có yêu cầu hoàn tiền đang xử lý.");
  }

  // Find the paid payment record
  const payment = await prisma.payment.findFirst({
    where: {
      case_id: caseId,
      status: "paid",
    },
  });

  if (!payment) {
    throw new AppError(404, "PAYMENT_NOT_FOUND", "Không tìm thấy giao dịch thanh toán gốc");
  }

  const refund = await prisma.$transaction(async (tx) => {
    const createdRefund = await tx.refund.create({
      data: {
        case_id: caseId,
        payment_id: payment.id,
        tier: 1,
        amount: caseItem.locked_price ?? payment.amount,
        requested_by: userId,
        reason: reason || "",
        status: "requested",
      },
    });

    await tx.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "refund_requested",
        actor_auth_user_id: userId,
        metadata_json: { refund_id: createdRefund.id, amount: createdRefund.amount },
      },
    });

    return createdRefund;
  });

  auditLogger.log({
    operation: "payments.request_refund",
    actor_id: userId,
    actor_role: "student",
    case_id: caseId,
    action: "requested",
    metadata: { refund_id: refund.id, amount: refund.amount },
    duration_ms: timer(),
  });

  return refund;
}
