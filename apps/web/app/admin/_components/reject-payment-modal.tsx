"use client";

import { useState } from "react";
import { Modal, TextArea, Button } from "@heroui/react";
import type { UseMutationResult } from "@tanstack/react-query";

interface RejectPaymentModalProps {
  isOpen: boolean;
  paymentId: string | null;
  onOpenChange: (open: boolean) => void;
  verifyPaymentMutation: UseMutationResult<
    any,
    any,
    { paymentId: string; status: "paid" | "rejected"; reason?: string },
    any
  >;
}

export function RejectPaymentModal({
  isOpen,
  paymentId,
  onOpenChange,
  verifyPaymentMutation,
}: RejectPaymentModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const handleSubmit = () => {
    if (!paymentId || rejectionReason.length < 10) return;
    setRejecting(true);
    verifyPaymentMutation.mutate(
      { paymentId, status: "rejected", reason: rejectionReason },
      {
        onSuccess: () => setRejectionReason(""),
        onSettled: () => setRejecting(false),
      }
    );
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="max-w-md w-full border border-default-200 bg-surface rounded-lg">
          <Modal.Header>
            <Modal.Heading className="font-display font-bold text-default-800 text-lg">
              Từ chối minh chứng thanh toán
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
            <p className="text-sm text-default-500">
              Vui lòng cung cấp lý do từ chối cụ thể. Lý do này sẽ được hiển thị cho học viên để họ tiến hành đăng tải lại minh chứng mới.
            </p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rejection-reason" className="text-xs font-bold text-default-700">
                Lý do từ chối (Tối thiểu 10 ký tự)
              </label>
              <TextArea
                id="rejection-reason"
                placeholder="Mô tả lý do không hợp lệ (ví dụ: ảnh mờ không thấy mã giao dịch, sai số tài khoản...)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
              <p className="text-[10px] text-default-400 text-right">
                Số ký tự hiện tại: {rejectionReason.length} / 10
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={() => onOpenChange(false)} className="font-semibold">
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              onPress={handleSubmit}
              isDisabled={rejectionReason.length < 10 || rejecting}
              className="font-bold"
            >
              Xác nhận từ chối
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
