import { prisma } from "../../../../db.js";
import { updateAuditRoundAfterPayment } from "./audit-round-update.js";

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

export async function createPaymentProof(data: {
  caseId: string;
  packageId: string;
  amount: number;
  proofFileUrl: string;
  userId: string;
  auditRoundIds: string[];
}) {
  const { caseId, packageId, amount, proofFileUrl, userId, auditRoundIds } = data;
  return await prisma.$transaction(async (tx: any) => {
    const payment = await tx.payment.create({
      data: {
        case_id: caseId,
        package_id: packageId,
        amount,
        status: "pending_verification",
        proof_file_url: proofFileUrl,
      },
    });

    // Link payment to ALL pending audit_rounds + set awaiting_verification
    for (const roundId of auditRoundIds) {
      await tx.auditRound.update({
        where: { id: roundId },
        data: {
          payment_id: payment.id,
          status: "awaiting_verification",
        },
      });
    }

    await tx.case.update({
      where: { id: caseId },
      data: {
        payment_status: "pending_verification",
      },
    });

    await tx.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "payment_proof_uploaded",
        actor_auth_user_id: userId,
        metadata_json: { payment_id: payment.id, amount, audit_round_ids: auditRoundIds },
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
        metadata_json: { payment_id: paymentId, rejection_reason: rejectionReason },
      },
    });

    // Cascade round status updates for both paid and rejected
    await updateAuditRoundAfterPayment(tx, paymentId, status);

    return updatedPayment;
  });
}
