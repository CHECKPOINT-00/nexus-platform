"use client";

import React, { useState, useEffect } from "react";
import { Case } from "@/types";
import { useCaseDetails } from "../hooks/useCaseDetails";
import { Settings, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button, TextInput } from "@mantine/core";

interface TabCaseSettingsProps {
  caseData: Case;
}

export default function TabCaseSettings({ caseData }: TabCaseSettingsProps) {
  const { updateSettings, isUpdatingSettings } = useCaseDetails(caseData.id);

  const [teamName, setTeamName] = useState(caseData.team_name || "");
  const [school, setSchool] = useState(caseData.school || "");
  const [courseContext, setCourseContext] = useState(caseData.course_context || "");
  const [groupNo, setGroupNo] = useState(caseData.group_no || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const validate = (vals: { teamName: string; school: string; courseContext: string; groupNo: string }, checkTouched = false) => {
    const nextErrors: Record<string, string> = {};

    if (!checkTouched || touched.teamName) {
      if (vals.teamName.trim().length > 0 && vals.teamName.trim().length < 2) {
        nextErrors.teamName = "Tên nhóm/dự án phải từ 2 đến 100 ký tự.";
      } else if (vals.teamName.length > 100) {
        nextErrors.teamName = "Tên nhóm/dự án không được vượt quá 100 ký tự.";
      }
    }

    if (!checkTouched || touched.groupNo) {
      if (vals.groupNo.trim().length > 10) {
        nextErrors.groupNo = "Số thứ tự nhóm không được vượt quá 10 ký tự.";
      }
    }

    if (!checkTouched || touched.school) {
      if (vals.school.trim().length > 0 && vals.school.trim().length < 2) {
        nextErrors.school = "Tên trường phải từ 2 đến 100 ký tự.";
      } else if (vals.school.length > 100) {
        nextErrors.school = "Tên trường không được vượt quá 100 ký tự.";
      }
    }

    if (!checkTouched || touched.courseContext) {
      if (vals.courseContext.trim().length > 0 && vals.courseContext.trim().length < 2) {
        nextErrors.courseContext = "Thông tin môn học phải từ 2 đến 100 ký tự.";
      } else if (vals.courseContext.length > 100) {
        nextErrors.courseContext = "Thông tin môn học không được vượt quá 100 ký tự.";
      }
    }

    return nextErrors;
  };

  useEffect(() => {
    const nextErrors = validate({ teamName, school, courseContext, groupNo }, true);
    setErrors(nextErrors);
  }, [teamName, school, courseContext, groupNo, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    // Mark all fields as touched
    const allTouched = {
      teamName: true,
      school: true,
      courseContext: true,
      groupNo: true,
    };
    setTouched(allTouched);

    const clientErrors = validate({ teamName, school, courseContext, groupNo }, false);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setStatusMsg({
        type: "error",
        text: "Vui lòng sửa các lỗi nhập liệu trước khi lưu thay đổi.",
      });
      return;
    }

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
        text: err?.response?.data?.message || err?.response?.data?.error || "Gặp lỗi khi lưu thông tin cấu hình.",
      });
    }
  };

  return (
    <div className="bg-surface-app border border-border-app rounded-lg p-6 font-body text-xs text-text-app animate-fade-in">
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
            className={`p-3.5 rounded-lg border flex items-start gap-2.5 text-xs animate-fade-in ${
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
            <TextInput
              label="Tên nhóm / Tên dự án"
              placeholder="Ví dụ: MedTech, Team Sáng Tạo..."
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setErrors(prev => ({ ...prev, teamName: "" }));
              }}
              onBlur={() => setTouched(prev => ({ ...prev, teamName: true }))}
              error={touched.teamName ? errors.teamName : undefined}
              maxLength={100}
              variant="default"
              radius="md"
            />

            <TextInput
              label="Mã số nhóm / Số thứ tự"
              placeholder="Ví dụ: N03, Group 5..."
              value={groupNo}
              onChange={(e) => {
                setGroupNo(e.target.value);
                setErrors(prev => ({ ...prev, groupNo: "" }));
              }}
              onBlur={() => setTouched(prev => ({ ...prev, groupNo: true }))}
              error={touched.groupNo ? errors.groupNo : undefined}
              maxLength={10}
              variant="default"
              radius="md"
            />

            <TextInput
              label="Trường học / Viện đào tạo"
              placeholder="Ví dụ: Đại học FPT, Đại học Bách Khoa..."
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                setErrors(prev => ({ ...prev, school: "" }));
              }}
              onBlur={() => setTouched(prev => ({ ...prev, school: true }))}
              error={touched.school ? errors.school : undefined}
              maxLength={100}
              variant="default"
              radius="md"
            />

            <TextInput
              label="Lớp học / Môn học"
              placeholder="Ví dụ: EXE101, MKT301..."
              value={courseContext}
              onChange={(e) => {
                setCourseContext(e.target.value);
                setErrors(prev => ({ ...prev, courseContext: "" }));
              }}
              onBlur={() => setTouched(prev => ({ ...prev, courseContext: true }))}
              error={touched.courseContext ? errors.courseContext : undefined}
              maxLength={100}
              variant="default"
              radius="md"
            />
          </div>

          <div className="pt-2 border-t border-border-app/40 flex justify-end">
            <Button
              type="submit"
              disabled={isUpdatingSettings}
              color="brand"
              leftSection={isUpdatingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              className="font-semibold text-xs h-9 px-4 cursor-pointer disabled:opacity-60"
            >
              <span>{isUpdatingSettings ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
