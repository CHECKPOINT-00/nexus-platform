"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button, Select, Textarea } from "@mantine/core";
import { CheckCircle, Loader2 } from "lucide-react";
import { usePackages } from "@/hooks/usePackages";

interface ApproveCaseModalProps {
  caseId: string | null;
  onClose: () => void;
  onApprove: (caseId: string, proposed_package_id?: string, package_change_reason?: string) => Promise<void>;
  currentPackageId?: string;
}

export default function ApproveCaseModal({
  caseId,
  onClose,
  onApprove,
  currentPackageId,
}: ApproveCaseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: packages, isLoading: isLoadingPackages } = usePackages();
  const [proposedPackageId, setProposedPackageId] = useState<string | null>(null);
  const [packageChangeReason, setPackageChangeReason] = useState<string>("");

  useEffect(() => {
    if (!caseId) {
      setError(null);
      setProposedPackageId(null);
      setPackageChangeReason("");
    } else if (currentPackageId) {
      setProposedPackageId(currentPackageId);
    }
  }, [caseId, currentPackageId]);

  const hasProposedChange = proposedPackageId && proposedPackageId !== currentPackageId;

  const handleSubmit = async () => {
    if (!caseId) return;
    if (hasProposedChange && !packageChangeReason.trim()) {
      setError("Vui lòng nhập lý do thay đổi gói dịch vụ.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onApprove(
        caseId,
        hasProposedChange ? proposedPackageId : undefined,
        hasProposedChange ? packageChangeReason : undefined
      );
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Đã xảy ra lỗi khi duyệt hồ sơ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={caseId !== null}
      onClose={onClose}
      title={
        <div className="flex items-center gap-1.5 text-green-600 font-heading font-bold text-sm">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>Xác nhận duyệt hồ sơ</span>
        </div>
      }
      centered
    >
      <div className="space-y-4 font-body text-xs text-text-app">
        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-danger">
            {error}
          </div>
        )}

        <p className="text-sm leading-relaxed">
          Xác nhận duyệt hồ sơ này là hợp lệ để tiến hành phản biện? Hồ sơ sẽ được chuyển sang trạng thái <strong>Chờ Xác Nhận Gói / Chờ Thanh Toán</strong>.
        </p>
        
        <hr className="border-border-app" />

        <div className="space-y-3">
          <Select
            label="Đề xuất gói dịch vụ khác (Tùy chọn)"
            placeholder="Giữ nguyên gói dịch vụ của học sinh"
            value={proposedPackageId}
            onChange={(val) => {
              setProposedPackageId(val);
              if (val === currentPackageId) {
                setPackageChangeReason("");
              }
            }}
            data={
              packages?.map((pkg) => ({
                value: pkg.id,
                label: `${pkg.name} (${pkg.price.toLocaleString("vi-VN")}đ)`,
              })) || []
            }
            disabled={isLoadingPackages || isSubmitting}
            clearable
          />

          {hasProposedChange && (
            <Textarea
              label="Lý do thay đổi gói dịch vụ"
              placeholder="Nhập lý do đổi gói..."
              value={packageChangeReason}
              onChange={(e) => setPackageChangeReason(e.currentTarget.value)}
              required
              rows={3}
              disabled={isSubmitting}
            />
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border-app">
          <Button
            onClick={onClose}
            variant="default"
            className="flex-1"
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            color="green"
            className="flex-1"
            leftSection={isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            disabled={isSubmitting}
          >
            Xác nhận duyệt
          </Button>
        </div>
      </div>
    </Modal>
  );
}
