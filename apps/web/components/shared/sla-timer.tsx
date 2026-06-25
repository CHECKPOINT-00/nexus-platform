"use client";

import { useEffect, useState } from "react";
import { Clock, Pause } from "lucide-react";

interface SlaTimerProps {
  createdAt: string;
  deadline?: string | null;
  userFacingStage: string;
}

export function SlaTimer({ createdAt, deadline, userFacingStage }: SlaTimerProps) {
  const [timeLeftStr, setTimeLeftStr] = useState("");
  const [color, setColor] = useState<"success" | "warning" | "danger" | undefined>("success");
  const isPaused = userFacingStage === "Need Clarification";

  useEffect(() => {
    if (isPaused) {
      setTimeLeftStr("Đang tạm dừng (Chờ làm rõ)");
      setColor(undefined);
      return;
    }

    // Default deadline is 48 hours after creation if not explicitly set
    const deadlineTime = deadline
      ? new Date(deadline).getTime()
      : new Date(createdAt).getTime() + 48 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = deadlineTime - now;

      if (difference <= 0) {
        setTimeLeftStr("Quá hạn SLA");
        setColor("danger");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s`);

      // Set color warning if less than 4 hours remaining
      if (hours < 4) {
        setColor("warning");
      } else {
        setColor("success");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, deadline, isPaused]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold ${
        isPaused
          ? "bg-default-100 text-default-600 dark:bg-default-800 dark:text-default-400"
          : color === "danger"
          ? "bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400"
          : color === "warning"
          ? "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
          : "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400"
      }`}
    >
      {isPaused ? <Pause className="w-3 h-3 shrink-0" /> : <Clock className="w-3 h-3 shrink-0" />}
      <span>{timeLeftStr}</span>
    </span>
  );
}
