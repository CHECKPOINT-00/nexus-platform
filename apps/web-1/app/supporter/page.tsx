"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useCasesList } from "../dashboard/hooks/useCasesList";
import { Case, statusThemeMap } from "@/types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import {
  AlertCircle,
  RefreshCw,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
} from "lucide-react";
import { Badge, Button, Select, TextInput } from "@mantine/core";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortKey = "case_code" | "team_name" | "package" | "created_at" | "internal_status" | "payment_status";
type SortDir = "asc" | "desc";

// ─── Status filter options ────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "assigned", label: "Mới được phân công" },
  { value: "auditing", label: "Đang phản biện" },
  { value: "need_clarification", label: "Chờ thông tin" },
  { value: "waiting_user", label: "Chờ phản hồi" },
  { value: "report_ready_to_publish", label: "Chờ gửi báo cáo" },
  { value: "done", label: "Hoàn thành" },
  { value: "completed", label: "Đã đóng" },
  { value: "approved", label: "Đã duyệt" },
];

const PAYMENT_OPTIONS = [
  { value: "all", label: "Tất cả thanh toán" },
  { value: "unpaid", label: "Chưa thanh toán" },
  { value: "not_required", label: "Miễn phí" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "proof_submitted", label: "Đang xác minh" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBadgeColor(color: string): string {
  switch (color) {
    case "success": return "teal";
    case "warning": return "yellow";
    case "danger": return "red";
    case "primary": return "brand";
    default: return "gray";
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  const mapped = statusThemeMap[status] || { label: status, color: "default" as const };
  return { label: mapped.label, color: getBadgeColor(mapped.color) };
}

// ─── Sort icon component ──────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="w-3.5 h-3.5 text-text-subtle opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3.5 h-3.5 text-brand" />
    : <ChevronDown className="w-3.5 h-3.5 text-brand" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupporterDashboard() {
  const { data: cases, isLoading, error, refetch } = useCasesList();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const processed = useMemo(() => {
    let list: Case[] = cases || [];

    // search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.case_code.toLowerCase().includes(q) ||
          (c.team_name ?? "").toLowerCase().includes(q) ||
          (c.school ?? "").toLowerCase().includes(q) ||
          (c.package?.name ?? "").toLowerCase().includes(q)
      );
    }

    // status filter
    if (statusFilter !== "all") {
      list = list.filter((c) => {
        const s = c.internal_status ?? "";
        if (statusFilter === "need_clarification") return s === "need_clarification" || s === "waiting_user";
        return s === statusFilter;
      });
    }

    // payment filter
    if (paymentFilter !== "all") {
      list = list.filter((c) => c.payment_status === paymentFilter);
    }

    // sort
    list = [...list].sort((a, b) => {
      let av = "";
      let bv = "";
      switch (sortKey) {
        case "case_code":   av = a.case_code; bv = b.case_code; break;
        case "team_name":   av = a.team_name ?? ""; bv = b.team_name ?? ""; break;
        case "package":     av = a.package?.name ?? ""; bv = b.package?.name ?? ""; break;
        case "created_at":  av = a.created_at; bv = b.created_at; break;
        case "internal_status": av = a.internal_status ?? ""; bv = b.internal_status ?? ""; break;
        case "payment_status":  av = a.payment_status ?? ""; bv = b.payment_status ?? ""; break;
      }
      const cmp = av.localeCompare(bv, "vi");
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [cases, search, statusFilter, paymentFilter, sortKey, sortDir]);

  // ── Toggle sort ───────────────────────────────────────────────────────────
  function handleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir("asc");
    }
  }

  // ── Table header cell ─────────────────────────────────────────────────────
  function Th({ col, children }: { col: SortKey; children: React.ReactNode }) {
    return (
      <th
        onClick={() => handleSort(col)}
        className="px-4 py-3 text-left text-xs font-semibold text-text-muted cursor-pointer select-none hover:text-text-app transition-colors whitespace-nowrap"
      >
        <span className="flex items-center gap-1.5">
          {children}
          <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
        </span>
      </th>
    );
  }

  const totalCount = (cases || []).length;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 font-body text-xs text-text-app pb-12 animate-fade-in max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-app">
            Hồ sơ phụ trách
          </h1>
          <p className="font-body text-sm text-text-muted mt-1">
            Đánh giá, phản biện logic ý tưởng khởi nghiệp và hỗ trợ chuyên môn cho sinh viên.
          </p>
        </div>

        <Button
          onClick={() => refetch()}
          variant="default"
          leftSection={<RefreshCw className="w-3.5 h-3.5" />}
          className="text-text-muted hover:text-brand text-xs font-semibold font-body h-9 px-3 cursor-pointer"
        >
          <span>Tải lại</span>
        </Button>
      </div>

      {/* ── Toolbar: search + filters ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <TextInput
          leftSection={<Search className="w-4 h-4 text-text-subtle" />}
          placeholder="Tìm mã hồ sơ, tên nhóm, trường..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          classNames={{
            root: "flex-1 min-w-0",
            input: "text-xs font-body h-9 bg-surface-app border-border-app focus:border-brand",
          }}
        />

        <div className="flex gap-2 items-center shrink-0">
          <Filter className="w-4 h-4 text-text-subtle shrink-0" />
          <Select
            data={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v ?? "all")}
            classNames={{
              input: "text-xs font-body h-9 bg-surface-app border-border-app min-w-[180px]",
            }}
          />
          <Select
            data={PAYMENT_OPTIONS}
            value={paymentFilter}
            onChange={(v) => setPaymentFilter(v ?? "all")}
            classNames={{
              input: "text-xs font-body h-9 bg-surface-app border-border-app min-w-[160px]",
            }}
          />
        </div>
      </div>

      {/* ── Summary row ─────────────────────────────────────────────────── */}
      <p className="text-xs text-text-muted font-body">
        Hiển thị <span className="font-semibold text-text-app">{processed.length}</span> / {totalCount} hồ sơ
      </p>

      {/* ── Main content ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="py-8">
          <LoadingSkeleton variant="card" count={5} />
        </div>
      ) : error ? (
        <div className="p-4 bg-danger-soft border border-danger/10 text-danger rounded-xl font-body text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Không thể tải danh sách hồ sơ. Vui lòng thử lại sau.</span>
        </div>
      ) : processed.length === 0 ? (
        <div className="py-16 border border-border-app rounded-2xl bg-surface-app text-center flex flex-col items-center justify-center gap-3">
          <Search className="w-8 h-8 text-text-subtle" />
          <div className="space-y-1.5 max-w-sm">
            <h4 className="font-heading font-bold text-sm text-text-app">Không tìm thấy hồ sơ</h4>
            <p className="font-body text-xs text-text-muted leading-relaxed">
              Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-border-app rounded-2xl overflow-hidden bg-surface-app shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-body border-collapse">
              <thead>
                <tr className="border-b border-border-app bg-surface-soft/60">
                  <Th col="case_code">Mã hồ sơ</Th>
                  <Th col="team_name">Tên nhóm</Th>
                  <Th col="package">Gói dịch vụ</Th>
                  <Th col="internal_status">Trạng thái</Th>
                  <Th col="payment_status">Thanh toán</Th>
                  <Th col="created_at">Ngày nộp</Th>
                  {/* non-sortable action col */}
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {processed.map((item, idx) => {
                  const statusBadge = getStatusBadge(item.internal_status ?? "");
                  const paymentBadge = getStatusBadge(item.payment_status ?? "");
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-border-app last:border-0 transition-colors hover:bg-brand/5 group ${
                        isEven ? "bg-surface-app" : "bg-surface-soft/30"
                      }`}
                    >
                      {/* case_code */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-text-subtle uppercase tracking-wide text-[10px]">
                          {item.case_code}
                        </span>
                      </td>

                      {/* team_name */}
                      <td className="px-4 py-3">
                        <span className="font-heading font-semibold text-text-app text-xs">
                          {item.team_name || (
                            <span className="text-text-subtle italic font-body">Chưa đặt tên</span>
                          )}
                        </span>
                        {item.school && (
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {item.school}
                            {item.course_context ? ` (${item.course_context})` : ""}
                          </p>
                        )}
                      </td>

                      {/* package */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-text-muted">
                          {item.package?.name || <span className="italic text-text-subtle">—</span>}
                        </span>
                      </td>

                      {/* internal_status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          size="xs"
                          variant="light"
                          color={statusBadge.color}
                          className="font-body text-[10px]"
                        >
                          {statusBadge.label}
                        </Badge>
                      </td>

                      {/* payment_status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          size="xs"
                          variant="light"
                          color={paymentBadge.color}
                          className="font-body text-[10px]"
                        >
                          {paymentBadge.label}
                        </Badge>
                      </td>

                      {/* created_at */}
                      <td className="px-4 py-3 whitespace-nowrap text-text-muted">
                        {formatDate(item.created_at)}
                      </td>

                      {/* action */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Link
                          href={`/supporter/case/${item.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 transition-colors text-[11px] font-semibold font-body"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
