"use client";

import React, { useEffect, useState } from "react";
import FindingEditor from "./FindingEditor";
import { 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Play 
} from "lucide-react";
import { Button } from "@mantine/core";

interface Finding {
  id: string;
  field: string;
  status: string;
  evidence: string;
  reason: string;
  question: string;
  next_action: string;
}

interface FindingCardProps {
  finding: Finding;
  onUpdate: (updated: Finding) => void;
  onDelete: () => void;
}

export default function FindingCard({ finding, onUpdate, onDelete }: FindingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFinding, setEditedFinding] = useState<Finding>({ ...finding });

  useEffect(() => {
    setEditedFinding({ ...finding });
    setIsEditing(false);
  }, [finding]);

  const getFieldDetails = (field: string) => {
    switch (field) {
      case "idea":
        return { label: "Ý tưởng sản phẩm", colorClass: "border-brand text-brand bg-brand-soft/20" };
      case "customer":
        return { label: "Chân dung khách hàng", colorClass: "border-emerald-500 text-emerald-600 bg-emerald-50" };
      case "pain_point":
        return { label: "Vấn đề thị trường", colorClass: "border-orange-500 text-orange-600 bg-orange-50" };
      case "alternatives":
        return { label: "Giải pháp thay thế", colorClass: "border-blue-500 text-blue-600 bg-blue-50" };
      case "capability":
        return { label: "Năng lực của nhóm", colorClass: "border-purple-500 text-purple-600 bg-purple-50" };
      default:
        return { label: field, colorClass: "border-border-app text-text-muted bg-surface-muted" };
    }
  };

  const handleSave = () => {
    onUpdate(editedFinding);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedFinding({ ...finding });
    setIsEditing(false);
  };

  const { label, colorClass } = getFieldDetails(finding.field);

  if (isEditing) {
    return (
      <div className="border border-brand rounded-xl p-4 bg-surface-app space-y-4 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center pb-2 border-b border-border-app">
          <span className="font-heading font-bold text-xs text-brand">Đang chỉnh sửa khía cạnh</span>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCancel}
              variant="default"
              leftSection={<X className="w-3.5 h-3.5" />}
              className="text-text-muted hover:text-text-app text-xs font-semibold font-body h-8 px-3 cursor-pointer"
            >
              <span>Hủy</span>
            </Button>
            <Button
              onClick={handleSave}
              color="brand"
              leftSection={<Check className="w-3.5 h-3.5" />}
              className="text-xs font-semibold font-body h-8 px-3 cursor-pointer"
            >
              <span>Lưu</span>
            </Button>
          </div>
        </div>

        <FindingEditor
          finding={editedFinding}
          onChange={(updated) => setEditedFinding(updated as Finding)}
        />
      </div>
    );
  }

  return (
    <div className="border border-border-app rounded-xl overflow-hidden bg-surface-app transition-shadow hover:shadow-sm">
      {/* Card Header */}
      <div className="p-4 md:p-5 flex justify-between items-start gap-4 bg-surface-soft/40 border-b border-border-app">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-body uppercase border ${colorClass}`}>
            {label}
          </span>
          <span className="px-2 py-0.5 rounded bg-danger-soft text-danger border border-danger/10 text-[10px] font-bold font-body">
            {finding.status}
          </span>
          <h4 className="font-heading font-semibold text-xs text-text-app line-clamp-1 ml-1.5">
            {finding.question}
          </h4>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg border border-border-app hover:bg-surface-muted text-text-muted hover:text-text-app transition-colors cursor-pointer"
            title="Chỉnh sửa"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg border border-danger/10 bg-danger-soft/20 hover:bg-danger-soft text-danger transition-colors cursor-pointer"
            title="Xóa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4 font-body text-xs leading-relaxed text-text-app">
        {/* Evidence */}
        <div className="space-y-1">
          <span className="font-semibold text-text-muted flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-text-subtle" />
            Bằng chứng dẫn chiếu:
          </span>
          <blockquote className="border-l-2 border-border-strong pl-3 py-1 bg-surface-soft text-text-muted italic rounded-r">
            {finding.evidence || "Không tìm thấy thông tin đối chiếu."}
          </blockquote>
        </div>

        {/* Reason */}
        <div className="space-y-1">
          <span className="font-semibold text-text-muted flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-text-subtle" />
            Lý do đánh giá:
          </span>
          <p className="pl-5 text-text-app">{finding.reason}</p>
        </div>

        {/* Question */}
        <div className="space-y-1 p-3 bg-brand-soft/20 border border-brand/10 rounded-lg">
          <span className="font-semibold text-brand flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-brand" />
            Câu hỏi hướng dẫn học viên:
          </span>
          <p className="pl-5 text-brand-hover font-medium">{finding.question}</p>
        </div>

        {/* Next Action */}
        <div className="space-y-1">
          <span className="font-semibold text-success flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-success" />
            Hành động tiếp theo gợi ý:
          </span>
          <p className="pl-5 text-text-app whitespace-pre-wrap">{finding.next_action}</p>
        </div>
      </div>
    </div>
  );
}
