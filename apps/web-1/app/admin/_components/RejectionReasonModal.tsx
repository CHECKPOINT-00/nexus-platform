import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button, Modal, TextArea } from "@heroui/react";

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting: boolean;
}

export default function RejectionReasonModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim().length < 10) return;
    onConfirm(reason.trim());
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Modal.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" />
      <Modal.Container className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body">
        <Modal.Dialog className="w-full max-w-md bg-surface-app border border-border-app rounded-2xl shadow-xl overflow-hidden flex flex-col outline-none">
          {/* Header */}
          <Modal.Header className="p-4 border-b border-border-app flex justify-between items-center bg-surface-soft/40">
            <div className="flex items-center gap-1.5 text-danger font-heading font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Từ chối giao dịch thanh toán</span>
            </div>
            <Modal.CloseTrigger className="p-1 rounded-full hover:bg-surface-muted text-text-muted hover:text-text-app cursor-pointer">
              <X className="w-4 h-4" />
            </Modal.CloseTrigger>
          </Modal.Header>

          {/* Content */}
          <Modal.Body className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-app">Lý do từ chối (Bắt buộc)</label>
              <TextArea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do từ chối chuyển khoản cụ thể (ví dụ: Số tiền chuyển khoản không khớp, sai nội dung chuyển khoản...)"
                className="w-full"
                maxLength={250}
                required
              />
              <div className="flex justify-between items-center text-[10px]">
                <span className={reason.length < 10 ? "text-danger" : "text-success"}>
                  {reason.length < 10 
                    ? `Cần nhập tối thiểu 10 ký tự (Hiện tại: ${reason.length}/10)` 
                    : "Đủ điều kiện phê duyệt"}
                </span>
                <span className="text-text-subtle">{reason.length}/250</span>
              </div>
            </div>
          </Modal.Body>

          {/* Actions Footer */}
          <Modal.Footer className="p-4 border-t border-border-app flex gap-3 bg-surface-soft/20">
            <Button
              onPress={handleClose}
              isDisabled={isSubmitting}
              variant="ghost"
              className="flex-1 border border-border-strong text-text-muted hover:text-text-app font-body font-semibold text-xs h-10 rounded-lg cursor-pointer bg-surface-app"
            >
              Hủy bỏ
            </Button>
            <Button
              onPress={handleConfirm}
              isDisabled={reason.trim().length < 10 || isSubmitting}
              className="flex-1 bg-danger text-white font-body font-semibold text-xs h-10 rounded-lg hover:bg-danger-hover cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận Từ chối"}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}
