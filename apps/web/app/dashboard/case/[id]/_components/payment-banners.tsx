import { Alert, Button } from "@heroui/react";
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
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Ý tưởng đã được lưu</Alert.Title>
            <Alert.Description>
              Vui lòng hoàn tất thanh toán để kích hoạt supporter phản biện ý tưởng của nhóm bạn.
            </Alert.Description>
            <Button
              onPress={onOpenPaymentDrawer}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold shrink-0 shadow-sm mt-2 sm:hidden"
              size="sm"
            >
              Thanh toán ngay
            </Button>
          </Alert.Content>
          <Button
            onPress={onOpenPaymentDrawer}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold shrink-0 shadow-sm hidden sm:block"
            size="sm"
          >
            Thanh toán ngay
          </Button>
        </Alert>
      )}

      {isPendingVerification && (
        <Alert status="accent">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Minh chứng đang được kiểm tra</Alert.Title>
            <Alert.Description>
              Bạn đã tải lên minh chứng thanh toán. Ban quản trị hệ thống sẽ duyệt giao dịch của bạn trong vòng vài giờ làm việc.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {isRejectedPayment && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Minh chứng bị từ chối</Alert.Title>
            <Alert.Description>
              Lý do: <span className="font-semibold underline">{latestPayment?.rejection_reason}</span>.{" "}
              Vui lòng kiểm tra và tải lên ảnh minh chứng mới để tiếp tục.
            </Alert.Description>
            <Button
              onPress={onOpenPaymentDrawer}
              variant="danger"
              size="sm"
              className="font-bold shrink-0 mt-2 sm:hidden"
            >
              Tải lại minh chứng
            </Button>
          </Alert.Content>
          <Button
            onPress={onOpenPaymentDrawer}
            variant="danger"
            size="sm"
            className="font-bold shrink-0 hidden sm:block"
          >
            Tải lại minh chứng
          </Button>
        </Alert>
      )}
    </>
  );
}

