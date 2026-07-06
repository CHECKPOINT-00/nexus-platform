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

export function caseRequiresPayment(caseData: Case): boolean {
  const price = getCaseEffectivePrice(caseData);
  return price > 0 && !["paid", "not_required", "refunded"].includes(caseData.payment_status || "");
}

export function canConfirmPackage(caseData: Case): boolean {
  return caseData.payment_status === "awaiting_confirmation";
}

export function canUploadProof(caseData: Case): boolean {
  return caseData.payment_status === "pending" || caseData.payment_status === "rejected";
}

export function isPaymentExpired(caseData: Case): boolean {
  return caseData.payment_status === "expired";
}

export function canReactivatePayment(caseData: Case): boolean {
  if (caseData.payment_status !== "expired" || !caseData.expired_at) {
    return false;
  }
  const expiredTime = new Date(caseData.expired_at).getTime();
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - expiredTime <= sevenDaysInMs;
}

export function paymentWindowRemaining(caseData: Case): number {
  if (!caseData.payment_window_expires_at) return 0;
  const expiryTime = new Date(caseData.payment_window_expires_at).getTime();
  return Math.max(0, expiryTime - Date.now());
}

export function canRequestRefund(caseData: Case): boolean {
  return caseData.payment_status === "paid" && !caseData.assigned_supporter_auth_user_id;
}

export function isPaymentSatisfied(caseData: Case): boolean {
  return ["paid", "not_required"].includes(caseData.payment_status || "");
}

/**
 * Formats a number as a standard VND currency string (e.g. 100.000 ₫).
 */
export function formatPrice(price: number): string {
  if (price === 0) return "Miễn phí";
  const formatted = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(price);
  return `${formatted} VND`;
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
  
  // Validate type (image only - including iOS HEIC/HEIF)
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!allowedTypes.includes(file.type)) {
    notifications.show({
      title: "Định dạng không hợp lệ",
      message: "Chỉ chấp nhận định dạng ảnh (JPG, PNG, WEBP, HEIC, HEIF).",
      color: "red",
    });
    return false;
  }
  
  return true;
}
