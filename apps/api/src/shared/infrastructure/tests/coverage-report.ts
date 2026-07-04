/**
 * Backend Demo Regression Coverage Report
 * 
 * This file documents the regression test coverage for the backend demo path.
 * Run tests: node --test apps/api/src/shared/infrastructure/tests/*.test.ts
 */

export const REGRESSION_COVERAGE = {
  phase_01_boundaries: {
    total: 5,
    tests: [
      "case types - valid stage validation",
      "admin types - filter enum validation", 
      "report types - payload normalization",
      "payment types - decision validation",
      "AppError - structured error"
    ]
  },
  phase_02_lifecycle: {
    total: 5,
    tests: [
      "case transitions - valid paths",
      "admin accept - idempotent no-op",
      "admin reject - validation",
      "assign supporter - same supporter no-op",
      "assign supporter - invalid supporter"
    ]
  },
  phase_03_messaging: {
    total: 4,
    tests: [
      "send message - validation",
      "edit report - draft only",
      "report payload - malformed JSON handling",
      "existing api.test.ts coverage"
    ]
  },
  phase_04_packages: {
    total: 3,
    tests: [
      "package seed - only on empty",
      "payment verify - final status guard",
      "revision submit - final stage guard"
    ]
  },
  existing_coverage: {
    total: 3,
    tests: [
      "package list seeds defaults on empty db",
      "revision submit keeps attachment refs metadata-only",
      "payment proof upload cleans up on db failure"
    ]
  }
};

export const TOTAL_TESTS = 20;

export const COVERAGE_AREAS = {
  domain_validation: ["case types", "admin types", "report types", "payment types"],
  lifecycle_guards: ["transitions", "final stage", "idempotency"],
  error_handling: ["AppError", "validation errors", "status guards"],
  edge_cases: ["no-op", "malformed input", "cleanup on failure"],
  persistence: ["seed fallback", "metadata-only refs", "transaction rollback"]
};
