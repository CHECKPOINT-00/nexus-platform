# Nexus Platform

Monorepo for `apps/api`, `apps/web-1`, and shared `packages/*`.

## Stack

- Next.js 16 (App Router)
- Hono (Backend framework)
- Better Auth
- Prisma 7 (PostgreSQL Client)
- Mantine UI v9 + Tailwind CSS (Frontend UI)
- Turborepo
- Vercel AI SDK (with OpenAI & Google providers)
- TanStack Stack (Query v5, Form v1, Virtual v3)
- Lucide React (for UI icons)

## Structure

```txt
root/
├── apps/api/      # Hono backend, auth, Prisma, streaming, payments & refunds
├── apps/web-1/    # Next.js product app (Mantine UI v9 + Tailwind CSS)
├── packages/ui/   # Shared React primitives
├── packages/*     # Shared ESLint and TypeScript presets
├── prisma/        # Root Prisma schema (18 models/tables)
└── docs/          # Technical documentation and system architecture
```

## Setup

```bash
npm install
```

Create root `.env` from `.env.example`, then set:

- `DATABASE_URL`
- `DIRECT_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_API_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Cloudinary is used for payment proof uploads only. The application stores the public `secure_url` in the payment record.

## Run

```bash
npm run dev
```

Ports:

- API: `8000`
- Web: `3000`

## Build and checks

```bash
npm run build
```

## Notes

- One root `.env` only.
- API owns authentication, session logic, and business workflows.
- Web app (`apps/web-1`) uses Mantine UI v9 + Tailwind CSS. Do not position Modals/Drawers manually with Tailwind fixed/flex classes.
- Standardized Terminology:
  - `Hồ sơ phản biện` (Evaluation Profile)
  - `Nhu cầu hỗ trợ` (Support Needs)
  - `Tài liệu minh chứng` (Evidence Documents - managed via `document_records` direct uploads)
  - `Báo cáo phản biện` (Evaluation Report)
  - `Trao đổi & phản hồi` (Discussion & Chat - polling-based: 10s for details, 5s for messages)
  - `Vòng phản biện/Revision rounds`
- Admin Pricing Configurations (F07) & Price Locking:
  - Centralized pricing helpers (`pricing.ts`), admin configuration pages, and endpoints to update/lock package pricing dynamically.
- Refund Module:
  - Supports structured refund requests (`Refund` database model) through multi-tier policies based on supporter assignment status.
- `docs/tech-doc-urls.txt` is the source of truth for external library docs.
