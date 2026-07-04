# Trạng thái: tham chiếu legacy
# Không dùng làm source of truth chính.
# Đã được thay thế bởi: [`technical-notes/platform-architecture-note.md`](../../technical-notes/platform-architecture-note.md)

# Kiến trúc luồng làm việc có cấu trúc và AI

## Phạm vi

Tài liệu này mô tả hình dạng kỹ thuật cũ của intake, AI hỗ trợ xử lý case, supporter review, và ánh xạ UI workspace.

## Điểm chính

- Intake vận hành như một luồng form có cấu trúc, không phải chat tự do.
- UI có thể trông giống chat, nhưng backend vẫn giữ state và validation.
- Chỉ hỏi những trường chưa biết; dữ liệu đã có trong workspace thì tái sử dụng.
- AI xử lý missing-field detection, phân loại, draft hỗ trợ audit, và tóm tắt cho supporter.
- Supporter review draft, sửa logic, hỏi bổ sung khi cần, rồi duyệt đầu ra cuối.
- Hono backend giữ workflow core, validation, quyền truy cập, và quản lý case.
- Vercel AI SDK chạy trong Hono cho model call và streamed output.
- n8n chỉ nên dùng cho automation như mail, notification, và reminder.

## Tham chiếu

- `../../technical-notes/platform-architecture-note.md`
- `../../requirements/structured-intake.md`
- `../../requirements/supporter-review-and-report.md`
