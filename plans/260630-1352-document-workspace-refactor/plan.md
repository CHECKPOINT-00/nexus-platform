---
title: "Document workspace refactor"
description: "Refactor case workspace into checkpoint/unit/file document manager with compatible backend migration."
status: pending
priority: P2
effort: 5 phases / 5-8d
branch: ui/heroui-to-mantine
tags: [documents, workspace, api, prisma, migration, cloudinary]
created: 2026-06-30
---

# Document workspace refactor

## Summary
Refactor legacy `idea/report` workspace into document-first IA aligned with `Case -> Checkpoint -> Lifecycle Unit -> File`. Backend-first, compatibility-safe, no immediate implementation in this plan.

## Context
- [Backend model research](./research/researcher-01-backend-model-report.md)
- [UI IA research](./research/researcher-02-ui-ia-report.md)
- [Scout report](./reports/scout-report.md)
- [Document spec](../../docs/case-documents/NEXUS_DOCUMENT_SYSTEM_COMPLETE_SPEC.md)

## Must decide before coding
- [ ] checkpoint selection rule for all read/write flows; never rely on `checkpoints[0]`
- [ ] document identity and dedupe key for backfill/replay (`source_kind`, source handle, canonical name, seq, unit ownership)
- [ ] `is_primary` derivation rules for multi-file units and duplicate legacy URLs
- [ ] report mapping policy: `report` row only, document artifact only, or hybrid with invariant rules
- [ ] `document_workspace` contract invariants: required fields, `null` vs `[]`, sort guarantees, empty-state semantics
- [ ] mixed migrated + unmigrated case merge rules to avoid double counting and contradictory `latest_report` / `round_history`
- [ ] Drive vs Cloudinary behavior matrix for open, download, visibility, signed/public URL, and broken-link UX
- [ ] malformed legacy row policy: quarantine, audit log, fallback read behavior, and operator repair path
- [ ] backfill idempotency strategy: rerun-safe upsert key, duplicate prevention, and audit checks
- [ ] rollback gate if storage upload succeeds but normalized document write fails mid-flow
- [ ] polling/perf guardrails for enlarged case-detail payloads and dynamic version reassignment after refresh
- [ ] accessibility and deep-link policy for checkpoint/section/version/assessment navigation

## Phase list
1. [Phase 01 — Backend contract and domain model](./phase-01-backend-contract-and-model.md) — pending
2. [Phase 02 — Schema migration and data backfill](./phase-02-schema-migration.md) — pending
3. [Phase 03 — API assembly and compatibility projections](./phase-03-api-assembly-and-compatibility.md) — pending
4. [Phase 04 — Workspace IA and UI refactor](./phase-04-workspace-ia-and-ui-refactor.md) — pending
5. [Phase 05 — Validation, rollout, and cleanup](./phase-05-validation-rollout-and-cleanup.md) — pending

## Critical dependencies
- Decide normalized file/document record model.
- Decide report artifact mapping into `aNN-vNN`.
- Keep legacy `intake_snapshot`, `round_history`, old tabs alive until migrated.
- Preserve shared workspace shell, chat, timeline, settings.

## Expected outcomes
- Document tree response by checkpoint, version unit, assessment unit, file.
- Workspace reads as document manager, not parsed content viewer.
- Cloudinary-backed files and Drive URLs coexist under one normalized model.
- Legacy cases remain readable during transition.

## Major risks
- Legacy lifecycle data inconsistent with canonical `vNN` / `aNN-vNN`.
- API shape changes ripple through student/supporter workspaces.
- Migration may need fallback behavior for malformed old rows.

## Review focus
- Is report modeled as file artifact, record artifact, or both?
- Is checkpoint nav shape `Overview / Versions / Assessments` correct?
- Is additive migration acceptable before removing old fields?
