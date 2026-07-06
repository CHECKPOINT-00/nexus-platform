import { expireOverduePaymentsUseCase } from "../modules/payments/application/expire-overdue-payments.usecase.js";
import { prisma } from "../db.js";

async function main() {
  console.log("Starting overdue payments expiry sweep...");
  try {
    const result = await expireOverduePaymentsUseCase("system");
    console.log(`Successfully swept overdue payments. Expired cases: ${result.expiredCount}`);
  } catch (error) {
    console.error("Failed to run overdue payments expiry sweep:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
