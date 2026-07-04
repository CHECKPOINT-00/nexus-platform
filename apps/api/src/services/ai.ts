import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

// Initialize OpenAI-compatible (V98) provider
const openaiProvider = createOpenAI({
  baseURL: process.env.V98_BASE_URL || "https://api.openai.com/v1",
  apiKey: process.env.V98_API_KEY || process.env.OPENAI_API_KEY || "",
});

export interface Finding {
  field: string;
  status: string;
  evidence: string;
  reason: string;
  question: string;
  next_action: string;
}

export interface AiReportOutput {
  findings: Finding[];
}

export async function generateReportDraft(intakeData: any): Promise<AiReportOutput> {
  const systemPrompt = `Bạn là một chuyên gia phản biện ý tưởng khởi nghiệp cao cấp cho sinh viên. Nhiệm vụ của bạn là phân tích tài liệu và thông tin đầu vào của sinh viên, chỉ ra các lỗi thiếu sót, điểm mơ hồ hoặc thiếu căn cứ theo tiêu chí Checkpoint môn học.
Bạn bắt buộc phải trả về kết quả dạng JSON khớp chính xác với cấu trúc dưới đây. Tuyệt đối không viết thêm lời dẫn, lời kết hay các ký tự markdown nằm ngoài khối JSON.

Cấu trúc JSON yêu cầu:
{
  "findings": [
    {
      "field": "tên khía cạnh bị lỗi (chọn một trong các từ khóa: 'idea' | 'customer' | 'pain_point' | 'alternatives' | 'capability')",
      "status": "Loại vấn đề (ví dụ: 'Thiếu thông tin' | 'Chưa rõ ràng' | 'Mâu thuẫn' | 'Thiếu bằng chứng')",
      "evidence": "Trích dẫn nguyên văn từ tài liệu nộp của sinh viên (hoặc ghi 'Không tìm thấy thông tin trong bản nộp')",
      "reason": "Giải thích chi tiết vì sao khía cạnh này bị đánh giá như vậy",
      "question": "Câu hỏi cụ thể hướng dẫn để học viên trả lời làm rõ thêm",
      "next_action": "Các bước chi tiết học viên cần thực hiện để sửa đổi ý tưởng"
    }
  ]
}

Hãy phân tích kỹ lưỡng, đưa ra từ 3 đến 5 findings chất lượng, tập trung vào những lỗ hổng logic lớn nhất.`;

  let userPrompt = "";
  if (intakeData.idea) {
    userPrompt = `Dữ liệu ý tưởng của sinh viên:
- Ý tưởng kinh doanh: ${intakeData.idea}
- Khách hàng mục tiêu: ${intakeData.customer}
- Nỗi đau/Vấn đề cốt lõi: ${intakeData.pain_point}
- Giải pháp thay thế hiện tại: ${intakeData.alternatives}
- Năng lực của nhóm: ${intakeData.team_capability || "Chưa cung cấp"}
- Liên kết tài liệu Google Drive: ${intakeData.drive_url || "Chưa đính kèm"}`;
  } else {
    const currentBlocker = typeof intakeData.current_blocker === "string" ? intakeData.current_blocker : "";
    const situations = Array.isArray(intakeData.current_situations) ? intakeData.current_situations.join(", ") : "";
    const docsStr = Array.isArray(intakeData.documents)
      ? intakeData.documents
          .map((d: any) => `${d.document_type}: ${d.drive_url || d.file_url || ""} (${d.role_description})`)
          .join("\n")
      : "";
    userPrompt = `Dữ liệu Checkpoint 1 của sinh viên:
- Điểm kẹt hiện tại: ${currentBlocker || intakeData.case_summary || ""}
- Tình huống hiện tại: ${situations}
- Nhu cầu hỗ trợ chính: ${intakeData.support_needs?.primary_need || ""}
- Kỳ vọng đầu ra: ${intakeData.expected_outputs || ""}
- Tài liệu đính kèm:\n${docsStr}`;
  }

  try {
    const modelName = process.env.GEMINI_MODEL_LLM || "gemini-1.5-flash";
    const response = await generateText({
      model: google(modelName) as any,
      system: systemPrompt,
      prompt: userPrompt,
    });

    const parsed = parseJsonResponse(response.text);
    if (parsed) return parsed;
  } catch (error) {
    console.error("Gemini failed, falling back to OpenAI/V98: ", error);
  }

  try {
    const modelName = process.env.OPENAI_MODEL_LLM || "gpt-4o-mini";
    const response = await generateText({
      model: openaiProvider(modelName) as any,
      system: systemPrompt,
      prompt: userPrompt,
    });

    const parsed = parseJsonResponse(response.text);
    if (parsed) return parsed;
  } catch (error) {
    console.error("OpenAI fallback failed: ", error);
    throw new Error("Tất cả các dịch vụ AI phản biện đang bận. Vui lòng thử lại sau.");
  }

  throw new Error("Không thể phân tích dữ liệu phản biện từ AI.");
}

function parseJsonResponse(text: string): AiReportOutput | null {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    const obj = JSON.parse(cleanText);
    if (obj && Array.isArray(obj.findings)) {
      return obj as AiReportOutput;
    }
    return null;
  } catch (e) {
    console.error("Failed to parse JSON from AI text: ", text, e);
    return null;
  }
}
