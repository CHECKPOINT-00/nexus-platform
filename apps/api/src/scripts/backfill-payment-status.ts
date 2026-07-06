import { prisma } from "../db.js";

async function main() {
  console.log("Starting backfill-payment-status script...");

  // 1. Count cases before updates
  const pendingVerificationCount = await prisma.case.count({
    where: { payment_status: "pending_verification" }
  });
  const freePaidCount = await prisma.case.count({
    where: {
      payment_status: "paid",
      locked_price: 0
    }
  });
  const unassignedUnpaidStageCount = await prisma.case.count({
    where: {
      internal_status: "accepted_unassigned",
      NOT: {
        payment_status: { in: ["paid", "not_required"] }
      }
    }
  });

  console.log(`Pre-update counts:`);
  console.log(`- pending_verification cases to backfill: ${pendingVerificationCount}`);
  console.log(`- free 'paid' cases to convert to 'not_required': ${freePaidCount}`);
  console.log(`- triage-accepted but unpaid cases to set stage to 'triage_accepted': ${unassignedUnpaidStageCount}`);

  // 2. Perform updates
  if (pendingVerificationCount > 0) {
    const res = await prisma.case.updateMany({
      where: { payment_status: "pending_verification" },
      data: { payment_status: "proof_submitted" }
    });
    console.log(`Updated ${res.count} cases to payment_status = 'proof_submitted'`);
  }

  if (freePaidCount > 0) {
    const res = await prisma.case.updateMany({
      where: {
        payment_status: "paid",
        locked_price: 0
      },
      data: { payment_status: "not_required" }
    });
    console.log(`Updated ${res.count} cases to payment_status = 'not_required'`);
  }

  if (unassignedUnpaidStageCount > 0) {
    const res = await prisma.case.updateMany({
      where: {
        internal_status: "accepted_unassigned",
        NOT: {
          payment_status: { in: ["paid", "not_required"] }
        }
      },
      data: { user_facing_stage: "triage_accepted" }
    });
    console.log(`Updated ${res.count} cases to user_facing_stage = 'triage_accepted'`);
  }

  // 3. Post-update counts
  const postPendingVerificationCount = await prisma.case.count({
    where: { payment_status: "pending_verification" }
  });
  const postFreePaidCount = await prisma.case.count({
    where: {
      payment_status: "paid",
      locked_price: 0
    }
  });
  const postUnassignedUnpaidStageCount = await prisma.case.count({
    where: {
      internal_status: "accepted_unassigned",
      NOT: [
        { payment_status: { in: ["paid", "not_required"] } },
        { user_facing_stage: "triage_accepted" }
      ]
    }
  });

  console.log(`Post-update counts:`);
  console.log(`- pending_verification cases remaining: ${postPendingVerificationCount}`);
  console.log(`- free 'paid' cases remaining: ${postFreePaidCount}`);
  console.log(`- triage-accepted but unpaid cases remaining (user_facing_stage !== 'triage_accepted'): ${postUnassignedUnpaidStageCount}`);

  await prisma.$disconnect();
  console.log("Backfill complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
