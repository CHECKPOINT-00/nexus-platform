# Code standards

## Repo structure

- `apps/api`: Hono backend, Better Auth, Prisma, AI engine.
- `apps/web-1`: Next.js 16 product app.
- `packages/ui`: shared React primitives.
- `prisma/schema.prisma`: single source of truth cho data model.

## Conventions

- TypeScript ESM.
- Relative import trong TS dùng `.js` suffix.
- Một root `.env`, không tách env per app.
- Prisma dùng plural table names và snake_case field names.
- Auth/session logic chỉ sống trong `apps/api`.

## API standards

- Mount auth qua `/api/auth/*`.
- Keep CORS narrow, chủ yếu cho localhost dev origin cần thiết.
- Stream/health/session là runtime endpoint nền tảng.

## Web standards

- Next.js app tách theo route group rõ ràng: public, auth, dashboard, supporter, admin.
- Giữ UI consistent với Mantine UI v9 và shared primitives.
- Tránh đưa business logic nặng vào component page nếu có thể tách hook/module.

## API module organization

- Bounded context theo domain: cases, reports, payments, packages, ai-engine.
- Layering theo clean architecture: domain, application, infrastructure, presentation.
- Modules giao tiếp trực tiếp qua use-case/service, không cần bus cho MVP.

## Documentation standards

- Doc nói đúng hiện trạng, không invent API hay env key.
- File mới nên đặt theo topic rõ ràng, không tạo folder rỗng lạm dụng.
- Giữ nội dung ngắn, có thể scan nhanh.
