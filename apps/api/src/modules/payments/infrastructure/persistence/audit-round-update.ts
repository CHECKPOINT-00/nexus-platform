/**
 * Pure utility: update linked audit_rounds after payment verified.
 * Handles multi-round cascade: all rounds linked to paymentId get updated.
 * - "paid": all → "in_progress", SLA deadline only on the lowest round_number.
 * - "rejected": all → "payment_rejected".
 * Takes a Prisma transaction client (tx) — does NOT import prisma directly,
 * so it can be unit-tested without a database.
 */
export async function updateAuditRoundAfterPayment(
  tx: any,
  paymentId: string,
  status: "paid" | "rejected",
): Promise<void> {
  if (status === "paid") {
    // Cascade all linked rounds to "in_progress" (SLA = null initially)
    const result = await tx.auditRound.updateMany({
      where: { payment_id: paymentId },
      data: {
        status: "in_progress",
        sla_deadline_at: null,
      },
    });

    if (result.count > 0) {
      // Set 48h SLA only on the round with minimum round_number
      const firstRound = await tx.auditRound.findFirst({
        where: { payment_id: paymentId },
        orderBy: { round_number: "asc" },
      });
      if (firstRound) {
        await tx.auditRound.update({
          where: { id: firstRound.id },
          data: {
            sla_deadline_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
          },
        });
      }
    }
  } else if (status === "rejected") {
    await tx.auditRound.updateMany({
      where: { payment_id: paymentId },
      data: {
        status: "payment_rejected",
      },
    });
  }
}
