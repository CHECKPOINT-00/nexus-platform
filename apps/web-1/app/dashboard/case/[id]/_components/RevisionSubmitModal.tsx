"use client";

import React, { useState } from "react";
import { Modal, Button, TextInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Send, Plus, Trash, AlertCircle } from "lucide-react";
import { useCaseRevision } from "../hooks/useCaseRevision";

interface RevisionSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

export default function RevisionSubmitModal({ isOpen, onClose, caseId }: RevisionSubmitModalProps) {
  const [changeSummary, setChangeSummary] = useState("");
  const [remainingBlockers, setRemainingBlockers] = useState("");
  const [documents, setDocuments] = useState<Array<{ drive_url: string; document_type: string; role_description: string }>>([
    { drive_url: "", document_type: "Checkpoint 1 Revision", role_description: "Bản sửa đổi của nhóm sau phản biện" }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { submitRevision, isSubmitting } = useCaseRevision(caseId);

  const validateForm = (vals: { changeSummary: string; remainingBlockers: string; documents: typeof documents }, checkTouched = false) => {
    const nextErrors: Record<string, string> = {};
    
    if (!checkTouched || touched.changeSummary) {
      if (!vals.changeSummary.trim()) {
        nextErrors.changeSummary = "Tóm tắt thay đổi là bắt buộc.";
      } else if (vals.changeSummary.trim().length < 10) {
        nextErrors.changeSummary = "Tóm tắt thay đổi phải chứa ít nhất 10 ký tự.";
      } else if (vals.changeSummary.length > 1000) {
        nextErrors.changeSummary = "Tóm tắt thay đổi không được vượt quá 1000 ký tự.";
      }
    }

    if (!checkTouched || touched.remainingBlockers) {
      if (vals.remainingBlockers.length > 1000) {
        nextErrors.remainingBlockers = "Nội dung khó khăn không được vượt quá 1000 ký tự.";
      }
    }

    vals.documents.forEach((doc, idx) => {
      const urlKey = `doc_url_${idx}`;
      const typeKey = `doc_type_${idx}`;
      const descKey = `doc_desc_${idx}`;

      if (!checkTouched || touched[urlKey]) {
        if (!doc.drive_url.trim()) {
          nextErrors[urlKey] = "Đường dẫn tài liệu là bắt buộc.";
        } else if (doc.drive_url.length > 500) {
          nextErrors[urlKey] = "Đường dẫn không được vượt quá 500 ký tự.";
        } else if (!/^https?:\/\/(drive|docs)\.google\.com\/.*/.test(doc.drive_url.trim())) {
          nextErrors[urlKey] = "Đường dẫn phải là liên kết Google Drive hoặc Google Docs hợp lệ.";
        }
      }

      if (!checkTouched || touched[typeKey]) {
        if (doc.document_type.length > 100) {
          nextErrors[typeKey] = "Loại tài liệu không được vượt quá 100 ký tự.";
        }
      }

      if (!checkTouched || touched[descKey]) {
        if (doc.role_description.length > 250) {
          nextErrors[descKey] = "Mô tả không được vượt quá 250 ký tự.";
        }
      }
    });

    return nextErrors;
  };

  React.useEffect(() => {
    if (isOpen) {
      const nextErrors = validateForm({ changeSummary, remainingBlockers, documents }, true);
      setErrors(nextErrors);
    }
  }, [changeSummary, remainingBlockers, documents, touched, isOpen]);

  const handleSubmit = async () => {
    setError(null);

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {
      changeSummary: true,
      remainingBlockers: true,
    };
    documents.forEach((_, idx) => {
      allTouched[`doc_url_${idx}`] = true;
      allTouched[`doc_type_${idx}`] = true;
      allTouched[`doc_desc_${idx}`] = true;
    });
    setTouched(allTouched);

    const formErrors = validateForm({ changeSummary, remainingBlockers, documents }, false);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setError("Vui lòng sửa các lỗi nhập liệu trước khi nộp bản sửa.");
      return;
    }

    try {
      await submitRevision({
        changeSummary,
        documents,
        remainingBlockers,
      });
      notifications.show({
        title: "Nộp bản sửa thành công",
        message: "Đã gửi bản sửa đổi thành công! Dự án của bạn sẽ quay lại hàng chờ đánh giá.",
        color: "green",
      });
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Đã xảy ra lỗi khi gửi bản sửa đổi.");
    }
  };

  const handleAddDocument = () => {
    setDocuments(prev => [
      ...prev,
      { drive_url: "", document_type: "Tài liệu sửa đổi bổ sung", role_description: "Tài liệu đính kèm thêm" }
    ]);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => {
      const copy = { ...prev };
      delete copy[`doc_url_${index}`];
      delete copy[`doc_type_${index}`];
      delete copy[`doc_desc_${index}`];
      return copy;
    });
    setTouched(prev => {
      const copy = { ...prev };
      delete copy[`doc_url_${index}`];
      delete copy[`doc_type_${index}`];
      delete copy[`doc_desc_${index}`];
      return copy;
    });
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
    setErrors({});
    setTouched({});
    onClose();
  };

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
          onChange={(e) => {
            setChangeSummary(e.target.value);
            setErrors(prev => ({ ...prev, changeSummary: "" }));
          }}
          onBlur={() => setTouched(prev => ({ ...prev, changeSummary: true }))}
          error={touched.changeSummary ? errors.changeSummary : undefined}
          maxLength={1000}
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
                onChange={(e) => {
                  handleDocChange(idx, "drive_url", e.target.value);
                  setErrors(prev => ({ ...prev, [`doc_url_${idx}`]: "" }));
                }}
                onBlur={() => setTouched(prev => ({ ...prev, [`doc_url_${idx}`]: true }))}
                error={touched[`doc_url_${idx}`] ? errors[`doc_url_${idx}`] : undefined}
                maxLength={500}
                variant="default"
                radius="md"
              />

              <div className="grid grid-cols-2 gap-2">
                <TextInput
                  label="Loại tài liệu"
                  value={doc.document_type}
                  onChange={(e) => {
                    handleDocChange(idx, "document_type", e.target.value);
                    setErrors(prev => ({ ...prev, [`doc_type_${idx}`]: "" }));
                  }}
                  onBlur={() => setTouched(prev => ({ ...prev, [`doc_type_${idx}`]: true }))}
                  error={touched[`doc_type_${idx}`] ? errors[`doc_type_${idx}`] : undefined}
                  maxLength={100}
                  variant="default"
                  radius="md"
                />
                <TextInput
                  label="Mô tả"
                  value={doc.role_description}
                  onChange={(e) => {
                    handleDocChange(idx, "role_description", e.target.value);
                    setErrors(prev => ({ ...prev, [`doc_desc_${idx}`]: "" }));
                  }}
                  onBlur={() => setTouched(prev => ({ ...prev, [`doc_desc_${idx}`]: true }))}
                  error={touched[`doc_desc_${idx}`] ? errors[`doc_desc_${idx}`] : undefined}
                  maxLength={250}
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
          onChange={(e) => {
            setRemainingBlockers(e.target.value);
            setErrors(prev => ({ ...prev, remainingBlockers: "" }));
          }}
          onBlur={() => setTouched(prev => ({ ...prev, remainingBlockers: true }))}
          error={touched.remainingBlockers ? errors.remainingBlockers : undefined}
          maxLength={1000}
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            color="brand"
            leftSection={<Send className="w-3.5 h-3.5" />}
            className="flex-1 font-semibold cursor-pointer"
          >
            <span>{isSubmitting ? "Đang gửi..." : "Gửi bản sửa"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
