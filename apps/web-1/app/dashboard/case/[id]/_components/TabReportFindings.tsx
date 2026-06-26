"use client";

import React, { useState } from "react";
import { Case } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { AlertCircle, HelpCircle, FileText, ChevronDown, ChevronUp, CheckCircle, Lightbulb, Play } from "lucide-react";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface TabReportFindingsProps {
  caseData: Case;
  selectedVersion: number;
}

interface Finding {
  field: "idea" | "customer" | "pain_point" | "alternatives" | "capability" | string;
  status: string;
  evidence: string;
  reason: string;
  question: string;
  next_action: string;
}

export default function TabReportFindings({ caseData, selectedVersion }: TabReportFindingsProps) {
  // Fetch latest approved report for the case
  const { data: report, isLoading, error } = useQuery({
    queryKey: ["case-report-latest", caseData.id, selectedVersion],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/reports/${caseData.id}/latest`);
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null; // No approved report yet
        }
        throw err;
      }
    },
    enabled: !!caseData.id,
  });

  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getFieldDetails = (field: string) => {
    switch (field) {
      case "idea":
        return { label: "Ý tưởng sản phẩm", colorClass: "border-brand text-brand bg-brand-soft/20" };
      case "customer":
        return { label: "Chân dung khách hàng", colorClass: "border-emerald-500 text-emerald-600 bg-emerald-50" };
      case "pain_point":
        return { label: "Vấn đề thị trường", colorClass: "border-orange-500 text-orange-600 bg-orange-50" };
      case "alternatives":
        return { label: "Giải pháp thay thế", colorClass: "border-blue-500 text-blue-600 bg-blue-50" };
      case "capability":
        return { label: "Năng lực của nhóm", colorClass: "border-purple-500 text-purple-600 bg-purple-50" };
      default:
        return { label: field, colorClass: "border-border-app text-text-muted bg-surface-muted" };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface-app border border-border-app rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in">
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-app border border-border-app rounded-2xl p-6 md:p-8 animate-fade-in">
        <div className="p-4 bg-danger-soft border border-danger/10 text-danger rounded-xl font-body text-xs">
          Không thể tải thông tin báo cáo phản biện. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  if (!report) {
    // Determine the empty state message based on payment and audit status
    let title = "Chưa có báo cáo phản biện";
    let desc = "Báo cáo phản biện chính thức sẽ hiển thị ở đây sau khi được Supporter kiểm duyệt và phê duyệt.";

    if ((caseData.payment_status === "unpaid" || caseData.payment_status === "rejected") && caseData.package?.price !== 0) {
      title = "Đang chờ thanh toán dịch vụ";
      desc = "Vui lòng hoàn tất thanh toán để Supporter bắt đầu tiến hành kiểm tra tài liệu và xuất báo cáo phản biện.";
    } else if (caseData.internal_status === "unassigned") {
      title = "Đang chờ phân công Supporter";
      desc = "Hệ thống đang chỉ định một Supporter chuyên môn hỗ trợ phản biện dự án của bạn.";
    } else if (caseData.internal_status === "assigned" || caseData.internal_status === "auditing") {
      title = "Supporter đang tiến hành phản biện";
      desc = "Ý tưởng của bạn đang được phân tích và đánh giá logic bởi Supporter chuyên môn của Nexus.";
    }

    return (
      <div className="bg-surface-app border border-border-app rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-surface-soft border border-border-app text-text-subtle flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h4 className="font-heading font-bold text-sm text-text-app">{title}</h4>
          <p className="font-body text-xs text-text-muted leading-relaxed">{desc}</p>
        </div>
      </div>
    );
  }

  let findings: Finding[] = [];
  try {
    const parsed = JSON.parse(report.content_md);
    findings = parsed.findings || [];
  } catch (e) {
    // Fallback if content_md is plain markdown
  }

  if (findings.length === 0) {
    return (
      <div className="bg-surface-app border border-border-app rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-surface-soft border border-border-app text-text-subtle flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h4 className="font-heading font-bold text-sm text-text-app">Dự án hoàn hảo!</h4>
          <p className="font-body text-xs text-text-muted leading-relaxed">
            Supporter không tìm thấy lỗi logic hay thiếu sót nghiêm trọng nào trong hồ sơ của bạn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-app border border-border-app rounded-2xl p-6 md:p-8 space-y-6 shadow-sm animate-fade-in">
      <div className="flex items-center gap-2 pb-2 border-b border-border-app/55">
        <Lightbulb className="w-5 h-5 text-brand" />
        <div>
          <h3 className="font-heading font-bold text-sm text-text-app">Kết quả phản biện thực tế</h3>
          <p className="font-body text-[11px] text-text-muted">
            Dưới đây là các điểm cần làm rõ/cải thiện được tìm thấy trong bản nộp của bạn.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {findings.map((finding, idx) => {
          const { label, colorClass } = getFieldDetails(finding.field);
          const isExpanded = !!expandedIndices[idx];

          return (
            <div
              key={idx}
              className={`border border-border-app rounded-xl overflow-hidden bg-surface-app transition-shadow hover:shadow-sm`}
            >
              {/* Header (Always Visible) */}
              <div
                onClick={() => toggleExpand(idx)}
                className="p-4 md:p-5 flex justify-between items-center gap-4 cursor-pointer select-none bg-surface-soft/40"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-body uppercase border ${colorClass}`}>
                    {label}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-danger-soft text-danger border border-danger/10 text-[10px] font-bold font-body">
                    {finding.status}
                  </span>
                  <h4 className="font-heading font-semibold text-xs text-text-app line-clamp-1">
                    {finding.question}
                  </h4>
                </div>
                <div className="text-text-subtle shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="border-t border-border-app p-5 space-y-4 font-body text-xs leading-relaxed text-text-app animate-slide-down">
                  {/* Evidence Section */}
                  <div className="space-y-1">
                    <span className="font-semibold text-text-muted flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-text-subtle" />
                      Bằng chứng dẫn chiếu:
                    </span>
                    <blockquote className="border-l-2 border-border-strong pl-3 py-1 bg-surface-soft text-text-muted italic rounded-r">
                      {finding.evidence || "Không tìm thấy thông tin đối chiếu trong tài liệu nộp."}
                    </blockquote>
                  </div>

                  {/* Reason Section */}
                  <div className="space-y-1">
                    <span className="font-semibold text-text-muted flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-text-subtle" />
                      Lý do đánh giá:
                    </span>
                    <p className="pl-5 text-text-app">{finding.reason}</p>
                  </div>

                  {/* Question Section */}
                  <div className="space-y-1 p-3 bg-brand-soft/20 border border-brand/10 rounded-lg">
                    <span className="font-semibold text-brand flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-brand" />
                      Câu hỏi phản biện từ Supporter:
                    </span>
                    <p className="pl-5 text-brand-hover font-medium">{finding.question}</p>
                  </div>

                  {/* Next Action Section */}
                  <div className="space-y-1">
                    <span className="font-semibold text-success flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-success" />
                      Hành động tiếp theo gợi ý:
                    </span>
                    <p className="pl-5 text-text-app whitespace-pre-wrap">{finding.next_action}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
