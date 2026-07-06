"use client";

import React, { useMemo } from "react";
import { Case } from "@/types";
import { Timeline, Text } from "@mantine/core";
import { 
  FolderPlus, 
  Upload, 
  CheckCircle, 
  XCircle, 
  FileEdit, 
  FileCheck, 
  HelpCircle, 
  Circle,
  Clock,
  UserCheck,
  Trash2,
  Lock,
  LucideIcon
} from "lucide-react";

interface ActivityTimelineProps {
  caseData: Case;
}

interface EventConfig {
  label: string;
  desc: string;
  icon: LucideIcon;
  colorClass: string;
}

const EVENT_CONFIGS: Record<string, EventConfig> = {
  case_created: {
    label: "Khởi tạo hồ sơ",
    desc: "Hồ sơ phản biện đã được khởi tạo trên hệ thống.",
    icon: FolderPlus,
    colorClass: "bg-brand-soft text-brand border-brand/20",
  },
  case_created_event: {
    label: "Khởi tạo hồ sơ",
    desc: "Hồ sơ phản biện đã được khởi tạo trên hệ thống.",
    icon: FolderPlus,
    colorClass: "bg-brand-soft text-brand border-brand/20",
  },
  case_submitted: {
    label: "Hồ sơ đã nộp",
    desc: "Hồ sơ phản biện đã được gửi lên hệ thống thành công và đang chờ xét duyệt.",
    icon: Upload,
    colorClass: "bg-brand-soft text-brand border-brand/20",
  },
  case_accepted: {
    label: "Hồ sơ được duyệt",
    desc: "Hồ sơ đã được quản trị viên duyệt và chấp nhận.",
    icon: CheckCircle,
    colorClass: "bg-success-soft text-success border-success/20",
  },
  case_rejected: {
    label: "Hồ sơ bị từ chối",
    desc: "Hồ sơ không được chấp nhận phê duyệt.",
    icon: XCircle,
    colorClass: "bg-danger-soft text-danger border-danger/20",
  },
  case_cancelled_by_student: {
    label: "Hồ sơ đã hủy",
    desc: "Hồ sơ đã bị hủy bởi sinh viên.",
    icon: XCircle,
    colorClass: "bg-danger-soft text-danger border-danger/20",
  },
  supporter_assigned: {
    label: "Đã phân công người hỗ trợ",
    desc: "Người hỗ trợ đã được phân công để đánh giá và phản biện hồ sơ.",
    icon: UserCheck,
    colorClass: "bg-info-soft text-info border-info/20",
  },
  more_info_requested: {
    label: "Yêu cầu bổ sung thông tin",
    desc: "Yêu cầu cập nhật hoặc làm rõ thêm thông tin hồ sơ.",
    icon: HelpCircle,
    colorClass: "bg-warning-soft text-warning border-warning/20",
  },
  request_more_info: {
    label: "Yêu cầu bổ sung thông tin",
    desc: "Yêu cầu cập nhật hoặc làm rõ thêm thông tin hồ sơ.",
    icon: HelpCircle,
    colorClass: "bg-warning-soft text-warning border-warning/20",
  },
  clarification_requested: {
    label: "Yêu cầu làm rõ",
    desc: "Người hỗ trợ yêu cầu nhóm bổ sung hoặc giải trình về nội dung hồ sơ.",
    icon: HelpCircle,
    colorClass: "bg-warning-soft text-warning border-warning/20",
  },
  need_clarification: {
    label: "Yêu cầu làm rõ",
    desc: "Người hỗ trợ yêu cầu nhóm bổ sung hoặc giải trình về nội dung hồ sơ.",
    icon: HelpCircle,
    colorClass: "bg-warning-soft text-warning border-warning/20",
  },
  revision_submitted: {
    label: "Đã nộp bản sửa đổi",
    desc: "Bản sửa đổi hồ sơ đã được nộp thành công.",
    icon: Upload,
    colorClass: "bg-info-soft text-info border-info/20",
  },
  revision_recalled: {
    label: "Bản sửa đổi đã được thu hồi",
    desc: "Bản sửa đổi đã được thu hồi và không còn hiệu lực.",
    icon: XCircle,
    colorClass: "bg-danger-soft text-danger border-danger/20",
  },
  payment_submitted: {
    label: "Nộp minh chứng thanh toán",
    desc: "Minh chứng chuyển khoản ngân hàng được tải lên hệ thống.",
    icon: Upload,
    colorClass: "bg-warning-soft text-warning border-warning/20",
  },
  payment_proof_uploaded: {
    label: "Nộp minh chứng thanh toán",
    desc: "Minh chứng chuyển khoản ngân hàng được tải lên hệ thống.",
    icon: Upload,
    colorClass: "bg-warning-soft text-warning border-warning/20",
  },
  payment_approved: {
    label: "Thanh toán thành công",
    desc: "Giao dịch thanh toán được xác nhận hợp lệ bởi quản trị viên.",
    icon: CheckCircle,
    colorClass: "bg-success-soft text-success border-success/20",
  },
  payment_verified: {
    label: "Thanh toán thành công",
    desc: "Giao dịch thanh toán được xác nhận hợp lệ bởi quản trị viên.",
    icon: CheckCircle,
    colorClass: "bg-success-soft text-success border-success/20",
  },
  payment_rejected: {
    label: "Thanh toán bị từ chối",
    desc: "Minh chứng giao dịch bị từ chối do thông tin không khớp.",
    icon: XCircle,
    colorClass: "bg-danger-soft text-danger border-danger/20",
  },
  payment_expired: {
    label: "Thanh toán quá hạn",
    desc: "Hạn thanh toán cho hồ sơ đã kết thúc.",
    icon: Clock,
    colorClass: "bg-danger-soft text-danger border-danger/20",
  },
  payment_reactivated: {
    label: "Mở lại thanh toán",
    desc: "Cổng thanh toán đã được mở lại cho hồ sơ.",
    icon: Clock,
    colorClass: "bg-info-soft text-info border-info/20",
  },
  package_confirmed: {
    label: "Xác nhận gói dịch vụ",
    desc: "Gói dịch vụ đã được xác nhận thành công.",
    icon: CheckCircle,
    colorClass: "bg-success-soft text-success border-success/20",
  },
  supporter_output_uploaded: {
    label: "Tải lên tài liệu hỗ trợ",
    desc: "Tài liệu đầu ra hỗ trợ (supporter output) đã được tải lên.",
    icon: FileCheck,
    colorClass: "bg-success-soft text-success border-success/20",
  },
  external_feedback_uploaded: {
    label: "Đánh giá bên ngoài",
    desc: "Tài liệu đánh giá của chuyên gia/giảng viên bên ngoài đã được tải lên.",
    icon: Upload,
    colorClass: "bg-info-soft text-info border-info/20",
  },
  document_deleted: {
    label: "Xóa tài liệu",
    desc: "Tài liệu đã được gỡ bỏ khỏi hệ thống.",
    icon: Trash2,
    colorClass: "bg-danger-soft text-danger border-danger/20",
  },
  case_closed: {
    label: "Hoàn tất & Đóng case",
    desc: "Người hỗ trợ đã xác nhận hoàn tất công việc hỗ trợ và đóng case.",
    icon: Lock,
    colorClass: "bg-success-soft text-success border-success/20",
  },
  refund_requested: {
    label: "Yêu cầu hoàn tiền",
    desc: "Yêu cầu hoàn tiền đã được gửi lên hệ thống.",
    icon: Clock,
    colorClass: "bg-warning-soft text-warning border-warning/20",
  },
  refund_approved: {
    label: "Duyệt hoàn tiền",
    desc: "Yêu cầu hoàn tiền đã được quản trị viên duyệt.",
    icon: CheckCircle,
    colorClass: "bg-success-soft text-success border-success/20",
  },
  refund_rejected: {
    label: "Từ chối hoàn tiền",
    desc: "Yêu cầu hoàn tiền đã bị từ chối.",
    icon: XCircle,
    colorClass: "bg-danger-soft text-danger border-danger/20",
  },
  refund_completed: {
    label: "Hoàn tiền thành công",
    desc: "Giao dịch hoàn tiền đã được hoàn tất.",
    icon: CheckCircle,
    colorClass: "bg-success-soft text-success border-success/20",
  },
};

export default function ActivityTimeline({ caseData }: ActivityTimelineProps) {
  const events = caseData.events || [];

  const sortedEvents = useMemo(() => {
    const filtered = events.filter(event => event.event_type !== "message_sent");
    return [...filtered].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [events]);

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
      " ngày " +
      d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    );
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
      <Timeline 
        bulletSize={32} 
        lineWidth={2} 
        active={-1}
        styles={{
          itemBullet: {
            backgroundColor: "transparent",
            border: "none",
            boxShadow: "none",
          }
        }}
      >
        {sortedEvents.map((event) => {
          const config = EVENT_CONFIGS[event.event_type] || {
            label: event.event_type.replace(/_/g, " "),
            desc: "Sự kiện hệ thống ghi nhận.",
            icon: Circle,
            colorClass: "bg-surface-soft text-text-muted border-border-app",
          };

          const { label, desc, icon: Icon, colorClass } = config;

          return (
            <Timeline.Item
              key={event.id}
              bullet={
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${colorClass} shadow-sm bg-surface-app transition-transform hover:scale-110`}>
                  <Icon className="w-4 h-4" />
                </div>
              }
              title={
                <div className="flex flex-wrap items-baseline gap-2 font-heading">
                  <span className="font-bold text-xs text-text-app">
                    {label}
                  </span>
                  <span className="text-[10px] text-text-subtle">
                    {formatDateTime(event.created_at)}
                  </span>
                </div>
              }
              classNames={{
                itemBullet: "bg-transparent border-0 p-0",
                item: "before:border-border-app",
              }}
            >
              <div className="space-y-1 font-body mt-1">
                <Text size="xs" className="text-text-muted leading-relaxed">
                  {desc}
                </Text>
                {event.actor && (
                  <Text size="10px" className="text-text-subtle">
                    Thực hiện bởi: <strong className="text-text-muted">{event.actor.name}</strong> ({
                      event.actor.role === "admin" ? "Admin" : event.actor.role === "supporter" ? "Supporter" : "Sinh viên"
                    })
                  </Text>
                )}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
}


