import { AppError } from "../../../shared/domain/app-error.js";
import { prisma } from "../../../db.js";
import { findCaseById } from "../infrastructure/persistence/case.repository.js";
import { auditLogger } from "../../../shared/infrastructure/audit-logger.js";

export async function cancelCaseUseCase(
  userId: string,
  caseId: string,
) {
  const timer = auditLogger.startTimer();
  const caseItem = await findCaseById(caseId);

  if (!caseItem) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy hồ sơ");
  }

  if (caseItem.owner_auth_user_id !== userId) {
    throw new AppError(403, "FORBIDDEN", "Bạn không có quyền hủy hồ sơ này");
  }

  if (caseItem.user_facing_stage !== "triage_accepted") {
    throw new AppError(409, "INVALID_STATE", "Hồ sơ không ở trạng thái chờ thanh toán");
  }

  const validPaymentStatuses = ["awaiting_confirmation", "pending", "proof_submitted", "rejected", "expired"];
  if (!validPaymentStatuses.includes(caseItem.payment_status)) {
    throw new AppError(409, "INVALID_STATE", "Trạng thái thanh toán không hợp lệ để hủy");
  }

  if (caseItem.assigned_supporter_auth_user_id !== null) {
    throw new AppError(409, "INVALID_STATE", "Hồ sơ đã được phân công supporter, vui lòng yêu cầu hoàn tiền");
  }

  const updatedCase = await prisma.$transaction(async (tx) => {
    const updated = await tx.case.update({
      where: { id: caseId },
      data: {
        user_facing_stage: "closed",
        internal_status: "cancelled",
      },
    });

    await tx.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "case_cancelled_by_student",
        actor_auth_user_id: userId,
      },
    });

    return updated;
  });

  auditLogger.log({
    operation: "cases.cancel_case",
    actor_id: userId,
    actor_role: "student",
    case_id: caseId,
    action: "cancelled",
    old_state: { stage: caseItem.user_facing_stage, status: caseItem.internal_status },
    new_state: { stage: updatedCase.user_facing_stage, status: updatedCase.internal_status },
    duration_ms: timer(),
  });

  return updatedCase;
}
