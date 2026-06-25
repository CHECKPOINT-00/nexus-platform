import type { CaseEvent } from "../types";

const EVENT_LABELS: Record<string, string> = {
  case_created: "Dự án được khởi tạo",
  payment_proof_uploaded: "Tải ảnh minh chứng",
  payment_verified: "Xác nhận thanh toán",
  payment_rejected: "Từ chối thanh toán",
  supporter_assigned: "Mentor nhận dự án",
  report_draft_created: "AI tạo báo cáo nháp",
  report_approved: "Gửi báo cáo phản biện",
  status_updated: "Cập nhật trạng thái",
};

interface ActivityLogProps {
  events: CaseEvent[];
}

export function ActivityLog({ events }: ActivityLogProps) {
  return (
    <div className="flex flex-col gap-4 relative pl-4 border-l border-default-200">
      {events.map((e) => (
        <div key={e.id} className="relative flex flex-col gap-0.5">
          <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-orange-500 border border-background" />
          <p className="text-xs font-semibold text-default-700">
            {EVENT_LABELS[e.event_type] ?? e.event_type}
          </p>
          <p className="text-[10px] text-default-400">
            Bởi {e.actor.name} ({new Date(e.created_at).toLocaleDateString("vi-VN")})
          </p>
        </div>
      ))}
    </div>
  );
}
