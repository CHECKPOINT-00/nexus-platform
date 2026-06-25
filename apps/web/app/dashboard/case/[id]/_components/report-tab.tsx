import type { Finding } from "../types";
import { FindingCard } from "./finding-card";

interface ReportTabProps {
  approvedFindings: Finding[];
  userFacingStage: string;
  isSupporter: boolean;
}

export function ReportTab({ approvedFindings, userFacingStage, isSupporter }: ReportTabProps) {
  if (approvedFindings.length === 0) {
    if (isSupporter) return null;
    return (
      <div className="p-12 text-center border border-dashed border-default-300 rounded-lg bg-surface">
        <p className="text-sm text-default-400">Chưa có báo cáo phản biện chính thức nào.</p>
      </div>
    );
  }

  const showClarify = userFacingStage === "Need Clarification" && !isSupporter;

  return (
    <div className="flex flex-col gap-4">
      {/* Disclaimer */}
      <div className="bg-default-100/80 p-3.5 rounded border border-default-200 text-[11px] text-default-500 italic leading-relaxed text-center">
        &ldquo;Phân tích này được thực hiện dựa trên tiêu chí Checkpoint. Kết quả cuối cùng vẫn cần sự thảo luận và hướng dẫn từ supporter của bạn để tối ưu.&rdquo;
      </div>

      {approvedFindings.map((f, idx) => (
        <FindingCard
          key={idx}
          finding={f}
          index={idx}
          showClarifyInput={showClarify}
        />
      ))}
    </div>
  );
}
