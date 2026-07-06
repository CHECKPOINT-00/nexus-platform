import { findManyCasesByRole } from "../infrastructure/persistence/case.repository.js";

export async function listCasesUseCase(session: any) {
  try {
    const { expireOverduePaymentsUseCase } = await import("../../payments/application/expire-overdue-payments.usecase.js");
    await expireOverduePaymentsUseCase();
  } catch (err) {
    console.error("Lazy expiry check failed:", err);
  }

  return await findManyCasesByRole(session.user.id, session.user.role);
}
