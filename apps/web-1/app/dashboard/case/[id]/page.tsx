"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useCaseDetails } from "./hooks/useCaseDetails";
import CaseStatusHeader from "./_components/CaseStatusHeader";
import UnpaidAlertBanner from "./_components/UnpaidAlertBanner";
import StatusGuidanceCard from "./_components/StatusGuidanceCard";
import WorkspaceSidebar from "./_components/WorkspaceSidebar";
import DocumentWorkspace from "./_components/documents/DocumentWorkspace";
import TabDiscussionChat from "./_components/TabDiscussionChat";
import ActivityTimeline from "./_components/ActivityTimeline";
import AuditRoundTimeline from "./_components/AuditRoundTimeline";
import TabCaseSettings from "./_components/TabCaseSettings";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import BuyRoundModal from "./_components/BuyRoundModal";
import ExternalFeedbackUploadModal from "./_components/ExternalFeedbackUploadModal";
import { Button, Alert, Stepper } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getCaseEffectivePrice, caseRequiresPayment } from "@/lib/pricing";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Sparkles, Zap, Clock, AlertCircle } from "lucide-react";
import type { AuditRound } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const AUDIT_STAGES = [
  "Bổ sung thông tin",
  "Chờ supporter review",
  "Nhận báo cáo",
];

function getActiveStep(stage: string): number {
  switch (stage) {
    case "submitted":
    case "need_more_information":
      return 0;
    case "under_review":
    case "revision_submitted":
      return 1;
    case "report_ready":
    case "waiting_for_revision":
      return 2;
    case "completed":
    case "approved":
    case "APPROVED":
    case "sent":
      return 3;
    default:
      return 0;
  }
}

function getStepGuidance(stage: string): { title: string; message: string; color: string } | null {
  switch (stage) {
    case "submitted":
      return { title: "Bổ sung thông tin", message: "Vui lòng tải lên đầy đủ tài liệu dự án để Supporter có thể bắt đầu đánh giá.", color: "blue" };
    case "need_more_information":
      return { title: "Cần bổ sung thông tin", message: "Supporter yêu cầu bổ sung thêm thông tin. Vui lòng kiểm tra yêu cầu và cập nhật tài liệu.", color: "orange" };
    case "under_review":
      return { title: "Đang đánh giá", message: "Supporter đang đọc tài liệu và viết báo cáo phản biện. Vui lòng chờ trong thời gian này.", color: "blue" };
    case "revision_submitted":
      return { title: "Đang thẩm định bản sửa", message: "Supporter đang thẩm định bản sửa đổi mới nhất của bạn.", color: "blue" };
    case "report_ready":
    case "waiting_for_revision":
      return { title: "Nhận báo cáo", message: "Báo cáo phản biện đã sẵn sàng. Bạn có thể xem báo cáo và nộp bản sửa đổi cho vòng tiếp theo.", color: "green" };
    case "completed":
    case "approved":
    case "APPROVED":
    case "sent":
      return { title: "Hoàn tất", message: "Quy trình phản biện đã hoàn tất. Cảm ơn bạn đã sử dụng dịch vụ.", color: "green" };
    default:
      return null;
  }
}

function getSlaInfo(slaDeadlineAt: string | null): { text: string; isOverdue: boolean } | null {
  if (!slaDeadlineAt) return null;
  const slaDate = new Date(slaDeadlineAt);
  const now = new Date();
  const diffMs = slaDate.getTime() - now.getTime();
  if (diffMs <= 0) return { text: "Quá hạn", isOverdue: true };
  const hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));
  if (hoursRemaining < 1) return { text: "còn <1h", isOverdue: false };
  return { text: `còn ${hoursRemaining}h`, isOverdue: false };
}

export default function CaseWorkspacePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const {
    caseData,
    roundHistory,
    openRequestsForMoreInfo,
    documentWorkspace,
    isLoading,
    error,
  } = useCaseDetails(id);

  const [activeTab, setActiveTab] = useState<"documents" | "discussion" | "timeline" | "settings">("documents");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [buyRoundOpened, setBuyRoundOpened] = useState(false);

  const finalStages = ["completed", "rejected", "closed"];
  const showUpgradeBanner =
    caseData.package_id === "pkg_tf_free" &&
    caseData.payment_status === "not_required" &&
    !finalStages.includes(caseData.user_facing_stage);

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/cases/${id}/upgrade-package`, {
        packageId: "pkg_tf_audit",
      });
      return res.data;
    },
    onSuccess: () => {
      router.push(`/dashboard/case/${id}/payment`);
    },
    onError: () => {
      notifications.show({
        title: "Nâng cấp thất bại",
        message: "Không thể nâng cấp gói dịch vụ. Vui lòng thử lại sau.",
        color: "red",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 w-full pb-12">
        <LoadingSkeleton variant="text-block" count={1} />
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="w-full p-4">
        <div className="p-4 bg-danger-soft border border-danger/10 text-danger rounded-xl font-body text-sm">
          Không thể tải dữ liệu không gian làm việc của hồ sơ. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  const effectivePrice = getCaseEffectivePrice(caseData);
  const isAudit = caseData.package_id === "pkg_tf_audit";
  const activeAuditRound = caseData.audit_rounds?.find(
    (r: AuditRound) => r.status !== "completed"
  ) || caseData.audit_rounds?.[caseData.audit_rounds.length - 1];
  const slaInfo = activeAuditRound ? getSlaInfo(activeAuditRound.slaDeadlineAt) : null;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden animate-fade-in">
      <WorkspaceSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        messageCount={caseData.messages?.length}
      />

      <div className="flex-grow flex flex-col h-full min-w-0 overflow-y-auto p-6 space-y-6">
        {activeTab !== "discussion" && (
          <>
            <CaseStatusHeader caseData={caseData} versions={[]} selectedVersion={0} onVersionChange={() => {}} />

            {slaInfo && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-body animate-fade-in ${
                  slaInfo.isOverdue
                    ? "bg-danger/10 text-danger font-semibold"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {slaInfo.isOverdue ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                <span>SLA {slaInfo.text}</span>
              </div>
            )}

            <UnpaidAlertBanner
              caseData={caseData}
              onOpenPayment={() => router.push(`/dashboard/case/${id}/payment`)}
            />

            {showUpgradeBanner && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg bg-brand-soft/30 border border-brand/20 animate-fade-in">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-heading font-semibold text-sm text-text-app">Nâng cấp gói dịch vụ</h4>
                    <p className="font-body text-xs text-text-muted leading-relaxed">
                      Bạn đang dùng bản đánh giá miễn phí. Nâng cấp lên Audit (39k) để được phân tích chuyên sâu.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => upgradeMutation.mutate()}
                  color="teal"
                  loading={upgradeMutation.isPending}
                  leftSection={<Zap className="w-4 h-4" />}
                  className="font-body font-semibold text-xs h-9 px-4 shrink-0 cursor-pointer"
                >
                  Nâng cấp ngay
                </Button>
              </div>
            )}

            {isAudit && (
              <>
                <Stepper
                  active={getActiveStep(caseData.user_facing_stage)}
                  size="sm"
                  className="animate-fade-in"
                >
                  {AUDIT_STAGES.map((label, idx) => (
                    <Stepper.Step key={idx} label={label} />
                  ))}
                </Stepper>

                {(() => {
                  const guidance = getStepGuidance(caseData.user_facing_stage);
                  if (!guidance) return null;
                  return (
                    <Alert
                      variant="light"
                      color={guidance.color}
                      radius="md"
                      title={guidance.title}
                      className="animate-fade-in font-body text-xs shrink-0"
                    >
                      <p className="text-text-muted text-xs leading-relaxed">
                        {guidance.message}
                      </p>
                    </Alert>
                  );
                })()}
              </>
            )}

            {!caseRequiresPayment(caseData) && (
              <StatusGuidanceCard
                caseData={caseData}
                openRequestsForMoreInfo={openRequestsForMoreInfo}
                onOpenBuyRound={() => setBuyRoundOpened(true)}
                onSelectTab={setActiveTab}
              />
            )}

            {caseData.audit_rounds && caseData.audit_rounds.length > 0 && (
              <AuditRoundTimeline auditRounds={caseData.audit_rounds} assignedSupporterAuthUserId={caseData.assigned_supporter_auth_user_id} />
            )}
          </>
        )}

        <div className="flex-grow min-h-0">
          {activeTab === "documents" && (
            <>
              <div className="mb-4 flex justify-end gap-3">
                <Button
                  size="sm"
                  color="brand"
                  variant="light"
                  className="font-semibold cursor-pointer h-8.5 text-xs"
                  onClick={() => setIsFeedbackOpen(true)}
                >
                  Tải đánh giá bên ngoài
                </Button>
              </div>
              <DocumentWorkspace workspace={documentWorkspace} />
            </>
          )}

          {activeTab === "discussion" && <TabDiscussionChat caseId={caseData.id} />}

          {activeTab === "timeline" && <ActivityTimeline caseData={caseData} />}

          {activeTab === "settings" && <TabCaseSettings caseData={caseData} />}
        </div>
      </div>

      <BuyRoundModal caseId={id} opened={buyRoundOpened} onClose={() => setBuyRoundOpened(false)} />
      <ExternalFeedbackUploadModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        caseId={id}
        latestVersionNo={documentWorkspace?.checkpoints?.[0]?.latest_version_no || 1}
      />

    </div>
  );
}
