/**
 * Pure utility: update linked audit_round after payment verified "paid".
 * Takes a Prisma transaction client (tx) — does NOT import prisma directly,
 * so it can be unit-tested without a database.
 */
export async function updateAuditRoundAfterPayment(
  tx: any,
  paymentId: string,
): Promise<void> {
  const auditRound = await tx.auditRound.findFirst({
    where: { payment_id: paymentId },
  });
  if (auditRound) {
    await tx.auditRound.update({
      where: { id: auditRound.id },
      data: {
        status: "payment_verified",
        sla_deadline_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });
  }
}
