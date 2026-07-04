---
title: "Document upload MVP"
description: "Plan backend and frontend work for post-intake document uploads with DB-backed document types."
status: pending
priority: P2
effort: 24h
branch: ui/heroui-to-mantine
tags: [documents, upload, cloudinary, api, web]
created: 2026-07-01
---

# Document upload MVP plan

## Context
- Brainstorm: `E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/plans/reports/brainstorm-260701-1517-document-upload-mvp-summary.md`
- Checklist: `E:/FPT/Semester_7/EXE101/product-workspace/nexus-platform/plans/reports/checklist-260701-1517-document-upload-mvp.md`
- Research: `./research/researcher-01-backend-scout-report.md`, `./research/researcher-02-frontend-scout-report.md`

## Goal
Ship MVP where intake stays URL-based, while all post-intake document flows use managed file upload via Cloudinary for revision submit, supporter output, and external evaluation feedback artifacts that users upload into the document workspace.

## Phases
1. [pending] [Phase 01 — Lock contracts and DB master data](./phase-01-lock-contracts-and-db-master-data.md)
2. [pending] [Phase 02 — Build shared post-intake upload pipeline](./phase-02-build-shared-post-intake-upload-pipeline.md)
3. [pending] [Phase 03 — Upgrade revision submit flow](./phase-03-upgrade-revision-submit-flow.md)
4. [pending] [Phase 04 — Add supporter output and evidence flows](./phase-04-add-supporter-output-and-evidence-flows.md)
5. [pending] [Phase 05 — Add workspace UI modals and type-driven selects](./phase-05-add-workspace-ui-modals-and-type-driven-selects.md)
6. [pending] [Phase 06 — Verify behavior and document changes](./phase-06-verify-behavior-and-document-changes.md)

## Dependencies
- Phase 01 before Phases 02–05.
- Phase 02 before Phases 03–05.
- Phase 03 can land before Phase 04.
- Phase 05 depends on backend contracts from Phases 01–04.
- Phase 06 after all implementation phases.

## Key constraints
- Intake/create-case remains URL-only.
- Post-intake flows accept file upload only; no mixed URL/file payload.
- Upload first, DB write second, delete Cloudinary asset on DB failure.
- Keep existing workspace shell and document workspace read model.
- Keep payment proof isolated and image-only.

## Main touch areas
- `prisma/schema.prisma`
- `apps/api/src/modules/cases/**`
- `apps/api/src/modules/documents/**`
- `apps/api/src/modules/payments/**` (reuse only, no behavior merge)
- `apps/web-1/app/dashboard/case/[id]/**`
- `apps/web-1/app/supporter/case/[id]/**`
- `apps/web-1/app/admin/**`
- `docs/development-roadmap.md`
- `docs/project-changelog.md`

## Critical implementation details to lock during implementation
- Exact `document_types` rows and filter dimensions for each flow.
- External-feedback metadata contract locked for MVP:
  - `source`: `lecturer` | `mentor` | `other`
  - `source_other_text`: optional, required only when `source = other`
  - `timing`: `pre_support` | `post_support`
  - `selected_version_no`: required integer, default latest version
- File size limits per flow after MIME policy is locked.

## Validation Log

### Session 1 — 2026-07-01
**Trigger:** Initial plan validation after reviewing current document workspace UX and clarifying real business semantics with sample evaluation artifact paths.
**Questions asked:** 4

#### Questions & Answers

1. **[Architecture]** How should `document_types` options be filtered for post-intake forms?
   - Options: Server flow filter (Recommended) | Server broad list | No filter MVP
   - **Answer:** Server flow filter
   - **Rationale:** This keeps business filtering in backend, lets frontend request context-specific options with query params, and prevents wrong document types from appearing in the wrong flow.

2. **[Architecture]** When evidence upload targets an assessment but matching `aNN-vNN` unit does not exist, what should happen?
   - Options: Auto-create next (Recommended) | Require target unit | Attach to version
   - **Answer:** Auto-create next
   - **Rationale:** This preserves existing technical grouping by `assessment_units` while avoiding a broken UX when a user needs to upload external evaluation feedback for a selected version.

3. **[Scope]** What file policy should post-intake document uploads use for MVP?
   - Options: Docs+images+zip (Recommended) | Docs+PDF only | Same as payment
   - **Answer:** Custom narrow document policy — `pdf`, `docx`, `xlsx`, `pptx`, `md`, `txt`; payment proof remains image-only.
   - **Rationale:** Document lifecycle uploads need office/document formats, while payment proof remains a separate image-only domain with tighter validation.

4. **[Architecture / UX]** What does the `Đánh giá` tab actually represent in business terms?
   - Options: Nexus internal assessment artifacts | External evaluation feedback context (Recommended) | Mixed internal/external assessment bucket
   - **Answer:** External evaluation feedback context
   - **Custom input:** "feedback giảng viên, note mentor, pass/fail assessment, screenshot minh chứng" là chuyện riêng của lớp học của user; Nexus không chấm điểm hay làm mentor. User upload các nội dung đó để Nexus hiểu bức tranh vấn đề hiện tại. Thường sẽ có 2 file: đánh giá khi không đạt để Nexus hiểu vấn đề, và đánh giá sau khi qua hỗ trợ/đạt để lưu feedback, nhận xét giảng viên, làm bằng chứng cải thiện hệ thống và uy tín Nexus.
   - **Rationale:** This changes the whole UX and domain framing: `assessment_units` remain technical containers, but the tab must no longer read like Nexus is performing assessments or mentoring.

#### Confirmed Decisions
- Document type filtering: backend-owned query filtering — frontend passes needed query params.
- Missing assessment container: auto-create next `aNN-vNN` for selected version — preserve upload flow continuity.
- Upload MIME policy: document lifecycle allows `pdf`, `docx`, `xlsx`, `pptx`, `md`, `txt`; payment proof stays image-only.
- `Đánh giá` semantics: external evaluation feedback uploaded by users for problem understanding and outcome evidence — not Nexus-owned assessment.
- External-feedback MVP metadata: `source`, optional `source_other_text`, `timing`, `selected_version_no`; store at document-level, not only technical unit-level.

#### Action Items
- [x] Reframe evidence flow copy and requirements as external evaluation feedback context.
- [x] Update phase files to place upload action inside document workspace `Đánh giá` tab, not admin/supporter-only surfaces.
- [x] Add UX requirement to distinguish pre-support diagnostic feedback vs post-support outcome evidence.
- [x] Keep `assessment_units` only as technical grouping terminology in implementation notes.
- [x] Replace `Phiên bản`-first document IA with simpler 3-tab IA: `Tổng quan` / `Tài liệu` / `Đánh giá bên ngoài`.
- [x] Move version from primary navigation to table metadata/filter/sort in both document tables.
- [x] Map current components to target component responsibilities before implementation.

#### Impact on Phases
- Phase 02: lock MIME allowlist to `pdf`, `docx`, `xlsx`, `pptx`, `md`, `txt` for document lifecycle uploads; keep payment proof image-only.
- Phase 04: replace supporter/admin-owned evidence semantics with user-uploaded external evaluation feedback semantics; keep auto-create `aNN-vNN` as technical grouping for selected version.
- Phase 05: remove version-first workspace IA, keep `Tổng quan` plus two document tables (`Tài liệu`, `Đánh giá bên ngoài`), and expose version via column/filter/sort instead of sidebar + tab.
- Phase 06: add verification for external-feedback wording and grouped display expectations, not only raw upload success.

## Final IA decision
- Primary tabs inside document workspace:
  1. `Tổng quan`
  2. `Tài liệu`
  3. `Đánh giá bên ngoài`
- `Phiên bản` is no longer primary information architecture for MVP.
- `Phiên bản` stays as metadata on rows and as filter/sort control.
- `Đánh giá bên ngoài` remains separate because business meaning differs from Nexus support-flow documents.

## Wireframe

### 1) `Tổng quan`
```text
+-------------------------------------------------------------+
| Checkpoint selector (if >1)                                 |
+-------------------------------------------------------------+
| Summary cards                                                |
| [Tổng tài liệu] [Tài liệu hỗ trợ] [Đánh giá bên ngoài]      |
| [Phiên bản mới nhất] [Lần cập nhật gần nhất]                |
+-------------------------------------------------------------+
| Hoạt động chính                                              |
| - Bản sửa mới nhất: v03                                      |
| - Audit gần nhất: ...                                        |
| - Đánh giá ngoài mới nhất: sau hỗ trợ / giảng viên          |
+-------------------------------------------------------------+
| CTA theo vai trò                                             |
| User: Nộp bản sửa | Tải đánh giá bên ngoài                  |
| Supporter: Tải output hỗ trợ                                |
+-------------------------------------------------------------+
```

### 2) `Tài liệu`
```text
+-----------------------------------------------------------------------------------+
| Header: Tài liệu                                                                  |
| Mô tả: Tài liệu trong flow làm việc giữa user và supporter.                      |
| Actions: [Nộp bản sửa] [Tải output hỗ trợ]                                       |
+-----------------------------------------------------------------------------------+
| Search | Filter: loại tài liệu | giai đoạn | vai trò | phiên bản | Sort          |
+-----------------------------------------------------------------------------------+
| Table                                                                             |
| Tên file | Loại tài liệu | Giai đoạn | Vai trò | Phiên bản | Nguồn | Cập nhật | ... |
| ...                                                                               |
+-----------------------------------------------------------------------------------+
```

### 3) `Đánh giá bên ngoài`
```text
+------------------------------------------------------------------------------------------------+
| Header: Đánh giá bên ngoài                                                                     |
| Mô tả: Nhận xét, kết quả, minh chứng từ bên ngoài Nexus để hiểu vấn đề và kết quả sau hỗ trợ. |
| Action: [Tải đánh giá bên ngoài]                                                               |
+------------------------------------------------------------------------------------------------+
| Search | Filter: nguồn đánh giá | thời điểm | phiên bản | loại tài liệu | Sort                |
+------------------------------------------------------------------------------------------------+
| Group toggle: [Tất cả] [Trước hỗ trợ] [Sau hỗ trợ]                                             |
+------------------------------------------------------------------------------------------------+
| Table                                                                                          |
| Tên file | Nguồn đánh giá | Thời điểm | Phiên bản gắn với | Loại | Cập nhật | ...             |
| ...                                                                                            |
+------------------------------------------------------------------------------------------------+
```

## Component mapping: current -> target
- `apps/web-1/app/dashboard/case/[id]/_components/WorkspaceSidebar.tsx`
  - Current: primary rail + inner version list for documents.
  - Target: keep outer workspace rail only; remove document-version submenu entirely.
  - Change: delete `versions`, `selectedVersion`, `onVersionChange` props and document-copy that says "theo phiên bản và đánh giá".

- `apps/web-1/app/dashboard/case/[id]/_components/documents/DocumentWorkspace.tsx`
  - Current: tabs `Tổng quan` / `Phiên bản` / `Đánh giá`; `selectedVersion` drives highlight/filter feel.
  - Target: tabs `Tổng quan` / `Tài liệu` / `Đánh giá bên ngoài`.
  - Change: replace version-unit table with unified support-flow document table; rename assessment tab and rewrite copy; version becomes row metadata/filter, not navigation state.

- `apps/web-1/app/dashboard/case/[id]/page.tsx`
  - Current: owns `selectedVersion`, passes versions into sidebar, opens revision modal from page-level banner.
  - Target: stop owning version navigation state for document UX; keep modal ownership here if convenient, but trigger can also be surfaced from `DocumentWorkspace` CTA area.
  - Change: remove version-state plumbing unless reused as table default filter.

- `apps/web-1/app/supporter/case/[id]/page.tsx`
  - Current: mirrors same document workspace/version-sidebar behavior.
  - Target: same simplified IA as user workspace.
  - Change: remove version-state plumbing; add supporter-only upload CTA path for output documents.

- `apps/web-1/app/dashboard/case/[id]/_components/RevisionSubmitModal.tsx`
  - Current: URL/Drive list modal, disconnected from new document-table IA.
  - Target: file-upload modal launched from `Tài liệu` tab CTA.
  - Change: switch from free-text/link rows to typed multipart upload form using backend document type options.

- `apps/api/src/modules/documents/application/assemble-document-workspace.ts`
  - Current: read model centered on `version_units` and `assessment_units`; assessment view currently tied to `assessment_report` semantics.
  - Target: still can keep technical units internally, but API/web mapper must support 2 business collections for UI: support-flow documents vs external-evaluation documents.
  - Change: add UI-friendly flattening/grouping metadata without rewriting lifecycle storage model.

- `apps/web-1/types/case.ts`
  - Current: types mirror checkpoint overview + version/assessment units.
  - Target: extend types for flattened table rows / display metadata if frontend should avoid recomputing joins.
  - Change: add fields for `version_label`, `stage_label`, `external_source`, `feedback_timing`, `business_bucket` or equivalent.

## Final component strategy
- Keep existing outer workspace shell.
- Keep checkpoint switcher.
- Remove inner version sidebar.
- Keep technical `version_units` / `assessment_units` in backend if cheaper.
- Add UI-facing flatten layer for tables.
- Keep MVP simple: two tables, clear labels, strong filters, no extra nested navigation.
- External-feedback metadata contract for implementation:
  ```ts
  {
    source: "lecturer" | "mentor" | "other";
    source_other_text?: string | null;
    timing: "pre_support" | "post_support";
    selected_version_no: number;
  }
  ```
- Validation rule:
  - `source_other_text` required only when `source = "other"`
  - `selected_version_no` required and must exist in case checkpoint versions
  - default selected version in UI = latest version
- Storage rule:
  - keep metadata at document level (JSON/metadata field acceptable for MVP)
  - `assessment_unit` stays technical container only

## Done when
- Intake path unchanged.
- Revision, supporter output, evidence uploads work through Cloudinary-backed multipart endpoints.
- UI uses modal actions with API-driven type options.
- Tests cover happy path, guard path, and upload cleanup path.
- Roadmap/changelog updated to match shipped scope.
