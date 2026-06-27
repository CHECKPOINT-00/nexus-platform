"use client";

import React, { useState } from "react";
import { Modal, Button, TextInput, Textarea } from "@mantine/core";
import { Send, Plus, Trash, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface RevisionSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

export default function RevisionSubmitModal({ isOpen, onClose, caseId }: RevisionSubmitModalProps) {
  const queryClient = useQueryClient();
  const [changeSummary, setChangeSummary] = useState("");
  const [remainingBlockers, setRemainingBlockers] = useState("");
  const [documents, setDocuments] = useState<Array<{ drive_url: string; document_type: string; role_description: string }>>([
    { drive_url: "", document_type: "Checkpoint 1 Revision", role_description: "Bản sửa đổi của nhóm sau phản biện" }
  ]);
  const [error, setError] = useState<string | null>(null);

  const submitRevisionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/cases/${caseId}/revisions`, {
        change_summary: changeSummary,
        documents,
        remaining_blockers: remainingBlockers || undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      alert("Đã gửi bản sửa đổi thành công! Dự án của bạn sẽ quay lại hàng chờ đánh giá.");
      handleClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Đã xảy ra lỗi khi gửi bản sửa đổi.");
    }
  });

  const handleAddDocument = () => {
    setDocuments(prev => [
      ...prev,
      { drive_url: "", document_type: "Tài liệu sửa đổi bổ sung", role_description: "Tài liệu đính kèm thêm" }
    ]);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDocChange = (index: number, field: string, val: string) => {
    setDocuments(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleClose = () => {
    setChangeSummary("");
    setRemainingBlockers("");
    setDocuments([{ drive_url: "", document_type: "Checkpoint 1 Revision", role_description: "Bản sửa đổi của nhóm sau phản biện" }]);
    setError(null);
    onClose();
  };

  const isFormValid =
    changeSummary.trim().length >= 10 &&
    documents.length > 0 &&
    documents.every(d => d.drive_url.trim().length > 0 && /^https?:\/\/(drive|docs)\.google\.com\/.*/.test(d.drive_url));

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={<span className="font-heading font-bold text-sm text-text-app">Nộp bản sửa đổi (Revision Submission)</span>}
      size="lg"
      radius="md"
      centered
    >
      <div className="space-y-4 font-body">
        {error && (
          <div className="p-3 bg-danger-soft border border-danger/10 text-danger rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <Textarea
          label="Tóm tắt thay đổi (Tối thiểu 10 ký tự)"
          placeholder="Ví dụ: Nhóm đã sửa lại chân dung khách hàng từ học sinh cấp 3 sang học sinh tiểu học như supporter góp ý, đồng thời thêm khảo sát thực tế..."
          value={changeSummary}
          onChange={(e) => setChangeSummary(e.target.value)}
          required
          minRows={3}
          autosize
          variant="default"
          radius="md"
        />

        <div className="space-y-3">
          <label className="text-xs font-semibold text-text-app block">Tài liệu / Link Drive đính kèm mới</label>
          {documents.map((doc, idx) => (
            <div key={idx} className="p-3 border border-border-app rounded-xl bg-surface-soft/20 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border-app/30">
                <span className="text-[11px] font-bold text-text-app">Liên kết tài liệu #{idx + 1}</span>
                {idx > 0 && (
                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    onClick={() => handleRemoveDocument(idx)}
                    className="cursor-pointer text-danger hover:bg-danger-soft h-7 w-7 p-0 rounded-lg flex items-center justify-center"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              
              <TextInput
                label="Link Google Drive"
                placeholder="Dán link thư mục hoặc file Google Drive mới"
                value={doc.drive_url}
                onChange={(e) => handleDocChange(idx, "drive_url", e.target.value)}
                variant="default"
                radius="md"
              />

              <div className="grid grid-cols-2 gap-2">
                <TextInput
                  label="Loại tài liệu"
                  value={doc.document_type}
                  onChange={(e) => handleDocChange(idx, "document_type", e.target.value)}
                  variant="default"
                  radius="md"
                />
                <TextInput
                  label="Mô tả"
                  value={doc.role_description}
                  onChange={(e) => handleDocChange(idx, "role_description", e.target.value)}
                  variant="default"
                  radius="md"
                />
              </div>
            </div>
          ))}
          
          <Button
            size="sm"
            variant="outline"
            color="brand"
            onClick={handleAddDocument}
            leftSection={<Plus className="w-4 h-4" />}
            className="border-brand/35 text-brand font-semibold cursor-pointer"
          >
            Thêm tài liệu khác
          </Button>
        </div>

        <Textarea
          label="Khó khăn còn lại cần giải đáp thêm (Tùy chọn)"
          placeholder="Nếu còn điểm vướng mắc, hãy ghi tại đây để supporter giải đáp kỹ hơn ở round tới..."
          value={remainingBlockers}
          onChange={(e) => setRemainingBlockers(e.target.value)}
          minRows={2}
          autosize
          variant="default"
          radius="md"
        />

        <div className="flex gap-3 pt-4 border-t border-border-app">
          <Button onClick={handleClose} variant="default" className="flex-1">
            Hủy bỏ
          </Button>
          <Button
            onClick={() => submitRevisionMutation.mutate()}
            disabled={!isFormValid || submitRevisionMutation.isPending}
            color="brand"
            leftSection={<Send className="w-3.5 h-3.5" />}
            className="flex-1 font-semibold cursor-pointer"
          >
            <span>{submitRevisionMutation.isPending ? "Đang gửi..." : "Gửi bản sửa"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
