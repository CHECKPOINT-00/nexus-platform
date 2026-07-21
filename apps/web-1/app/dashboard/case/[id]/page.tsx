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
import TabCaseSettings from "./_components/TabCaseSettings";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import RevisionSubmitModal from "./_components/RevisionSubmitModal";
import ExternalFeedbackUploadModal from "./_components/ExternalFeedbackUploadModal";
import { Button, Alert, Modal } from "@mantine/core";
import { useRecallRevision } from "./hooks/useRecallRevision";
import { notifications } from "@mantine/notifications";
import { getCaseEffectivePrice, caseRequiresPayment } from "@/lib/pricing";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Sparkles, Zap } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
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
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isRecallConfirmOpen, setIsRecallConfirmOpen] = useState(false);

  const { recallRevision, isRecalling } = useRecallRevision(id);

  const handleRecall = () => {
    setIsRecallConfirmOpen(true);
  };

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

  const hasRevisionBanner =
    !!(openRequestsForMoreInfo && openRequestsForMoreInfo.length > 0) ||
    caseData.user_facing_stage === "report_ready" ||
    caseData.user_facing_stage === "waiting_for_revision";
  const effectivePrice = getCaseEffectivePrice(caseData);

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

            {!caseRequiresPayment(caseData) && (
              <StatusGuidanceCard
                caseData={caseData}
                openRequestsForMoreInfo={openRequestsForMoreInfo}
                onOpenRevision={() => setIsRevisionOpen(true)}
                onRecallRevision={handleRecall}
                isRecalling={isRecalling}
                onSelectTab={setActiveTab}
              />
            )}
          </>
        )}

        <div className="flex-grow min-h-0">
          {activeTab === "documents" && (
            <>
              <div className="mb-4 flex justify-end gap-3">
                {(caseData.user_facing_stage === "report_ready" ||
                  caseData.user_facing_stage === "waiting_for_revision" ||
                  caseData.user_facing_stage === "need_more_information") &&
                  !hasRevisionBanner && (
                  <Button
                    size="sm"
                    color="brand"
                    className="font-semibold cursor-pointer h-8.5 text-xs"
                    onClick={() => setIsRevisionOpen(true)}
                  >
                    Nộp bản sửa
                  </Button>
                )}
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

      <RevisionSubmitModal isOpen={isRevisionOpen} onClose={() => setIsRevisionOpen(false)} caseId={id} />
      <ExternalFeedbackUploadModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        caseId={id}
        latestVersionNo={documentWorkspace?.checkpoints?.[0]?.latest_version_no || 1}
      />

      <Modal
        opened={isRecallConfirmOpen}
        onClose={() => setIsRecallConfirmOpen(false)}
        title={<span className="font-heading font-bold text-sm text-text-app">Xác nhận thu hồi bản nộp mới nhất</span>}
        size="md"
        radius="md"
        centered
      >
        <div className="space-y-4 font-body text-xs text-text-muted">
          <p>
            Bạn có chắc chắn muốn thu hồi <span className="font-bold">bản nộp mới nhất</span> này không? Hành động này sẽ thực hiện:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Xóa toàn bộ các tệp tài liệu của <span className="font-bold">bản nộp mới nhất</span> khỏi hệ thống.</li>
            <li>Hoàn tác phiên bản và khôi phục trạng thái hồ sơ về vòng trước.</li>
          </ul>
          <p className="font-semibold text-danger">
            Lưu ý: Mọi tệp và mô tả của bản nộp mới nhất này sẽ bị xóa bỏ hoàn toàn và không thể khôi phục.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              className="font-semibold cursor-pointer"
              onClick={() => setIsRecallConfirmOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              size="xs"
              color="red"
              className="font-semibold cursor-pointer"
              loading={isRecalling}
              onClick={async () => {
                try {
                  await recallRevision();
                  setIsRecallConfirmOpen(false);
                  notifications.show({
                    title: "Thu hồi thành công",
                    message: "Bản nộp đã được thu hồi. Bạn có thể tiến hành nộp lại.",
                    color: "teal",
                  });
                } catch (err: any) {
                  notifications.show({
                    title: "Lỗi thu hồi",
                    message: err?.response?.data?.message || "Không thể thu hồi bản nộp.",
                    color: "red",
                  });
                }
              }}
            >
              Xác nhận thu hồi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
