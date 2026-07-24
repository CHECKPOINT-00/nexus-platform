"use client";

import React from "react";
import { Clock, ArrowUpRight, ArrowDownRight, RotateCcw, Receipt, Loader2 } from "lucide-react";

interface CreditEntry {
  id: string;
  amount: number;
  balance_after: number;
  type: "purchase" | "consumption" | "refund";
  reference_id: string | null;
  created_at: string;
}

interface CreditTransactionHistoryProps {
  entries?: CreditEntry[];
  isLoading?: boolean;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return `Hôm nay, ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays === 1) {
    return `Hôm qua, ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeLabel(type: string) {
  switch (type) {
    case "purchase":
      return { label: "Mua credit", icon: ArrowDownRight, color: "text-success", bg: "bg-success-soft" };
    case "consumption":
      return { label: "Đã dùng", icon: ArrowUpRight, color: "text-brand", bg: "bg-brand-soft/30" };
    case "refund":
      return { label: "Hoàn tiền", icon: RotateCcw, color: "text-warning", bg: "bg-warning-soft" };
    default:
      return { label: type, icon: Receipt, color: "text-text-muted", bg: "bg-surface-soft" };
  }
}

export default function CreditTransactionHistory({ entries, isLoading }: CreditTransactionHistoryProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-app border border-border-app rounded-xl p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-brand" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-surface-app border border-border-app rounded-xl p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center">
            <Clock className="w-5 h-5 text-text-muted" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-app">Chưa có giao dịch</p>
            <p className="text-xs text-text-muted mt-0.5">
              Lịch sử mua và sử dụng credit sẽ xuất hiện tại đây
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-app border border-border-app rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border-app">
        <h3 className="text-sm font-bold text-text-app flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-muted" />
          Lịch sử sử dụng credit
        </h3>
      </div>
      <div className="divide-y divide-border-app">
        {entries.map((entry) => {
          const meta = getTypeLabel(entry.type);
          const Icon = meta.icon;
          const isPositive = entry.amount > 0;

          return (
            <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-soft/50 transition-colors">
              <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-app">{meta.label}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{formatTime(entry.created_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${isPositive ? "text-success" : meta.color}`}>
                  {isPositive ? "+" : ""}{entry.amount}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Còn {entry.balance_after}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
