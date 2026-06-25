"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Save, CheckSquare, Loader2, Plus } from "lucide-react";

interface ReviewActionsPanelProps {
  onSaveDraft: () => void;
  onApprove: () => void;
  onAddFinding: () => void;
  isSaving: boolean;
  isApproving: boolean;
  findingsCount: number;
}

export default function ReviewActionsPanel({
  onSaveDraft,
  onApprove,
  onAddFinding,
  isSaving,
  isApproving,
  findingsCount,
}: ReviewActionsPanelProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-app border-t border-border-app p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left Side: Summary info */}
        <div className="flex items-center gap-3 font-body text-xs text-text-muted">
          <span className="font-semibold text-text-app">
            Tổng số: <strong className="text-brand text-sm">{findingsCount}</strong> khía cạnh phản biện
          </span>
          <span className="text-text-subtle">|</span>
          <button
            onClick={onAddFinding}
            className="inline-flex items-center gap-1 text-brand font-bold hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm khía cạnh mới</span>
          </button>
        </div>

        {/* Right Side: Action CTA Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onPress={onSaveDraft}
            isDisabled={isSaving || isApproving}
            variant="ghost"
            className="flex-1 sm:flex-initial border border-border-strong text-text-muted hover:text-text-app font-body font-semibold text-xs h-10 px-5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer bg-surface-app"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Lưu nháp</span>
          </Button>

          <Button
            onPress={onApprove}
            isDisabled={isSaving || isApproving || findingsCount === 0}
            className="flex-1 sm:flex-initial bg-success text-white font-body font-semibold text-xs h-10 px-6 rounded-lg flex items-center justify-center gap-1.5 hover:bg-success-hover cursor-pointer shadow-sm shadow-success/15"
          >
            {isApproving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckSquare className="w-3.5 h-3.5" />
            )}
            <span>Duyệt & Gửi báo cáo</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
