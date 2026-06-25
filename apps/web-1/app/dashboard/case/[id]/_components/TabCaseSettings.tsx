"use client";

import React, { useState } from "react";
import { Case } from "@/types";
import { useCaseDetails } from "../hooks/useCaseDetails";
import { Settings, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button, Input } from "@heroui/react";

interface TabCaseSettingsProps {
  caseData: Case;
}

export default function TabCaseSettings({ caseData }: TabCaseSettingsProps) {
  const { updateSettings, isUpdatingSettings } = useCaseDetails(caseData.id);

  const [teamName, setTeamName] = useState(caseData.team_name || "");
  const [school, setSchool] = useState(caseData.school || "");
  const [courseContext, setCourseContext] = useState(caseData.course_context || "");
  const [groupNo, setGroupNo] = useState(caseData.group_no || "");

  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    try {
      await updateSettings({
        team_name: teamName,
        school,
        course_context: courseContext,
        group_no: groupNo,
      });
      setStatusMsg({ type: "success", text: "Đã cập nhật thông tin dự án thành công!" });
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err?.response?.data?.error || "Gặp lỗi khi lưu thông tin cấu hình.",
      });
    }
  };

  return (
    <div className="bg-surface-app border border-border-app rounded-2xl p-6 shadow-sm font-body text-xs text-text-app animate-fade-in">
      <div className="max-w-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-text-app">
            <Settings className="w-5 h-5 text-brand" />
            <h3 className="font-heading font-bold text-base">Cấu hình thông tin dự án</h3>
          </div>
          <p className="text-text-muted text-xs mt-1">
            Cập nhật tên nhóm, trường học và bối cảnh lớp học để báo cáo phản biện hiển thị chính xác.
          </p>
        </div>

        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-fade-in ${
              statusMsg.type === "success"
                ? "bg-success-soft text-success border-success/15"
                : "bg-danger-soft text-danger border-danger/15"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-muted">Tên nhóm / Tên dự án</label>
              <Input
                type="text"
                placeholder="Ví dụ: MedTech, Team Sáng Tạo..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand px-3 h-10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-muted">Mã số nhóm / Số thứ tự</label>
              <Input
                type="text"
                placeholder="Ví dụ: N03, Group 5..."
                value={groupNo}
                onChange={(e) => setGroupNo(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand px-3 h-10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-muted">Trường học / Viện đào tạo</label>
              <Input
                type="text"
                placeholder="Ví dụ: Đại học FPT, Đại học Bách Khoa..."
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand px-3 h-10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-muted">Lớp học / Môn học</label>
              <Input
                type="text"
                placeholder="Ví dụ: EXE101, MKT301..."
                value={courseContext}
                onChange={(e) => setCourseContext(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand px-3 h-10"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border-app/40 flex justify-end">
            <Button
              type="submit"
              isDisabled={isUpdatingSettings}
              className="bg-brand text-white font-semibold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 hover:bg-brand-hover cursor-pointer disabled:opacity-60"
            >
              {isUpdatingSettings ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isUpdatingSettings ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
