# API KNOWLEDGE BASE

## OVERVIEW
Hono backend for monorepo. Handles health, streaming, Better Auth, Prisma access, AI engine (Vercel AI SDK + OpenAI/Google).

## STRUCTURE
```
src/
├── index.ts   # server entry, routes, CORS, auth mount
├── auth.ts    # Better Auth config
├── db.ts      # Prisma client wiring
└── env.ts     # root env load
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Start server | `src/index.ts` | `serve()` entry, port default `8000` |
| Auth config | `src/auth.ts` | Better Auth source of truth |
| DB access | `src/db.ts` | Prisma adapter/client setup |
| Env loading | `src/env.ts` | Reads root `.env` |

## CONVENTIONS
- ESM only.
- Relative imports use `.js` suffix in TS source.
- CORS only for auth routes, localhost `3000`.
- `/api/auth/*` mounts Better Auth handler directly.
- `/health`, `/stream`, `/session` are canonical runtime endpoints.

## ANTI-PATTERNS
- Add second auth system.
- Read env from per-app files.
- Move auth/session logic into web app.
- Hardcode extra localhost origins unless auth flow needs them.
- Replace streaming helper with ad hoc chunking.

## COMMANDS
```bash
npm run dev --workspace=apps/api
npm run build --workspace=apps/api
npm run check-types --workspace=apps/api
```

## NOTES
- Keep auth and Prisma changes aligned with root schema/URL config.
- **Database Migration Safety**: For Prisma schema/migration tasks, MUST read [prisma-migration-safety.md](file:///E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/.agents/rules/prisma-migration-safety.md). Direct DB mutation on production forbidden for agents.
- API is backend-only; no UI conventions here.
- Configure provider API keys in root `.env` (`GOOGLE_GENERATIVE_AI_API_KEY`, `OPENAI_API_KEY`) for AI Engine.
