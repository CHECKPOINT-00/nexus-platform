"use client";

import React, { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useCaseDetails } from "../../../dashboard/case/[id]/hooks/useCaseDetails";
import CaseStatusHeader from "../../../dashboard/case/[id]/_components/CaseStatusHeader";
import WorkspaceSidebar from "../../../dashboard/case/[id]/_components/WorkspaceSidebar";
import TabIdeaContent from "../../../dashboard/case/[id]/_components/TabIdeaContent";
import TabReportFindings from "../../../dashboard/case/[id]/_components/TabReportFindings";
import TabDiscussionChat from "../../../dashboard/case/[id]/_components/TabDiscussionChat";
import ActivityTimeline from "../../../dashboard/case/[id]/_components/ActivityTimeline";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SupporterCaseWorkspacePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  // 1. Auth Guard
  const { data: session, isPending: isAuthPending } = useSession();
  
  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/auth");
    } else if (!isAuthPending && session) {
      const userRole = (session.user as any).role;
      if (userRole !== "supporter" && userRole !== "admin") {
        router.push("/dashboard"); // Redirect students back
      }
    }
  }, [session, isAuthPending, router]);

  // 2. Fetch Case Details
  const { caseData, latestReport, isLoading, error } = useCaseDetails(id);
  const [activeTab, setActiveTab] = useState<"idea" | "report" | "discussion" | "timeline" | "settings">("idea");
  const [selectedVersion, setSelectedVersion] = useState<number>(0);

  // Extract unique versions from lifecycle units
  const versions = React.useMemo(() => {
    if (!caseData?.lifecycle_units) return [0];
    const uniqueVers = Array.from(
      new Set(caseData.lifecycle_units.map((unit: any) => unit.version_no))
    ).sort((a: any, b: any) => b - a); // Sort descending
    return uniqueVers.length > 0 ? (uniqueVers as number[]) : [0];
  }, [caseData?.lifecycle_units]);

  // Set default selected version to the latest one
  useEffect(() => {
    if (versions.length > 0 && selectedVersion === 0) {
      setSelectedVersion(versions[0]);
    }
  }, [versions, selectedVersion]);

  if (isAuthPending || isLoading) {
    return <LoadingScreen message="Đang tải không gian làm việc của Supporter..." />;
  }

  if (error || !caseData) {
    return (
      <div className="w-full p-4">
        <div className="p-4 bg-danger-soft border border-danger/10 text-danger rounded-xl font-body text-sm">
          Không thể tải dữ liệu không gian làm việc của dự án. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden animate-fade-in">
      {/* Sidebar - Docked Left, full height */}
      <WorkspaceSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab !== "settings") {
            setActiveTab(tab);
          }
        }}
        messageCount={caseData.messages?.length}
        hideSettings
        versions={versions}
        selectedVersion={selectedVersion}
        onVersionChange={setSelectedVersion}
      />

      {/* Main Content Area - Scrollable */}
      <div className="flex-grow flex flex-col h-full min-w-0 overflow-y-auto p-6 space-y-6">
        {/* 1. Case Status Header */}
        <CaseStatusHeader
          caseData={caseData}
          versions={versions}
          selectedVersion={selectedVersion}
          onVersionChange={setSelectedVersion}
        />

        {/* 2. Unpaid Warnings (Read-Only Warning for Supporters) */}
        {caseData.payment_status !== "paid" && caseData.package?.price !== 0 && (
          <div className="p-4 rounded-xl bg-warning-soft border border-warning/15 text-warning font-body text-xs flex items-center gap-2 shrink-0">
            <span>⚠️ Học viên chưa hoàn tất thanh toán dự án này. Vui lòng lưu ý trước khi gửi báo cáo phản biện chính thức.</span>
          </div>
        )}

        {/* 3. Tab Content */}
        <div className="flex-grow min-h-0">
          {activeTab === "idea" && (
            <TabIdeaContent caseData={caseData} selectedVersion={selectedVersion} />
          )}

          {activeTab === "report" && (
            <TabReportFindings caseData={caseData} selectedVersion={selectedVersion} report={latestReport} />
          )}

          {activeTab === "discussion" && (
            <TabDiscussionChat caseId={caseData.id} />
          )}

          {activeTab === "timeline" && (
            <ActivityTimeline caseData={caseData} />
          )}
        </div>
      </div>
    </div>
  );
}
