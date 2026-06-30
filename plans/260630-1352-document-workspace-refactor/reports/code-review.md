# Code review — document workspace refactor

**Date:** 2026-07-01
**Scope:** `plans/260630-1352-document-workspace-refactor/` — working-tree changes on `ui/heroui-to-mantine`
**Reviewer method:** Read full `git diff`, all new `apps/api/src/modules/documents/**` files, modified case/report repositories, web types/hooks/pages, and the new `DocumentWorkspace.tsx` component. Ran `npm --workspace apps/api test`, `npm --workspace apps/api run check-types`, and `npm --workspace apps/web-1 run check-types` locally.
**Supersedes / corrects:** `implementation-status.md` (two inaccurate claims — see §"Corrections to implementation-status.md").

---

## Executive summary

The refactor's **architecture and core security controls are sound** — all three High findings from `security-review.md` (VULN-001 URL scheme allowlist, VULN-002 write-field allowlist, VULN-003 case-scoped reads) are addressed in the write/read paths, and the contract spec is high quality.

However, the feature is **not yet runnable end-to-end**, and `implementation-status.md` overstates verification. Real verification found:

1. **2 unit tests FAIL** (Phase 01 workspace assembly) — the report claims tests pass.
2. **No Prisma migration exists** for the `document_records` table → every `prisma.documentRecord.*` call crashes at runtime against a real DB.
3. **The new `DocumentWorkspace.tsx` UI is written but never wired into either case page** → `document_workspace` data is fetched and exposed by the hook but never rendered; students/supporters still see the legacy `TabIdeaContent` / `TabReportFindings`.

One Critical functional bug causes both test failures: revision lifecycle units are created with `unit_type: "outbound"` but the workspace assembly filters for `intake`/`revision` only, so **every revision and its documents are silently dropped** from the document tree.

**Net status:** Phase 01/03 backend contract is structurally complete and type-safe; Phase 02 (migration) and Phase 04 (UI) are **not delivered** despite the report saying they are "mostly done". Plan `status: in_progress` is correct and should stay that way.

---

## Actual verification results

| Command | Real result | `implementation-status.md` claim |
|---------|-------------|----------------------------------|
| `npm --workspace apps/api test` | ❌ **3 subtests FAIL** (35 tests: 32 pass / 3 fail) | ✅ "test pass" |
| `npm --workspace apps/api run check-types` | ✅ pass | ✅ |
| `npm --workspace apps/web-1 run check-types` | ✅ pass | ✅ |

Failing subtests (both same root cause — see C1):
- `not ok 6` — `document workspace assembly - selects checkpoint and counts all files` → `1 !== 2` (cp-2's `outbound` unit dropped, total_files undercounts).
- `not ok 10` — `document workspace assembly - keeps mixed source actions and broken files visible` → `version_units[0]` is `undefined`, crashes accessing `.files`.

The third failure is the parent suite rollup (`2 subtests failed`).

---

## Corrections to `implementation-status.md`

Two claims in the existing report are inaccurate and should be fixed before this plan is used as a decision basis:

1. **"Verification → `npm --workspace apps/api test` ✅"** — incorrect. The test command currently fails with 3 failing subtests (see above). Phase 01's status line "Done." should read "Done in code, but assembly test fails due to outbound-unit filter mismatch (C1)."
2. **"Document workspace UI now renders from new contract and selected checkpoint state."** — the component (`DocumentWorkspace.tsx`) exists and is internally correct, but **no page imports or renders it**. Both `dashboard/case/[id]/page.tsx` and `supporter/case/[id]/page.tsx` still render only `TabIdeaContent` / `TabReportFindings`. The dashboard page does not even destructure `documentWorkspace` from the hook. Phase 04 should be "Component written, not wired in (H1)."

---

## Critical (block — feature does not run)

### [C1] Revision units are invisible in the document workspace + 2 tests fail
**Location:** `apps/api/src/modules/documents/application/assemble-document-workspace.ts:119` (filter) and `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts:407` (write).
**Evidence:**
```ts
// case.repository.ts:402-408 — revision created as "outbound"
const revisionUnit = await tx.lifecycleUnit.create({
  data: { ... unit_code: `v0${nextVersion}`, unit_type: "outbound", version_no: nextVersion, ... },
});

// assemble-document-workspace.ts:119 — filter excludes "outbound"
const versionUnits = units.filter((u) => u.unit_type === 'intake' || u.unit_type === 'revision');
```
**Impact:** Every revision a student submits creates a lifecycle unit + document records that the document workspace assembly **drops**. The `version_units` array for that checkpoint omits the revision entirely, so its documents never appear. This is also why both assembly tests fail (the `outbound` test unit is filtered out, undercounting files / producing an empty `version_units`).
**Note on `unit_type` canonical values:** There are currently three divergent vocabularies — the spec doc (`NEXUS_DOCUMENT_SYSTEM_COMPLETE_SPEC`) says `version`/`assessment`; the code writes `intake`/`outbound`; the filter expects `intake`/`revision`. This must be reconciled to one canonical set.
**Fix (choose one):**
- **(a) Minimal & safe:** widen the filter to include `outbound`:
  ```ts
  const versionUnits = units.filter(
    (u) => u.unit_type === 'intake' || u.unit_type === 'revision' || u.unit_type === 'outbound',
  );
  ```
- **(b) Cleaner but needs data migration:** change `submitCaseRevision` to write `unit_type: "revision"`, and backfill existing `outbound` rows to `revision`. Also reconcile against the spec's `version`/`assessment` vocabulary.
After either fix, re-run `npm --workspace apps/api test` — both failing subtests should pass.

### [C2] No Prisma migration for the `document_records` table
**Location:** `prisma/schema.prisma` defines `model DocumentRecord @@map("document_records")`, but `prisma/migrations/20260625074649_init_business_models/migration.sql` contains no `CREATE TABLE "document_records"` (confirmed by grep).
**Impact:** `prisma generate` produces the TS types (so `check-types` passes), but the database has no such table. Every `prisma.documentRecord.*` call — intake creation, revision creation, report publish (`upsertReportArtifactDocumentRecord`), case detail read (`findDocumentRecordsByCaseId`), and the backfill script — will throw `relation "document_records" does not exist` against a real DB. The feature is not deployable as-is.
**Fix:** Run `npx prisma migrate dev --name add_document_records` to generate and apply the migration **before any deploy or real backfill run**. This is the concrete artifact that Phase 02's "real migration proof" gate is waiting on.

---

## High

### [H1] `document_workspace` is fetched but never rendered on the frontend
**Location:** `apps/web-1/app/dashboard/case/[id]/hooks/useCaseDetails.ts:59` exposes `documentWorkspace`; `apps/web-1/app/dashboard/case/[id]/_components/documents/DocumentWorkspace.tsx` is a complete component; but `apps/web-1/app/dashboard/case/[id]/page.tsx` and `apps/web-1/app/supporter/case/[id]/page.tsx` neither import nor render it.
**Impact:** The entire Phase 04 UI refactor is not actually delivered to users. The dashboard page doesn't even destructure `documentWorkspace` from the hook. Users still see legacy `TabIdeaContent` / `TabReportFindings`, and the new contract data is dead payload on every 10s refetch.
**Fix:** Import `DocumentWorkspace` into both pages and render it in the document tab, passing `documentWorkspace` from the hook (and destructuring it in the dashboard page).

### [H2] `source_kind: "generated"` accepts arbitrary external URLs from clients
**Location:** `apps/api/src/modules/documents/domain/document-types.ts:117-133` (`deriveSourceKindFromUrl`) and `apps/api/src/modules/documents/application/document-dto.ts:144` (`validateDocumentUrl` for `generated` — scheme-only, no host restriction).
**Impact:** Any URL not on drive/docs/res.cloudinary.com is classified `"generated"` and accepted as long as scheme is `http`/`https`. A student can submit `https://evil.com/malware.pdf`; it is persisted as a `"generated"` document and later rendered as a clickable external link. Not XSS (scheme allowlist blocks `javascript:`), but it breaks the source-kind model (`"generated"` is meant to be server-produced report artifacts) and opens a phishing / arbitrary-external-link surface. This is the write-side counterpart of `security-review.md` VERIFY-003.
**Fix:** Reject client-supplied URLs that classify to `"generated"` (only allow `drive` + `cloudinary` from client writes); reserve `"generated"` for server-produced artifacts. Or add an explicit host allowlist for the legitimate generated case.

---

## Medium

### [M1] Backfill script hardcodes an absolute Windows path
**Location:** `apps/api/src/scripts/backfill-documents.ts:148` — quarantine log path is `E:\FPT\Semester_7\...\reports\backfill-quarantine.json`.
**Impact:** Not portable; breaks on other machines, CI, or Linux.
**Fix:** Resolve from `process.cwd()` / `import.meta.url`, or accept the path via env/CLI arg.

### [M2] Backfill default `uploaderId = 'system'` will violate FK
**Location:** `backfill-documents.ts:155` — defaults to `'system'`, but `uploaded_by_auth_user_id` is a FK to `users.id` (`onDelete: Cascade`).
**Impact:** If no user row with id `'system'` exists, every `create` branch of the upsert fails with an FK violation.
**Fix:** Require the uploader id explicitly (fail fast if missing), or resolve a real admin/system user id.

### [M3] `getCaseDocumentsHandler` pulls the entire case then discards it
**Location:** `apps/api/src/modules/cases/http/cases.controller.ts:106-123` — the `/cases/:id/documents` endpoint calls the full `getCaseDetailUseCase` (owner, members, events, payments, reports, lifecycle units) and returns only `document_workspace`.
**Impact:** Wasteful, and combined with the hook's `refetchInterval: 10000` it amplifies load.
**Fix:** Add a lightweight usecase that loads only checkpoints + lifecycle_units + document_records, or accept a projection flag on `getCaseDetailUseCase`.

### [M4] Duplicate authorization path (inline + `requireCaseAccess`)
**Location:** `get-case-detail.usecase.ts:77-84` re-implements owner/member/supporter/admin checks inline, while the controller already calls `requireCaseAccess` (`cases.controller.ts:86`). This is the exact pattern `security-review.md` VULN-003 flagged.
**Impact:** Two divergent authz code paths; risk of drift.
**Fix:** Collapse to one chokepoint — drop the inline check and rely on `requireCaseAccess`, or move all authz into the usecase and drop the controller call.

---

## Low / hygiene

- **[L1]** `DocumentWorkspace.tsx:28` falls back to `workspace.checkpoints[0]`, violating contract invariant 7 ("NEVER use `checkpoints[0]`"). Prefer `selected_checkpoint_id`; render empty state if no match. Low risk in UI, but inconsistent with the contract.
- **[L2]** `DocumentWorkspace.tsx:210-226` (`FileRow`) displays files but renders no open/download action — `open_action`, `download_action`, `file_url`, `download_url` are unused. Even once wired in, users cannot open/download files. Render an anchor with `target="_blank" rel="noopener noreferrer"` when `open_action` is non-null.
- **[L3]** `apps/web-1/types/case.ts:34` places `document_workspace?: DocumentWorkspace` on the `Case` interface, but the API returns `document_workspace` at the top level (sibling of `case`, not inside it). The hook reads it correctly (`caseQuery.data?.document_workspace`); the field on `Case` is dead/misleading. Remove it from `Case`, keep `DocumentWorkspace` as a standalone type.
- **[L4]** `assemble-document-workspace.ts:97` seeds `let selected = checkpoints[0]` before the loop. For multi-checkpoint the loop overrides it, but for single-checkpoint it returns `[0]` (acceptable since only one exists) — still technically violates the letter of invariant 7. Seed `null` and let the loop select: `let selected = null; for (...) { if (!selected || cp.latest_version_no > selected.latest_version_no) selected = cp; ... }`.
- **[L5]** `case.repository.ts:338-346` (`findLatestIntakeUnit`) queries `where: { case_id, unit_code: "intake" }`, but `unit_code` is `"v00"` and the intake discriminator is `unit_type: "intake"` (or `unit_code: "v00"`). Pre-existing, not introduced by this diff; the new read path uses `findFirstIntakeUnit` instead. Flagged for later cleanup.
- **[L6]** `assemble-document-workspace.ts:106` compares `checkpoint.latest_assessment_no > selected.latest_assessment_no` directly, while `submit-revision.usecase.ts:46` uses `?? 0`. The local type declares `number` (and the column has `DEFAULT 0`), so it works with Prisma data, but null-ish values would NaN-compare. Standardize on `?? 0`.

---

## What was done well

- **VULN-001 (stored XSS via URL scheme) — addressed.** `validateDocumentUrl` enforces `protocol ∈ {http:, https:}` plus per-source host allowlists (Drive → `drive.google.com`/`docs.google.com`; Cloudinary → `res.cloudinary.com` + cloud-name path segment). The write-validation test (`not ok` #7) passes.
- **VULN-002 (mass-assignment) — addressed.** `DocumentWriteInput` is an explicit client-writable allowlist; `buildDocumentRecordInput` derives all identity/ownership fields (`case_id`, `checkpoint_id`, `lifecycle_unit_id`, `uploaded_by_auth_user_id`, `is_primary`, `seq`, `source_kind`, `canonical_name`, `cloudinary_public_id`) server-side. Separation is clean.
- **VULN-003 read-side — addressed.** `findDocumentRecordsByCaseId` queries `where: { case_id }` (case-scoped, no cross-case join on `lifecycle_unit_id`/`checkpoint_id`), and the case-detail controller routes through `requireCaseAccess`. (The remaining authz duplication is M4, not a leak.)
- **Checkpoint selection rule** implements the intended invariant (prefer `current_checkpoint`, else highest `latest_version_no`, tie-break on `latest_assessment_no`). Only the `[0]` seed (L4) needs tidying.
- **Report artifact mapping** is wired correctly: `publishReport` → `upsertReportArtifactDocumentRecord` inside the same transaction, with a stable id `report-artifact-<reportId>` → idempotent on re-publish.
- **Contract spec** (`document-contract.ts`) is thorough — 13 explicit invariants covering nullability, empty states, identity keys, unit semantics, and source-aware behavior. High-quality source of truth.
- **Backfill script** has quarantine logging and idempotent upserts via stable hash ids — the right shape for Phase 02's rerun-safety gate (modulo M1/M2).

---

## Recommended action priority

| # | Severity | Task | Why now |
|---|----------|------|---------|
| 1 | 🔴 C1 | Fix `buildVersionUnits` filter (or change `unit_type` to `revision`) and re-run tests | Feature broken + tests red immediately |
| 2 | 🔴 C2 | Generate + apply `document_records` Prisma migration | No table = whole feature crashes at runtime |
| 3 | 🟠 H1 | Wire `DocumentWorkspace` into both case pages | Phase 04 not actually delivered |
| 4 | 🟠 H2 | Reject client URLs classifying to `"generated"` | Policy gap / phishing surface |
| 5 | 🟡 M1–M4 | Backfill path, uploader id, perf handler, authz consolidation | Before any real backfill run |
| 6 | 🟢 L1–L6 | UI hygiene, type cleanup, invariant consistency | When re-splitting the UI component |

---

## Open questions for the team

- Which `unit_type` vocabulary is canonical — `intake`/`outbound` (current write), `intake`/`revision` (current filter), or `version`/`assessment` (spec)? Decide once, align write + filter + spec.
- Should the document workspace UI fully replace the legacy `TabIdeaContent`/`TabReportFindings` now, or coexist behind a feature flag until browser validation passes?
- Is the `/cases/:id/documents` endpoint intended for polling, or is the embedded `document_workspace` on the main detail response enough? (Affects M3.)

---

## Bottom line

The plan's security and domain-design foundations are correct and the three High security findings are closed. But the feature is **not runnable today**: a unit-filter mismatch drops all revisions (C1, red tests), the DB table does not exist (C2), and the new UI is not mounted (H1). `implementation-status.md` should be corrected on its two inaccurate "done/pass" claims. Keep `plan.md` `status: in_progress` until C1, C2, and H1 are resolved and the test suite is green again.
