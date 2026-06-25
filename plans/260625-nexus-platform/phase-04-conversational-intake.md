# Phase 4: Conversational Intake Flow

## Context Links
- [Overview Plan](./plan.md)
- [Intake Spec Web](../../docs/web-spec/web-spec-intake-workflow.md)

## Overview
- **Priority**: P1
- **Status**: Pending
- **Description**: Hiện thực hóa giao diện Intake hội thoại có cấu trúc (Structured Conversational Intake) và tích hợp API tạo case.
- **Estimated Effort**: 4h

## Key Insights
- Không dùng chat tự do 100%. Dữ liệu phải được kiểm soát bằng form có cấu trúc dưới lớp giao diện chat.
- Tự động điền (auto-fill) và ẩn các trường hệ thống đã biết (Case ID, auth user id, checkpoint).
- <!-- Updated: Validation Session 1 - Cải thiện trải nghiệm biểu mẫu tự điền và xác thực link Drive -->
- Cho phép người dùng biết rõ trường nào được auto-fill bằng nhãn "Thông tin đã có" màu xanh nhạt.

## Requirements
- Giao diện chat bong bóng (HeroUI Card/Chip).
- **Thanh tiến trình bên lề (Sidebar Progress)**: Một cột nhỏ bên trái hiển thị danh sách các bước câu hỏi (Stage, Idea, Customer, Pain Point, Alternatives) để người dùng luôn định vị được tiến độ (Rule 2).
- **Google Drive Validator**:
  - Giao diện báo lỗi trực quan (Rule 17) khi link Drive không hợp lệ hoặc thiếu quyền truy cập (ví dụ: "Vui lòng cấp quyền xem 'Bất kỳ ai có liên kết'").
- Cho phép đính kèm Google Drive link.
- Form action thu thập các field: `stage`, `idea`, `pain_point`, `customer`, `alternatives`, `team_capability`, `deadline`.
- **UI/UX Specifications (Compliance)**:
  - **Reduce Thinking Load (Rule 12)**: Bong bóng câu hỏi của chatbot phải cực kỳ cụ thể để người dùng không cần suy nghĩ sâu hoặc đoán:
    - Thay vì hỏi *"Mô tả khách hàng mục tiêu"*, hỏi: *"Ai là người trực tiếp gặp vấn đề này? Họ thuộc nhóm sinh viên nào?"*
    - Thay vì hỏi *"Phân tích giải pháp thay thế"*, hỏi: *"Hiện tại họ đang tự xử lý vấn đề đó bằng cách nào?"*
  - **Input Auto-fill Indicator**: Các trường được điền tự động hiển thị nhãn nhẹ màu xanh nhạt: *"Thông tin đã được đồng bộ"* để đảm bảo tính minh bạch.
  - **Error Messages Location (Rule 20)**: Các thông báo lỗi xác thực liên kết Drive hoặc form phải xuất hiện ngay bên dưới ô nhập liệu tương ứng, màu chữ đỏ dịu (`text-danger-500`), không được hiển thị popup gây nhiễu.
  - **Intake-to-Workspace Redirection**: Sau khi người dùng nộp Case thành công, chuyển hướng trực tiếp về trang Chi tiết dự án `/dashboard/case/[id]` để họ có thể xem lại dữ liệu đã nộp, tạo cảm giác yên tâm và tin cậy.
  - **Unpaid Case Alert Banner (Rule 9)**: Nếu case mới nộp ở trạng thái `unpaid` (Chưa thanh toán), hiển thị một Banner thông báo màu cam dịu ở đầu trang: *"Ý tưởng đã được lưu. Vui lòng hoàn tất thanh toán để kích hoạt supporter phản biện"* kèm nút **"Thanh toán ngay"** mở ra ngăn kéo (Drawer) tải ảnh chuyển khoản. Giao diện này không che chặn nội dung chính mà hướng dẫn học viên hành động một cách tinh tế.


## Architecture
- **Frontend Stepper**: State-machine client-side React + Drive Link Pattern Regex Validator.
- **Backend Handler**: Hono router lưu dữ liệu và khởi tạo transaction tạo Case.

## Related Code Files
- [NEW] [apps/web/app/dashboard/intake/page.tsx](../../apps/web/app/dashboard/intake/page.tsx) - Trang UI Intake hội thoại.
- [NEW] [apps/api/src/routes/intake.ts](../../apps/api/src/routes/intake.ts) - API Hono validate và tạo case.
- [NEW] [apps/web/lib/utils/drive-validator.ts](../../apps/web/lib/utils/drive-validator.ts) - Helper kiểm tra link Google Drive hợp lệ.

## Implementation Steps
1. Khởi tạo cấu trúc các câu hỏi theo nhánh lựa chọn (Ví dụ: đã có ý tưởng -> hỏi sâu hơn về pain point; chưa có ý tưởng -> hướng dẫn tìm ý tưởng).
2. Viết UI component hiển thị chat bubble kèm micro-animations.
3. Thêm module helper `drive-validator.ts` phía client.
4. Tạo endpoint backend `POST /api/cases` nhận dữ liệu form và lưu vào table `cases`, `checkpoints`.
5. Validate các trường dữ liệu ở backend trước khi insert DB.

## Todo List
- [ ] Dựng State machine quản lý các câu hỏi và Sidebar progress.
- [ ] Thiết kế bong bóng chat & các nút lựa chọn.
- [ ] Viết bộ validate link Google Drive và giao diện thông báo lỗi.
- [ ] Tạo API backend insert case vào Database.
- [ ] Tích hợp tính năng thêm link tài liệu Google Drive.

## Success Criteria
- Hoàn thành luồng intake chuyển sang màn hình thanh toán hoặc màn hình chi tiết case.
- Dữ liệu lưu xuống PostgreSQL đúng format, không bị trùng lặp.

## Risk Assessment
- *Rủi ro*: User tải lại trang làm mất dữ liệu đang nhập.
- *Khắc phục*: Save tạm state vào LocalStorage khi đang nhập dở.

## Security Considerations
- Tránh SQL Injection bằng cách sử dụng Prisma parameterized queries.
- Sanitize các link Google Drive của user.

## Next Steps
- Triển khai AI Engine & Report Lifecycle ở [Phase 5](./phase-05-ai-engine-reports.md).
