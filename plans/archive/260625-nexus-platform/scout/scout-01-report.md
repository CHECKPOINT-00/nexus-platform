# Scout Report: Nexus Workspace Structure

Date: 2026-06-25
Author: Antigravity Scout

## Objective
Locate and identify all configuration files, database schemas, backend and frontend structure to implement the Nexus platform.

## Key Files Identified

### 1. Database Schema
- [prisma/schema.prisma](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/prisma/schema.prisma)
  - Current state: Setup with Better Auth default schemas (`users`, `sessions`, `accounts`, `verifications`, `two_factors`).
  - Next step: Add business models (`cases`, `case_members`, `checkpoints`, `lifecycle_units`, `reports`, `payments`, `case_messages`, `case_events`, `ai_jobs`).

### 2. Backend (Hono API)
- [apps/api/src/index.ts](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/index.ts)
  - Current state: Runs on port 8000. Setup with basic CORS, a `/session` endpoint, and Better Auth handler mounted at `/api/auth/*`.
- [apps/api/src/auth.ts](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/auth.ts)
  - Current state: Configures Better Auth with social provider Google and credentials provider `emailAndPassword`.
- [apps/api/src/db.ts](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/api/src/db.ts)
  - Current state: Initializes `PrismaClient` with `PrismaPg` adapter.

### 3. Frontend (Next.js)
- [apps/web/app/page.tsx](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web/app/page.tsx)
  - Current state: Basic Turborepo starter template.
- [apps/web/app/providers.tsx](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web/app/providers.tsx)
  - Current state: Wraps children with TanStack `QueryClientProvider` and Theme provider.
- [apps/web/AGENTS.md](file:///e:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/apps/web/AGENTS.md)
  - Current state: Reference files for Mantine UI v9 React components.

## Unresolved Items
- Need to determine direct file upload endpoint vs link integration in `lifecycle_units`.
