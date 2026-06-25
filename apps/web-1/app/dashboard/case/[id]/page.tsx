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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaseWorkspacePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { caseData, isLoading, error } = useCaseDetails(id);
  const [activeTab, setActiveTab] = useState<"idea" | "report" | "discussion" | "timeline" | "settings">("idea");
  const [selectedVersion, setSelectedVersion] = useState<number>(0);

  // Extract unique versions from lifecycle units
  const versions = React.useMemo(() => {
    if (!caseData?.lifecycle_units) return [0];
    const uniqueVers = Array.from(
      new Set(caseData.lifecycle_units.map((unit) => unit.version_no))
    ).sort((a, b) => b - a); // Sort descending
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

      {/* 3. Main Workspace Sidebar & Content Layout */}
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
            <TabReportFindings caseData={caseData} selectedVersion={selectedVersion} />
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
    </div>
  );
}
