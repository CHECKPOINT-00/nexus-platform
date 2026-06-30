---
title: "Document workspace refactor"
description: "Refactor case workspace into checkpoint/unit/file document manager with compatible backend migration."
status: in_progress
priority: P2
effort: 6 phases / 6-9d
branch: ui/heroui-to-mantine
tags: [documents, workspace, api, prisma, migration, cloudinary]
created: 2026-06-30
---

# Document workspace refactor

## Summary
Refactor legacy `idea/report` workspace into document-first IA aligned with `Case -> Checkpoint -> Lifecycle Unit -> File`. Core implementation now exists and passes current code-level verification, but migration/backfill proof, rollout validation, and final security closure still remain.

## Context
- [Backend model research](./research/researcher-01-backend-model-report.md)
- [UI IA research](./research/researcher-02-ui-ia-report.md)
- [Scout report](./reports/scout-report.md)
- [Security review report](./reports/security-review.md)
- [Document spec](../../docs/case-documents/NEXUS_DOCUMENT_SYSTEM_COMPLETE_SPEC.md)

## Current reality
- [x] checkpoint selection rule implemented in code; no longer relies on `checkpoints[0]`
- [x] `document_workspace` contract shape exists in backend and web types, including `selected_checkpoint_id`
- [x] URL validation on document writes exists for current create/revision flows
- [x] write DTO path now constrains client-writable document fields for current scope
- [x] case detail read path uses shared access check for current document workspace response
- [ ] document identity and dedupe key for backfill/replay still needs real migration proof
- [ ] `is_primary` derivation rules still need validation on migrated legacy rows
- [ ] report mapping policy still needs validation on real data and mixed artifact cases
- [ ] mixed migrated + unmigrated merge rules still need proof against real sample matrix
- [ ] Drive vs Cloudinary behavior matrix still needs browser verification and final policy decisions
- [ ] malformed legacy row quarantine/audit path still needs real execution proof
- [ ] backfill idempotency / duplicate prevention still needs rerun validation
- [ ] rollback gate for storage success + normalized write failure still needs rehearsal
- [ ] polling/perf guardrails and refresh reassignment behavior still need validation
- [ ] accessibility and deep-link policy still need browser verification

## Phase list
1. [Phase 01 — Backend contract and domain model](./phase-01-backend-contract-and-model.md) — done in code, verified for current scope
2. [Phase 02 — Schema migration and data backfill](./phase-02-schema-migration.md) — partial; schema/code exists, real backfill proof still open
3. [Phase 03 — API assembly and compatibility projections](./phase-03-api-assembly-and-compatibility.md) — done for current scope, broader compatibility matrix still open
4. [Phase 04 — Workspace IA and UI refactor](./phase-04-workspace-ia-and-ui-refactor.md) — mostly done, browser-level verification still open
5. [Phase 05 — Validation, rollout, and cleanup](./phase-05-validation-rollout-and-cleanup.md) — partial; code-level checks passed, rollout/browser/matrix validation still open
6. [Phase 06 — Security hardening](./phase-06-security-hardening.md) — partial; core controls implemented, verification/policy items still open

## Critical dependencies
- Prove normalized file/document migration on real data, including rerun/idempotency and quarantine handling.
- Decide and verify final report artifact mapping into `aNN-vNN` on migrated rows.
- Keep legacy `intake_snapshot`, `round_history`, old tabs alive until rollout validation clears removal.
- Preserve shared workspace shell, chat, timeline, settings.
- Close remaining security verification items: response allowlist, Cloudinary URL policy, download/SSRF policy.

## Expected outcomes
- Document tree response by checkpoint, version unit, assessment unit, file.
- Workspace reads as document manager, not parsed content viewer.
- Cloudinary-backed files and Drive URLs coexist under one normalized model.
- Legacy cases remain readable during transition.
- Plan can be closed only after migration proof, browser validation, and remaining security decisions are verified.

## Major risks
- Legacy lifecycle data inconsistent with canonical `vNN` / `aNN-vNN`.
- API shape changes ripple through student/supporter workspaces.
- Migration may need fallback behavior for malformed old rows.

## Review focus
- Is report modeled as file artifact, record artifact, or both?
- Is checkpoint nav shape `Overview / Versions / Assessments` correct?
- Is additive migration acceptable before removing old fields?
