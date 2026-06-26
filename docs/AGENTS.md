# AGENTS.md cho `docs/`

## Mục đích của `docs/`

`docs/` dùng mô hình business-first, PRD-led. Mục tiêu là giữ business context, product scope, requirement, flow, technical note, và archive trong một trục rõ ràng.

## Tài liệu canonical

- `project-context.md` - business context canonical.
- `prd/core-product-prd.md` - product scope canonical.
- `flows/` - user flow và operational flow canonical.
- `requirements/` - functional requirement canonical.
- `technical-notes/` - technical note tối thiểu sau khi product scope đã rõ.

## Tài liệu hỗ trợ

- `codebase-summary.md` - tóm tắt nhanh bối cảnh codebase.
- `code-standards.md` - chuẩn code hỗ trợ.
- `tech-doc-urls.txt` - nguồn docs ngoài ưu tiên.

## Tài liệu legacy

- `archive/` - legacy reference, không phải source of truth.

## Quy tắc đặt tài liệu mới

1. Đặt tài liệu vào đúng lớp canonical trước.
2. Nếu thông tin thuộc business context, PRD, flow, requirement, hoặc technical note, cập nhật file canonical hiện có trước khi tạo file mới.
3. Không tạo top-level folder docs mới nếu chưa có lý do rõ.
4. Giữ tên file ngắn, mô tả đúng chủ đề, và tránh trùng nghĩa.

## Quy tắc cập nhật

- Không tự bịa API, kiến trúc, env key, hay runtime flow chưa thấy trong code hoặc docs đã xác nhận.
- Sửa file canonical trước: `project-context.md`, `prd/core-product-prd.md`, `flows/*`, `requirements/*`, `technical-notes/*`.
- Không dùng `archive/` làm nơi cập nhật chính.
- Giữ tài liệu ngắn, quét nhanh được, và tách ý theo heading rõ.
- Dùng `docs/tech-doc-urls.txt` khi cần nguồn ngoài cho Hono, Better Auth, HeroUI, TanStack, hoặc thư viện khác.
- Bám quy ước repo: một root `.env`, auth/session ở `apps/api`, Prisma plural table + snake_case, web app ở `apps/web-1`.

## Cách chọn nơi sửa

- Nếu đổi business context: sửa `project-context.md`.
- Nếu đổi product scope: sửa `prd/core-product-prd.md`.
- Nếu đổi hành vi feature: sửa `requirements/*` và `flows/*`.
- Nếu đổi technical impact: sửa `technical-notes/*`.
- Nếu là hướng dẫn thao tác hoặc dữ liệu legacy: xem `archive/` khi cần truy vết.

## Khi làm việc như AI agent

- Đọc `codebase-summary.md` nếu cần bối cảnh nhanh.
- Ưu tiên chỉnh file canonical thay vì tạo bản ghi chéo dư thừa.
- Nếu thiếu dữ liệu, ghi `Missing`, `Unclear`, `Needs decision`, hoặc `Assumption`.
- Chỉ ghi những gì có thể kiểm tra từ repo hiện tại hoặc docs đã xác nhận.
