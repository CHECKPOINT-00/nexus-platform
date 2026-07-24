import { prisma } from "../../../../db.js";

export async function findManyPaymentsWithCase() {
  return await prisma.payment.findMany({
    include: {
      case: {
        select: {
          case_code: true,
          team_name: true,
          owner: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function findPaymentById(id: string) {
  return await prisma.payment.findUnique({
    where: { id },
  });
}

export async function findPaymentByIdWithCase(id: string) {
  return await prisma.payment.findUnique({
    where: { id },
    include: {
      case: {
        select: { case_code: true, owner_auth_user_id: true },
      },
    },
  });
}

export async function createUnpaidPayment(data: {
  caseId: string;
  packageId: string;
  amount: number;
  metadataJson: Record<string, unknown> | null;
}) {
  return await prisma.payment.create({
    data: {
      case_id: data.caseId,
      package_id: data.packageId,
      amount: data.amount,
      status: "unpaid",
      metadata_json: data.metadataJson ?? undefined,
    },
  });
}

export async function createPaymentProof(data: {
  caseId: string;
  packageId: string;
  amount: number;
  proofFileUrl: string;
  userId: string;
}) {
  return await prisma.$transaction(async (tx: any) => {
    const payment = await tx.payment.create({
      data: {
        case_id: data.caseId,
        package_id: data.packageId,
        amount: data.amount,
        status: "pending_verification",
        proof_file_url: data.proofFileUrl,
      },
    });

    await tx.case.update({
      where: { id: data.caseId },
      data: {
        payment_status: "pending_verification",
      },
    });

    await tx.caseEvent.create({
      data: {
        case_id: data.caseId,
        event_type: "payment_proof_uploaded",
        actor_auth_user_id: data.userId,
        payment_id: payment.id,
        metadata_json: { payment_id: payment.id, amount: data.amount },
      },
    });

    return payment;
  });
}

export async function verifyPayment(data: {
  paymentId: string;
  caseId: string;
  status: "paid" | "rejected";
  rejectionReason: string | null;
  adminId: string;
}) {
  const { paymentId, caseId, status, rejectionReason, adminId } = data;
  return await prisma.$transaction(async (tx: any) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status,
        rejection_reason: rejectionReason,
        verified_by_auth_user_id: adminId,
        verified_at: new Date(),
      },
    });

    await tx.case.update({
      where: { id: caseId },
      data: {
        payment_status: status === "paid" ? "paid" : "unpaid",
      },
    });

    await tx.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: status === "paid" ? "payment_verified" : "payment_rejected",
        actor_auth_user_id: adminId,
        payment_id: paymentId,
        metadata_json: { payment_id: paymentId, rejection_reason: rejectionReason },
      },
    });

    if (status === "paid") {
      // --- Credit purchase on successful verification ---
      const paymentRecord = await tx.payment.findUnique({ where: { id: paymentId } });
      const quantity = paymentRecord?.amount ?? 1;

      // Get current credit balance
      const latestLedger = await tx.creditLedger.findFirst({
        where: { case_id: caseId },
        orderBy: { id: "desc" },
      });
      const currentBalance = latestLedger?.balance_after ?? 0;
      const newBalance = currentBalance + quantity;

      // Create credit ledger purchase entry
      await tx.creditLedger.create({
        data: {
          case_id: caseId,
          amount: quantity,
          balance_after: newBalance,
          type: "purchase",
          reference_id: paymentId,
          idempotency_key: `purchase-${paymentId}`,
        },
      });

      // Create case event for credit purchase
      await tx.caseEvent.create({
        data: {
          case_id: caseId,
          event_type: "credits_purchased",
          actor_auth_user_id: adminId,
          payment_id: paymentId,
          metadata_json: { quantity, new_balance: newBalance, payment_id: paymentId },
        },
      });

      // Update audit rounds: set all linked rounds in_progress + SLA on lowest round
      const updatedRounds = await tx.auditRound.updateMany({
        where: { payment_id: paymentId },
        data: {
          status: "in_progress",
          sla_deadline_at: null,
        },
      });

      if (updatedRounds.count > 0) {
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
    } else {
      // rejected: set linked rounds to payment_rejected
      await tx.auditRound.updateMany({
        where: { payment_id: paymentId },
        data: { status: "payment_rejected" },
      });
    }

    return updatedPayment;
  });
}
