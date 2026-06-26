"use client";

import React from "react";
import { Payment } from "@/types";
import { Check, X, FileText, Image as ImageIcon, ExternalLink, AlertCircle } from "lucide-react";
import { Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";

interface AdminPaymentVerificationTableProps {
  payments: Payment[];
  onApprove: (paymentId: string) => void;
  onReject: (paymentId: string) => void;
}

export default function AdminPaymentVerificationTable({
  payments,
  onApprove,
  onReject,
}: AdminPaymentVerificationTableProps) {
  const pendingPayments = payments.filter((p) => p.status === "pending_verification");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPdf = (url?: string | null) => {
    if (!url) return false;
    return url.toLowerCase().endsWith(".pdf");
  };

  if (pendingPayments.length === 0) {
    return (
      <div className="p-8 border border-border-app rounded-2xl bg-surface-app text-center flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-soft border border-border-app text-text-subtle flex items-center justify-center">
          <Check className="w-5 h-5 text-success" />
        </div>
        <div className="space-y-0.5">
          <p className="font-heading font-semibold text-xs text-text-app">Không có giao dịch chờ duyệt</p>
          <p className="font-body text-[11px] text-text-muted">
            Tất cả minh chứng chuyển khoản ngân hàng đã được xử lý hoặc chưa được gửi lên.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border-app rounded-2xl overflow-hidden bg-surface-app shadow-sm font-body text-xs text-text-app">
      <div className="overflow-x-auto">
        <Table aria-label="Bảng xác thực thanh toán" className="w-full border-collapse text-left">
          <TableHeader className="bg-surface-soft border-b border-border-app font-heading font-bold text-[11px] text-text-muted">
            <TableColumn className="p-4 pl-6 text-left">Mã dự án</TableColumn>
            <TableColumn className="p-4 text-left">Gói dịch vụ</TableColumn>
            <TableColumn className="p-4 text-left">Số tiền</TableColumn>
            <TableColumn className="p-4 text-left">Thời gian gửi</TableColumn>
            <TableColumn className="p-4 text-left">Biên lai giao dịch</TableColumn>
            <TableColumn className="p-4 pr-6 text-right">Thao tác</TableColumn>
          </TableHeader>
          <TableBody className="divide-y divide-border-app/45">
            {pendingPayments.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-surface-soft/30 transition-colors border-b border-border-app/40 last:border-b-0">
                <TableCell className="p-4 pl-6 font-heading font-bold text-xs">
                  {payment.case?.case_code || "CASE"}
                </TableCell>
                <TableCell className="p-4 font-semibold text-text-muted">
                  {payment.package?.name || "Gói dịch vụ"}
                </TableCell>
                <TableCell className="p-4 font-heading font-semibold text-brand text-xs">
                  {formatPrice(payment.amount)}
                </TableCell>
                <TableCell className="p-4 text-text-subtle">
                  {formatDate(payment.created_at)}
                </TableCell>
                <TableCell className="p-4">
                  {payment.proof_file_url ? (
                    <a
                      href={`http://localhost:8000${payment.proof_file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand hover:underline font-semibold"
                    >
                      {isPdf(payment.proof_file_url) ? (
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>Xem minh chứng</span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-subtle" />
                    </a>
                  ) : (
                    <span className="text-text-subtle italic flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Không tìm thấy file
                    </span>
                  )}
                </TableCell>
                <TableCell className="p-4 pr-6 text-right">
                  <div className="inline-flex items-center gap-2 justify-end">
                    <Button
                      onPress={() => onApprove(payment.id)}
                      className="bg-success hover:bg-success-hover text-white text-[10px] font-semibold h-8 w-8 min-w-0 p-0 rounded-lg shadow-sm shadow-success/10 flex items-center justify-center cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      onPress={() => onReject(payment.id)}
                      className="bg-danger hover:bg-danger-hover text-white text-[10px] font-semibold h-8 w-8 min-w-0 p-0 rounded-lg shadow-sm shadow-danger/10 flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
