# Plan Audit — Document Workspace Refactor

**Date:** 2026-07-01  
**Purpose:** Final verification before E2E testing

---

## Executive Summary

**All code-level implementation is COMPLETE.** The plan is ready for E2E browser testing.

### Critical/High Issues — ALL RESOLVED ✅

| Issue | Status | Resolution |
|-------|--------|------------|
| C1: unit_type filter mismatch | ✅ DONE | Aligned to `version`/`assessment` vocabulary |
| C2: Missing Prisma migration | ✅ DONE | Migration exists and applied |
| H1: DocumentWorkspace not wired | ✅ DONE | Rendered in both dashboard/supporter pages |
| H2: Generated URLs not rejected | ✅ DONE | Validation enforced |

### Security Hardening — ALL COMPLETE ✅

| Item | Status | Implementation |
|------|--------|----------------|
| VULN-001: URL scheme allowlist | ✅ DONE | `validateDocumentUrl` enforces `http:`/`https:` + host allowlists |
| VULN-002: Mass-assignment | ✅ DONE | `DocumentWriteInput` is explicit allowlist |
| VULN-003: Case-scoped reads | ✅ DONE | `findDocumentRecordsByCaseId` queries `where: { case_id }` |
| VERIFY-001: Response disclosure | ✅ DONE | Base shape + role extensions |
| VERIFY-002: Cloudinary signed URLs | ✅ DONE | Direct signed URLs, 2h TTL |
| VERIFY-003: Download SSRF | ✅ DONE | No proxy — direct URLs to client |

---

## Phase Status

### Phase 01 — Backend contract ✅ DONE
- Contract, URL validation, write allowlist, checkpoint selection — all implemented
- unit_type aligned to `version`/`assessment` across all code

### Phase 02 — Schema migration ✅ DONE (code-level)
- Migrations exist: `20260701000000_align_unit_type_to_spec`, `20260701000001_add_document_records`
- Backfill script exists but not run on real data

### Phase 03 — API assembly ✅ DONE
- `getCaseDetailUseCase()` returns `document_workspace`
- Legacy payload preserved
- `requireCaseAccess()` used

### Phase 04 — Workspace UI ✅ DONE
- `DocumentWorkspace` wired into both pages
- Legacy tabs removed
- Tab structure updated

### Phase 05 — Validation ✅ DONE (code-level)
- Tests exist and pass
- Type checks pass

### Phase 06 — Security hardening ✅ DONE
- All VULN and VERIFY items resolved

---

## Remaining Open Items

### Low Priority (only matter for production backfill)

1. **M1: Backfill script hardcodes Windows path**
   - Location: `apps/api/src/scripts/backfill-documents.ts:148`
   - Fix before running backfill on production

2. **M2: Backfill default `uploaderId` may violate FK**
   - Location: `backfill-documents.ts:155`
   - Fix before running backfill on production

### Medium Priority

3. **Security regression tests** — partially covered
   - ✅ `javascript:` scheme rejection — tested
   - ✅ H2 `generated` URL rejection — tested
   - ⚠️ Mass-assignment rejection — not explicitly tested (but implemented)
   - ⚠️ Cross-case row drop — not explicitly tested (but implemented)

### Require Browser Validation (you're doing this now)

4. **E2E testing:**
   - Document workspace renders correctly
   - Open/download actions work
   - Checkpoint navigation works
   - Legacy fields work for old cases

---

## Conclusion

**No blocking issues remain for E2E testing.**

All Critical and High severity issues are resolved. All security hardening items are complete. The plan is ready for browser validation.

**Next steps:**
1. ✅ You: E2E browser testing
2. ⏳ If E2E passes: Fix M1/M2 before production backfill
3. ⏳ If E2E passes: Run backfill on staging/dev
4. ⏳ If backfill passes: Deploy to production
