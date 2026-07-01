"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useCaseDetails } from "./hooks/useCaseDetails";
import CaseStatusHeader from "./_components/CaseStatusHeader";
import UnpaidAlertBanner from "./_components/UnpaidAlertBanner";
import WorkspaceSidebar from "./_components/WorkspaceSidebar";
import DocumentWorkspace from "./_components/documents/DocumentWorkspace";
import TabDiscussionChat from "./_components/TabDiscussionChat";
import ActivityTimeline from "./_components/ActivityTimeline";
import TabCaseSettings from "./_components/TabCaseSettings";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import RevisionSubmitModal from "./_components/RevisionSubmitModal";
import ExternalFeedbackUploadModal from "./_components/ExternalFeedbackUploadModal";
import { Button } from "@mantine/core";

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

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden animate-fade-in">
      <WorkspaceSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        messageCount={caseData.messages?.length}
      />

      <div className="flex-grow flex flex-col h-full min-w-0 overflow-y-auto p-6 space-y-6">
        <CaseStatusHeader caseData={caseData} versions={[]} selectedVersion={0} onVersionChange={() => {}} />

        <UnpaidAlertBanner
          caseData={caseData}
          onOpenPayment={() => router.push(`/dashboard/case/${id}/payment`)}
        />

        {openRequestsForMoreInfo && openRequestsForMoreInfo.length > 0 && (
          <div className="p-4 bg-warning-soft border border-warning/15 text-warning rounded-lg font-body text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0 animate-fade-in">
            <div className="space-y-1">
              <h5 className="font-bold">⚠️ Yêu cầu bổ sung thông tin từ Supporter</h5>
              <p>{openRequestsForMoreInfo[0].metadata_json?.query || "Vui lòng xem chi tiết phản hồi."}</p>
            </div>
            <Button
              size="sm"
              color="brand"
              className="font-semibold cursor-pointer h-8.5 text-xs"
              onClick={() => setIsRevisionOpen(true)}
            >
              Nộp bản sửa / Bổ sung tài liệu
            </Button>
          </div>
        )}

        {(caseData.user_facing_stage === "report_ready" || caseData.user_facing_stage === "waiting_for_revision") &&
          (!openRequestsForMoreInfo || openRequestsForMoreInfo.length === 0) && (
            <div className="p-4 bg-brand-soft/20 border border-brand/10 rounded-lg font-body text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0 animate-fade-in">
              <div className="space-y-1">
                <h5 className="font-bold text-brand">📝 Hồ sơ đã có báo cáo phản biện</h5>
                <p className="text-text-muted">
                  Nhóm có thể tiến hành sửa đổi bài làm và nộp bản mới để Supporter thẩm định vòng tiếp theo.
                </p>
              </div>
              <Button
                size="sm"
                color="brand"
                className="font-semibold cursor-pointer h-8.5 text-xs"
                onClick={() => setIsRevisionOpen(true)}
              >
                Nộp bản sửa
              </Button>
            </div>
          )}

        <div className="flex-grow min-h-0">
          {activeTab === "documents" && (
            <>
              <div className="mb-4 flex justify-end">
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
    </div>
  );
}
