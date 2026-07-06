"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useCaseDetails } from "../../../dashboard/case/[id]/hooks/useCaseDetails";
import { caseRequiresPayment, isPaymentSatisfied } from "@/lib/pricing";
import CaseStatusHeader from "../../../dashboard/case/[id]/_components/CaseStatusHeader";
import WorkspaceSidebar from "../../../dashboard/case/[id]/_components/WorkspaceSidebar";
import DocumentWorkspace from "../../../dashboard/case/[id]/_components/documents/DocumentWorkspace";
import TabDiscussionChat from "../../../dashboard/case/[id]/_components/TabDiscussionChat";
import ActivityTimeline from "../../../dashboard/case/[id]/_components/ActivityTimeline";
import LoadingScreen from "@/components/ui/LoadingScreen";
import SupporterOutputUploadModal from "./_components/SupporterOutputUploadModal";
import { Alert, Button, Modal, Text, Group, Stack } from "@mantine/core";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useCloseCase } from "./hooks/useCloseCase";
import type { DocumentCheckpoint } from "@/types/case";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SupporterCaseWorkspacePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: session, isPending: isAuthPending } = useSession();
  const { caseData, documentWorkspace, isLoading, error } = useCaseDetails(id);
  const [activeTab, setActiveTab] = useState<"documents" | "discussion" | "timeline" | "settings">("documents");
  const [isOutputUploadOpen, setIsOutputUploadOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const { closeCase, isClosing } = useCloseCase(id);

  React.useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/auth");
    } else if (!isAuthPending && session) {
      const userRole = (session.user as any).role;
      if (userRole !== "supporter" && userRole !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [session, isAuthPending, router]);

  if (isAuthPending || isLoading) {
    return <LoadingScreen message="Đang tải không gian làm việc của Supporter..." />;
  }

  if (error || !caseData) {
    return (
      <div className="w-full p-4">
        <div className="p-4 bg-danger-soft border border-danger/10 text-danger rounded-xl font-body text-sm">
          Không thể tải hồ sơ phản biện. Vui lòng thử lại.
        </div>
      </div>
    );
  }

  const isCaseClosed = caseData.user_facing_stage === "closed" || caseData.internal_status === "done";

  // Detect if supporter has uploaded at least one output document
  const hasOutputDocuments =
    (documentWorkspace?.checkpoints ?? []).some(
      (cp: DocumentCheckpoint) => (cp.support_flow_documents?.length ?? 0) > 0
    );

  // Show the "ready to close" alert only if: case is not closed, payment satisfied, has output docs
  const showReadyToCloseAlert =
    !isCaseClosed &&
    isPaymentSatisfied(caseData) &&
    hasOutputDocuments;

  const handleConfirmClose = async () => {
    try {
      await closeCase();
      setIsCloseConfirmOpen(false);
    } catch {
      // error notification handled inside hook
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden animate-fade-in">
      <WorkspaceSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab !== "settings" && tab !== "payment") {
            setActiveTab(tab);
          }
        }}
        messageCount={caseData.messages?.length}
        hideSettings
        hidePayment
      />

      <div className={`flex-grow flex flex-col h-full min-w-0 ${activeTab === "discussion" ? "overflow-hidden" : "overflow-y-auto p-6 space-y-6"}`}>
        {activeTab !== "discussion" && (
          <>
            <CaseStatusHeader caseData={caseData} versions={[]} selectedVersion={0} onVersionChange={() => {}} />

            {!isPaymentSatisfied(caseData) ? (
              <div className="p-4 rounded-xl bg-danger-soft border border-danger/15 text-danger font-body text-xs flex items-center gap-2 shrink-0">
                <span>⚠️ Hồ sơ chưa thanh toán — không thể tải lên báo cáo hoặc thực hiện các thao tác chuyên môn lúc này.</span>
              </div>
            ) : caseRequiresPayment(caseData) && (
              <div className="p-4 rounded-xl bg-warning-soft border border-warning/15 text-warning font-body text-xs flex items-center gap-2 shrink-0">
                <span>⚠️ Nhóm sinh viên chưa hoàn tất thanh toán hồ sơ này. Lưu ý trước khi gửi báo cáo phản biện chính thức.</span>
              </div>
            )}

            {/* Case closed banner */}
            {isCaseClosed && (
              <Alert
                icon={<CheckCircle className="w-4 h-4" />}
                color="green"
                variant="light"
                radius="md"
                className="font-body"
              >
                <Text size="sm" fw={600}>Case đã hoàn tất</Text>
                <Text size="xs" c="dimmed" mt={2}>
                  Case này đã được đóng. Tài liệu output đã được gửi đến nhóm sinh viên.
                </Text>
              </Alert>
            )}

            {/* Ready to close suggestion alert */}
            {showReadyToCloseAlert && (
              <Alert
                icon={<AlertCircle className="w-4 h-4" />}
                color="green"
                variant="light"
                radius="md"
                className="font-body"
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Stack gap={2}>
                    <Text size="sm" fw={600}>Tài liệu output đã được tải lên</Text>
                    <Text size="xs" c="dimmed">
                      Bạn đã hoàn tất công việc hỗ trợ. Hãy đóng case để hoàn tất quy trình và thông báo cho nhóm sinh viên.
                    </Text>
                  </Stack>
                  <Button
                    size="sm"
                    color="green"
                    variant="filled"
                    className="font-semibold cursor-pointer shrink-0"
                    leftSection={<CheckCircle className="w-3.5 h-3.5" />}
                    onClick={() => setIsCloseConfirmOpen(true)}
                  >
                    Đóng case
                  </Button>
                </Group>
              </Alert>
            )}
          </>
        )}

        <div className={activeTab === "discussion" ? "flex-1 min-h-0 h-full" : "flex-grow min-h-0"}>
          {activeTab === "documents" && (
            <>
              {!isCaseClosed && (
                <div className="mb-4 flex justify-end gap-2">
                  <Button
                    size="sm"
                    color="brand"
                    className="font-semibold cursor-pointer h-8.5 text-xs"
                    onClick={() => setIsOutputUploadOpen(true)}
                    disabled={!isPaymentSatisfied(caseData)}
                  >
                    Tải output hỗ trợ
                  </Button>
                  {!showReadyToCloseAlert && !isCaseClosed && isPaymentSatisfied(caseData) && (
                    <Button
                    size="sm"
                    variant="outline"
                    color="green"
                    className="font-semibold cursor-pointer h-8.5 text-xs"
                    leftSection={<XCircle className="w-3.5 h-3.5" />}
                    onClick={() => setIsCloseConfirmOpen(true)}
                  >
                    Đóng case
                  </Button>
                  )}
                </div>
              )}
              <DocumentWorkspace workspace={documentWorkspace} />
            </>
          )}

          {activeTab === "discussion" && <TabDiscussionChat caseId={caseData.id} />}

          {activeTab === "timeline" && <ActivityTimeline caseData={caseData} />}
        </div>
      </div>

      <SupporterOutputUploadModal
        isOpen={isOutputUploadOpen}
        onClose={() => setIsOutputUploadOpen(false)}
        caseId={id}
      />

      {/* Close case confirm modal */}
      <Modal
        opened={isCloseConfirmOpen}
        onClose={() => setIsCloseConfirmOpen(false)}
        title={<span className="font-heading font-bold text-sm text-text-app">Xác nhận đóng case</span>}
        size="sm"
        radius="md"
        centered
      >
        <Stack gap="md" className="font-body">
          <Text size="sm" c="dimmed">
            Bạn xác nhận đã hoàn tất công việc hỗ trợ cho case này? Sau khi đóng, case sẽ chuyển sang trạng thái{" "}
            <strong>Hoàn tất</strong> và nhóm sinh viên sẽ được thông báo.
          </Text>
          <Text size="xs" c="dimmed" className="bg-surface-soft/60 p-3 rounded-lg border border-border-app">
            Lưu ý: Đây là hành động không thể hoàn tác. Hãy đảm bảo tất cả tài liệu output đã được tải lên trước khi đóng.
          </Text>
          <Group justify="flex-end" gap="xs" pt="xs">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCloseConfirmOpen(false)}
              disabled={isClosing}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              color="green"
              size="sm"
              loading={isClosing}
              onClick={handleConfirmClose}
              leftSection={<CheckCircle className="w-3.5 h-3.5" />}
              className="font-semibold cursor-pointer"
            >
              Xác nhận đóng case
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
