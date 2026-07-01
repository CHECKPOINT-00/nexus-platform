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
import { Button, Alert, Modal } from "@mantine/core";
import { useRecallRevision } from "./hooks/useRecallRevision";
import { notifications } from "@mantine/notifications";

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
            <Alert
              variant="light"
              color="blue"
              radius="md"
              title="Hồ sơ đã có báo cáo phản biện"
              className="animate-fade-in font-body text-xs shrink-0"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mt-1">
                <p className="text-text-muted text-xs">
                  Nhóm có thể tiến hành sửa đổi bài làm và nộp bản mới để Supporter thẩm định vòng tiếp theo.
                </p>
                <Button
                  size="xs"
                  color="brand"
                  className="font-semibold cursor-pointer shrink-0"
                  onClick={() => setIsRevisionOpen(true)}
                >
                  Nộp bản sửa
                </Button>
              </div>
            </Alert>
          )}

        <div className="flex-grow min-h-0">
          {activeTab === "documents" && (
            <>
              {caseData.user_facing_stage === "revision_submitted" && (
                <Alert
                  variant="light"
                  color="blue"
                  radius="md"
                  title="Hồ sơ đang chờ Supporter thẩm định"
                  className="animate-fade-in font-body text-xs shrink-0 mb-4"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mt-1">
                    <p className="text-text-muted text-xs">
                      Nếu bạn phát hiện thông tin bị thiếu hoặc tải nhầm tệp, bạn có thể thu hồi bản nộp này để chuẩn bị lại tài liệu đầy đủ.
                    </p>
                    <Button
                      size="xs"
                      color="red"
                      className="font-semibold cursor-pointer shrink-0"
                      loading={isRecalling}
                      onClick={handleRecall}
                    >
                      Thu hồi bản nộp
                    </Button>
                  </div>
                </Alert>
              )}
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
