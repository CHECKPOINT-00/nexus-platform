# Phase 01 — Lock contracts and DB master data

## Context links
- Parent plan: `./plan.md`
- Brainstorm: `../reports/brainstorm-260701-1517-document-upload-mvp-summary.md`
- Checklist: `../reports/checklist-260701-1517-document-upload-mvp.md`
- Backend scout: `./research/researcher-01-backend-scout-report.md`
- Docs: `docs/code-standards.md`, `docs/system-architecture.md`

## Overview
- Date: 2026-07-01
- Description: Freeze schema, DTO, and type-option contracts before file upload work.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights
- Current revision path already writes lifecycle unit + document records: `apps/api/src/modules/cases/infrastructure/persistence/case.repository.ts:377`.
- Current validation still permits URL or file hybrid: `apps/api/src/modules/documents/application/validate-document-write.ts:19`.
- Document workspace read model already understands `cloudinary` source kind: `apps/api/src/modules/documents/domain/document-contract.ts:43`.
- Hardcoded document types still live in domain helper: `apps/api/src/modules/documents/domain/document-types.ts:13`.

## Requirements
- Add DB-backed `document_types` master data.
- Keep `document_records.doc_type` as string code in MVP.
- Expose read API for active type options.
- Split intake URL contract from post-intake multipart/file contracts.
- Define role/flow/unit-scope filtering rules for type lookup.
- Lock external-feedback metadata contract for MVP: `source`, optional `source_other_text`, `timing`, `selected_version_no`.

## Architecture
- Add `document_types` table to Prisma with fields: `code`, `label`, `direction`, `unit_scope`, `is_active`, `sort_order`.
- Seed canonical list from spec into DB.
- New documents query endpoint returns active options, optionally filtered by `direction`, `flow`, `unit_scope`, `role`.
- DTOs become explicit:
  - intake create-case: URL-based `documents`
  - revision upload: multipart file + metadata
  - supporter output upload: multipart file + metadata
  - evidence upload: multipart file + metadata
- External-feedback DTO metadata shape for MVP:
  - `source`: `lecturer` | `mentor` | `other`
  - `source_other_text?`: required only for `other`
  - `timing`: `pre_support` | `post_support`
  - `selected_version_no`: integer version selector
- Validation shifts from hardcoded enum list to DB-backed lookup for post-intake writes.

## Related code files
- Modify: `prisma/schema.prisma`
- Modify: `apps/api/src/modules/cases/application/cases.dto.ts`
- Modify: `apps/api/src/modules/documents/domain/document-types.ts`
- Modify: `apps/api/src/modules/documents/application/validate-document-write.ts`
- Create/update: migration files under Prisma workflow
- Create/update: documents module query endpoint/service files
- Create/update: seed/update script for document types

## Implementation Steps
1. Inspect current Prisma document-related models and confirm naming/relations.
2. Add `document_types` model and migration with minimal MVP fields.
3. Add seed/update script for canonical rows from spec.
4. Design response shape for type option API, including label/code/direction/unit scope.
5. Lock external-feedback metadata DTO and validation rules.
6. Replace hardcoded validation source with repository query for active types.
7. Split DTO contracts so intake stays URL-based while post-intake flows stop pretending URL/file are equivalent.
8. Add compatibility note for legacy records whose `doc_type` is not yet canonical.

## Todo list
- [ ] Add `document_types` Prisma model.
- [ ] Generate migration.
- [ ] Seed canonical document type rows.
- [ ] Add query/repository for active document types.
- [ ] Add document type read endpoint.
- [ ] Define filter params for type options.
- [ ] Update validation path to use DB-backed types.
- [ ] Preserve intake URL validation path.

## Success Criteria
- `document_types` exists with seeded canonical rows.
- API can return active type options for UI selects.
- Post-intake validation no longer relies on long hardcoded type list.
- Intake create-case behavior still accepts Drive/Docs links only.

## Risk Assessment
- Schema drift if old records use display labels instead of stable codes.
- Too much filtering logic in first pass can slow implementation.
- Endpoint contracts may shift after multipart parser constraints are known.

## Security Considerations
- Do not trust client-supplied direction or source kind when server can derive it.
- Reject inactive or out-of-scope type codes server-side.
- Keep intake URL validation narrow to allowed Drive/Docs hosts.

## Next steps
- Hand final contract to shared upload pipeline in Phase 02.
- Reuse type option API in Phase 05 UI forms.
