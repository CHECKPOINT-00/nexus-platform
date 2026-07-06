"use client";

import React, { useState, useEffect } from "react";
import { Case } from "@/types";
import CasePipelineStepper from "@/components/case/CasePipelineStepper";
import { Clock, Users } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface CaseStatusHeaderProps {
  caseData: Case;
  versions: number[];
  selectedVersion: number;
  onVersionChange: (version: number) => void;
}

export default function CaseStatusHeader({
  caseData,
  versions,
  selectedVersion,
  onVersionChange,
}: CaseStatusHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user ? (session.user as typeof session.user & { role?: string }) : undefined;

  const [timeLeft, setTimeLeft] = useState<string>("");
  const [timerColor, setTimerColor] = useState<string>("text-text-muted");

  const isPaused = caseData.internal_status === "need_clarification";

  useEffect(() => {
    if (isPaused) {
      setTimeLeft("Đang chờ nhóm bổ sung thông tin");
      setTimerColor("text-warning");
      return;
    }

    if (!caseData.deadline) {
      setTimeLeft("Chưa thiết lập");
      setTimerColor("text-text-subtle");
      return;
    }

    const targetDate = new Date(caseData.deadline).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft("Quá hạn SLA");
        setTimerColor("text-danger font-bold");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let timeString = "";
      if (days > 0) timeString += `${days} ngày `;
      timeString += `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      setTimeLeft(timeString);

      // Alert style if under 4 hours
      if (diff < 4 * 60 * 60 * 1000) {
        setTimerColor("text-danger font-semibold animate-pulse");
      } else if (diff < 12 * 60 * 60 * 1000) {
        setTimerColor("text-warning font-semibold");
      } else {
        setTimerColor("text-brand font-semibold");
      }
    };

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [caseData.deadline, isPaused]);

  return (
    <div className="bg-surface-app border border-border-app rounded-lg p-6 flex flex-col gap-6 shadow-sm">
      {/* Case Info & SLA Timer Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Case Basic Info */}
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">
              Hồ sơ phản biện
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-app">
              {caseData.case_code}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-body text-text-muted">
            {caseData.team_name && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-text-subtle" />
                <span>Nhóm: <strong>{caseData.team_name}</strong></span>
              </div>
            )}
            {caseData.school && (
              <div className="flex items-center gap-1.5">
                <span className="text-text-subtle">|</span>
                <span>Trường: <strong>{caseData.school}</strong></span>
              </div>
            )}
            {caseData.course_context && (
              <div className="flex items-center gap-1.5">
                <span className="text-text-subtle">|</span>
                <span>Lớp/Môn: <strong>{caseData.course_context}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* SLA Timer */}
        <div className="flex items-center gap-2 p-2 px-3 bg-surface-soft rounded-lg text-xs font-body shrink-0 self-start md:self-auto">
          <Clock className="w-4 h-4 text-text-subtle" />
          <span className="text-text-muted mr-1.5">Hạn phản biện:</span>
          <span className={timerColor}>{timeLeft}</span>
          {isPaused && (
            <div className="w-2 h-2 rounded-full bg-warning animate-ping ml-1" />
          )}
        </div>
      </div>

      {/* Case Progress Stepper */}
      <div className="border-t border-border-app pt-4 w-full">
        <CasePipelineStepper caseData={caseData} versionNo={versions.length || 1} />
      </div>
    </div>
  );
}
