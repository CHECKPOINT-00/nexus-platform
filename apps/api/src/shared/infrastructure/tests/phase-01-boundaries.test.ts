import { test } from "node:test";
import assert from "node:assert";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://user:pass@localhost:5432/test";
process.env.BETTER_AUTH_URL ??= "http://localhost:8000";
process.env.GOOGLE_CLIENT_ID ??= "test-client-id";
process.env.GOOGLE_CLIENT_SECRET ??= "test-client-secret";

test("Phase 01 - Backend boundaries & contracts", async (t) => {
  await t.test("case types - valid stage validation", async () => {
    const { isValidCaseStage, isValidInternalStatus, isFinalCaseStage } = await import(
      "../../../modules/cases/domain/case.types.js"
    );
    assert.ok(isValidCaseStage("submitted"));
    assert.ok(isValidCaseStage("under_review"));
    assert.ok(!isValidCaseStage("invalid_stage"));
    assert.ok(isValidInternalStatus("triage_pending"));
    assert.ok(!isValidInternalStatus("invalid_status"));
    assert.ok(isFinalCaseStage("completed"));
    assert.ok(isFinalCaseStage("rejected"));
    assert.ok(!isFinalCaseStage("submitted"));
  });

  await t.test("admin types - filter enum validation", async () => {
    const { isValidAdminCaseStage, isValidAdminInternalStatus } = await import(
      "../../../modules/admin/domain/admin.types.js"
    );
    assert.ok(isValidAdminCaseStage("submitted"));
    assert.ok(!isValidAdminCaseStage("invalid"));
    assert.ok(isValidAdminInternalStatus("triage_pending"));
    assert.ok(!isValidAdminInternalStatus("invalid"));
  });

  await t.test("report types - payload normalization", async () => {
    const { normalizeReportDraftContent, parseReportDraftContent } = await import(
      "../../../modules/reports/domain/report.types.js"
    );
    const input = {
      overall_summary: "Test summary",
      completeness_score: 75,
      findings: [
        { field: "idea", status: "needs_work", evidence: "E", reason: "R", question: "Q", next_action: "A" },
      ],
    };
    const normalized = normalizeReportDraftContent(input);
    assert.strictEqual(normalized.overall_summary, "Test summary");
    assert.strictEqual(normalized.completeness_score, 75);
    assert.strictEqual(normalized.findings.length, 1);

    const parsed = parseReportDraftContent(JSON.stringify(input));
    assert.ok(parsed);
    assert.strictEqual(parsed?.findings.length, 1);
  });

  await t.test("payment types - decision validation", async () => {
    const { isValidPaymentDecision, isFinalPaymentStatus } = await import(
      "../../../modules/payments/domain/payment.types.js"
    );
    assert.ok(isValidPaymentDecision("paid"));
    assert.ok(isValidPaymentDecision("rejected"));
    assert.ok(!isValidPaymentDecision("invalid"));
    assert.ok(isFinalPaymentStatus("paid"));
    assert.ok(isFinalPaymentStatus("rejected"));
    assert.ok(!isFinalPaymentStatus("pending_verification"));
  });

  await t.test("AppError - structured error", async () => {
    const { AppError } = await import("../../domain/app-error.js");
    const err = new AppError(400, "TEST_ERROR", "Test message", ["detail1"]);
    assert.strictEqual(err.status, 400);
    assert.strictEqual(err.code, "TEST_ERROR");
    assert.strictEqual(err.message, "Test message");
    assert.deepStrictEqual(err.details, ["detail1"]);
  });
});
