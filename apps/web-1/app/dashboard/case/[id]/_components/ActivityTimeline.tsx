"use client";

import React from "react";
import { Case } from "@/types";
import { 
  FolderPlus, 
  Upload, 
  CheckCircle, 
  XCircle, 
  FileEdit, 
  FileCheck, 
  HelpCircle, 
  Circle,
  Clock
} from "lucide-react";

interface ActivityTimelineProps {
  caseData: Case;
}

export default function ActivityTimeline({ caseData }: ActivityTimelineProps) {
  const events = caseData.events || [];

  // Sort events chronologically (oldest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const getEventDetails = (type: string) => {
    switch (type) {
      case "case_created":
      case "case_created_event":
        return {
          label: "Nộp hồ sơ phản biện",
          desc: "Hồ sơ phản biện đã được gửi và ghi nhận vào hệ thống Nexus.",
          icon: FolderPlus,
          colorClass: "bg-brand-soft text-brand border-brand/20",
        };
      case "payment_submitted":
      case "payment_proof_uploaded":
        return {
          label: "Nộp minh chứng thanh toán",
          desc: "Minh chứng chuyển khoản ngân hàng được tải lên hệ thống.",
          icon: Upload,
          colorClass: "bg-warning-soft text-warning border-warning/20",
        };
      case "payment_approved":
      case "payment_verified":
        return {
          label: "Thanh toán thành công",
          desc: "Giao dịch thanh toán được xác nhận hợp lệ bởi quản trị viên.",
          icon: CheckCircle,
          colorClass: "bg-success-soft text-success border-success/20",
        };
      case "payment_rejected":
        return {
          label: "Thanh toán bị từ chối",
          desc: "Minh chứng giao dịch bị từ chối do thông tin không khớp.",
          icon: XCircle,
          colorClass: "bg-danger-soft text-danger border-danger/20",
        };
      case "report_draft_created":
        return {
          label: "Tạo bản nháp phản biện AI",
          desc: "Bản thảo báo cáo phản biện AI được tạo lập tự động.",
          icon: FileEdit,
          colorClass: "bg-info-soft text-info border-info/20",
        };
      case "report_approved":
      case "report_sent":
        return {
          label: "Báo cáo chính thức",
          desc: "Báo cáo phản biện được kiểm duyệt và gửi tới sinh viên.",
          icon: FileCheck,
          colorClass: "bg-success-soft text-success border-success/20",
        };
      case "clarification_requested":
      case "need_clarification":
        return {
          label: "Yêu cầu làm rõ",
          desc: "Supporter yêu cầu nhóm bổ sung hoặc giải trình về nội dung hồ sơ.",
          icon: HelpCircle,
          colorClass: "bg-warning-soft text-warning border-warning/20",
        };
      default:
        return {
          label: type.replace(/_/g, " "),
          desc: "Sự kiện hệ thống ghi nhận.",
          icon: Circle,
          colorClass: "bg-surface-soft text-text-muted border-border-app",
        };
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " ngày " + d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="bg-surface-app border border-border-app rounded-lg p-8 text-center flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Clock className="w-8 h-8 text-text-subtle animate-pulse" />
        <p className="text-xs text-text-muted font-body">Chưa có hoạt động nào được ghi nhận cho hồ sơ này.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-app border border-border-app rounded-lg p-6 md:p-8 space-y-6 animate-fade-in">
      <div className="relative pl-6 border-l-2 border-border-app space-y-8 py-2 ml-4">
        {sortedEvents.map((event) => {
          const { label, desc, icon: Icon, colorClass } = getEventDetails(event.event_type);

          return (
            <div key={event.id} className="relative group">
              {/* Timeline Marker Point */}
              <div className={`absolute -left-[38px] top-0 w-8 h-8 rounded-full flex items-center justify-center border ${colorClass} shadow-sm transition-transform group-hover:scale-110 z-10 bg-surface-app`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Event Content card */}
              <div className="space-y-1.5 font-body">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h4 className="font-heading font-bold text-xs text-text-app">
                    {label}
                  </h4>
                  <span className="text-[10px] text-text-subtle">
                    {formatDateTime(event.created_at)}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {desc}
                </p>
                {event.actor && (
                  <p className="text-[10px] text-text-subtle">
                    Thực hiện bởi: <strong className="text-text-muted">{event.actor.name}</strong> ({event.actor.role === "admin" ? "Admin" : event.actor.role === "supporter" ? "Supporter" : "Sinh viên"})
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
