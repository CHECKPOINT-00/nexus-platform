"use client";

import React, { useState } from "react";
import { Button, Modal, TextArea, Input } from "@heroui/react";
import { X, Send, Plus, Trash, AlertCircle } from "lucide-react";
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
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Modal.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" />
      <Modal.Container className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body">
        <Modal.Dialog className="w-full max-w-lg bg-surface-app border border-border-app rounded-2xl shadow-xl overflow-hidden flex flex-col outline-none">
          <Modal.Header className="p-4 border-b border-border-app flex justify-between items-center bg-surface-soft/40">
            <span className="font-heading font-bold text-sm text-text-app">Nộp bản sửa đổi (Revision Submission)</span>
            <Modal.CloseTrigger className="p-1 rounded-full hover:bg-surface-muted text-text-muted hover:text-text-app cursor-pointer">
              <X className="w-4 h-4" />
            </Modal.CloseTrigger>
          </Modal.Header>

          <Modal.Body className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-danger-soft border border-danger/10 text-danger rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-app">Tóm tắt thay đổi (Tối thiểu 10 ký tự)</label>
              <TextArea
                placeholder="Ví dụ: Nhóm đã sửa lại chân dung khách hàng từ học sinh cấp 3 sang học sinh tiểu học như supporter góp ý, đồng thời thêm khảo sát thực tế..."
                value={changeSummary}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setChangeSummary(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 py-2 min-h-20 transition-all"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-text-app">Tài liệu / Link Drive đính kèm mới</label>
              {documents.map((doc, idx) => (
                <div key={idx} className="p-3 border border-border-app rounded-xl bg-surface-soft/20 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border-app/30">
                    <span className="text-[11px] font-bold text-text-app">Liên kết tài liệu #{idx + 1}</span>
                    {idx > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        isIconOnly
                        onPress={() => handleRemoveDocument(idx)}
                        className="cursor-pointer text-danger hover:bg-danger-soft h-7 w-7 min-w-7 rounded-lg"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-text-subtle">Link Google Drive</label>
                    <Input
                      placeholder="Dán link thư mục hoặc file Google Drive mới"
                      value={doc.drive_url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDocChange(idx, "drive_url", e.target.value)}
                      className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 h-10 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-text-subtle">Loại tài liệu</label>
                      <Input
                        value={doc.document_type}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDocChange(idx, "document_type", e.target.value)}
                        className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 h-10 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-text-subtle">Mô tả</label>
                      <Input
                        value={doc.role_description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDocChange(idx, "role_description", e.target.value)}
                        className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 h-10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onPress={handleAddDocument}
                className="border-brand/35 text-brand font-semibold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm tài liệu khác</span>
              </Button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-app">Khó khăn còn lại cần giải đáp thêm (Tùy chọn)</label>
              <TextArea
                placeholder="Nếu còn điểm vướng mắc, hãy ghi tại đây để supporter giải đáp kỹ hơn ở round tới..."
                value={remainingBlockers}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemainingBlockers(e.target.value)}
                className="w-full bg-surface-soft border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-none focus:border-brand px-3 py-2 min-h-16 transition-all"
              />
            </div>
          </Modal.Body>

          <Modal.Footer className="p-4 border-t border-border-app flex gap-3 bg-surface-soft/20">
            <Button onPress={handleClose} variant="ghost" className="flex-1 bg-surface-app border border-border-strong text-text-muted">Hủy bỏ</Button>
            <Button
              onPress={() => submitRevisionMutation.mutate()}
              isDisabled={!isFormValid || submitRevisionMutation.isPending}
              className="flex-1 bg-brand text-white font-semibold cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitRevisionMutation.isPending ? "Đang gửi..." : "Gửi bản sửa"}</span>
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}
