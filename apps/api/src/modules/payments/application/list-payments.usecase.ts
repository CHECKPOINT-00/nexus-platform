import { findManyPaymentsWithCase } from "../infrastructure/persistence/payment.repository.js";

export async function listPaymentsUseCase() {
  return await findManyPaymentsWithCase();
}
