# Phase 06 — Verify behavior and document changes

## Context links
- Parent plan: `./plan.md`
- Checklist tests: `../reports/checklist-260701-1517-document-upload-mvp.md`
- Docs policy: `docs/development-roadmap.md`, `docs/project-changelog.md`, `docs/system-architecture.md`

## Overview
- Date: 2026-07-01
- Description: Run targeted verification, fix regressions, and update project docs after implementation lands.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights
- Repo rules require compile checks after edits, tests before finish, and doc updates after feature work.
- No strong test coverage appears around current document workspace flows, so targeted additions matter.

## Requirements
- Add unit/integration tests for type validation, upload cleanup, revision upload, supporter output upload, external evaluation feedback upload, guard failures, intake compatibility, payment proof image-only guard.
- Verify external-feedback metadata contract works end-to-end: `source`, conditional `source_other_text`, `timing`, `selected_version_no`.
- Verify inner document IA no longer duplicates version as sidebar + tab + table primary classifier.
- Verify `Đánh giá bên ngoài` wording and grouping no longer imply Nexus-owned assessment.
- Verify version works as metadata/filter/sort in tables.
- Run compile/lint/test commands relevant to touched apps.
- Update roadmap/changelog and any architecture docs changed by final design.
- Run code review after implementation.

## Architecture
- Keep tests close to modules they verify.
- Prefer integration tests around controller/use-case seams for multipart flows.
- Add focused unit tests for rollback helper and DB-backed type validation.
- <!-- Updated: Validation Session 1 - semantics verification --> Verification should cover both technical correctness and user-facing semantics for external evaluation feedback artifacts.
- Docs should describe actual shipped behavior only.

## Related code files
- Modify/create: API test files around cases/documents/payments
- Modify/create: Web test files if frontend testing setup exists for hooks/modals
- Modify: `docs/development-roadmap.md`
- Modify: `docs/project-changelog.md`
- Possibly modify: `docs/system-architecture.md`, `docs/code-standards.md`

## Implementation Steps
1. Add backend unit tests for document type validation and upload rollback.
2. Add integration tests for revision/output/external-feedback endpoints and guard paths.
3. Add regression test for intake URL-only path.
4. Add regression test for payment proof image-only policy if not already covered.
5. Add UI verification that `Đánh giá` messaging and grouping communicate external feedback semantics.
6. Run compile/lint/tests and fix failures.
7. Run code review and apply necessary corrections.
8. Update docs to reflect shipped scope and constraints.

## Todo list
- [ ] Add type validation tests.
- [ ] Add cleanup-on-fail tests.
- [ ] Add revision integration test.
- [ ] Add supporter output integration test.
- [ ] Add external-feedback integration test.
- [ ] Add validation test for `source_other_text` conditional rule.
- [ ] Add validation test for `selected_version_no` existence rule.
- [ ] Add forbidden role/stage tests.
- [ ] Add intake compatibility test.
- [ ] Add payment proof guard test.
- [ ] Verify removal of duplicate version-first navigation in UI.
- [ ] Verify `Đánh giá bên ngoài` microcopy/grouping in UI.
- [ ] Verify table filters/sort for version and external-feedback metadata.
- [ ] Run compile/lint/tests.
- [ ] Update roadmap/changelog.
- [ ] Run code review.

## Success Criteria
- All targeted tests pass.
- Compile/lint pass for touched apps.
- Docs match shipped behavior.
- Inner document IA is simpler and no longer duplicates version as main classifier in 3 places.
- `Đánh giá bên ngoài` UX no longer implies Nexus-owned classroom assessment.
- Review does not find blocking issues.

## Risk Assessment
- Multipart endpoint tests may be slower/harder to wire than JSON route tests.
- Existing unrelated failures can obscure signal; keep verification targeted first, then broader if needed.
- Doc updates can drift if implementation changes late.

## Security Considerations
- Verification must include unauthorized-role cases and malformed file cases.
- Ensure rollback tests cover orphaned upload prevention.
- Docs should not reveal sensitive storage internals beyond needed architecture detail.

## Next steps
- After approval, implement in order: Phase 01 → 02 → 03 → 04 → 05 → 06.
