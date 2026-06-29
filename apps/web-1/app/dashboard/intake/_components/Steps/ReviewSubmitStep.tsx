"use client";

import React from "react";
import { ServicePackage } from "@/types";
import dayjs from "dayjs";

interface ReviewSubmitStepProps {
  values: any;
  packages: ServicePackage[] | undefined;
  error: string | null;
}

const PRIMARY_NEEDS_MAP: Record<string, string> = {
  filter_select_idea: "Lọc & lựa chọn ý tưởng khởi nghiệp (khi có nhiều ý tưởng hoặc chưa chốt)",
  clarify_customer_pain: "Làm rõ khách hàng mục tiêu & nỗi đau (Problem & Customer)",
  critique_feasibility: "Phản biện tính khả thi & giải pháp (Solution & Feasibility)",
  audit_cp1_draft: "Tổng duyệt & rà soát lỗi báo cáo Checkpoint 1",
  improve_rejected_idea: "Cải thiện ý tưởng bị giảng viên từ chối / đánh giá yếu",
};

const getDisplayBlocker = (values: any) => {
  if (typeof values.current_blocker === "string" && values.current_blocker.trim()) {
    return values.current_blocker.trim();
  }
  if (typeof values.case_summary === "string" && values.case_summary.trim()) {
    return values.case_summary.trim();
  }
  if (Array.isArray(values.current_situations) && values.current_situations.length > 0) {
    return values.current_situations.join("\n");
  }
  return "Chưa cung cấp";
};

export default function ReviewSubmitStep({ values, packages, error }: ReviewSubmitStepProps) {
  const selectedPackage = packages?.find((p) => p.id === values.package_id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return "Chưa chọn";
    const d = dayjs(dateVal);
    return d.isValid() ? d.format("DD/MM/YYYY") : "Chưa chọn";
  };

  return (
    <div className="font-body text-text-app max-w-3xl mx-auto space-y-10">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-text-app">Xác nhận thông tin hồ sơ</h2>
        <p className="text-sm text-text-muted">
          Đây là gói bàn giao để Supporter bắt đầu xử lý. Kiểm tra lại trước khi xác nhận.
        </p>
      </div>

      {error && (
        <div className="text-sm text-danger bg-danger-soft/20 p-3 rounded-lg">
          Lỗi: {error}
        </div>
      )}

      <div className="space-y-10">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-brand uppercase tracking-wider">1. Điểm kẹt hiện tại</h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-4 gap-x-6 text-sm">
            <div className="font-semibold text-text-app">Nhóm đang cần gỡ gì lúc này:</div>
            <div className="text-text-app leading-relaxed whitespace-pre-wrap">{getDisplayBlocker(values)}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-brand uppercase tracking-wider">2. Nhu cầu hỗ trợ</h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-4 gap-x-6 text-sm">
            <div className="font-semibold text-text-app">Nhu cầu hỗ trợ chính:</div>
            <div className="text-text-app">
              {PRIMARY_NEEDS_MAP[values.support_needs?.primary_need] || values.support_needs?.primary_need || "N/A"}
            </div>

            {values.expected_outputs && (
              <>
                <div className="font-semibold text-text-app">Kết quả mong đợi:</div>
                <div className="text-text-app leading-relaxed whitespace-pre-wrap">{values.expected_outputs}</div>
              </>
            )}

            {values.support_needs?.extra_notes && (
              <>
                <div className="font-semibold text-text-app">Ghi chú thêm cho Supporter:</div>
                <div className="text-text-app leading-relaxed whitespace-pre-wrap">
                  {values.support_needs.extra_notes}
                </div>
              </>
            )}

            {values.lecturer_feedback && (
              <>
                <div className="font-semibold text-text-app">Phản hồi của giảng viên hướng dẫn:</div>
                <div className="text-text-app leading-relaxed whitespace-pre-wrap">{values.lecturer_feedback}</div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-brand uppercase tracking-wider">3. Tài liệu đính kèm</h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-5 gap-x-6 text-sm">
            {values.documents && values.documents.length > 0 ? (
              values.documents.map((doc: any, index: number) => (
                <React.Fragment key={index}>
                  <div className="font-semibold text-text-app">{doc.document_type}:</div>
                  <div className="space-y-1">
                    <a
                      href={doc.drive_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-blue-600 hover:underline break-all block"
                    >
                      {doc.drive_url}
                    </a>
                    {doc.role_description && (
                      <p className="text-xs text-text-muted italic">Mô tả tài liệu: {doc.role_description}</p>
                    )}
                  </div>
                </React.Fragment>
              ))
            ) : (
              <>
                <div className="font-semibold text-text-app">Tài liệu đính kèm:</div>
                <div className="text-text-muted italic">Không có tài liệu đính kèm</div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-brand uppercase tracking-wider">4. Hạn chót & gói dịch vụ</h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-4 gap-x-6 text-sm">
            <div className="font-semibold text-text-app">Gói phản biện đã chọn:</div>
            <div className="text-text-app">
              {selectedPackage?.name} ({formatPrice(selectedPackage?.price || 0)})
            </div>

            <div className="font-semibold text-text-app">Hạn nộp bài mong muốn:</div>
            <div className="text-text-app">{formatDate(values.deadline)}</div>

            <div className="font-semibold text-text-app">Mức độ ưu tiên xử lý:</div>
            <div className="text-text-app">{values.urgency === "urgent" ? "Gấp (trong 24h)" : "Bình thường"}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-brand uppercase tracking-wider">5. Liên hệ</h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-4 gap-x-6 text-sm">
            <div className="font-semibold text-text-app">Họ tên & vai trò:</div>
            <div className="text-text-app">
              {values.contact?.full_name || "N/A"}
              {values.contact?.team_role ? ` (${values.contact.team_role})` : ""}
            </div>

            <div className="font-semibold text-text-app">Mã sinh viên:</div>
            <div className="text-text-app">{values.contact?.student_code || "N/A"}</div>

            <div className="font-semibold text-text-app">Số điện thoại Zalo:</div>
            <div className="text-text-app">{values.contact?.zalo || "N/A"}</div>

            <div className="font-semibold text-text-app">Email liên hệ:</div>
            <div className="text-text-app break-all">{values.contact?.email || "N/A"}</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-brand uppercase tracking-wider">6. Metadata nhóm / môn học</h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-4 gap-x-6 text-sm">
            <div className="font-semibold text-text-app">Tên đề tài:</div>
            <div className="text-text-app">{values.team_context?.project_name || "N/A"}</div>

            <div className="font-semibold text-text-app">Trường học:</div>
            <div className="text-text-app">{values.school || "N/A"}</div>

            <div className="font-semibold text-text-app">Môn học & nhóm lớp:</div>
            <div className="text-text-app">
              {values.course_context || "N/A"}
              {values.team_context?.group_no ? ` - Nhóm ${values.team_context.group_no}` : ""}
            </div>

            {values.team_context?.team_status_summary && (
              <>
                <div className="font-semibold text-text-app">Hiện trạng hoạt động của nhóm:</div>
                <div className="text-text-app leading-relaxed whitespace-pre-wrap">
                  {values.team_context.team_status_summary}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
