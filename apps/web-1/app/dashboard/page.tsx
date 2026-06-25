"use client";

import Link from "next/link";
import { useCasesList } from "./hooks/useCasesList";
import CaseCard from "./_components/CaseCard";
import DashboardEmptyState from "./_components/DashboardEmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { FolderPlus } from "lucide-react";

export default function StudentDashboard() {
  const { data: cases, isLoading, error } = useCasesList();

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-app">Dự án phản biện</h1>
          <p className="font-body text-sm text-text-muted">
            Quản lý các dự án kiểm định chất lượng ý tưởng khởi nghiệp.
          </p>
        </div>
        
        {/* Only show Create button if there are cases, otherwise the empty state has it */}
        {!isLoading && cases && cases.length > 0 && (
          <Link
            href="/dashboard/intake"
            className="inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-brand hover:bg-brand-hover text-white px-4 py-2 h-10 rounded-lg shadow-sm shadow-brand/10 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Tạo dự án mới</span>
          </Link>
        )}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-8">
          <LoadingSkeleton variant="card" count={3} />
        </div>
      ) : error ? (
        <div className="p-4 bg-danger-soft border border-danger/10 text-danger rounded-lg font-body text-sm">
          Không thể tải danh sách dự án. Vui lòng thử lại sau.
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
