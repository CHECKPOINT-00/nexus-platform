# API

Hono backend for Nexus Platform.

## What it does

- Health check at `/health`
- Streaming demo at `/stream`
- Better Auth at `/api/auth/*`
- Session lookup at `/session`
- Prisma access through the root schema

## Setup

Run from repo root:

```bash
npm install
```

Set root `.env`:

- `PORT` (default `8000`)
- `DATABASE_URL`
- `DIRECT_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Run

```bash
npm run dev --workspace=apps/api
```

## Build and checks

```bash
npm run build --workspace=apps/api
npm run check-types --workspace=apps/api
```

## Files

- `src/index.ts` - server entry
- `src/auth.ts` - Better Auth config
- `src/db.ts` - Prisma client setup
- `src/env.ts` - env loading
