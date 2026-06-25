"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, Spinner } from "@heroui/react";
import { Settings } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { useAdminData } from "./hooks/use-admin-data";
import { CasesTab } from "./_components/cases-tab";
import { PaymentsTab } from "./_components/payments-tab";
import { RejectPaymentModal } from "./_components/reject-payment-modal";

export default function AdminConsole() {
  const router = useRouter();
  const { data: session, isPending: loadingSession } = authClient.useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const isAdmin = !loadingSession && (session?.user as { role?: string })?.role === "admin";

  const { cases, supporters, payments, loadingCases, loadingSupporters, loadingPayments,
    assignMutation, verifyPaymentMutation } = useAdminData({ enabled: isAdmin });

  // Auth guard
  useEffect(() => {
    if (!loadingSession) {
      if (!session) router.push("/auth");
      else if ((session.user as { role?: string }).role !== "admin") router.push("/dashboard");
    }
  }, [session, loadingSession, router]);

  if (loadingSession || loadingCases || loadingSupporters || loadingPayments) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-default-500">Đang tải trang quản trị...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleApprovePayment = (paymentId: string) => {
    if (confirm("Xác nhận đã nhận được khoản thanh toán này?")) {
      verifyPaymentMutation.mutate({ paymentId, status: "paid" });
    }
  };

  const handleRejectPayment = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-orange-600 dark:text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold font-display text-default-800">Quản trị hệ thống</h1>
          <p className="text-sm text-default-500">Điều phối supporter và kiểm duyệt giao dịch.</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs variant="secondary">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Các tác vụ quản trị" className="border-b border-default-200">
            <Tabs.Tab id="cases">
              Phân phối Supporter
              <Tabs.Indicator className="bg-orange-500" />
            </Tabs.Tab>
            <Tabs.Tab id="payments">
              Duyệt giao dịch
              <Tabs.Indicator className="bg-orange-500" />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="cases">
          <CasesTab cases={cases} supporters={supporters} assignMutation={assignMutation} />
        </Tabs.Panel>

        <Tabs.Panel id="payments">
          <PaymentsTab
            payments={payments}
            onApprove={handleApprovePayment}
            onReject={handleRejectPayment}
          />
        </Tabs.Panel>
      </Tabs>

      {/* Reject Modal */}
      <RejectPaymentModal
        isOpen={isModalOpen}
        paymentId={selectedPaymentId}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedPaymentId(null);
        }}
        verifyPaymentMutation={verifyPaymentMutation}
      />
    </div>
  );
}
