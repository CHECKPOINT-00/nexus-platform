"use client";

import React, { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCaseDetails } from "./hooks/useCaseDetails";
import CaseStatusHeader from "./_components/CaseStatusHeader";
import UnpaidAlertBanner from "./_components/UnpaidAlertBanner";
import WorkspaceSidebar from "./_components/WorkspaceSidebar";
import TabIdeaContent from "./_components/TabIdeaContent";
import TabReportFindings from "./_components/TabReportFindings";
import TabDiscussionChat from "./_components/TabDiscussionChat";
import ActivityTimeline from "./_components/ActivityTimeline";
import TabCaseSettings from "./_components/TabCaseSettings";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import RevisionSubmitModal from "./_components/RevisionSubmitModal";
import { Button } from "@heroui/react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaseWorkspacePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const {
    caseData,
    intakeSnapshot,
    latestReport,
    latestUserAction,
    documentBoardSections,
    roundHistory,
    openRequestsForMoreInfo,
    isLoading,
    error,
  } = useCaseDetails(id);

  const [activeTab, setActiveTab] = useState<"idea" | "report" | "discussion" | "timeline" | "settings">("report");
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);

  // Extract unique versions from lifecycle units
  const versions = React.useMemo<number[]>(() => {
    if (!caseData?.lifecycle_units) return [0];
    const uniqueVers = Array.from(
      new Set((caseData.lifecycle_units as any[]).map((unit: any) => Number(unit.version_no)))
    ).sort((a: number, b: number) => b - a); // Sort descending
    return uniqueVers.length > 0 ? uniqueVers : [0];
  }, [caseData?.lifecycle_units]);

  // Set default selected version to the latest one
  useEffect(() => {
    if (versions.length > 0 && selectedVersion === 0) {
      setSelectedVersion(versions[0]);
    }
  }, [versions, selectedVersion]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <LoadingSkeleton variant="text-block" count={1} />
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="p-4 bg-danger-soft border border-danger/10 text-danger rounded-xl font-body text-sm">
          Không thể tải dữ liệu không gian làm việc của dự án. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  // Find report for the selected version/round
  const selectedRoundReport = roundHistory?.find((h: any) => h.round_no === selectedVersion)?.report || null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* 1. Case Status Header */}
      <CaseStatusHeader
        caseData={caseData}
        versions={versions}
        selectedVersion={selectedVersion}
        onVersionChange={setSelectedVersion}
      />

      {/* 2. Unpaid Alerts Banner */}
      <UnpaidAlertBanner
        caseData={caseData}
        onOpenPayment={() => router.push(`/dashboard/case/${id}/payment`)}
      />

      {/* 3. Action / Triage Notices for CP1 Golden Path */}
      {openRequestsForMoreInfo && openRequestsForMoreInfo.length > 0 && (
        <div className="p-4 bg-warning-soft border border-warning/15 text-warning rounded-xl font-body text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 animate-fade-in">
          <div className="space-y-1">
            <h5 className="font-bold">⚠️ Yêu cầu bổ sung thông tin từ Supporter</h5>
            <p>{openRequestsForMoreInfo[0].metadata_json?.query || "Vui lòng xem chi tiết phản hồi."}</p>
          </div>
          <Button
            size="sm"
            className="bg-brand text-white font-semibold cursor-pointer h-8.5 rounded-lg text-xs"
            onPress={() => setIsRevisionOpen(true)}
          >
            Nộp bản sửa / Bổ sung tài liệu
          </Button>
        </div>
      )}

      {(caseData.user_facing_stage === "report_ready" || caseData.user_facing_stage === "waiting_for_revision") && (!openRequestsForMoreInfo || openRequestsForMoreInfo.length === 0) && (
        <div className="p-4 bg-brand-soft/20 border border-brand/10 rounded-xl font-body text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 animate-fade-in">
          <div className="space-y-1">
            <h5 className="font-bold text-brand">📝 Dự án đã có báo cáo phản biện</h5>
            <p className="text-text-muted">Nhóm có thể tiến hành sửa đổi bài làm và nộp bản mới (Revision) để Supporter thẩm định vòng tiếp theo.</p>
          </div>
          <Button
            size="sm"
            className="bg-brand text-white font-semibold cursor-pointer h-8.5 rounded-lg text-xs"
            onPress={() => setIsRevisionOpen(true)}
          >
            Nộp bản sửa (Revision)
          </Button>
        </div>
      )}

      {/* 4. Main Workspace Sidebar & Content Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        <WorkspaceSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          messageCount={caseData.messages?.length}
        />

        <div className="flex-grow min-w-0">
          {activeTab === "idea" && (
            <TabIdeaContent caseData={caseData} selectedVersion={selectedVersion} />
          )}

          {activeTab === "report" && (
            <TabReportFindings caseData={caseData} selectedVersion={selectedVersion} report={selectedRoundReport || latestReport} />
          )}

          {activeTab === "discussion" && (
            <TabDiscussionChat caseId={caseData.id} />
          )}

          {activeTab === "timeline" && (
            <ActivityTimeline caseData={caseData} />
          )}

          {activeTab === "settings" && (
            <TabCaseSettings caseData={caseData} />
          )}
        </div>
      </div>

      {/* Revision submission modal */}
      <RevisionSubmitModal
        isOpen={isRevisionOpen}
        onClose={() => setIsRevisionOpen(false)}
        caseId={id}
      />
    </div>
  );
}
