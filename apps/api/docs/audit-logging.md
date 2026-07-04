# Backend Audit Logging

## Overview
Structured JSON audit logging for all demo-critical operations.

## Format
```typescript
{
  "timestamp": "2026-06-29T21:40:00.000Z",
  "level": "INFO" | "WARN" | "ERROR",
  "operation": "admin.accept_case",
  "actor_id": "user-123",
  "actor_role": "admin",
  "case_id": "case-456",
  "resource_type": "case",
  "resource_id": "case-456",
  "action": "accepted",
  "old_state": { "stage": "submitted", "status": "triage_pending" },
  "new_state": { "stage": "under_review", "status": "accepted_unassigned" },
  "duration_ms": 42
}
```

## Logged Operations

### Admin Operations
- `admin.accept_case` - Case acceptance with idempotent no-op tracking
- `admin.reject_case` - Case rejection with reason
- `admin.request_more_info` - Request clarification from student
- `admin.assign_supporter` - Supporter assignment/unassignment

### Case Operations  
- `case.assign_supporter` - Assignment changes with old/new state
- `case.status_update` - Stage/status transitions
- `case.create` - Case creation (via CaseEvent)
- `case.revision_submit` - Revision submissions (via CaseEvent)

### Report Operations
- `report.approve` - Report publish with draft→approved transition
- `report.generate` - AI draft generation (via CaseEvent)
- `report.edit` - Draft edits (via CaseEvent)

### Payment Operations
- `payment.proof_uploaded` - Proof of payment upload (via CaseEvent)
- `payment.verified` - Admin verification (via CaseEvent)

## Key Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `operation` | Canonical operation name | `admin.accept_case` |
| `action` | Specific action taken | `accepted`, `no_op`, `invalid_status` |
| `old_state` | State before operation | `{ stage: "submitted" }` |
| `new_state` | State after operation | `{ stage: "under_review" }` |
| `duration_ms` | Operation duration | `42` |
| `error_code` | Error code if failed | `VALIDATION_ERROR` |

## Usage

```typescript
import { auditLogger } from "../../../shared/infrastructure/audit-logger.js";

const timer = auditLogger.startTimer();

// ... operation logic ...

auditLogger.log({
  operation: "admin.accept_case",
  actor_id: userId,
  case_id: caseId,
  action: "accepted",
  old_state: { stage: oldStage },
  new_state: { stage: newStage },
  duration_ms: timer(),
});
```

## Filtering

- Logs are disabled in `NODE_ENV=test`
- All logs are JSON formatted for easy parsing
- Use `level: "WARN"` for validation failures
- Use `level: "ERROR"` for system failures
