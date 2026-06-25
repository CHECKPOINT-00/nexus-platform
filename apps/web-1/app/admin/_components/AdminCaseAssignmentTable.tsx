"use client";

import React, { useState } from "react";
import { Case, User } from "@/types";
import { UserCheck, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import { Button, Select, ListBox, ListBoxItem } from "@heroui/react";

interface AdminCaseAssignmentTableProps {
  cases: Case[];
  supporters: User[];
  onAssign: (caseId: string, supporterId: string) => Promise<void>;
  isAssigning: boolean;
}

export default function AdminCaseAssignmentTable({
  cases,
  supporters,
  onAssign,
  isAssigning,
}: AdminCaseAssignmentTableProps) {
  const unassignedCases = cases.filter((c) => c.internal_status === "unassigned");
  const [selectedSupporters, setSelectedSupporters] = useState<Record<string, string>>({});
  const [loadingCaseId, setLoadingCaseId] = useState<string | null>(null);

  const handleSelectSupporter = (caseId: string, supporterId: string) => {
    setSelectedSupporters((prev) => ({
      ...prev,
      [caseId]: supporterId,
    }));
  };

  const handleAssignClick = async (caseId: string) => {
    const supporterId = selectedSupporters[caseId];
    if (!supporterId) return;

    setLoadingCaseId(caseId);
    try {
      await onAssign(caseId, supporterId);
      // Remove from selected list
      setSelectedSupporters((prev) => {
        const copy = { ...prev };
        delete copy[caseId];
        return copy;
      });
    } catch (e) {
      // Handled by parent hook
    } finally {
      setLoadingCaseId(null);
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "intake":
        return "Thu thập thông tin";
      case "payment":
        return "Thanh toán dịch vụ";
      case "checkpoint_1":
        return "Checkpoint 1";
      case "checkpoint_2":
        return "Checkpoint 2";
      case "checkpoint_3":
        return "Checkpoint 3";
      default:
        return stage;
    }
  };

  if (unassignedCases.length === 0) {
    return (
      <div className="p-8 border border-border-app rounded-2xl bg-surface-app text-center flex flex-col items-center justify-center gap-3 font-body text-xs text-text-app">
        <div className="w-10 h-10 rounded-full bg-surface-soft border border-border-app text-text-subtle flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-success" />
        </div>
        <div className="space-y-0.5">
          <p className="font-heading font-semibold text-xs text-text-app">Đã phân công hết toàn bộ Case</p>
          <p className="font-body text-[11px] text-text-muted">
            Không có dự án nào đang trong trạng thái chờ phân công Supporter chuyên môn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border-app rounded-2xl overflow-hidden bg-surface-app shadow-sm font-body text-xs text-text-app">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-soft border-b border-border-app font-heading font-bold text-[11px] text-text-muted">
              <th className="p-4 pl-6">Mã dự án</th>
              <th className="p-4">Tên nhóm</th>
              <th className="p-4">Gói dịch vụ</th>
              <th className="p-4">Giai đoạn</th>
              <th className="p-4">Trạng thái thanh toán</th>
              <th className="p-4">Chọn Supporter</th>
              <th className="p-4 pr-6 text-right">Phân công</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-app/45">
            {unassignedCases.map((item) => {
              const selectedId = selectedSupporters[item.id] || "";
              const isLoadingThis = loadingCaseId === item.id;

              return (
                <tr key={item.id} className="hover:bg-surface-soft/30 transition-colors">
                  <td className="p-4 pl-6 font-heading font-bold text-xs">
                    {item.case_code}
                  </td>
                  <td className="p-4 font-semibold text-text-app">
                    {item.team_name || "Chưa đặt tên"}
                  </td>
                  <td className="p-4 text-text-muted">
                    {item.package?.name || "Gói dịch vụ"}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-brand-soft/20 text-brand border border-brand/10 text-[10px] font-semibold">
                      {getStageLabel(item.user_facing_stage)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.payment_status === "paid"
                        ? "bg-success-soft text-success border border-success/10"
                        : item.payment_status === "unpaid"
                        ? "bg-warning-soft text-warning border border-warning/10"
                        : "bg-surface-muted text-text-muted border border-border-app"
                    }`}>
                      {item.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Select
                      aria-label="Chọn Supporter"
                      placeholder="Chọn Supporter"
                      selectedKey={selectedId || null}
                      onSelectionChange={(key) => handleSelectSupporter(item.id, key?.toString() || "")}
                      isDisabled={isAssigning || isLoadingThis}
                      className="w-48"
                    >
                      <Select.Trigger className="w-full h-8 px-2 bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand flex items-center justify-between cursor-pointer">
                        <Select.Value className="truncate" />
                      </Select.Trigger>
                      <Select.Popover className="bg-surface-app border border-border-app rounded-lg shadow-md p-1 min-w-[200px] z-50">
                        <ListBox className="outline-none">
                          {supporters.map((sup) => (
                            <ListBoxItem 
                              key={sup.id} 
                              id={sup.id} 
                              textValue={sup.name}
                              className="px-2 py-1.5 text-xs rounded hover:bg-surface-soft cursor-pointer text-text-app outline-none select-none block"
                            >
                              {sup.name} ({sup.email})
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <Button
                      onPress={() => handleAssignClick(item.id)}
                      isDisabled={!selectedId || isAssigning || isLoadingThis}
                      className="bg-brand text-white text-[11px] font-bold h-8 px-3 rounded-lg flex items-center justify-center gap-1 hover:bg-brand-hover cursor-pointer disabled:opacity-50"
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" />
                      )}
                      <span>Chỉ định</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
