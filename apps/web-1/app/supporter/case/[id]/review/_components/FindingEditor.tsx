import React from "react";
import { Select, TextInput, Textarea } from "@mantine/core";

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
        <Select
          label="Khía cạnh đánh giá"
          data={fields.map((f) => ({ value: f.id, label: f.label }))}
          value={finding.field}
          onChange={(val) => handleChange("field", val || "")}
          radius="md"
          comboboxProps={{ withinPortal: false }}
        />

        {/* Issue Status */}
        <TextInput
          label="Loại vấn đề / Trạng thái"
          value={finding.status}
          onChange={(e) => handleChange("status", e.target.value)}
          placeholder="Ví dụ: Thiếu thông tin, Chưa rõ ràng, Mâu thuẫn..."
          radius="md"
          required
        />
      </div>

      {/* Evidence */}
      <Textarea
        label="Bằng chứng dẫn chiếu (Trích nguyên văn từ bản nộp)"
        value={finding.evidence}
        onChange={(e) => handleChange("evidence", e.target.value)}
        placeholder="Trích dẫn nguyên văn tài liệu hoặc ghi 'Không tìm thấy thông tin trong bản nộp'..."
        minRows={2}
        autosize
        radius="md"
        required
      />

      {/* Reason */}
      <Textarea
        label="Lý do đánh giá (Giải thích chi tiết lỗi logic)"
        value={finding.reason}
        onChange={(e) => handleChange("reason", e.target.value)}
        placeholder="Giải thích vì sao khía cạnh này bị đánh giá là có vấn đề..."
        minRows={3}
        autosize
        radius="md"
        required
      />

      {/* Question */}
      <Textarea
        label="Câu hỏi phản biện hướng dẫn (Học viên cần trả lời gì?)"
        value={finding.question}
        onChange={(e) => handleChange("question", e.target.value)}
        placeholder="Đặt câu hỏi cụ thể để học viên tư duy và làm rõ ý tưởng..."
        minRows={2}
        autosize
        radius="md"
        required
      />

      {/* Next Action */}
      <Textarea
        label="Hành động khắc phục gợi ý (Cần sửa đổi gì?)"
        value={finding.next_action}
        onChange={(e) => handleChange("next_action", e.target.value)}
        placeholder="Đề xuất các đầu việc chi tiết để sửa lỗi logic..."
        minRows={3}
        autosize
        radius="md"
        required
      />
    </div>
  );
}
