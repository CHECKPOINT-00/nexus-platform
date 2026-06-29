# Tóm tắt codebase

_Tổng hợp từ `repomix-output.xml` và kiểm tra workspace hiện tại._

## Repo này là gì

Turborepo monorepo cho Nexus Platform.

## Khu vực chính

### `apps/api`

Backend Hono với:

- `/health`, `/stream`, `/session`
- Better Auth tại `/api/auth/*`
- route cho case, report, payment, package, và AI engine
- ownership cho auth/session, case workflow, report flow, message endpoints, admin/supporter actions

### `apps/web-1`

Next.js 16 product app với các bề mặt:

- public app entry
- auth
- dashboard
- student case workspace
- supporter workspace
- admin workspace
- intake flow nhiều bước

### `packages/ui`

Các primitive UI dùng chung giữa các bề mặt.

### `prisma/schema.prisma`

Mô hình dữ liệu Postgres trung tâm.

## Tài liệu chính trong `docs/`

- `docs/project-context.md`
- `docs/prd/`
- `docs/flows/`
- `docs/requirements/`
- `docs/technical-notes/`
- `docs/archive/`
- `docs/tech-doc-urls.txt`

## Verified MVP surfaces

- Student case workspace và supporter case workspace cùng bám một sidebar SPA shell.
- `TabDiscussionChat` đã có fetch + send message qua REST và polling 5 giây.
- `ActivityTimeline` đã có và render `caseData.events`.
- `useCaseDetails` polling 10 giây và trả `case`, `intake_snapshot`, `latest_report`, `document_board_sections`, `round_history`, `open_requests_for_more_info`.
- Intake documents hiện dùng 1 Drive/Docs URL chính + checklist loại tài liệu trong thư mục.
- Supporter có review page riêng để generate/edit/approve báo cáo phản biện.

## Ràng buộc vận hành

- Chỉ dùng một root `.env`.
- API sở hữu auth và session.
- Prisma dùng plural table + snake_case columns.
- Web dùng Mantine UI v9 và cấu trúc app router.
