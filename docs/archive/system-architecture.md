# Trạng thái: tham chiếu legacy
# Không dùng làm source of truth chính.
# Đã được thay thế bởi: [`technical-notes/platform-architecture-note.md`](../../technical-notes/platform-architecture-note.md)

# Kiến trúc platform

## Mục đích

Đây là bản tóm tắt kỹ thuật cũ của platform, giữ lại để tra cứu lịch sử.

## Thành phần chính

- Web app: `apps/web-1`
- API: `apps/api`
- DB schema: `prisma/schema.prisma`
- Chủ sở hữu auth/session: `apps/api`

## Ghi chú

- Thông tin chi tiết đã được rút gọn vào `technical-notes/platform-architecture-note.md`.
- Nếu có khác biệt, tài liệu canonical mới sẽ ưu tiên hơn tài liệu này.
