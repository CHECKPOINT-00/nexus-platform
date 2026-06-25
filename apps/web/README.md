# Web

Next.js 16 app for the product UI.

## Stack

- Next.js App Router (React 19)
- HeroUI v3 (Tailwind v4 with `@tailwindcss/postcss` and `postcss`)
- `next-themes`
- TanStack Query v5
- TanStack Form v1 (for standardized form state & validation)
- TanStack Virtual v3
- Axios
- Lucide React (for UI icons)
- DevTools (TanStack React DevTools, TanStack Form DevTools for debugging)

## Folder Structure (Feature-Driven Architecture)

We organize files by **features** inside `src/features/` instead of flat folder categorization. Pages in `app/` are kept minimal, acting as structural layouts that compose feature components.

```
apps/web/
├── app/                           # Next.js App Router (Layouts, Routing & Page Composition)
│   ├── layout.tsx                 # App layout, sets up Providers
│   └── (dashboard)/               # Group of dashboard routes (cases, reports, packages)
│       └── cases/page.tsx         # Dashboard cases page
├── components/                    # Global Shared Primitives (Not bound to a single feature)
│   ├── ui/                        # Custom HeroUI v3 wrappers
│   ├── layouts/                   # Sidebar, Header, Navbar shells
│   └── feedback/                  # Toasts, AlertBanners, EmptyStates, ErrorBoundary
├── features/                      # Business Feature Blocks (Colocated)
│   └── [feature_name]/            # e.g., auth, cases, reports, payments, admin
│       ├── components/            # Feature-specific UI (LoginForm, CaseTable, SLACountdown)
│       ├── hooks/                 # React Query queries, mutations & UI state hooks
│       ├── services/              # API request methods calling the Hono backend
│       └── index.ts               # Feature entry export definitions
├── hooks/                         # Global hooks (useTheme, useMediaQuery)
├── lib/                           # Third-party configurations & helper utils
│   ├── api-client.ts              # Axios Client (withCredentials: true, baseURL pointing to API)
│   ├── auth-client.ts             # Better Auth Client SDK
│   └── utils.ts                   # Date formats, VND currency formatters, classnames helper
└── types/                         # TypeScript declaration files
```

### Key Design Guidelines (UI/UX)
Refer to the `frontend-ui-rules.md` file for detailed visual styling and interaction guidelines:
- **Google Aesthetic**: Minimalist, clean, practical, and highly readable.
- **One Screen, One Job**: Keep pages single-task oriented.
- **Explainable AI Findings**: Display evidence, logic, and next steps clearly for AI reports.
- **Direct Imports**: Share schema types directly from API modules using Turborepo dependencies.

## Setup

Run from repo root:

```bash
npm install
```

Set root `.env`:

- `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Run

```bash
npm run dev --workspace=apps/web
```

Open `http://localhost:3000`.

## Build and checks

```bash
npm run build --workspace=apps/web
npm run check-types --workspace=apps/web
npm run lint --workspace=apps/web
```
