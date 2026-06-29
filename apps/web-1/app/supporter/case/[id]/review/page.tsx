"use client";

import React, { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useReportReview } from "./hooks/useReportReview";
import { useCaseDetails } from "../../../../dashboard/case/[id]/hooks/useCaseDetails";
import DisclaimerBanner from "./_components/DisclaimerBanner";
import FindingCard from "./_components/FindingCard";
import ReviewActionsPanel from "./_components/ReviewActionsPanel";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { Sparkles, ArrowLeft, Bot, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Finding {
  id: string;
  field: string;
  status: string;
  evidence: string;
  reason: string;
  question: string;
  next_action: string;
}

export default function SupporterReportReviewPage({ params }: PageProps) {
  const { id: caseId } = use(params);
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

  // 2. Fetch data
  const { caseData, isLoading: isCaseLoading } = useCaseDetails(caseId);
  const {
    draftReport,
    isLoading: isDraftLoading,
    generateDraft,
    isGenerating,
    updateDraft,
    isUpdating,
    approveReport,
    isApproving,
  } = useReportReview(caseId);

  // Local state for editable findings list
  const [findings, setFindings] = useState<Finding[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load findings from draft report content when fetched
  useEffect(() => {
    if (draftReport?.content_md) {
      try {
        const parsed = JSON.parse(draftReport.content_md);
        setFindings((parsed.findings || []).map((finding: Finding, index: number) => ({
          ...finding,
          id: finding.id || `${finding.field || "finding"}-${index}`,
        })));

      } catch (e) {
        setFindings([]);
      }
    }
  }, [draftReport]);

  const handleUpdateFinding = (index: number, updatedFinding: Finding) => {
    const updated = [...findings];
    updated[index] = updatedFinding;
    setFindings(updated);
    setHasUnsavedChanges(true);
  };

  const handleDeleteFinding = (index: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khía cạnh phản biện này?")) {
      const updated = findings.filter((_, idx) => idx !== index);
      setFindings(updated);
      setHasUnsavedChanges(true);
    }
  };

  const handleAddFinding = () => {
    const newFinding: Finding = {
      id: crypto.randomUUID(),
      field: "idea",
      status: "Chưa hoàn thiện",
      evidence: "Chưa dẫn chiếu bằng chứng từ tài liệu nộp.",
      reason: "Bổ sung lý do đánh giá logic khía cạnh này.",
      question: "Câu hỏi gợi mở cho học viên là gì?",
      next_action: "Đề xuất đầu việc chi tiết để sửa đổi.",
    };
    setFindings([...findings, newFinding]);
    setHasUnsavedChanges(true);
  };

  const handleSaveDraft = async () => {
    if (!draftReport) return;
    try {
      const contentMd = JSON.stringify({ findings });
      await updateDraft({ reportId: draftReport.id, contentMd });
      setHasUnsavedChanges(false);
      notifications.show({
        title: "Lưu bản nháp thành công",
        message: "Đã lưu bản nháp báo cáo thành công.",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Lỗi",
        message: "Lỗi khi lưu bản nháp.",
        color: "red",
      });
    }
  };

  const handleApproveAndSend = async () => {
    if (!draftReport) return;
    if (findings.length === 0) {
      notifications.show({
        title: "Không thể phê duyệt",
        message: "Báo cáo phải có ít nhất 1 khía cạnh phản biện.",
        color: "yellow",
      });
      return;
    }
    
    if (
      window.confirm(
        "Xác nhận phê duyệt? Báo cáo sẽ được chuyển sang trạng thái APPROVED và gửi trực tiếp tới sinh viên."
      )
    ) {
      try {
        // Save current findings first to ensure no edits are lost
        const contentMd = JSON.stringify({ findings });
        await updateDraft({ reportId: draftReport.id, contentMd });
        
        // Call approve
        await approveReport(draftReport.id);
        setHasUnsavedChanges(false);
        notifications.show({
          title: "Phê duyệt thành công",
          message: "Đã duyệt và gửi báo cáo phản biện thành công!",
          color: "green",
        });
        router.push(`/dashboard/case/${caseId}`);
      } catch (e) {
        notifications.show({
          title: "Lỗi",
          message: "Lỗi khi phê duyệt báo cáo.",
          color: "red",
        });
      }
    }
  };

  if (isAuthPending || isCaseLoading || isDraftLoading) {
    return (
      <div className="space-y-6 w-full pb-12">
        <LoadingSkeleton variant="text-block" count={1} />
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-28 animate-fade-in font-body">
      {/* Header back navigation */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => router.push(`/supporter/case/${caseId}`)}
          variant="default"
          leftSection={<ArrowLeft className="w-4 h-4" />}
          className="text-text-muted hover:text-text-app text-xs font-semibold font-body h-9 px-3 cursor-pointer"
        >
          <span>Quay lại Hồ sơ</span>
        </Button>
        <div>
          <h2 className="font-heading text-lg font-bold text-text-app">Biên tập Báo cáo Phản biện</h2>
          <p className="text-xs text-text-muted">Mã hồ sơ: {caseData?.case_code}</p>
        </div>
      </div>

      {/* Onboarding View: If no draft report exists yet */}
      {!draftReport ? (
        <div className="bg-surface-app border border-border-app rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-brand-soft/40 text-brand flex items-center justify-center">
            <Bot className="w-7 h-7" />
          </div>
          
          <div className="space-y-2 max-w-md">
            <h3 className="font-heading font-bold text-base text-text-app">Khởi tạo Báo cáo Phản biện</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Hồ sơ này chưa có báo cáo phản biện. Supporter chuyên môn có thể khởi tạo bản nháp phản biện AI dựa trên dữ liệu đầu vào của học viên để tiết kiệm thời gian biên tập.
            </p>
          </div>

          <Button
            onClick={() => generateDraft()}
            disabled={isGenerating}
            color="brand"
            leftSection={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            className="font-body font-semibold text-xs h-10 px-5 cursor-pointer disabled:opacity-50"
          >
            <span>{isGenerating ? "Đang phân tích hồ sơ và tạo bản nháp..." : "Khởi tạo bản nháp AI"}</span>
          </Button>
        </div>
      ) : (
        /* Edit Workspace View */
        <div className="space-y-6">
          {/* Unsaved changes alert */}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 p-3 bg-warning-soft border border-warning/20 text-warning rounded-xl text-xs font-semibold font-body animate-pulse">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
              <span>Bạn có thay đổi chưa lưu. Vui lòng click "Lưu nháp" để không bị mất dữ liệu.</span>
            </div>
          )}

          {/* Guidelines info box */}
          <DisclaimerBanner />

          {/* Findings List */}
          <div className="space-y-6">
            {findings.length === 0 ? (
              <div className="bg-surface-soft/40 border border-border-app border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-6 h-6 text-text-subtle" />
                <p className="text-xs text-text-muted">Chưa có khía cạnh phản biện nào. Vui lòng click "Thêm khía cạnh mới".</p>
              </div>
            ) : (
              findings.map((finding, index) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  onUpdate={(updated) => handleUpdateFinding(index, updated)}
                  onDelete={() => handleDeleteFinding(index)}
                />
              ))
            )}
          </div>

          {/* Bottom Floating Control Panel */}
          <ReviewActionsPanel
            onSaveDraft={handleSaveDraft}
            onApprove={handleApproveAndSend}
            onAddFinding={handleAddFinding}
            isSaving={isUpdating}
            isApproving={isApproving}
            findingsCount={findings.length}
          />
        </div>
      )}
    </div>
  );
}
