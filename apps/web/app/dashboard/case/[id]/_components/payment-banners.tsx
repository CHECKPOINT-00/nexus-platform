import { Card, Button } from "@heroui/react";
import { AlertTriangle, Clock } from "lucide-react";
import type { Payment } from "../types";

interface PaymentBannersProps {
  paymentStatus: string;
  isOwner: boolean;
  latestPayment: Payment | undefined;
  onOpenPaymentDrawer: () => void;
}

export function PaymentBanners({
  paymentStatus,
  isOwner,
  latestPayment,
  onOpenPaymentDrawer,
}: PaymentBannersProps) {
  const isUnpaid = paymentStatus === "unpaid";
  const isPendingVerification = paymentStatus === "pending_verification";
  const isRejectedPayment = latestPayment?.status === "rejected";

  if (!isOwner) return null;

  return (
    <>
      {isUnpaid && (
        <Card className="border border-amber-200/50 bg-amber-50 dark:bg-amber-950/10 text-amber-800 shadow-none rounded-md">
          <Card.Content className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Ý tưởng đã được lưu</p>
                <p className="text-xs text-amber-700/90 mt-0.5">
                  Vui lòng hoàn tất thanh toán để kích hoạt supporter phản biện ý tưởng của nhóm bạn.
                </p>
              </div>
            </div>
            <Button
              onPress={onOpenPaymentDrawer}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold shrink-0 shadow-sm"
              size="sm"
            >
              Thanh toán ngay
            </Button>
          </Card.Content>
        </Card>
      )}

      {isPendingVerification && (
        <Card className="border border-blue-200 bg-blue-50 dark:bg-blue-950/10 text-blue-800 shadow-none rounded-md">
          <Card.Content className="p-4 flex gap-2.5 items-start">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Minh chứng đang được kiểm tra</p>
              <p className="text-xs text-blue-700/95 mt-0.5">
                Bạn đã tải lên minh chứng thanh toán. Ban quản trị hệ thống sẽ duyệt giao dịch của bạn trong vòng vài giờ làm việc.
              </p>
            </div>
          </Card.Content>
        </Card>
      )}

      {isRejectedPayment && (
        <Card className="border border-danger-200 bg-danger-50 dark:bg-danger-950/10 text-danger-800 shadow-none rounded-md">
          <Card.Content className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Minh chứng bị từ chối</p>
                <p className="text-xs text-danger-700/90 mt-0.5">
                  Lý do: <span className="font-semibold underline">{latestPayment?.rejection_reason}</span>.{" "}
                  Vui lòng kiểm tra và tải lên ảnh minh chứng mới để tiếp tục.
                </p>
              </div>
            </div>
            <Button
              onPress={onOpenPaymentDrawer}
              variant="danger"
              size="sm"
              className="font-bold shrink-0"
            >
              Tải lại minh chứng
            </Button>
          </Card.Content>
        </Card>
      )}
    </>
  );
}
