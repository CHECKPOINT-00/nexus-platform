"use client";

import React, { useState, useEffect } from "react";
import { Case } from "@/types";
import { statusThemeMap } from "@/types";
import VersionSelector from "./VersionSelector";
import { Clock, Users, Calendar, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
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
  const isSupporterOrAdmin = user?.role === "supporter" || user?.role === "admin";

  const [timeLeft, setTimeLeft] = useState<string>("");
  const [timerColor, setTimerColor] = useState<string>("text-text-muted");

  const isPaused = caseData.internal_status === "need_clarification";

  useEffect(() => {
    if (isPaused) {
      setTimeLeft("Tạm dừng (Cần phản hồi)");
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

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [caseData.deadline, isPaused]);

  // Translate stage label
  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "intake":
        return "Thu thập thông tin";
      case "payment":
        return "Thanh toán dịch vụ";
      case "checkpoint_1":
        return "Checkpoint 1";
      case "checkpoint_2":
        return "Checkpoint 2";
      case "checkpoint_3":
        return "Checkpoint 3";
      default:
        return stage;
    }
  };

  const statusTheme = statusThemeMap[caseData.user_facing_stage] || {
    label: caseData.user_facing_stage,
    color: "default",
  };

  const badgeClass = {
    primary: "bg-brand-soft/30 text-brand border border-brand/20",
    secondary: "bg-info-soft text-info border border-info/20",
    success: "bg-success-soft text-success border border-success/20",
    warning: "bg-warning-soft text-warning border border-warning/20",
    danger: "bg-danger-soft text-danger border border-danger/20",
    default: "bg-surface-muted text-text-muted border border-border-app",
  }[statusTheme.color as "primary" | "secondary" | "success" | "warning" | "danger" | "default"] || "bg-surface-muted text-text-muted border border-border-app";

  return (
    <div className="bg-surface-app border border-border-app rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      {/* Case Basic Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-app">
            {caseData.case_code}
          </h2>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-body ${badgeClass}`}>
            {statusTheme.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-body text-text-muted max-w-full">
          {caseData.team_name && (
            <div className="flex items-center gap-1.5 min-w-0 max-w-full">
              <Users className="w-4 h-4 text-text-subtle shrink-0" />
              <span className="break-all">Nhóm: <strong>{caseData.team_name}</strong></span>
            </div>
          )}
          {caseData.school && (
            <div className="flex items-center gap-1.5 min-w-0 max-w-full">
              <span className="text-text-subtle shrink-0">|</span>
              <span className="break-all">Trường: <strong>{caseData.school}</strong></span>
            </div>
          )}
          {caseData.course_context && (
            <div className="flex items-center gap-1.5 min-w-0 max-w-full">
              <span className="text-text-subtle shrink-0">|</span>
              <span className="break-all">Lớp/Môn: <strong>{caseData.course_context}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* SLA Timer & Version Selector */}
      <div className="flex flex-wrap md:flex-col items-start md:items-end gap-4 shrink-0 w-full md:w-auto">
        <div className="flex items-center gap-2 p-2 px-3 bg-surface-soft rounded-lg text-xs font-body">
          <Clock className="w-4 h-4 text-text-subtle" />
          <span className="text-text-muted mr-1.5">Hạn phản biện:</span>
          <span className={timerColor}>{timeLeft}</span>
          {isPaused && (
            <div className="w-2 h-2 rounded-full bg-warning animate-ping ml-1" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSupporterOrAdmin && (
            <Link
              href={`/supporter/case/${caseData.id}/review`}
              className="inline-flex items-center justify-center gap-1.5 font-body text-xs font-semibold bg-brand hover:bg-brand-hover text-white px-3.5 py-2 h-8.5 rounded-lg shadow-sm shadow-brand/10 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Biên tập phản biện</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
