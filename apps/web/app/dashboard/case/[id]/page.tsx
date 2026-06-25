"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Spinner } from "@heroui/react";
import { useCaseWorkspace } from "./hooks/use-case-workspace";
import { usePaymentUpload } from "./hooks/use-payment-upload";
import { PaymentBanners } from "./_components/payment-banners";
import { CaseHeader } from "./_components/case-header";
import { WorkspaceDesktop } from "./_components/workspace-desktop";
import { WorkspaceMobile } from "./_components/workspace-mobile";
import { PaymentDrawer } from "./_components/payment-drawer";

export default function CaseWorkspace() {
  const params = useParams();
  const caseId = params.id as string;
  const router = useRouter();

  const [selectedVersionCode, setSelectedVersionCode] = useState("v00");

  const workspace = useCaseWorkspace(caseId);
  const payment = usePaymentUpload(caseId);

  const { c, isLoading, messages, currentUserId, isSupporter, isOwner } = workspace;

  // Decode intake data from selected version
  const activeVersion = useMemo(
    () =>
      workspace.versions.find((v) => v.unit_code === selectedVersionCode) ||
      workspace.versions[workspace.versions.length - 1],
    [workspace.versions, selectedVersionCode]
  );

  const intakeData = useMemo(() => {
    if (!activeVersion?.content) return null;
    try {
      return JSON.parse(activeVersion.content);
    } catch {
      return null;
    }
  }, [activeVersion]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
        <p className="text-sm text-default-500 mt-2">Đang tải thông tin dự án...</p>
      </div>
    );
  }

  if (!c) {
    return (
      <div className="text-center py-24">
        <p className="text-danger font-bold">Không tìm thấy dự án hoặc bạn không có quyền truy cập.</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-4">
          Quay lại Bảng điều khiển
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-2">
      <PaymentBanners
        paymentStatus={c.payment_status}
        isOwner={isOwner}
        latestPayment={c.payments[0]}
        onOpenPaymentDrawer={payment.onOpen}
      />

      <CaseHeader
        caseCode={c.case_code}
        teamName={c.team_name}
        courseContext={c.course_context}
        school={c.school}
        createdAt={c.created_at}
        deadline={c.deadline}
        userFacingStage={c.user_facing_stage}
      />

      <WorkspaceDesktop
        c={c}
        versions={workspace.versions}
        selectedVersionCode={selectedVersionCode}
        onVersionChange={setSelectedVersionCode}
        intakeData={intakeData}
        isSupporter={isSupporter}
        draftReport={workspace.draftReport}
        approvedReport={workspace.approvedReport}
        approvedFindings={workspace.approvedFindings}
        messages={messages}
        currentUserId={currentUserId}
        generateDraftMutation={workspace.generateDraftMutation}
        saveDraftMutation={workspace.saveDraftMutation}
        approveReportMutation={workspace.approveReportMutation}
        sendMessageMutation={workspace.sendMessageMutation}
      />

      <WorkspaceMobile
        c={c}
        versions={workspace.versions}
        selectedVersionCode={selectedVersionCode}
        onVersionChange={setSelectedVersionCode}
        intakeData={intakeData}
        approvedFindings={workspace.approvedFindings}
        messages={messages}
        currentUserId={currentUserId}
        sendMessageMutation={workspace.sendMessageMutation}
      />

      <PaymentDrawer
        isOpen={payment.isOpen}
        onOpenChange={payment.onOpenChange}
        caseCode={c.case_code}
        packagePrice={c.package?.price ?? 0}
        file={payment.file}
        setFile={payment.setFile}
        uploading={payment.uploading}
        uploadError={payment.uploadError}
        setUploadError={payment.setUploadError}
        onUpload={payment.handleFileUpload}
      />
    </div>
  );
}
