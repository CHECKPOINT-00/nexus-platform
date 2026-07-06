import { AppError } from "../../../shared/domain/app-error.js";
import { prisma } from "../../../db.js";
import { findCaseById } from "../../cases/infrastructure/persistence/case.repository.js";
import { auditLogger } from "../../../shared/infrastructure/audit-logger.js";

export async function reactivatePaymentUseCase(
  userId: string,
  caseId: string,
) {
  const timer = auditLogger.startTimer();
  const caseItem = await findCaseById(caseId);

  if (!caseItem) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy hồ sơ");
  }

  if (caseItem.owner_auth_user_id !== userId) {
    throw new AppError(403, "FORBIDDEN", "Bạn không có quyền thao tác trên hồ sơ này");
  }

  if (caseItem.payment_status !== "expired") {
    throw new AppError(409, "INVALID_STATE", "Hồ sơ không ở trạng thái hết hạn thanh toán");
  }

  if (!caseItem.expired_at) {
    throw new AppError(500, "INTERNAL_ERROR", "Dữ liệu thời gian hết hạn không tồn tại");
  }

  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - caseItem.expired_at.getTime() > sevenDaysInMs) {
    throw new AppError(400, "EXPIRED_LIMIT_EXCEEDED", "Hồ sơ đã quá hạn 7 ngày, không thể kích hoạt lại");
  }

  const updatedCase = await prisma.$transaction(async (tx) => {
    const updated = await tx.case.update({
      where: { id: caseId },
      data: {
        payment_status: "pending",
        payment_window_expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000),
        expired_at: null,
      },
    });

    await tx.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "payment_reactivated",
        actor_auth_user_id: userId,
      },
    });

    return updated;
  });

  auditLogger.log({
    operation: "payments.reactivate_payment",
    actor_id: userId,
    actor_role: "student",
    case_id: caseId,
    action: "reactivated",
    old_state: { payment_status: "expired" },
    new_state: { payment_status: updatedCase.payment_status },
    duration_ms: timer(),
  });

  return updatedCase;
}
