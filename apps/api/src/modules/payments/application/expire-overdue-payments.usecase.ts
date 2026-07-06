import { prisma } from "../../../db.js";
import { auditLogger } from "../../../shared/infrastructure/audit-logger.js";

export async function expireOverduePaymentsUseCase(actorId: string = "system") {
  const timer = auditLogger.startTimer();
  const now = new Date();

  // Find cases that are pending or proof_submitted and have window expired
  const overdueCases = await prisma.case.findMany({
    where: {
      payment_status: { in: ["pending", "proof_submitted"] },
      payment_window_expires_at: { lt: now },
    },
    select: { id: true },
  });

  if (overdueCases.length === 0) {
    return { expiredCount: 0 };
  }

  let expiredCount = 0;
  for (const c of overdueCases) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.case.update({
          where: { id: c.id },
          data: {
            payment_status: "expired",
            expired_at: now,
          },
        });

        await tx.caseEvent.create({
          data: {
            case_id: c.id,
            event_type: "payment_expired",
            actor_auth_user_id: actorId,
          },
        });
      });
      expiredCount++;
    } catch (err) {
      console.error(`Failed to expire case ${c.id}:`, err);
    }
  }

  auditLogger.log({
    operation: "payments.expire_overdue",
    actor_id: actorId,
    actor_role: actorId === "system" ? "system" : "admin",
    action: "expired_scanned",
    metadata: { expired_count: expiredCount },
    duration_ms: timer(),
  });

  return { expiredCount };
}
