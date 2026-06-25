import { TextArea } from "@heroui/react";
import type { Finding } from "../types";

const FIELD_LABELS: Record<string, string> = {
  idea: "Ý tưởng",
  customer: "Khách hàng",
  pain_point: "Nỗi đau / Vấn đề",
  alternatives: "Giải pháp thay thế",
  capability: "Năng lực nhóm",
};

interface FindingCardProps {
  finding: Finding;
  index: number;
  showClarifyInput?: boolean;
}

export function FindingCard({ finding: f, index, showClarifyInput }: FindingCardProps) {
  const isDanger = f.status === "Mâu thuẫn" || f.status === "Thiếu bằng chứng";

  return (
    <div
      className={`border rounded-md shadow-none ${
        isDanger
          ? "border-danger-200/60 bg-danger-50/10"
          : "border-amber-200/60 bg-amber-50/10"
      }`}
    >
      {/* Card Header */}
      <div className="p-4 pb-2 flex justify-between items-start">
        <div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
              isDanger
                ? "bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400"
                : "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
            }`}
          >
            {f.status}
          </span>
          <h4 className="text-sm font-bold text-default-800 mt-2">
            Khía cạnh: {FIELD_LABELS[f.field] ?? f.field}
          </h4>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 pt-0 flex flex-col gap-3">
        <p className="text-xs text-default-700 leading-relaxed font-semibold">Bằng chứng từ tài liệu:</p>
        <p className="text-xs text-default-600 bg-default-100 p-2.5 rounded border border-default-200/50 leading-relaxed whitespace-pre-wrap">
          {f.evidence}
        </p>

        <p className="text-xs text-default-700 leading-relaxed font-semibold">Lý do nhận định:</p>
        <p className="text-xs text-default-600 leading-relaxed whitespace-pre-wrap">{f.reason}</p>

        {f.question && (
          <>
            <p className="text-xs text-orange-700 font-bold mt-1">Câu hỏi làm rõ / Định hướng giải quyết:</p>
            <p className="text-xs text-orange-600 bg-orange-50/50 dark:bg-orange-950/10 p-2.5 rounded border border-orange-200/30 leading-relaxed font-medium whitespace-pre-wrap">
              {f.question}
            </p>
          </>
        )}

        {f.next_action && (
          <>
            <p className="text-xs text-success-700 font-bold mt-1">Hành động tiếp theo kiến nghị:</p>
            <p className="text-xs text-success-600 bg-success-50/50 dark:bg-success-950/10 p-2.5 rounded border border-success-200/30 leading-relaxed font-medium whitespace-pre-wrap">
              {f.next_action}
            </p>
          </>
        )}

        {showClarifyInput && (
          <div className="mt-3">
            <label
              htmlFor={`clarify-${index}`}
              className="text-[10px] font-bold text-default-500 uppercase tracking-wider block mb-1"
            >
              Phản hồi làm rõ của nhóm
            </label>
            <TextArea
              id={`clarify-${index}`}
              placeholder="Nhập câu trả lời ngắn gọn để giải thích cho supporter..."
              rows={1}
              className="bg-background text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}
