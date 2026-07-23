import { Case } from "@/types";
import { notifications } from "@mantine/notifications";

/**
 * Resolves the effective pricing for a case, falling back to the package price
 * or 0 if neither are set.
 */
export function getCaseEffectivePrice(caseData?: {
  locked_price?: number | null;
  package?: { price?: number } | null;
} | null): number {
  return caseData?.locked_price ?? caseData?.package?.price ?? 0;
}

/**
 * Determines whether a case requires a payment to be made.
 * Checks for any audit rounds with "pending_payment" status (round-level gating).
 * This allows users to access the payment page for new unpaid rounds even after
 * a previous case-level payment has been completed.
 */
export function caseRequiresPayment(caseData: Case): boolean {
  return caseData.audit_rounds?.some(
    (r) => r.status === "pending_payment",
  ) ?? false;
}

/**
 * Formats a number as a standard VND currency string (e.g. 100.000 ₫).
 */
export function formatPrice(price: number): string {
  if (price === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Validates a file for payment proof upload (receipt).
 * Displays a Mantine notification if validation fails.
 * Returns true if valid, false otherwise.
 */
export function validatePaymentProof(file: File): boolean {
  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    notifications.show({
      title: "Kích thước file quá lớn",
      message: "Kích thước file vượt quá 5MB. Vui lòng chọn file nhỏ hơn.",
      color: "red",
    });
    return false;
  }
  
  // Validate type (image or pdf)
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    notifications.show({
      title: "Định dạng không hợp lệ",
      message: "Chỉ chấp nhận định dạng ảnh (JPG, PNG, WEBP) hoặc PDF.",
      color: "red",
    });
    return false;
  }
  
  return true;
}
