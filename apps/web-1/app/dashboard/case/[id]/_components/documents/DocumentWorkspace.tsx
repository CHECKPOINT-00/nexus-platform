"use client";

import React, { useMemo, useState } from "react";
import { Select, Button, Tooltip } from "@mantine/core";
import { FileText, Download, Clock } from "lucide-react";
import {
  DocumentWorkspaceProps,
  WorkspaceTab,
  FilterRole,
  buildSupportFlowRows,
  buildExternalFeedbackRows,
} from "./document-workspace.types";
import { buildCategoryGroups } from "./document-groups";
import DocumentRowsTable from "./DocumentRowsTable";
import type { RoundHistoryEntry } from "@/types/case";

interface DocumentWorkspaceWithReportsProps extends DocumentWorkspaceProps {
  roundHistory?: RoundHistoryEntry[] | null;
  caseId?: string;
}

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  initial: "Lần đầu",
  resubmit: "Đã sửa",
  logic_check: "Soi logic",
};

function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function DocumentWorkspace({ workspace, roundHistory, caseId }: DocumentWorkspaceWithReportsProps) {
  const [activeCheckpoint, setActiveCheckpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("documents");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");

  const selectedCheckpoint = useMemo(() => {
    if (!workspace || workspace.checkpoints.length === 0) return null;
    return (
      workspace.checkpoints.find((cp) => cp.checkpoint_id === activeCheckpoint) ??
      workspace.checkpoints.find(
        (cp) => cp.checkpoint_id === workspace.selected_checkpoint_id
      ) ??
      null
    );
  }, [activeCheckpoint, workspace]);

  const documentRows = useMemo(() => {
    if (!selectedCheckpoint) return [];
    return buildSupportFlowRows(selectedCheckpoint.support_flow_documents).sort(
      (a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      }
    );
  }, [selectedCheckpoint]);

  const feedbackRows = useMemo(() => {
    if (!selectedCheckpoint) return [];
    return buildExternalFeedbackRows(
      selectedCheckpoint.external_feedback_documents
    ).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }, [selectedCheckpoint]);

  const studentDocCount = useMemo(
    () => documentRows.filter((r) => r.uploaderRole === "student").length,
    [documentRows]
  );
  const supporterDocCount = useMemo(
    () =>
      documentRows.filter(
        (r) => r.uploaderRole === "supporter" || r.uploaderRole === "admin"
      ).length,
    [documentRows]
  );

  const displayedRows = useMemo(() => {
    if (activeTab === "external-feedback") {
      return feedbackRows;
    }
    if (filterRole === "student") {
      return documentRows.filter((r) => r.uploaderRole === "student");
    }
    if (filterRole === "supporter") {
      return documentRows.filter(
        (r) => r.uploaderRole === "supporter" || r.uploaderRole === "admin"
      );
    }
    return documentRows;
  }, [activeTab, documentRows, feedbackRows, filterRole]);

  const displayedGroups = useMemo(
    () => (activeTab === "documents" ? buildCategoryGroups(displayedRows) : []),
    [activeTab, displayedRows]
  );

  if (!workspace || workspace.checkpoints.length === 0 || !selectedCheckpoint) {
    return (
      <div className="bg-surface-app border border-border-app rounded-xl p-8 text-center">
        <p className="text-base font-medium text-text-app">Chưa có tài liệu</p>
        <p className="text-base text-text-muted mt-1">
          Hồ sơ này chưa có tài liệu nào được tải lên hoặc liên kết.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-app border border-border-app rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border-app flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-app">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab("documents");
              setFilterRole("all");
            }}
            className={`px-3.5 py-1.5 text-base font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "documents"
                ? "bg-brand text-white font-semibold"
                : "text-text-muted hover:text-text-app hover:bg-surface-soft"
            }`}
          >
            <span>Tài liệu bài nộp</span>
            <span
              className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-full leading-tight ${
                activeTab === "documents"
                  ? "bg-white/20 text-white"
                  : "bg-surface-soft text-text-muted"
              }`}
            >
              {documentRows.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("external-feedback");
              setFilterRole("all");
            }}
            className={`px-3.5 py-1.5 text-base font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "external-feedback"
                ? "bg-brand text-white font-semibold"
                : "text-text-muted hover:text-text-app hover:bg-surface-soft"
            }`}
          >
            <span>Đánh giá bên ngoài</span>
            <span
              className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-full leading-tight ${
                activeTab === "external-feedback"
                  ? "bg-white/20 text-white"
                  : "bg-surface-soft text-text-muted"
              }`}
            >
              {feedbackRows.length}
            </span>
          </button>

          {roundHistory && roundHistory.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("assessment-reports");
                setFilterRole("all");
              }}
              className={`px-3.5 py-1.5 text-base font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "assessment-reports"
                  ? "bg-brand text-white font-semibold"
                  : "text-text-muted hover:text-text-app hover:bg-surface-soft"
              }`}
            >
              <span>Báo cáo phản biện</span>
              <span
                className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-full leading-tight ${
                  activeTab === "assessment-reports"
                    ? "bg-white/20 text-white"
                    : "bg-surface-soft text-text-muted"
                }`}
              >
                {roundHistory.length}
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {activeTab === "documents" && (
            <Select
              value={filterRole}
              onChange={(val) => setFilterRole((val as FilterRole) || "all")}
              size="sm"
              radius="md"
              w={175}
              data={[
                { label: `Tất cả (${documentRows.length})`, value: "all" },
                { label: `Sinh viên (${studentDocCount})`, value: "student" },
                { label: `Supporter (${supporterDocCount})`, value: "supporter" },
              ]}
            />
          )}

          {workspace.checkpoints.length > 1 && (
            <Select
              value={selectedCheckpoint.checkpoint_id}
              onChange={(val) => val && setActiveCheckpoint(val)}
              size="sm"
              radius="md"
              w={150}
              data={workspace.checkpoints.map((cp) => ({
                label: cp.checkpoint_code,
                value: cp.checkpoint_id,
              }))}
            />
          )}
        </div>
      </div>

      {activeTab === "assessment-reports" ? (
        <div className="divide-y divide-border-app">
          {roundHistory && roundHistory.length > 0 ? (
            roundHistory.map((round) => (
              <div
                key={round.report_id}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-soft/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-app truncate">
                      {round.version_no
                        ? `Báo cáo v${String(round.version_no).padStart(2, "0")}`
                        : "Báo cáo"}
                      {" — "}
                      <span className="text-text-muted font-normal">
                        {SUBMISSION_TYPE_LABELS[round.submission_type] || round.submission_type}
                      </span>
                    </p>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateShort(round.submitted_at)}
                    </p>
                  </div>
                </div>
                <Tooltip label="Tải PDF">
                  <Button
                    component="a"
                    href={`/api/reports/${round.report_id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="compact-sm"
                    variant="subtle"
                    color="gray"
                    className="cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-base font-medium text-text-muted">Chưa có báo cáo phản biện.</p>
            </div>
          )}
        </div>
      ) : displayedRows.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-base font-medium text-text-muted">
            {activeTab === "documents"
              ? "Không có tài liệu nào thuộc bộ lọc này."
              : "Chưa có tài liệu đánh giá bên ngoài trong checkpoint này."}
          </p>
        </div>
      ) : (
        <DocumentRowsTable
          activeTab={activeTab}
          rows={displayedRows}
          groups={displayedGroups}
        />
      )}
    </div>
  );
}
