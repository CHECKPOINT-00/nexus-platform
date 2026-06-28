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

### `apps/web-1`

Next.js 16 product app với các bề mặt:

- public app entry
- auth
- dashboard
- supporter workspace
- admin workspace

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

## Ràng buộc vận hành

- Chỉ dùng một root `.env`.
- API sở hữu auth và session.
- Prisma dùng plural table + snake_case columns.
- Web dùng Mantine UI v9 và cấu trúc app router.
