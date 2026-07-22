"use client";

import React from "react";
import { Case } from "@/types";
import { 
  Clock, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle
} from "lucide-react";
import { Alert, Button } from "@mantine/core";

interface StatusGuidanceCardProps {
  caseData: Case;
  openRequestsForMoreInfo?: any[] | null;
  onOpenBuyRound?: () => void;
  onSelectTab: (tab: "documents" | "discussion" | "timeline" | "settings") => void;
}

export default function StatusGuidanceCard({
  caseData,
  openRequestsForMoreInfo,
  onOpenBuyRound,
}: StatusGuidanceCardProps) {
  const stage = caseData.user_facing_stage;
  const hasInfoRequest = openRequestsForMoreInfo && openRequestsForMoreInfo.length > 0;

  if (hasInfoRequest) {
    const queryText = openRequestsForMoreInfo[0].metadata_json?.query || "Vui lòng kiểm tra lại tài liệu đã tải lên.";
    return (
      <Alert
        variant="light"
        color="orange"
        radius="md"
        title="Yêu cầu bổ sung thông tin từ Supporter"
        icon={<HelpCircle className="w-4.5 h-4.5 shrink-0" />}
        className="animate-fade-in font-body text-xs shrink-0"
      >
        <div className="space-y-1 flex-grow">
            <p className="font-semibold text-warning-strong">Nội dung yêu cầu:</p>
            <p className="italic bg-surface-app/50 p-2.5 rounded border border-warning/10 font-body text-[11px] leading-relaxed">
              "{queryText}"
            </p>
          </div>
      </Alert>
    );
  }

  switch (stage) {
    case "submitted":
      return (
        <Alert
          variant="light"
          color="blue"
          radius="md"
          title="Hồ sơ đã gửi thành công — Chờ xét duyệt"
          icon={<Clock className="w-4.5 h-4.5 shrink-0" />}
          className="animate-fade-in font-body text-xs shrink-0"
        >
          <p className="text-text-muted text-xs leading-relaxed">
            Ban tổ chức đang kiểm tra hồ sơ và phân công Supporter chuyên môn phụ trách dự án (thường mất 12-24 giờ). Hiện tại bạn không cần làm gì thêm.
          </p>
        </Alert>
      );

    case "under_review":
      return (
        <Alert
          variant="light"
          color="blue"
          radius="md"
          title="Dự án đang trong quá trình phản biện"
          icon={<Activity className="w-4.5 h-4.5 shrink-0" />}
          className="animate-fade-in font-body text-xs shrink-0"
        >
          <p className="text-text-muted text-xs leading-relaxed">
            Supporter đang tiến hành đọc tài liệu và viết báo cáo phản biện chi tiết. Vui lòng chờ báo cáo hoặc theo dõi Thảo luận nếu Supporter cần trao đổi thêm.
          </p>
        </Alert>
      );

    case "report_ready":
    case "waiting_for_revision": {
      return (
        <Alert
          variant="light"
          color="green"
          radius="md"
          title="Báo cáo phản biện đã sẵn sàng"
          icon={<CheckCircle2 className="w-4.5 h-4.5 shrink-0" />}
          className="animate-fade-in font-body text-xs shrink-0"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1">
            <p className="text-text-muted text-xs leading-relaxed">
              Supporter đã hoàn thành đánh giá chi tiết. Nhấp nút bên dưới để mua thêm lượt audit và tiếp tục nộp tài liệu vòng mới.
            </p>
            <Button
              size="xs"
              color="teal"
              className="font-semibold shrink-0 cursor-pointer"
              onClick={onOpenBuyRound}
            >
              Mua thêm lượt audit (39k)
            </Button>
          </div>
        </Alert>
      );
    }

    case "revision_submitted":
      return (
        <Alert
          variant="light"
          color="blue"
          radius="md"
          title="Bản sửa đổi đã gửi thành công — Chờ thẩm định"
          icon={<Clock className="w-4.5 h-4.5 shrink-0" />}
          className="animate-fade-in font-body text-xs shrink-0"
        >
          <p className="text-text-muted text-xs leading-relaxed">
            Supporter đang tiến hành thẩm định bản sửa đổi mới nhất của bạn.
          </p>
        </Alert>
      );

    case "completed":
    case "approved":
    case "APPROVED":
    case "sent":
      return (
        <Alert
          variant="light"
          color="green"
          radius="md"
          title="Quy trình phản biện đã hoàn tất"
          icon={<CheckCircle2 className="w-4.5 h-4.5 shrink-0" />}
          className="animate-fade-in font-body text-xs shrink-0"
        >
          <p className="text-text-muted text-xs leading-relaxed">
            Hồ sơ phản biện dự án của bạn đã hoàn thành qua các vòng. Bạn có thể xem báo cáo chi tiết và điểm số tại tab Tài liệu dự án.
          </p>
        </Alert>
      );

    case "rejected":
      return (
        <Alert
          variant="light"
          color="red"
          radius="md"
          title="Hồ sơ bị từ chối xét duyệt"
          icon={<AlertCircle className="w-4.5 h-4.5 shrink-0" />}
          className="animate-fade-in font-body text-xs shrink-0"
        >
          <p className="text-text-muted text-xs leading-relaxed">
            Yêu cầu phản biện dự án của bạn không được duyệt. Vui lòng liên hệ với Ban tổ chức hoặc gửi thắc mắc qua phần Thảo luận.
          </p>
        </Alert>
      );

    default:
      return null;
  }
}
