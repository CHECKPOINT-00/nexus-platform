// Allowed file extensions for payment proof uploads
export const ALLOWED_PROOF_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"] as const;

// Max file size for payment proof uploads (5 MB)
export const MAX_PROOF_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Valid final decisions for verifying a payment
export const VALID_PAYMENT_DECISIONS = ["paid", "rejected"] as const;

export type PaymentDecision = (typeof VALID_PAYMENT_DECISIONS)[number];

export function isValidPaymentDecision(status: unknown): status is PaymentDecision {
  return (
    typeof status === "string" &&
    (VALID_PAYMENT_DECISIONS as readonly string[]).includes(status)
  );
}

export function normalizePaymentStatus(status: string): string {
  return status === "verified" ? "paid" : status;
}

export const VALID_PAYMENT_STATUSES = [
  "unpaid",
  "not_required",
  "awaiting_confirmation",
  "pending",
  "proof_submitted",
  "paid",
  "rejected",
  "expired",
  "refunded"
] as const;

export type PaymentStatus = (typeof VALID_PAYMENT_STATUSES)[number];

export function isPaymentSatisfied(status?: string | null): boolean {
  if (status === undefined) return true;
  return status === "paid" || status === "not_required";
}

export function canUploadProof(status?: string | null): boolean {
  return status === "pending" || status === "rejected";
}

export function canConfirmPackage(status?: string | null): boolean {
  return status === "awaiting_confirmation";
}

export function canReactivatePayment(status?: string | null): boolean {
  return status === "expired";
}

export function isActivePaymentWindow(status?: string | null): boolean {
  return status !== undefined && status !== null && ["awaiting_confirmation", "pending", "proof_submitted"].includes(status);
}

export function isFinalPaymentStatus(status?: string | null): boolean {
  return status === "paid" || status === "not_required" || status === "expired" || status === "refunded";
}
