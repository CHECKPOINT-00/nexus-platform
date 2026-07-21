"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Text, Button, Group } from "@mantine/core";
import { useCasesList } from "./hooks/useCasesList";
import CaseCard from "./_components/CaseCard";
import DashboardEmptyState from "./_components/DashboardEmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { FolderPlus, Users } from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const { data: cases, isLoading, error } = useCasesList();

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-app">Hồ sơ phản biện</h1>
          <p className="font-body text-sm text-text-muted">
            Quản lý các hồ sơ phản biện ý tưởng khởi nghiệp.
          </p>
        </div>
        
        {/* Only show Create buttons if there are cases, otherwise the empty state has it */}
        {!isLoading && cases && cases.length > 0 && (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/team-fit"
              className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-surface-app border border-border-app hover:border-brand/40 text-text-app px-4 py-2 h-10 rounded-lg transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Đánh giá đội ngũ</span>
            </Link>
            <Link
              href="/dashboard/intake"
              className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-brand hover:bg-brand-hover text-white px-4 py-2 h-10 rounded-lg shadow-sm shadow-brand/10 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Tạo hồ sơ mới</span>
            </Link>
          </div>
        )}
      </div>

      {/* Paid Audit CTA */}
      <Card shadow="sm" padding="lg" radius="md" withBorder className="border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50">
        <Group justify="space-between" align="center">
          <div className="space-y-1">
            <Text fw={700} size="lg" c="#115e59">
              Mua audit ngay
            </Text>
            <Text size="sm" c="dimmed">
              Bỏ qua bước đánh giá miễn phí, mua thẳng 1 lượt audit (39k)
            </Text>
          </div>
          <Button
            variant="filled"
            color="teal"
            size="md"
            rightSection="→"
            onClick={() => router.push("/dashboard/team-fit?intent=paid")}
          >
            Mua ngay (39k)
          </Button>
        </Group>
      </Card>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-8">
          <LoadingSkeleton variant="card" count={3} />
        </div>
      ) : error ? (
        <div className="p-4 bg-danger-soft border border-danger/10 text-danger rounded-lg font-body text-sm">
          Không thể tải danh sách hồ sơ. Vui lòng thử lại sau.
        </div>
      ) : !cases || cases.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
