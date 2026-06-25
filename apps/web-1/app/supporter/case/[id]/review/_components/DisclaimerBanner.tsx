"use client";

import React from "react";
import { Info, Sparkles } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-info-soft border border-info/20 shadow-sm font-body text-xs text-text-app">
      <div className="w-8 h-8 rounded-lg bg-white/80 border border-info/10 text-info flex items-center justify-center shrink-0">
        <Sparkles className="w-4.5 h-4.5" />
      </div>
      <div className="space-y-1">
        <h4 className="font-heading font-bold text-sm text-info flex items-center gap-1">
          <span>Dự thảo Phản biện AI</span>
        </h4>
        <p className="text-text-muted leading-relaxed">
          Nội dung dưới đây được khởi tạo tự động bởi AI của Nexus. Với vai trò Supporter chuyên môn, bạn bắt buộc phải kiểm duyệt, sửa đổi các nhận định hoặc gợi ý chưa phù hợp, bổ sung bằng chứng xác đáng để đảm bảo độ tin cậy của báo cáo trước khi gửi đến sinh viên.
        </p>
      </div>
    </div>
  );
}
