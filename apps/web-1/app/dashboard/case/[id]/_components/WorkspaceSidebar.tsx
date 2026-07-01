"use client";

import React from "react";
import { Tooltip, UnstyledButton, Title, Text } from "@mantine/core";
import { FileText, MessageSquare, History, Settings } from "lucide-react";
import classes from "../../../../../components/layout/DoubleNavbar.module.css";

interface WorkspaceSidebarProps {
  activeTab: "documents" | "discussion" | "timeline" | "settings";
  onTabChange: (tab: "documents" | "discussion" | "timeline" | "settings") => void;
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
      id: "documents" as const,
      label: "Tài liệu",
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
                    <span
                      className={`absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full text-[9px] font-bold flex items-center justify-center border-2 ${
                        isActive ? "bg-white text-brand border-brand" : "bg-brand text-white border-surface-app"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </UnstyledButton>
              </Tooltip>
            );
          })}
        </aside>

        <div className={classes.main}>
          <div className="mb-4">
            <Title order={6} className={classes.title}>
              {activeTab === "settings" ? "Chi tiết mục" : "Tài liệu hồ sơ"}
            </Title>
            <Text size="xs" c="dimmed" className="font-body text-[11px]">
              {activeTab === "documents" && "Tổng quan tài liệu, bản sửa, output hỗ trợ và đánh giá bên ngoài."}
              {activeTab === "discussion" && "Kênh phối hợp chính giữa nhóm và Supporter."}
              {activeTab === "timeline" && "Toàn bộ lịch sử hoạt động."}
              {activeTab === "settings" && "Cấu hình chung của hồ sơ."}
            </Text>
          </div>

          <div className="py-2">
            <Text size="xs" className="font-body italic text-text-subtle">
              {activeTab === "documents" &&
                "Không còn điều hướng theo phiên bản ở sidebar. Phiên bản hiển thị trong nội dung bảng tài liệu."}
              {activeTab === "discussion" && "Kênh chat hoạt động 24/7."}
              {activeTab === "timeline" && "Toàn bộ lịch sử xử lý hồ sơ phản biện."}
              {activeTab === "settings" && "Chỉ áp dụng cho người tạo hồ sơ."}
            </Text>
          </div>
        </div>
      </div>
    </nav>
  );
}
