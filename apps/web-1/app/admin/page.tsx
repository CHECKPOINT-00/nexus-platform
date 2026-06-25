"use client";

import React, { useState } from "react";
import { useAdminPayments } from "./hooks/useAdminPayments";
import { useAdminCases } from "./hooks/useAdminCases";
import AdminPaymentVerificationTable from "./_components/AdminPaymentVerificationTable";
import AdminCaseAssignmentTable from "./_components/AdminCaseAssignmentTable";
import RejectionReasonModal from "./_components/RejectionReasonModal";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { Shield, CreditCard, UserCheck, CheckCircle } from "lucide-react";

export default function AdminHubPage() {
  const {
    payments,
    isLoading: isPaymentsLoading,
    verifyPayment,
    isVerifying,
  } = useAdminPayments();

  const {
    cases,
    isCasesLoading,
    supporters,
    isSupportersLoading,
    assignSupporter,
    isAssigning,
  } = useAdminCases();

  // Rejection modal control
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"payments" | "cases">("payments");

  const handleApprovePayment = async (paymentId: string) => {
    if (window.confirm("Xác nhận đã nhận đủ số tiền thanh toán cho giao dịch này?")) {
      try {
        await verifyPayment({ paymentId, status: "paid" });
        alert("Đã duyệt thanh toán thành công!");
      } catch (e) {
        alert("Gặp lỗi khi duyệt thanh toán.");
      }
    }
  };

  const handleRejectClick = (paymentId: string) => {
    setRejectingPaymentId(paymentId);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingPaymentId) return;
    try {
      await verifyPayment({
        paymentId: rejectingPaymentId,
        status: "rejected",
        rejectionReason: reason,
      });
      setRejectingPaymentId(null);
      alert("Đã từ chối minh chứng thanh toán và gửi lý do cho sinh viên.");
    } catch (e) {
      alert("Gặp lỗi khi thực hiện từ chối thanh toán.");
    }
  };

  const handleAssignSupporter = async (caseId: string, supporterId: string) => {
    try {
      await assignSupporter({ caseId, supporterId });
      alert("Đã phân công Supporter chuyên môn phụ trách case thành công!");
    } catch (e) {
      alert("Gặp lỗi khi thực hiện phân công.");
    }
  };

  const isLoading = isPaymentsLoading || isCasesLoading || isSupportersLoading;

  const pendingPaymentsCount = payments.filter((p) => p.status === "pending_verification").length;
  const unassignedCasesCount = cases.filter((c) => c.internal_status === "unassigned").length;

  return (
    <div className="space-y-8 font-body text-xs text-text-app pb-12 animate-fade-in">
      {/* 1. Admin Console Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-soft/40 text-brand flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-app">Bàn làm việc Admin</h1>
          <p className="text-text-muted text-xs">Quản lý giao dịch thanh toán và phân công Supporter chuyên môn hỗ trợ.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <LoadingSkeleton variant="table-row" count={2} />
          <LoadingSkeleton variant="table-row" count={2} />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 p-2 border border-border-app bg-surface-app rounded-2xl shadow-sm h-fit">
            <button
              onClick={() => setActiveSection("payments")}
              className={`flex-1 md:flex-initial flex items-center justify-between gap-3 p-3 rounded-xl font-heading font-semibold text-xs transition-all cursor-pointer ${
                activeSection === "payments"
                  ? "bg-brand text-white shadow-sm shadow-brand/10"
                  : "text-text-muted hover:text-text-app hover:bg-surface-soft"
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Duyệt thanh toán</span>
              </div>
              {pendingPaymentsCount > 0 && (
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeSection === "payments" ? "bg-white text-brand" : "bg-warning text-white"
                }`}>
                  {pendingPaymentsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection("cases")}
              className={`flex-1 md:flex-initial flex items-center justify-between gap-3 p-3 rounded-xl font-heading font-semibold text-xs transition-all cursor-pointer ${
                activeSection === "cases"
                  ? "bg-brand text-white shadow-sm shadow-brand/10"
                  : "text-text-muted hover:text-text-app hover:bg-surface-soft"
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Phân công Supporter</span>
              </div>
              {unassignedCasesCount > 0 && (
                <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeSection === "cases" ? "bg-white text-brand" : "bg-brand-soft text-brand"
                }`}>
                  {unassignedCasesCount}
                </span>
              )}
            </button>
          </div>

          {/* Section Content */}
          <div className="flex-grow min-w-0">
            {activeSection === "payments" ? (
              <div className="space-y-3">
                <div className="pb-1.5 border-b border-border-app/55">
                  <h3 className="font-heading font-bold text-sm text-text-app">Duyệt minh chứng thanh toán</h3>
                  <p className="text-[10px] text-text-muted">Kiểm tra thông tin giao dịch chuyển khoản và ảnh đối chiếu từ học viên.</p>
                </div>
                <AdminPaymentVerificationTable
                  payments={payments}
                  onApprove={handleApprovePayment}
                  onReject={handleRejectClick}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="pb-1.5 border-b border-border-app/55">
                  <h3 className="font-heading font-bold text-sm text-text-app">Phân công Supporter chuyên môn</h3>
                  <p className="text-[10px] text-text-muted">Chỉ định Supporter phụ trách đánh giá và sửa đổi bản thảo phản biện cho Case mới.</p>
                </div>
                <AdminCaseAssignmentTable
                  cases={cases}
                  supporters={supporters}
                  onAssign={handleAssignSupporter}
                  isAssigning={isAssigning}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Rejection Reason Modal */}
      <RejectionReasonModal
        isOpen={rejectingPaymentId !== null}
        onClose={() => setRejectingPaymentId(null)}
        onConfirm={handleConfirmReject}
        isSubmitting={isVerifying}
      />
    </div>
  );
}
