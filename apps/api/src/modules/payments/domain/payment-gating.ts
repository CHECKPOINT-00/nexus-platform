import { isPaymentSatisfied } from "./payment.types.js";
import { AppError } from "../../../shared/domain/app-error.js";

export function assertPaymentSatisfied(caseObj: { payment_status?: string | null }) {
  if (!isPaymentSatisfied(caseObj.payment_status)) {
    throw new AppError(
      403,
      "PAYMENT_REQUIRED",
      "Hồ sơ chưa được thanh toán - không thể thực hiện thao tác chuyên môn"
    );
  }
}
