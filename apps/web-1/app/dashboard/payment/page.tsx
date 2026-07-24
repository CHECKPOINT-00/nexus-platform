"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button, Alert } from "@mantine/core";
import { CreditCard, CheckCircle2, Clock, XCircle, AlertCircle, ArrowLeft, Upload } from "lucide-react";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("pid");

  const { data: payment, isLoading, error } = useQuery({
    queryKey: ["payment", paymentId],
    queryFn: async () => {
      const res = await apiClient.get(`/payments/${paymentId}`);
      return res.data;
    },
    enabled: !!paymentId,
    refetchInterval: 5000,
  });

  if (!paymentId) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-4">
        <Alert color="red" title="Thiếu thông tin">
          Không tìm thấy mã giao dịch. Vui lòng thử lại.
        </Alert>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-6">
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-4">
        <Alert color="red" title="Lỗi">
          Không thể tải thông tin thanh toán.
        </Alert>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    unpaid: { label: "Chờ thanh toán", color: "orange", icon: Clock },
    pending_verification: { label: "Đang chờ xác nhận", color: "blue", icon: Clock },
    paid: { label: "Đã thanh toán", color: "green", icon: CheckCircle2 },
    rejected: { label: "Bị từ chối", color: "red", icon: XCircle },
  };

  const statusInfo = statusConfig[payment.status] || { label: payment.status, color: "gray", icon: AlertCircle };
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-text-muted hover:text-text-app text-xs">
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </button>

      <div className="bg-surface-app border border-border-app rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-text-app">Thanh toán</h2>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
            statusInfo.color === "green" ? "bg-success-soft text-success border-success/20" :
            statusInfo.color === "red" ? "bg-danger-soft text-danger border-danger/20" :
            statusInfo.color === "orange" ? "bg-warning-soft text-warning border-warning/20" :
            "bg-info-soft text-info border-info/20"
          }`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </span>
        </div>

	        {/* Bank info + QR */}
	        <div className="bg-brand-subtle/20 border border-brand/10 rounded-xl p-5 space-y-4">
	          <h3 className="font-heading font-semibold text-sm text-brand flex items-center gap-2">
	            <CreditCard className="w-4 h-4" />
	            Thông tin chuyển khoản
	          </h3>

	          {/* QR Code */}
	          {payment.bankInfo?.accountNumber && (
	            <div className="flex justify-center py-2">
	              <img
	                src={`https://img.vietqr.io/image/${payment.bankInfo.bankShortCode || "MB"}-${payment.bankInfo.accountNumber}-qr_only.png?amount=${payment.amount}&addInfo=${encodeURIComponent(payment.bankInfo.transferContent)}&accountName=${encodeURIComponent(payment.bankInfo.accountName)}`}
	                alt="QR thanh toán"
	                className="w-48 h-48 rounded-lg border border-border-app bg-white"
	              />
	            </div>
	          )}

	          <div className="space-y-3 text-xs">
	            <div className="flex justify-between py-1">
	              <span className="text-text-muted">Ngân hàng</span>
	              <span className="font-bold">{payment.bankInfo?.bankName || "MB Bank (Ngân hàng Quân Đội)"}</span>
	            </div>
	            <div className="flex justify-between py-1">
	              <span className="text-text-muted">Số tài khoản</span>
	              <span className="font-bold">{payment.bankInfo?.accountNumber || "0909090909"}</span>
	            </div>
	            <div className="flex justify-between py-1">
	              <span className="text-text-muted">Chủ tài khoản</span>
	              <span className="font-bold">{payment.bankInfo?.accountName || "NEXUS PLATFORM"}</span>
	            </div>
	            <div className="flex justify-between py-1">
	              <span className="text-text-muted">Số tiền</span>
	              <span className="font-bold text-brand">{payment.amount?.toLocaleString("vi-VN")}₫</span>
	            </div>
	            <div className="flex justify-between py-1">
	              <span className="text-text-muted">Nội dung CK</span>
	              <span className="font-bold text-xs uppercase font-mono px-2 py-1 bg-brand-soft/30 border border-brand/10 rounded text-brand">
	                {payment.bankInfo?.transferContent || "Thanh toan credit"}
	              </span>
	            </div>
	          </div>
	        </div>

        {/* Payment actions */}
        {payment.status === "unpaid" && (
          <div className="space-y-3">
            <p className="text-xs text-text-muted">
              Sau khi chuyển khoản, vui lòng quay lại trang hồ sơ để tải lên minh chứng thanh toán.
            </p>
            <Button
              component="a"
              href={`/dashboard/case/${payment.case_id}`}
              color="brand"
              fullWidth
              leftSection={<Upload className="w-4 h-4" />}
            >
              Tải lên minh chứng
            </Button>
          </div>
        )}

        {payment.status === "paid" && (
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
            <p className="text-sm font-semibold text-text-app">Thanh toán thành công</p>
            <Button
              component="a"
              href={`/dashboard/case/${payment.case_id}`}
              color="brand"
            >
              Về trang hồ sơ
            </Button>
          </div>
        )}

        {payment.status === "rejected" && (
          <Alert color="red" title="Giao dịch bị từ chối">
            <p className="text-xs">{payment.rejection_reason || "Minh chứng không hợp lệ."}</p>
          </Alert>
        )}
      </div>
    </div>
  );
}
