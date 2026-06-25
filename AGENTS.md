# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-25

## OVERVIEW
Turborepo monorepo. Stack: Next.js 16, Hono, Better Auth, Prisma 7, HeroUI v3, TanStack Query/Form/Virtual, Lucide React, Vercel AI SDK (with OpenAI/Google), shared `@repo/*` packages.

## STRUCTURE
```
root/
├── apps/api/      # Hono backend, auth, Prisma, streaming
├── apps/web-1/    # Next.js product app, HeroUI v3, TanStack Query
├── packages/ui/   # Shared React primitives used by docs
├── packages/*     # ESLint/TypeScript presets
├── prisma/        # Root Prisma schema
├── docs/          # Tech doc URL list for library work
└── .omo/          # Local continuation/workflow state
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Backend/API | `apps/api/src/index.ts`, `auth.ts`, `db.ts`, `env.ts` | Hono entry, auth mount, DB wiring |
| Web UI | `apps/web-1/app/*` | HeroUI v3 app; read `apps/web-1/AGENTS.md` first |
| Shared UI | `packages/ui/src/*` | Common primitives for shared React usage |
| DB schema | `prisma/schema.prisma` | Plural table names, snake_case fields |
| Tech docs | `docs/tech-doc-urls.txt` | Source of truth for external docs |
| Workspace rules | `package.json`, `turbo.json` | Root scripts + Turbo task graph |

## CONVENTIONS
- One root `.env`.
- TypeScript ESM, NodeNext-style relative imports use `.js` in source.
- API on `8000`; web on `3000`.
- Better Auth lives in `apps/api`; frontend only consumes client/session helpers.
- Prisma schema follows plural tables + snake_case columns.
- HeroUI is web-only.

## ANTI-PATTERNS (THIS PROJECT)
- Split env files per app.
- Add auth routes or session logic outside `apps/api`.
- Edit `apps/web-1` without checking `apps/web-1/AGENTS.md`.
- Reintroduce shadcn-style web components into `apps/web-1`.
- Change Prisma names away from plural/snake_case.
- Ignore `docs/tech-doc-urls.txt` when touching Hono, Better Auth, or HeroUI code.

## UNIQUE STYLES
- `apps/web-1` uses HeroUI v3 + `next-themes` + TanStack Form for form state & validation + Lucide React for UI icons.
- `apps/api` uses Hono streaming helpers, Better Auth plugins, and Vercel AI SDK for Google/OpenAI integrations.
- `packages/ui` is tiny, stable, and shared; keep changes minimal.

## COMMANDS
```bash
npm run dev
npm run build
npm run check-types
npm run prisma:generate
npm run prisma:migrate
```

## NOTES
- `apps/web-1/AGENTS.md` is the child-specific HeroUI note; keep it in sync with web work.
- `.agents/rules` exists but is empty right now.

## UI-UX-PRO-MAX USAGE RULE FOR NEXUS
ui-ux-pro-max is available as a UI/UX reference skill. It is not the source of truth.

Before building a major frontend screen, optionally query ui-ux-pro-max for:
- visual direction
- layout pattern
- color/typography suggestions
- UX anti-patterns
- Next.js/Tailwind implementation guidance

Then filter all recommendations through Nexus Frontend UI/UX Design Rules v2.

Never blindly apply a recommendation just because the skill returned it.
Never let the skill override Nexus-specific requirements:
- AI output must be explainable.
- Trust over magic.
- Status must be visible.
- Student input, AI output, and supporter/admin decision must be separated.
- UI must support revision/version workflow.
- Student screens must not feel like admin dashboards.
- Landing can be more creative; workspace/admin must be clearer and more restrained.

Use the skill as inspiration and validation, not as a rigid generator.
