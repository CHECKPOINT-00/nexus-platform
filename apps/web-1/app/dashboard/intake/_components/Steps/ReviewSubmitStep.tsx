"use client";

import React from "react";
import { ServicePackage } from "@/types";

interface ReviewSubmitStepProps {
  values: any;
  packages: ServicePackage[] | undefined;
  error: string | null;
}

export default function ReviewSubmitStep({ values, packages, error }: ReviewSubmitStepProps) {
  const selectedPackage = packages?.find((p) => p.id === values.package_id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-5 font-body">
      <div className="space-y-1">
        <h3 className="font-heading text-base font-bold text-text-app">Xác nhận thông tin hồ sơ</h3>
        <p className="font-body text-xs text-text-muted">
          Kiểm tra kỹ các thông tin trước khi nộp hồ sơ chạy phản biện.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger-soft border border-danger/10 text-danger rounded-xl text-xs font-semibold animate-pulse">
          ⚠️ {error}
        </div>
      )}

      <div className="border border-border-app rounded-xl p-4 bg-surface-soft/40 divide-y divide-border-app/50 text-xs space-y-3">
        <div className="pb-2.5 flex justify-between items-center">
          <span className="font-bold text-text-muted">Gói phản biện đã chọn</span>
          <span className="font-extrabold text-brand text-sm">
            {selectedPackage?.name} ({formatPrice(selectedPackage?.price || 0)})
          </span>
        </div>

        <div className="py-2.5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="font-bold text-text-muted block mb-0.5">Họ tên liên hệ</span>
            <span className="text-text-app">{values.contact?.full_name || "N/A"} ({values.contact?.team_role || "N/A"})</span>
          </div>
          <div>
            <span className="font-bold text-text-muted block mb-0.5">Số điện thoại Zalo</span>
            <span className="text-text-app">{values.contact?.zalo || "N/A"}</span>
          </div>
          <div className="md:col-span-2">
            <span className="font-bold text-text-muted block mb-0.5">Email liên hệ</span>
            <span className="text-text-app">{values.contact?.email || "N/A"}</span>
          </div>
        </div>

        <div className="py-2.5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="font-bold text-text-muted block mb-0.5">Tên đề tài</span>
            <span className="text-text-app">{values.team_context?.project_name || "N/A"}</span>
          </div>
          <div>
            <span className="font-bold text-text-muted block mb-0.5">Mã môn học / Lớp</span>
            <span className="text-text-app">{values.course_context || "N/A"} (Nhóm: {values.team_context?.group_no || "N/A"})</span>
          </div>
        </div>

        <div className="py-2.5 space-y-1">
          <span className="font-bold text-text-muted block">Tóm tắt ý tưởng dự án</span>
          <p className="text-text-app leading-relaxed text-[11px] bg-surface-app p-2.5 border border-border-app rounded-lg">
            {values.case_summary || "Chưa cung cấp"}
          </p>
        </div>

        <div className="py-2.5 space-y-1">
          <span className="font-bold text-text-muted block">Đường dẫn Google Drive tài liệu</span>
          {values.documents?.map((doc: any, index: number) => (
            <div key={index} className="text-[11px] bg-surface-app p-2 border border-border-app rounded-lg break-all">
              <span className="font-bold text-brand block">{doc.document_type}</span>
              <a href={doc.drive_url} target="_blank" rel="noreferrer noopener" className="text-blue-500 hover:underline">
                {doc.drive_url}
              </a>
              <p className="text-text-muted mt-0.5 italic">{doc.role_description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
