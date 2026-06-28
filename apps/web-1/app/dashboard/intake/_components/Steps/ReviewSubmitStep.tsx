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
  audit_checkpoint_1: "Phản biện & Đánh giá rủi ro Checkpoint 1",
  validate_customer_problem: "Kiểm chứng nỗi đau & Phân khúc khách hàng",
  verify_market_size: "Đánh giá quy mô thị trường & đối thủ cạnh tranh",
  optimize_business_model: "Tối ưu mô hình doanh thu & giải pháp thay thế",
  general_review: "Tổng duyệt toàn diện bản báo cáo Checkpoint",
};

export default function ReviewSubmitStep({ values, packages, error }: ReviewSubmitStepProps) {
  const selectedPackage = packages?.find((p) => p.id === values.package_id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return "Chưa chọn";
    const d = dayjs(dateVal);
    return d.isValid() ? d.format("DD/MM/YYYY") : "Chưa chọn";
  };

  return (
    <div className="font-body text-text-app max-w-3xl mx-auto space-y-10">
      
      {/* TIÊU ĐỀ CHÍNH */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-text-app">
          Xác nhận thông tin hồ sơ
        </h2>
        <p className="text-sm text-text-muted">
          Vui lòng kiểm tra kỹ tất cả các thông tin dưới đây trước khi gửi yêu cầu.
        </p>
      </div>

      {error && (
        <div className="text-sm text-danger bg-danger-soft/20 p-3 rounded-lg">
          Lỗi: {error}
        </div>
      )}

      {/* NỘI DUNG CHI TIẾT */}
      <div className="space-y-10">
        
        {/* 1. GÓI DỊCH VỤ & TIẾN ĐỘ */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand uppercase tracking-wider">
            1. Gói dịch vụ &amp; Hạn chót
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-4 gap-x-6 text-sm">
            <div className="text-text-muted">Gói phản biện đã chọn:</div>
            <div className="text-text-app">
              {selectedPackage?.name} ({formatPrice(selectedPackage?.price || 0)})
            </div>

            <div className="text-text-muted">Hạn nộp bài mong muốn:</div>
            <div className="text-text-app">
              {formatDate(values.deadline)}
            </div>

            <div className="text-text-muted">Mức độ ưu tiên xử lý:</div>
            <div className="text-text-app">
              {values.urgency === "urgent" ? "Gấp (trong 24h)" : "Bình thường"}
            </div>

            <div className="text-text-muted">Vòng phản biện bổ sung:</div>
            <div className="text-text-app">
              {values.needs_followup_review ? "Đăng ký thêm 1 vòng phản biện phụ" : "Không đăng ký"}
            </div>
          </div>
        </div>

        {/* 2. THÔNG TIN THÀNH VIÊN LIÊN HỆ */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand uppercase tracking-wider">
            2. Người đại diện liên hệ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-4 gap-x-6 text-sm">
            <div className="text-text-muted">Họ tên &amp; Vai trò:</div>
            <div className="text-text-app">
              {values.contact?.full_name || "N/A"}
              {values.contact?.team_role ? ` (${values.contact.team_role})` : ""}
            </div>

            <div className="text-text-muted">Mã sinh viên:</div>
            <div className="text-text-app">
              {values.contact?.student_code || "N/A"}
            </div>

            <div className="text-text-muted">Số điện thoại Zalo:</div>
            <div className="text-text-app">
              {values.contact?.zalo || "N/A"}
            </div>

            <div className="text-text-muted">Email liên hệ:</div>
            <div className="text-text-app break-all">
              {values.contact?.email || "N/A"}
            </div>
          </div>
        </div>

        {/* 3. THÔNG TIN ĐỀ TÀI & LỚP HỌC */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand uppercase tracking-wider">
            3. Thông tin đề tài &amp; Lớp học
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-4 gap-x-6 text-sm">
            <div className="text-text-muted">Tên đề tài / Dự án:</div>
            <div className="text-text-app">
              {values.team_context?.project_name || "N/A"}
            </div>

            <div className="text-text-muted">Trường học:</div>
            <div className="text-text-app">
              {values.school || "N/A"}
            </div>

            <div className="text-text-muted">Môn học &amp; Nhóm lớp:</div>
            <div className="text-text-app">
              {values.course_context || "N/A"}
              {values.team_context?.group_no ? ` - Nhóm ${values.team_context.group_no}` : ""}
            </div>

            {values.team_context?.team_status_summary && (
              <>
                <div className="text-text-muted">Hiện trạng hoạt động của nhóm:</div>
                <div className="text-text-app leading-relaxed whitespace-pre-wrap">
                  {values.team_context.team_status_summary}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4. CHI TIẾT Ý TƯỞNG DỰ ÁN */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand uppercase tracking-wider">
            4. Ý tưởng &amp; Bối cảnh thực tế
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-4 gap-x-6 text-sm">
            <div className="text-text-muted">Tóm tắt ý tưởng dự án:</div>
            <div className="text-text-app leading-relaxed whitespace-pre-wrap">
              {values.case_summary || "Chưa cung cấp"}
            </div>

            {values.current_situations && values.current_situations.length > 0 && (
              <>
                <div className="text-text-muted">Bối cảnh / Tình huống thực tế:</div>
                <div className="text-text-app">
                  <ul className="list-disc pl-5 space-y-1.5">
                    {values.current_situations.map((situation: string, index: number) => (
                      <li key={index} className="leading-relaxed">{situation}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 5. NHU CẦU & KỲ VỌNG HỖ TRỢ */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand uppercase tracking-wider">
            5. Nhu cầu hỗ trợ từ Supporter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-4 gap-x-6 text-sm">
            <div className="text-text-muted">Nhu cầu hỗ trợ chính:</div>
            <div className="text-text-app">
              {PRIMARY_NEEDS_MAP[values.support_needs?.primary_need] || values.support_needs?.primary_need || "N/A"}
            </div>

            <div className="text-text-muted">Kỳ vọng đầu ra chi tiết:</div>
            <div className="text-text-app leading-relaxed whitespace-pre-wrap">
              {values.expected_outputs || "Chưa cung cấp"}
            </div>

            {values.support_needs?.extra_notes && (
              <>
                <div className="text-text-muted">Ghi chú thêm cho Supporter:</div>
                <div className="text-text-app leading-relaxed whitespace-pre-wrap">
                  {values.support_needs.extra_notes}
                </div>
              </>
            )}

            {values.lecturer_feedback && (
              <>
                <div className="text-text-muted">Phản hồi của giảng viên hướng dẫn:</div>
                <div className="text-text-app leading-relaxed whitespace-pre-wrap">
                  {values.lecturer_feedback}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 6. TÀI LIỆU ĐÍNH KÈM */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-brand uppercase tracking-wider">
            6. Tài liệu đính kèm (Google Drive)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-y-5 gap-x-6 text-sm">
            {values.documents && values.documents.length > 0 ? (
              values.documents.map((doc: any, index: number) => (
                <React.Fragment key={index}>
                  <div className="text-text-muted">
                    {doc.document_type}:
                  </div>
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
                      <p className="text-xs text-text-muted italic">
                        Mô tả tài liệu: {doc.role_description}
                      </p>
                    )}
                  </div>
                </React.Fragment>
              ))
            ) : (
              <>
                <div className="text-text-muted">Tài liệu đính kèm:</div>
                <div className="text-text-muted italic">
                  Không có tài liệu đính kèm
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
