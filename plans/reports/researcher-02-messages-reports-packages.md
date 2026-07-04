---
name: researcher-02-messages-reports-packages
description: Backend messaging, reports, packages, and attachment/reference persistence map
metadata:
  type: reference
---

Backend contract map for messages, reports, packages, and attachment/reference semantics.

## Confirmed files
- `apps/api/src/modules/cases/http/cases.controller.ts`
- `apps/api/src/modules/cases/application/send-message.usecase.ts`
- `apps/api/src/modules/cases/application/list-messages.usecase.ts`
- `apps/api/src/modules/reports/http/reports.routes.ts`
- `apps/api/src/modules/reports/http/reports.controller.ts`
- `apps/api/src/modules/reports/application/approve-report.usecase.ts`
- `apps/api/src/modules/supporter/application/publish-report.usecase.ts`
- `apps/api/src/modules/packages/http/packages.controller.ts`
- `apps/api/src/modules/packages/application/list-packages.usecase.ts`
- `apps/api/src/modules/packages/infrastructure/persistence/package.repository.ts`

## Key implications
- Messaging belongs to cases module.
- Report publish has duplicate orchestration across reports/supporter.
- Package list seeds defaults when DB empty.
- No dedicated attachment/reference backend surface was confirmed in explored API.

## Best phase splits
- Messaging phase: cases controller/usecases/repository.
- Report phase: reports routes/controller/usecases/repository.
- Supporter publish bridge: supporter publish usecase/controller.
- Package phase: packages controller/usecase/repository/domain.

## Regression targets
1. GET/POST case messages auth + response payload.
2. Report draft lifecycle and publish guard.
3. Package empty-DB seed once behavior.
4. Preserve existing `document_id` / `file_url` consumers.

## Unresolved questions
- Hidden attachment/reference table in Prisma?
- Single source of truth for publish authority: reports or supporter?
- Attachment/reference modeled as metadata, report payload, or new domain object?
