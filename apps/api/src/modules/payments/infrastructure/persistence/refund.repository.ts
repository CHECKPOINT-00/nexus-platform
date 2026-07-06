import { prisma } from "../../../../db.js";

export async function createRefund(data: {
  caseId: string;
  paymentId: string;
  tier: number;
  amount: number;
  requestedBy: string;
  reason?: string;
}) {
  const { caseId, paymentId, tier, amount, requestedBy, reason } = data;
  return await prisma.refund.create({
    data: {
      case_id: caseId,
      payment_id: paymentId,
      tier,
      amount,
      requested_by: requestedBy,
      reason,
      status: "requested",
    },
  });
}

export async function findRefundById(id: string) {
  return await prisma.refund.findUnique({
    where: { id },
    include: {
      case: true,
      payment: true,
    },
  });
}

export async function findActiveRefundByCaseId(caseId: string) {
  return await prisma.refund.findFirst({
    where: {
      case_id: caseId,
      status: { in: ["requested", "approved"] },
    },
  });
}

export async function listRefunds() {
  return await prisma.refund.findMany({
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
      requester: {
        select: { name: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function updateRefundStatus(
  refundId: string,
  data: {
    status: string;
    processedBy: string;
    rejectionReason?: string | null;
    bankTransferRef?: string | null;
    proofFileUrl?: string | null;
    transferredAt?: Date | null;
  }
) {
  const { status, processedBy, rejectionReason, bankTransferRef, proofFileUrl, transferredAt } = data;
  return await prisma.refund.update({
    where: { id: refundId },
    data: {
      status,
      processed_by: processedBy,
      rejection_reason: rejectionReason,
      bank_transfer_ref: bankTransferRef,
      proof_file_url: proofFileUrl,
      transferred_at: transferredAt,
      processed_at: new Date(),
    },
  });
}
