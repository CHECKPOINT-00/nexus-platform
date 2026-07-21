"use client";

import React from "react";
import { AuditRound } from "@/types";
import {
  CreditCard,
  Clock,
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface AuditRoundTimelineProps {
  auditRounds: AuditRound[];
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Đang chờ thanh toán",
  payment_verified: "Đã thanh toán — đang chờ xử lý",
  in_review: "Supporter đang review",
  report_published: "Đã có báo cáo",
  completed: "Hoàn thành",
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "#f59e0b",
  payment_verified: "#3b82f6",
  in_review: "#8b5cf6",
  report_published: "#10b981",
  completed: "#10b981",
};

const STATUS_BG_CLASSES: Record<string, string> = {
  pending_payment: "bg-warning-soft text-warning border-warning/10",
  payment_verified: "bg-info-soft text-info border-info/10",
  in_review: "bg-purple-50 text-purple-600 border-purple-100",
  report_published: "bg-success-soft text-success border-success/10",
  completed: "bg-success-soft text-success border-success/10",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending_payment: CreditCard,
  payment_verified: Clock,
  in_review: Loader2,
  report_published: FileText,
  completed: CheckCircle2,
};

function getSlaLabel(slaDeadlineAt: string | null): {
  text: string;
  isOverdue: boolean;
} | null {
  if (!slaDeadlineAt) return null;
  const slaDate = new Date(slaDeadlineAt);
  const now = new Date();
  const diffMs = slaDate.getTime() - now.getTime();
  if (diffMs <= 0) return { text: "Quá hạn", isOverdue: true };
  const hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));
  if (hoursRemaining < 1) return { text: "còn <1h", isOverdue: false };
  return { text: `còn ${hoursRemaining}h`, isOverdue: false };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AuditRoundTimeline({
  auditRounds,
}: AuditRoundTimelineProps) {
  if (!auditRounds || auditRounds.length === 0) {
    return (
      <div className="bg-surface-app border border-border-app rounded-lg p-6 text-center flex flex-col items-center justify-center gap-2 animate-fade-in">
        <Clock className="w-7 h-7 text-text-subtle" />
        <p className="text-xs text-text-muted font-body">
          Chưa có lượt audit nào
        </p>
      </div>
    );
  }

  const sorted = [...auditRounds].sort(
    (a, b) => a.roundNumber - b.roundNumber
  );

  return (
    <div className="bg-surface-app border border-border-app rounded-lg p-5 md:p-6 animate-fade-in">
      <h3 className="font-heading font-bold text-sm text-text-app mb-4">
        Lịch sử lượt audit
      </h3>

      <div className="relative pl-5 border-l-2 border-border-app space-y-4 ml-2">
        {sorted.map((round, idx) => {
          const statusKey = round.status;
          const label =
            STATUS_LABELS[statusKey] || statusKey.replace(/_/g, " ");
          const color = STATUS_COLORS[statusKey] || "#9ca3af";
          const bgClass =
            STATUS_BG_CLASSES[statusKey] ||
            "bg-surface-soft text-text-muted border-border-app";
          const IconComponent =
            STATUS_ICONS[statusKey] ||
            (statusKey === "completed" ? CheckCircle2 : Clock);
          const slaInfo = getSlaLabel(round.slaDeadlineAt);
          const isLast = idx === sorted.length - 1;

          return (
            <div key={round.id} className="relative group">
              {/* Timeline dot */}
              <div
                className="absolute -left-[31px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 bg-surface-app transition-transform group-hover:scale-110"
                style={{ borderColor: color }}
              >
                <IconComponent className="w-3 h-3" style={{ color }} />
              </div>

              {/* Round card */}
              <div
                className="border rounded-lg p-4 space-y-2.5 transition-shadow hover:shadow-sm bg-surface-app"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: color,
                }}
              >
                {/* Header: round number + status badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-heading font-bold text-xs text-text-app">
                    Round #{round.roundNumber}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-body border ${bgClass}`}
                  >
                    {label}
                  </span>
                </div>

                {/* Details row: date + SLA */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-body text-text-muted">
                  <span>{formatDate(round.createdAt)}</span>

                  {slaInfo && (
                    <span
                      className={
                        slaInfo.isOverdue
                          ? "text-danger font-semibold flex items-center gap-1"
                          : "flex items-center gap-1"
                      }
                    >
                      {slaInfo.isOverdue && (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      SLA: {slaInfo.text}
                    </span>
                  )}
                </div>

                {/* Connector line to next (except last) */}
                {!isLast && (
                  <div
                    className="absolute left-[-29px] top-7 bottom-[-16px] w-[2px]"
                    style={{ backgroundColor: color + "40" }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
