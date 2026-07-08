# PROJECT KNOWLEDGE BASE

- Prefer `caveman` skill lite mode + `sequential-thinking` for structured reasoning.
- **CodeGraph**: Project indexed with CodeGraph. Use `codegraph_explore` MCP or `codegraph explore` CLI BEFORE `grep` or Read.

**Generated:** 2026-06-25

## OVERVIEW

Turborepo monorepo. Stack: Next.js 16, Hono, Better Auth, Prisma 7, Mantine UI v9, TanStack Query/Form/Virtual, Lucide React, Vercel AI SDK (OpenAI/Google), shared `@repo/*` packages.

## STRUCTURE

```
root/
├── apps/api/      # Hono backend, auth, Prisma, streaming
├── apps/web-1/    # Next.js product app, Mantine UI v9, TanStack Query
├── packages/ui/   # Shared React primitives used by docs
├── packages/*     # ESLint/TypeScript presets
├── prisma/        # Root Prisma schema
├── docs/          # Tech doc URL list for library work
└── .omo/          # Local continuation/workflow state
```

## WHERE TO LOOK

| Task            | Location                                              | Notes                                            |
| --------------- | ----------------------------------------------------- | ------------------------------------------------ |
| Backend/API     | `apps/api/src/index.ts`, `auth.ts`, `db.ts`, `env.ts` | Hono entry, auth mount, DB wiring                |
| Web UI          | `apps/web-1/app/*`                                    | Mantine UI v9 app; read `apps/web-1/AGENTS.md` first |
| Shared UI       | `packages/ui/src/*`                                   | Common primitives for shared React usage         |
| DB schema       | `prisma/schema.prisma`                                | Plural table names, snake_case fields            |
| Tech docs       | `docs/tech-doc-urls.txt`                              | Source of truth for external docs                |
| Workspace rules | `package.json`, `turbo.json`                          | Root scripts + Turbo task graph                  |

## CONVENTIONS

- One root `.env`.
- TypeScript ESM, NodeNext-style relative imports use `.js`.
- API `8000`; web `3000`.
- Better Auth in `apps/api`; frontend only consumes client/session helpers.
- Prisma schema: plural tables + snake_case columns.
- Mantine UI web-only.

## ANTI-PATTERNS

- Split env files per app.
- Add auth routes/session logic outside `apps/api`.
- Edit `apps/web-1` without reading `apps/web-1/AGENTS.md` first.
- Reintroduce shadcn-style components into `apps/web-1`.
- Change Prisma names away from plural/snake_case.
- Ignore `docs/tech-doc-urls.txt` when touching Hono, Better Auth, or Mantine UI code.
- Add manual Tailwind positioning classes (`fixed`, `inset-0`, `flex`, `items-center`, `justify-center`) to Mantine UI components (`Modal`, `Drawer`). Mantine has default layout; override classes break display (e.g., center alignment).

## UNIQUE STYLES

- `apps/web-1`: Mantine UI v9 + TanStack Form + Lucide React.
- `apps/api`: Hono streaming helpers, Better Auth plugins, Vercel AI SDK for Google/OpenAI.
- `packages/ui`: tiny, stable, shared; keep changes minimal.

## COMMANDS

```bash
npm run dev
npm run build
npm run check-types
npm run prisma:generate
npm run prisma:migrate
```

## NOTES

- `apps/web-1/AGENTS.md` is child-specific Mantine UI note; sync with web work.
- **Agent Rules**: [.agents/rules/](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/.agents/rules/) contains project-wide guidelines:
  - [development-rules.md](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/.agents/rules/development-rules.md): Coding standards, file sizes, visual aids, no direct `apiClient` calls in UI.
  - [documentation-management.md](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/.agents/rules/documentation-management.md): Roadmaps, changelogs, plan files.
  - [orchestration-protocol.md](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/.agents/rules/orchestration-protocol.md): Subagent delegation and parallel execution.
  - [primary-workflow.md](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/.agents/rules/primary-workflow.md): Planning, implementation, testing, code quality, integration, visual explanations.
  - [prisma-migration-safety.md](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/.agents/rules/prisma-migration-safety.md): Migration safety, DB mutation rules, target DB classification.

## UI-UX-PRO-MAX USAGE RULE

ui-ux-pro-max is UI/UX reference, not source of truth.

Before building major frontend screen, optionally query for:

- visual direction
- layout pattern
- color/typography suggestions
- UX anti-patterns
- Next.js/Tailwind implementation guidance

Filter through Nexus Frontend UI/UX Design Rules v2.

Never blindly apply skill recommendations.
Never let skill override Nexus requirements:

- AI output explainable.
- Trust over magic.
- Status visible.
- Student input, AI output, supporter/admin decision separated.
- UI support revision/version workflow.
- Student screens not admin dashboards.
- Landing creative; workspace/admin restrained.

Use skill as inspiration and validation, not rigid generator.
