# Nexus Platform

Monorepo for `apps/api`, `apps/web`, and shared `packages/*`.

## Stack

- Next.js 16
- Hono
- Better Auth
- Prisma 7
- Mantine UI v9
- Turborepo
- Vercel AI SDK (OpenAI & Google)
- TanStack Stack (Query v5, Form v1, Virtual v3)
- Lucide React (UI icons)

## Structure

```txt
root/
├── apps/api/      # Hono backend, auth, Prisma, streaming
├── apps/web/      # Next.js product app
├── packages/ui/   # Shared React primitives
├── packages/*     # Shared ESLint and TypeScript presets
├── prisma/        # Root Prisma schema
└── docs/          # Tech docs URL list for library work
```

## Setup

```bash
npm install
```

Create root `.env` from `.env.example`, set:

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

Cloudinary for payment proof uploads only. Stores public `secure_url` in payment record.

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
npm run lint
npm run check-types
npm run prisma:generate
npm run prisma:migrate
```

## Notes

- One root `.env`.
- API owns auth and session logic.
- Web uses Mantine UI v9.
- `docs/tech-doc-urls.txt` is source of truth for external library docs.
