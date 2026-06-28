export type FindingStatus = "clear" | "warning" | "critical" | "clarify_needed";

export interface ReportFinding {
  field: string;          // Phần tiêu chí đánh giá (ví dụ: "Pain Point")
  status: FindingStatus;  // Trạng thái đánh giá
  evidence: string;       // Bằng chứng từ tài liệu học viên nộp
  reason: string;         // Lý do phản biện của AI
  question: string;       // Câu hỏi làm rõ dành cho học viên
  next_action: string;    // Hướng dẫn hành động tiếp theo
}

export interface AiCritiqueReport {
  overall_summary: string;
  completeness_score: number; // 0-100
  findings: ReportFinding[];
}
