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

export async function createPaymentProof(data: {
  caseId: string;
  packageId: string;
  amount: number;
  proofFileUrl: string;
  userId: string;
}) {
  const { caseId, packageId, amount, proofFileUrl, userId } = data;
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

    await tx.case.update({
      where: { id: caseId },
      data: {
        payment_status: "proof_submitted",
      },
    });

    await tx.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "payment_proof_uploaded",
        actor_auth_user_id: userId,
        metadata_json: { payment_id: payment.id, amount },
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

    const caseUpdates: any = {
      payment_status: status,
    };
    if (status === "paid") {
      caseUpdates.user_facing_stage = "under_review";
      caseUpdates.internal_status = "accepted_unassigned";
    }

    await tx.case.update({
      where: { id: caseId },
      data: caseUpdates,
    });

    await tx.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: status === "paid" ? "payment_verified" : "payment_rejected",
        actor_auth_user_id: adminId,
        metadata_json: { payment_id: paymentId, rejection_reason: rejectionReason },
      },
    });

    return updatedPayment;
  });
}

export async function confirmPackage(
  caseId: string,
  userId: string,
  data: {
    acceptProposed: boolean;
    proposedPackageId: string | null;
    proposedLockedPrice: number | null;
  }
) {
  const { acceptProposed, proposedPackageId, proposedLockedPrice } = data;
  return await prisma.$transaction(async (tx: any) => {
    const existingCase = await tx.case.findUnique({
      where: { id: caseId }
    });

    if (!existingCase) {
      throw new Error(`Case not found: ${caseId}`);
    }

    const updates: any = {
      payment_status: "pending",
      package_confirmed_at: new Date(),
      payment_window_expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000)
    };

    if (acceptProposed && proposedPackageId) {
      updates.package_id = proposedPackageId;
      updates.locked_price = proposedLockedPrice;
    }

    const updatedCase = await tx.case.update({
      where: { id: caseId },
      data: updates
    });

    await tx.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "package_confirmed",
        actor_auth_user_id: userId,
        metadata_json: {
          package_id: updatedCase.package_id,
          locked_price: updatedCase.locked_price,
          accept_proposed: acceptProposed
        }
      }
    });

    return updatedCase;
  });
}
