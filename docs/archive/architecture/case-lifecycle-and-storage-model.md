# Trạng thái: tham chiếu legacy
# Không dùng làm source of truth chính.
# Đã được thay thế bởi: [`technical-notes/platform-architecture-note.md`](../../technical-notes/platform-architecture-note.md)

# Mô hình vòng đời case và lưu trữ

## Phạm vi

Tài liệu này mô tả mô hình cũ cho stage/status, flag, vòng đời Drive, versioning, và định danh backend.

## Điểm chính

- Stage người dùng nhìn thấy phải tách khỏi status nội bộ.
- Status nội bộ là state machine vận hành.
- Flag chỉ là nhãn phụ, không phải trạng thái chính.
- Drive giữ file source of truth; Postgres chỉ mirror metadata và state.
- Không ghi đè file cũ; tạo version mới khi cần.
- Định danh backend như `case_id`, `checkpoint_id`, `report_id`, `payment_id` phải sinh từ backend, không từ chat text.

## Tham chiếu

- `../../technical-notes/platform-architecture-note.md`
- `../../flows/case-lifecycle-flow.md`
- `../../requirements/case-workspace-and-status.md`
