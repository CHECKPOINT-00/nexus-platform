"use client";

import Link from "next/link";
import { Case } from "@/types";
import { studentStatusMap, getPipelineStep, PIPELINE_STAGES } from "@/types";
import { Card, Badge } from "@mantine/core";
import { Calendar, User, BookOpen, AlertCircle } from "lucide-react";
import { isPaymentSatisfied } from "@/lib/pricing";

interface CaseCardProps {
  item: Case;
  hrefPrefix?: string;
}

export default function CaseCard({ item, hrefPrefix = "/dashboard/case" }: CaseCardProps) {
  const version = item.checkpoints?.[0]?.latest_version_no || 1;
  const { stepKey, stepIndex } = getPipelineStep(item.user_facing_stage, version);
  const isRejected = stepKey === "rejected";

  const statusDetails = studentStatusMap[item.user_facing_stage] || { label: item.user_facing_stage, color: "default" as const };
  
  let label = statusDetails.label;
  if (!isRejected && stepIndex >= 0) {
    const stepName = stepKey === "revision" && version >= 2 
      ? `Sửa bài (Vòng ${version})` 
      : PIPELINE_STAGES[stepIndex]?.label || statusDetails.label;
    
    label = `${stepName} · ${stepIndex + 1}/${PIPELINE_STAGES.length} ▸`;
  }

  let color = "gray";
  if (statusDetails.color === "success") color = "green";
  else if (statusDetails.color === "warning") color = "orange";
  else if (statusDetails.color === "danger") color = "red";
  else if (statusDetails.color === "primary") color = "brand";

  const showPaymentWarning = !isPaymentSatisfied(item) && item.payment_status !== "refunded";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <Link href={`${hrefPrefix}/${item.id}`} className="block group">
      <Card p="lg" radius="md" withBorder className="bg-surface-app group-hover:border-brand shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-subtle uppercase font-body tracking-wider">
              {item.case_code}
            </span>
            <h3 className="font-heading text-lg font-bold text-text-app group-hover:text-brand transition-colors">
              {item.team_name || "Hồ sơ chưa đặt tên nhóm"}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {showPaymentWarning && (
              <span className="text-sm" title="Chưa hoàn tất thanh toán" style={{ color: "var(--mantine-color-orange-filled)" }}>
                ⚠️
              </span>
            )}
            <Badge size="sm" variant="light" color={color} className="font-body text-[10px]">
              {label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-app text-xs font-body text-text-muted">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-text-subtle" />
            <span className="truncate">{item.package?.name || "Gói dịch vụ"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-text-subtle" />
            <span>Ngày nộp hồ sơ: {formatDate(item.created_at)}</span>
          </div>
          {item.school && (
            <div className="flex items-center gap-2 col-span-2">
              <User className="w-3.5 h-3.5 text-text-subtle" />
              <span className="truncate">{item.school} {item.course_context ? `(${item.course_context})` : ""}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
