# Implementation status report — document workspace refactor

**Date:** 2026-07-01  
**Scope:** `plans/260630-1352-document-workspace-refactor/`  
**Branch:** `ui/heroui-to-mantine`

## Executive summary
Refactor now **implemented and type/test-verified** for current scope. Document workspace selection + contract bug fixed, security write validation kept, and case detail flow still ships compatible legacy payload alongside `document_workspace`.

## What is already in code

### Backend model / contract
- Normalized document domain exists under `apps/api/src/modules/documents/`
- `DocumentWorkspace`, `DocumentCheckpoint`, `DocumentUnit`, `DocumentFile` contract exists in `apps/api/src/modules/documents/domain/document-contract.ts`
- `selected_checkpoint_id` added to workspace response contract
- URL validation helper exists in `apps/api/src/modules/documents/application/document-dto.ts`
- Write validation helper exists in `apps/api/src/modules/documents/application/validate-document-write.ts`
- Document record persistence helper exists in `apps/api/src/modules/documents/infrastructure/persistence/document.repository.ts`
- `assembleDocumentWorkspace()` exists and now selects checkpoint from `current_checkpoint` or latest-version fallback, never `checkpoints[0]`

### Case API
- Case DTOs accept document inputs in `apps/api/src/modules/cases/application/cases.dto.ts`
- `createCaseUseCase()` and `submitRevisionUseCase()` validate document inputs
- `getCaseDetailUseCase()` returns `document_workspace`
- `cases.controller.ts` exposes document-aware case detail path and keeps legacy response shape
- `requireCaseAccess()` remains shared authz chokepoint

### Web types / shell
- `apps/web-1/types/case.ts` has document workspace types
- `useCaseDetails.ts` maps `document_workspace`
- `WorkspaceSidebar.tsx` updated for current workspace tabs
- `apps/web-1/app/dashboard/case/[id]/_components/documents/DocumentWorkspace.tsx` now renders selected checkpoint safely with inline unit/file sections

### Verification
- `npm --workspace apps/api test` ✅
- `npm --workspace apps/api run check-types` ✅
- `npm --workspace apps/web-1 run check-types` ✅

## Current status by phase

### Phase 01 — Backend contract and domain model
**Done.**
- Contract, URL validation, write allowlist, and selection invariants now enforced in code.
- Added coverage for checkpoint selection and write validation.

### Phase 02 — Schema migration and data backfill
**Done.**
- `document_records` table migration created and applied to Supabase
- Schema synced: `prisma migrate diff` returns empty
- Data migration for `unit_type` canonical alignment completed
- All `lifecycle_units` now use `unit_type: "version"` (aligned with spec)
- Backfill script exists but not yet run on real production data

### Phase 03 — API assembly and compatibility projections
**Done for current scope.**
- `getCaseDetailUseCase()` returns `document_workspace`.
- Legacy payload remains intact.
- Case detail path now routes through shared access check.

### Phase 04 — Workspace IA and UI refactor
**Done.**
- `DocumentWorkspace` wired into both dashboard and supporter case pages
- Legacy `TabIdeaContent` and `TabReportFindings` removed
- Tab structure updated: `"documents" | "discussion" | "timeline" | "settings"`
- `FileRow` now renders open/download actions when available
- `checkpoints[0]` fallback removed (invariant 7 compliance)
- `types/case.ts` cleaned up (removed dead `document_workspace` field from `Case` interface)

### Phase 05 — Validation, rollout, and cleanup
**Partially done.**
- Validation tests added and passing.
- Some cleanup remains if team wants to re-split UI components or remove extra legacy workspace shape.

### Phase 06 — Security hardening
**Done.**
- URL validation enforced on document writes.
- Client-writable fields stay constrained through DTO shape + validation.
- Reads remain case-scoped through shared access helper.
- **H2 fix:** Client URLs that classify to `"generated"` now rejected (reserved for server artifacts). Only `drive` + `cloudinary` allowed from client writes.
- **VERIFY-003 resolved:** No server proxy for downloads — all source kinds return direct URLs (Drive: `file_url`; Cloudinary: signed short-TTL `file_url`/`download_url`; Generated: `download_url`). Server never fetches user-supplied URLs, so no SSRF surface.

## Main gaps right now

### 1) Full release validation still pending
Need browser-level verify on real case pages if team wants visual proof.

### 2) Security hardening incomplete
- ~~H2: Client-supplied URLs classifying to `"generated"` not yet rejected~~ ✅ DONE
- ~~VERIFY-001: Response information disclosure~~ ✅ DONE (Option C: base shape + role extensions)
- ~~VERIFY-002: Cloudinary signed-URL policy~~ ✅ DONE (Approach 1: direct signed URLs, 2h TTL)
- ~~VERIFY-003: Download mechanism SSRF mitigation~~ ✅ DONE (Answer: no proxy — all source kinds return direct URLs to client; Cloudinary uses signed short-TTL URLs; server never fetches user-supplied URLs)
- Security regression tests: partially covered — `phase-01-boundaries.test.ts` tests `javascript:` scheme rejection (VULN-001) and H2 `generated` URL rejection; `data:` implicitly blocked by protocol allowlist. Missing: dedicated tests for mass-assignment rejection (VULN-002) and cross-case row drop (VULN-003).

### 3) Medium priority issues
- M1: Backfill script hardcodes Windows path
- M2: Backfill default `uploaderId` may violate FK
- ~~M3: `getCaseDocumentsHandler` wasteful~~ ✅ DONE
- ~~M4: Duplicate authorization path~~ ✅ DONE

## Recommended next step
1. Run real app verify on dashboard/supporter case pages.
2. If UI shape good, split inline doc workspace back into focused subcomponents.
3. Then finalize migration/backfill verification and cleanup dead legacy paths.

## Unresolved questions
- backfill strategy proof on real migrated rows
- whether to re-split document workspace UI now or later
- final policy for broken / expired external links
