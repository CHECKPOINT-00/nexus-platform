# Phase 5: AI Engine & Reports

## Context Links
- [Overview Plan](./plan.md)
- [AI Spec Web](../../docs/web-spec/web-spec-ai-human-ops.md)
- **Tài liệu tham khảo (References)**:
  - [Hono - Streaming Helpers Documentation](https://hono.dev/docs/helpers/streaming)
  - [Web Spec - AI & Human Operations](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/docs/web-spec/web-spec-ai-human-ops.md)
  - [Web Spec - Case Lifecycle](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/docs/web-spec/web-spec-case-lifecycle.md)
  - [Design System Master Rules](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/design-system/nexus-platform/MASTER.md)

## Overview
- **Priority**: P1
- **Status**: Pending
- **Description**: Tích hợp Vercel AI SDK vào Hono backend, viết logic sinh AI Draft Report và quản lý vòng đời của Report.
- **Estimated Effort**: 4h

## Key Insights
- Nghiêm cấm gửi thẳng text từ AI cho sinh viên. AI draft phải đi qua hàng chờ phê duyệt của supporter.
- Phân tích và gán tự động các tag cảnh báo (`Missing`, `Too vague`, `Mixed frame`, `Unsupported claim`) để supporter nắm tình hình nhanh.

## Requirements
- Vercel AI SDK stream kết quả phân tích về Hono.
- Quản lý trạng thái Report: `AI_DRAFT` -> `SUPPORTER_REVIEW` -> `APPROVED` -> `SENT`.
- Giao diện cho supporter xem và sửa report nháp trước khi click gửi.
- <!-- Updated: Validation Session 1 - Hỗ trợ đa nhà cung cấp OpenAI + Gemini làm backup -->
- Cho phép lựa chọn/fallback giữa OpenAI và Gemini API để đảm bảo tính sẵn sàng (redundancy).
- **Cấu trúc Report dễ giải thích (Rule 10)**: AI output không được viết dạng bài văn dài. Phải cấu trúc chi tiết cho mỗi finding gồm:
  - **Phần bị lỗi (Field)** (ví dụ: customer, alternatives)
  - **Trạng thái (Status)** (ví dụ: Thiếu thông tin, Chưa rõ)
  - **Bằng chứng (Evidence)** (Trích dẫn trực tiếp từ tài liệu)
  - **Lý do (Reason)** (Giải thích vì sao bị đánh giá như vậy)
  - **Câu hỏi làm rõ (Question)** (Câu hỏi cụ thể cho sinh viên)
  - **Hành động tiếp theo (Next Action)** (Sinh viên nên sửa thế nào)
- **UI/UX Specifications (Compliance)**:
  - **Design for Trust (Rule 11)**: Hiển thị một banner tuyên bố trách nhiệm rõ ràng ở đầu và cuối báo cáo nháp/chính thức: *"Phản tích này được thực hiện dựa trên tiêu chí Checkpoint. Kết quả cuối cùng vẫn cần sự thảo luận và hướng dẫn từ supporter của bạn để tối ưu."*
  - **Report Card Layout**: Mỗi lỗi phát hiện (Finding) được render thành 1 card riêng biệt, phân loại theo độ nghiêm trọng (ví dụ: Màu cam nhẹ cho 'Thiếu thông tin', Màu vàng nhạt cho 'Chưa rõ ràng').

## Màn hình & UX Components
- **Màn hình Supporter Review nháp báo cáo của AI**
  - **Đường dẫn (Route)**: `/supporter/case/[id]/review`
  - **Mục tiêu UX chính**: Hỗ trợ Supporter kiểm duyệt nhanh báo cáo do AI tự động tạo nháp, thực hiện chỉnh sửa trực tiếp nội dung trước khi chính thức phê duyệt gửi cho sinh viên.
  - **Các Component HeroUI**: `<Card>`, `<CardBody>`, `<CardHeader>`, `<Textarea>`, `<Button>`, `<Chip>` (Hiển thị các tag cảnh báo độ nghiêm trọng), `<Accordion>`, `<AccordionItem>` (Thu gọn/mở rộng chi tiết giải thích).

## Architecture
- **Provider**: OpenAI API (`@ai-sdk/openai`) & Gemini API (`@ai-sdk/google`) qua Vercel AI SDK.
- **Output Flow**: Hono Streaming API (`streamText`).
- **Data Structure**: JSON schema cho report findings để lưu thông tin dạng cấu trúc trong Database (Postgres).

## Related Code Files
- [NEW] [apps/api/src/routes/reports.ts](../../apps/api/src/routes/reports.ts) - Router quản lý report & phê duyệt.
- [NEW] [apps/api/src/services/ai.ts](../../apps/api/src/services/ai.ts) - Service gọi OpenAI/Gemini và build prompt hệ thống.

## Implementation Steps
1. Cài đặt các package của Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`).
2. Viết System Prompts chứa các quy định phản biện (Triad Lens, Checkpoint criteria) và ép cấu trúc JSON output.
3. Viết API `POST /api/reports/:caseId/draft` để generate nháp (hỗ trợ chuyển đổi model).
4. Viết API `POST /api/reports/:id/approve` đổi trạng thái sang `APPROVED` và cập nhật case sang `REPORT_SENT`.

## Todo List
- [ ] Tích hợp Vercel AI SDK và cài đặt provider packages.
- [ ] Viết helper switch/backup giữa OpenAI và Gemini.
- [ ] Viết prompt hệ thống phản biện ép cấu trúc JSON (Field-Status-Evidence-Reason-Question-Next action).
- [ ] Thiết lập API Hono stream AI draft.
- [ ] Xây dựng luồng phê duyệt và chuyển trạng thái report.

## Success Criteria
- Sinh được report nháp đầy đủ gợi ý phân tích dựa trên thông tin intake.
- Supporter phê duyệt thì user mới nhìn thấy report trên dashboard của mình.

## Risk Assessment
- *Rủi ro*: Trì hoãn / Timeout khi gọi OpenAI.
- *Khắc phục*: Tích hợp cơ chế retry hoặc trả lỗi thân thiện, lưu trạng thái AI job sang `ai_jobs` table.

## Security Considerations
- Tránh rò rỉ API key bằng cách sử dụng biến môi trường ở server.
- Xử lý prompt injection từ dữ liệu intake của sinh viên.

## Next Steps
- Triển khai giao diện Dashboard và Workspaces ở [Phase 6](./phase-06-workspaces.md).
