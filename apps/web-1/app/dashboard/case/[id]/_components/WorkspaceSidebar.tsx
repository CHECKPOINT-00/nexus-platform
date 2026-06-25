"use client";

import React from "react";
import { FileText, FileSpreadsheet, MessageSquare, History, Settings } from "lucide-react";

interface WorkspaceSidebarProps {
  activeTab: "idea" | "report" | "discussion" | "timeline" | "settings";
  onTabChange: (tab: "idea" | "report" | "discussion" | "timeline" | "settings") => void;
  messageCount?: number;
  hideSettings?: boolean;
}

export default function WorkspaceSidebar({
  activeTab,
  onTabChange,
  messageCount,
  hideSettings = false,
}: WorkspaceSidebarProps) {
  const tabs = [
    {
      id: "idea" as const,
      label: "Ý tưởng nộp",
      icon: FileSpreadsheet,
    },
    {
      id: "report" as const,
      label: "Báo cáo phản biện",
      icon: FileText,
    },
    {
      id: "discussion" as const,
      label: "Trao đổi & Phản hồi",
      icon: MessageSquare,
      count: messageCount,
    },
    {
      id: "timeline" as const,
      label: "Lịch sử hoạt động",
      icon: History,
    },
    ...(!hideSettings
      ? [
          {
            id: "settings" as const,
            label: "Cấu hình",
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1.5 p-2 border border-border-app bg-surface-app rounded-2xl shadow-sm h-fit overflow-x-auto md:overflow-visible no-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-between gap-3 p-3 rounded-xl font-heading font-semibold text-xs transition-all cursor-pointer whitespace-nowrap md:whitespace-normal shrink-0 md:shrink ${
              isActive
                ? "bg-brand text-white shadow-sm shadow-brand/10"
                : "text-text-muted hover:text-text-app hover:bg-surface-soft"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4.5 h-4.5" />
              <span>{tab.label}</span>
            </div>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  isActive ? "bg-white text-brand" : "bg-brand text-white"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
