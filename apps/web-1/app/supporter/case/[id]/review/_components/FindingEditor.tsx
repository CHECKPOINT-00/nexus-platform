import React from "react";
import { Select, ListBox, ListBoxItem, Input, TextArea } from "@heroui/react";

interface Finding {
  field: string;
  status: string;
  evidence: string;
  reason: string;
  question: string;
  next_action: string;
}

interface FindingEditorProps {
  finding: Finding;
  onChange: (updated: Finding) => void;
}

export default function FindingEditor({ finding, onChange }: FindingEditorProps) {
  const handleChange = (key: keyof Finding, value: string) => {
    onChange({
      ...finding,
      [key]: value,
    });
  };

  const fields = [
    { id: "idea", label: "Ý tưởng sản phẩm" },
    { id: "customer", label: "Chân dung khách hàng" },
    { id: "pain_point", label: "Vấn đề thị trường" },
    { id: "alternatives", label: "Giải pháp thay thế" },
    { id: "capability", label: "Năng lực của nhóm" },
  ];

  return (
    <div className="space-y-4 p-5 bg-surface-soft border border-border-app rounded-xl font-body text-xs text-text-app">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field Aspect */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-text-muted">Khía cạnh đánh giá</label>
          <Select
            aria-label="Khía cạnh đánh giá"
            selectedKey={finding.field}
            onSelectionChange={(key) => handleChange("field", key?.toString() || "")}
            className="w-full"
          >
            <Select.Trigger className="w-full h-10 px-3 bg-surface-app border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand flex items-center justify-between cursor-pointer">
              <Select.Value className="truncate" />
            </Select.Trigger>
            <Select.Popover className="bg-surface-app border border-border-app rounded-lg shadow-md p-1 min-w-[200px] z-50">
              <ListBox className="outline-none">
                {fields.map((f) => (
                  <ListBoxItem 
                    key={f.id} 
                    id={f.id} 
                    textValue={f.label}
                    className="px-2 py-1.5 text-xs rounded hover:bg-surface-soft cursor-pointer text-text-app outline-none select-none block"
                  >
                    {f.label}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        {/* Issue Status */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-text-muted">Loại vấn đề / Trạng thái</label>
          <Input
            type="text"
            value={finding.status}
            onChange={(e) => handleChange("status", e.target.value)}
            placeholder="Ví dụ: Thiếu thông tin, Chưa rõ ràng, Mâu thuẫn..."
            className="w-full bg-surface-app border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand h-10"
            required
          />
        </div>
      </div>

      {/* Evidence */}
      <div className="flex flex-col gap-1.5">
        <label className="font-semibold text-text-muted">Bằng chứng dẫn chiếu (Trích nguyên văn từ bản nộp)</label>
        <TextArea
          value={finding.evidence}
          onChange={(e) => handleChange("evidence", e.target.value)}
          placeholder="Trích dẫn nguyên văn tài liệu hoặc ghi 'Không tìm thấy thông tin trong bản nộp'..."
          rows={2}
          className="w-full bg-surface-app border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand min-h-[60px]"
          required
        />
      </div>

      {/* Reason */}
      <div className="flex flex-col gap-1.5">
        <label className="font-semibold text-text-muted">Lý do đánh giá (Giải thích chi tiết lỗi logic)</label>
        <TextArea
          value={finding.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
          placeholder="Giải thích vì sao khía cạnh này bị đánh giá là có vấn đề..."
          rows={3}
          className="w-full bg-surface-app border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand min-h-[90px]"
          required
        />
      </div>

      {/* Question */}
      <div className="flex flex-col gap-1.5">
        <label className="font-semibold text-text-muted">Câu hỏi phản biện hướng dẫn (Học viên cần trả lời gì?)</label>
        <TextArea
          value={finding.question}
          onChange={(e) => handleChange("question", e.target.value)}
          placeholder="Đặt câu hỏi cụ thể để học viên tư duy và làm rõ ý tưởng..."
          rows={2}
          className="w-full bg-surface-app border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand min-h-[60px] border-brand/40 focus:border-brand"
          required
        />
      </div>

      {/* Next Action */}
      <div className="flex flex-col gap-1.5">
        <label className="font-semibold text-text-muted">Hành động khắc phục gợi ý (Cần sửa đổi gì?)</label>
        <TextArea
          value={finding.next_action}
          onChange={(e) => handleChange("next_action", e.target.value)}
          placeholder="Đề xuất các đầu việc chi tiết để sửa lỗi logic..."
          rows={3}
          className="w-full bg-surface-app border border-border-strong rounded-lg text-xs font-body text-text-app focus:outline-brand min-h-[90px] border-success/40 focus:border-success"
          required
        />
      </div>
    </div>
  );
}
