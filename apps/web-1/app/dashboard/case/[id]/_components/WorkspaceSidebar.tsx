"use client";

import React from "react";
import { Tooltip, UnstyledButton, Title, Text } from "@mantine/core";
import { FileText, FileSpreadsheet, MessageSquare, History, Settings } from "lucide-react";
import classes from "../../../../../components/layout/DoubleNavbar.module.css";

interface WorkspaceSidebarProps {
  activeTab: "idea" | "report" | "discussion" | "timeline" | "settings";
  onTabChange: (tab: "idea" | "report" | "discussion" | "timeline" | "settings") => void;
  messageCount?: number;
  hideSettings?: boolean;
  versions?: number[];
  selectedVersion?: number;
  onVersionChange?: (version: number) => void;
}

export default function WorkspaceSidebar({
  activeTab,
  onTabChange,
  messageCount,
  hideSettings = false,
  versions = [0],
  selectedVersion = 0,
  onVersionChange,
}: WorkspaceSidebarProps) {
  const tabs = [
    {
      id: "idea" as const,
      label: "Nội dung hồ sơ",
      icon: FileSpreadsheet,
    },
    {
      id: "report" as const,
      label: "Báo cáo phản biện",
      icon: FileText,
    },
    {
      id: "discussion" as const,
      label: "Thảo luận & Phối hợp",
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
    <nav className={classes.navbar}>
      <div className={classes.wrapper}>
        {/* Primary Rail (Icons) */}
        <aside className={classes.aside}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Tooltip
                key={tab.id}
                label={tab.label}
                position="right"
                withArrow
                disabled={typeof window !== "undefined" && window.innerWidth < 768}
              >
                <UnstyledButton
                  onClick={() => onTabChange(tab.id)}
                  className={classes.mainLink}
                  data-active={isActive || undefined}
                >
                  <Icon className="w-5 h-5" />
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full text-[9px] font-bold flex items-center justify-center border-2 ${
                      isActive ? "bg-white text-brand border-brand" : "bg-brand text-white border-surface-app"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </UnstyledButton>
              </Tooltip>
            );
          })}
        </aside>

        {/* Secondary Panel (Details / Submenu) */}
        <div className={classes.main}>
          <div className="mb-4">
            <Title order={6} className={classes.title}>
              {activeTab === "idea" || activeTab === "report" ? "Phiên bản hồ sơ" : "Chi tiết mục"}
            </Title>
            <Text size="xs" c="dimmed" className="font-body text-[11px]">
              {activeTab === "idea" && "Chọn phiên bản để xem nội dung hồ sơ đã nộp."}
              {activeTab === "report" && "Chọn phiên bản để xem báo cáo phản biện."}
              {activeTab === "discussion" && "Kênh phối hợp chính giữa nhóm và Supporter."}
              {activeTab === "timeline" && "Toàn bộ lịch sử hoạt động."}
              {activeTab === "settings" && "Cấu hình chung của hồ sơ."}
            </Text>
          </div>

          {/* Dynamic content for sub-links (Version switcher or tab description) */}
          {(activeTab === "idea" || activeTab === "report") && versions.length > 0 ? (
            <div className="flex flex-col gap-1">
              {versions.map((ver) => {
                const isSelected = selectedVersion === ver;
                const label = ver === 0 ? "Bản gốc (V0)" : `Phiên bản v${ver.toString().padStart(2, "0")}`;
                const isLatest = ver === Math.max(...versions);

                return (
                  <UnstyledButton
                    key={ver}
                    onClick={() => onVersionChange?.(ver)}
                    className={classes.link}
                    data-active={isSelected || undefined}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{label}</span>
                      {isLatest && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          isSelected ? "bg-brand text-white" : "bg-surface-soft text-text-muted border border-border-app"
                        }`}>
                          Mới nhất
                        </span>
                      )}
                    </div>
                  </UnstyledButton>
                );
              })}
            </div>
          ) : (
            <div className="py-2">
              <Text size="xs" className="font-body italic text-text-subtle">
                {activeTab === "discussion" && "Kênh chat hoạt động 24/7."}
                {activeTab === "timeline" && "Toàn bộ lịch sử xử lý hồ sơ phản biện."}
                {activeTab === "settings" && "Chỉ áp dụng cho người tạo hồ sơ."}
              </Text>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
