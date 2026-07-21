"use client";
import React from "react";
import { Paper, Group, Text, SimpleGrid } from "@mantine/core";
import { AreaChart, DonutChart, BarChart } from "@mantine/charts";
import { FileText, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import type { AdminStatsResponse } from "../hooks/useAdminStats";

interface StatsDashboardProps {
  data: AdminStatsResponse | undefined;
  isLoading: boolean;
}

export default function StatsDashboard({ data, isLoading }: StatsDashboardProps) {
  if (isLoading || !data) {
    return (
      <Text size="sm" c="dimmed">
        Đang tải...
      </Text>
    );
  }

  // 4 stat cards — avoid Tailwind JIT issue with dynamic class names
  const cards = [
    {
      label: "Tổng hồ sơ",
      value: data.totalCases,
      icon: FileText,
      color: "var(--color-brand)",
      valueClass: "text-brand",
      detail: `${data.freeCases} miễn phí / ${data.paidCases} trả phí`,
    },
    {
      label: "Tỷ lệ chuyển đổi",
      value: `${data.conversionRate}%`,
      icon: TrendingUp,
      color: "#14b8a6",
      valueClass: "text-teal-500",
      detail: "Free → Audit",
    },
    {
      label: "Doanh thu",
      value: `${(data.totalRevenue / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: "#22c55e",
      valueClass: "text-green-500",
      detail: `${data.revenueByMonth.length} tháng gần nhất`,
    },
    {
      label: "SLA quá hạn",
      value: data.slaBreachCount,
      icon: AlertTriangle,
      color: data.slaBreachCount > 0 ? "#ef4444" : "#22c55e",
      valueClass: data.slaBreachCount > 0 ? "text-red-500" : "text-green-500",
      detail: data.slaBreachCount > 0 ? "Cần xử lý" : "Trong hạn",
    },
  ];

  // Revenue area chart data
  const areaData = data.revenueByMonth.map((r) => ({
    month: r.month,
    "Doanh thu": r.revenue,
  }));

  // Stage distribution donut — Vietnamese labels
  const stageLabels: Record<string, string> = {
    submitted: "Đã gửi",
    under_review: "Đang phản biện",
    report_ready: "Báo cáo sẵn sàng",
    waiting_for_revision: "Chờ sửa đổi",
    revision_submitted: "Đã sửa đổi",
    completed: "Hoàn thành",
    rejected: "Từ chối",
    closed: "Đã đóng",
  };

  const donutColors = [
    "blue.6",
    "violet.6",
    "cyan.6",
    "orange.6",
    "yellow.6",
    "teal.6",
    "red.6",
    "gray.6",
  ];
  const donutData = Object.entries(data.casesByStage).map(
    ([stage, count], idx) => ({
      name: stageLabels[stage] || stage,
      value: count,
      color: donutColors[idx % donutColors.length],
    }),
  );

  // Supporter workload bar chart
  const barData = data.supporterWorkload.map((s) => ({
    supporter: s.name,
    "Số case": s.caseCount,
  }));

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        {cards.map((card) => (
          <Paper
            key={card.label}
            p="md"
            radius="md"
            withBorder
            className="border-border-app bg-surface-app"
          >
            <Group gap="xs" mb={4}>
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
              <Text size="xs" c="dimmed" className="font-body">
                {card.label}
              </Text>
            </Group>
            <Text size="xl" fw={700} className={`font-heading ${card.valueClass}`}>
              {card.value}
            </Text>
            <Text size="xs" c="dimmed" className="font-body">
              {card.detail}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Charts — first row */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper p="md" radius="md" withBorder className="border-border-app bg-surface-app">
          <Text size="sm" fw={600} mb="md" className="font-heading">
            Doanh thu theo tháng
          </Text>
          {areaData.length > 0 ? (
            <AreaChart
              h={250}
              data={areaData}
              dataKey="month"
              series={[{ name: "Doanh thu", color: "blue.6" }]}
              curveType="natural"
              tickLine="xy"
              gridAxis="xy"
            />
          ) : (
            <Text size="xs" c="dimmed">
              Chưa có dữ liệu
            </Text>
          )}
        </Paper>

        <Paper p="md" radius="md" withBorder className="border-border-app bg-surface-app">
          <Text size="sm" fw={600} mb="md" className="font-heading">
            Phân bố trạng thái hồ sơ
          </Text>
          {donutData.length > 0 ? (
            <DonutChart
              h={250}
              data={donutData}
              withLabels
              withTooltip
              withLabelsLine
            />
          ) : (
            <Text size="xs" c="dimmed">
              Chưa có dữ liệu
            </Text>
          )}
        </Paper>
      </SimpleGrid>

      {/* Supporter workload — full width */}
      <Paper p="md" radius="md" withBorder className="border-border-app bg-surface-app">
        <Text size="sm" fw={600} mb="md" className="font-heading">
          Khối lượng công việc Supporter
        </Text>
        {barData.length > 0 ? (
          <BarChart
            h={250}
            data={barData}
            dataKey="supporter"
            series={[{ name: "Số case", color: "blue.6" }]}
            tickLine="xy"
            gridAxis="xy"
          />
        ) : (
          <Text size="xs" c="dimmed">
            Chưa có dữ liệu
          </Text>
        )}
      </Paper>
    </div>
  );
}
