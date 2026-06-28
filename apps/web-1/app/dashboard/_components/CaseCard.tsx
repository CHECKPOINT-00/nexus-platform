"use client";

import Link from "next/link";
import { Case } from "@/types";
import { statusThemeMap } from "@/types";
import { Card, Badge } from "@mantine/core";
import { Calendar, User, BookOpen } from "lucide-react";

interface CaseCardProps {
  item: Case;
  hrefPrefix?: string;
}

export default function CaseCard({ item, hrefPrefix = "/dashboard/case" }: CaseCardProps) {
  const getBadgeProps = (status: string) => {
    const mapped = statusThemeMap[status] || { label: status, color: "default" as const };
    let color = "gray";
    
    if (mapped.color === "success") color = "teal";
    else if (mapped.color === "warning") color = "yellow";
    else if (mapped.color === "danger") color = "red";
    else if (mapped.color === "primary") color = "brand";
    
    return { label: mapped.label, color };
  };

  const paymentBadge = getBadgeProps(item.payment_status);
  const internalStatusBadge = getBadgeProps(item.internal_status);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <Link href={`${hrefPrefix}/${item.id}`} className="block group">
      <Card p="lg" radius="md" withBorder className="bg-surface-app group-hover:border-brand shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-subtle uppercase font-body tracking-wider">
              {item.case_code}
            </span>
            <h3 className="font-heading text-lg font-bold text-text-app group-hover:text-brand transition-colors break-words break-all whitespace-normal line-clamp-2">
              {item.team_name || "Dự án chưa đặt tên"}
            </h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge size="sm" variant="light" color={internalStatusBadge.color} className="font-body text-[10px]">
              {internalStatusBadge.label}
            </Badge>
            <Badge size="sm" variant="light" color={paymentBadge.color} className="font-body text-[10px]">
              {paymentBadge.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-app text-xs font-body text-text-muted">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-text-subtle" />
            <span className="truncate">{item.package?.name || "Gói dịch vụ"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-text-subtle" />
            <span>Nộp ngày: {formatDate(item.created_at)}</span>
          </div>
          {item.school && (
            <div className="flex items-center gap-2 col-span-2">
              <User className="w-3.5 h-3.5 text-text-subtle" />
              <span className="truncate">{item.school} {item.course_context ? `(${item.course_context})` : ""}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
