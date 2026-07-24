# Scout report — document workspace refactor

## Inputs reviewed
- `docs/case-documents/NEXUS_DOCUMENT_SYSTEM_COMPLETE_SPEC.md`
- `docs/codebase-summary.md`
- `docs/code-standards.md`
- `docs/system-architecture.md`
- `docs/project-overview-pdr.md`
- backend case detail / revision / repository flow
- workspace shell components in `apps/web-1`

## Core mismatch found
Spec says document system is:

```text
Case -> Checkpoint -> Lifecycle Unit -> File
```

Current product code is closer to:

```text
Case -> Checkpoint -> Lifecycle Unit (+ JSON content + single file_url)
```

This mismatch creates most current UI/IA problems.

## UI mismatch summary
- current top-level split `idea` vs `report` is legacy view-model, not document-model
- sidebar mixes nav and version selection
- `TabIdeaContent` manages parsed content summary, not files
- `TabReportFindings` manages parsed report JSON, not file/url inventory
- chat, timeline, settings are mostly healthy separate domains

## Backend mismatch summary
- no first-class file/document record table
- lifecycle units mix semantic types (`intake`, `revision`) with pseudo-version codes
- no canonical `aNN-vNN` creation flow
- case detail API returns old workspace shape, not checkpoint/unit/file tree
- revision/intake write paths persist document arrays in JSON blobs

## Safe planning guardrails
1. Preserve shared workspace shell and role routing.
2. Preserve chat/timeline/settings domains for first pass.
3. Treat document refactor as data-contract-first task, not cosmetic tab rename.
4. Introduce normalized document records before large UI assembly.
5. Keep migration/fallback layer for legacy intake snapshot and old report data during transition.

## Recommended target narrative
- one top-level domain: `Tài liệu`
- secondary nav by checkpoint: `CP1`, later `CP2`
- inside checkpoint: `Tổng quan`, `Versions`, `Assessments`
- main pane shows file/url inventory + metadata + open/download actions
- no content-summary-first rendering in document manager

## Highest-risk areas
- Prisma/schema migration
- `GET /cases/:id` response shape migration
- revision submit / case create persistence
- report artifact mapping into assessment model
- backward compatibility for current workspace pages and tests

## Unresolved questions
- final migration strategy for existing legacy lifecycle units and report rows
- exact uploader flow split: Drive URL vs Cloudinary upload vs generated asset
