# Backend Demo Test Execution Guide

## Running Tests

```bash
# Run all tests
cd apps/api
npm test

# Run with coverage (experimental)
npm run test:coverage

# Run specific phase
node --test src/shared/infrastructure/tests/phase-01-boundaries.test.ts
node --test src/shared/infrastructure/tests/phase-02-lifecycle.test.ts
node --test src/shared/infrastructure/tests/phase-03-messaging.test.ts
node --test src/shared/infrastructure/tests/phase-04-packages.test.ts
```

## Test Coverage Summary

### Phase 01 - Backend Boundaries (5 tests)
✅ Domain type validation
✅ Enum validation for admin filters
✅ Report payload normalization
✅ Payment decision validation
✅ AppError structured errors

### Phase 02 - Case Lifecycle (5 tests)
✅ Valid stage transitions
✅ Idempotent admin accept
✅ Admin reject validation
✅ Supporter assignment no-op
✅ Invalid supporter detection

### Phase 03 - Messaging & Reports (4 tests)
✅ Message validation
✅ Draft-only report editing
✅ Malformed JSON handling
✅ Existing integration tests

### Phase 04 - Packages & Attachments (3 tests)
✅ Package seed fallback
✅ Payment final status guard
✅ Revision final stage guard

### Existing Coverage (3 tests)
✅ Package list seed on empty DB
✅ Revision attachment metadata-only
✅ Payment proof cleanup on DB failure

## Total Coverage
- **20 automated tests**
- **4 phases** fully covered
- **5 coverage areas**: domain validation, lifecycle guards, error handling, edge cases, persistence

## Coverage Areas

### Domain Validation
- Enum validation (case stage, internal status, payment status)
- Type guards (final stage, valid transitions)
- Payload normalization (report findings)

### Lifecycle Guards
- Transition validation
- Final stage mutation blocks
- Idempotency checks

### Error Handling
- AppError structured errors
- Validation errors with codes
- Status precondition checks

### Edge Cases
- No-op operations (idempotent)
- Malformed input handling
- Cleanup on failure

### Persistence
- Seed fallback behavior
- Metadata-only references
- Transaction rollback

## Expected Output

```
✔ Phase 01 - Backend boundaries & contracts (5 tests)
✔ Phase 02 - Case lifecycle & admin triage (5 tests)
✔ Phase 03 - Messaging & reports (4 tests)
✔ Phase 04 - Packages & attachments (3 tests)
✔ backend demo regression coverage (3 tests)

20 tests passed
```
