# API

Hono backend for Nexus Platform.

## Tech Stack

- Hono (Backend framework)
- Better Auth (Authentication)
- Prisma 7 (Database client)
- Vercel AI SDK & Core Providers (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`)

## Core Features

- Health check at `/health`
- Streaming demo at `/stream`
- Better Auth at `/api/auth/*`
- Bounded contexts modules (Cases, Reports, Payments, Packages, AI Engine) mounted at `/api/*`
- Prisma access through the root schema
- AI-powered analyses using Google Gemini and OpenAI models via Vercel AI SDK

## Folder Structure (Modular Monolith + Clean Architecture + DDD)

We group code by **business domains (Bounded Contexts)** inside `src/modules/` instead of technical folders. Each module is split into 4 layers representing Clean Architecture:

```
apps/api/src/
├── index.ts                      # Entry point, boots server, registers modules
├── env.ts                        # Environment config
├── auth.ts                       # Better Auth config
├── db.ts                         # Prisma database client setup
├── shared/                       # Shared Kernel (cross-cutting concerns)
│   ├── domain/                   # Generic domain interfaces/primitives
│   ├── application/              # Common exceptions & helpers
│   └── infrastructure/           # Base Prisma repo, shared requireAuth middleware
└── modules/                      # Business Modules (Bounded Contexts)
    └── [module_name]/            # e.g., cases, reports, payments, packages, ai-engine
        ├── domain/               # Domain Layer (Pure TS - Entities, Value Objects, Repo Interfaces)
        ├── application/          # Application Layer (Use Cases, DTOs)
        ├── infrastructure/       # Infra Layer (Prisma Repo implementations, external clients)
        └── presentation/         # Presentation Layer (Hono routes & controller handlers)
```

### Module Communication Rules
- **Direct Calls**: To keep the MVP simple, modules communicate by directly importing and calling the target module's Application Services / Use Cases.
- **No Sockets/Event-Buses**: We do not use messaging brokers, sockets, or event buses in this phase.
- **Decoupled Database**: Other modules reference users via `auth_user_id: String` in their schemas. We do not define strict Prisma model-level relations with Better Auth's `User` model to keep domain contexts decoupled.

### Better Auth Integration
- The setup lives in `src/auth.ts`.
- The routes are mounted on Hono via `app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))`.
- Authenticated endpoints are guarded using the shared middleware `requireAuth` (`src/shared/infrastructure/middlewares/auth.ts`) which resolves the session and sets `c.set('user', user)` into Hono's context.

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
