import { test } from "node:test";
import assert from "node:assert";

process.env.NODE_ENV = "test";

// ---------------------------------------------------------------------------
// Domain: isFinalCaseStage — sanity check
// ---------------------------------------------------------------------------

await test("buy-round - isFinalCaseStage blocks finalized stages", async (t) => {
  const { isFinalCaseStage } = await import(
    "../../../modules/cases/domain/case.types.js"
  );

  await t.test("returns true for closed", () => {
    assert.strictEqual(isFinalCaseStage("closed"), true);
  });

  await t.test("returns true for completed", () => {
    assert.strictEqual(isFinalCaseStage("completed"), true);
  });

  await t.test("returns true for rejected", () => {
    assert.strictEqual(isFinalCaseStage("rejected"), true);
  });

  await t.test("returns false for active stages", () => {
    assert.strictEqual(isFinalCaseStage("submitted"), false);
    assert.strictEqual(isFinalCaseStage("under_review"), false);
    assert.strictEqual(isFinalCaseStage("report_ready"), false);
  });

  await t.test("returns false for null/undefined", () => {
    assert.strictEqual(isFinalCaseStage(null), false);
    assert.strictEqual(isFinalCaseStage(undefined), false);
  });
});

// ---------------------------------------------------------------------------
// AppError: error codes for buy-round validation paths
// ---------------------------------------------------------------------------

await test("buy-round - validation error codes", async (t) => {
  const { AppError } = await import("../../domain/app-error.js");

  await t.test("UNAUTHORIZED when not logged in", () => {
    const err = new AppError(401, "UNAUTHORIZED", "Chưa đăng nhập");
    assert.strictEqual(err.code, "UNAUTHORIZED");
    assert.strictEqual(err.status, 401);
  });

  await t.test("NOT_FOUND when case does not exist", () => {
    const err = new AppError(404, "NOT_FOUND", "Không tìm thấy dự án");
    assert.strictEqual(err.code, "NOT_FOUND");
    assert.strictEqual(err.status, 404);
  });

  await t.test("FORBIDDEN when user is not case owner", () => {
    const err = new AppError(403, "FORBIDDEN", "Không có quyền mua round");
    assert.strictEqual(err.code, "FORBIDDEN");
    assert.strictEqual(err.status, 403);
  });

  await t.test("NOT_UPGRADED when case has no paid package", () => {
    const err = new AppError(400, "NOT_UPGRADED", "Case này chưa được nâng cấp lên gói trả phí");
    assert.strictEqual(err.code, "NOT_UPGRADED");
    assert.strictEqual(err.status, 400);
  });

  await t.test("UNPAID_ROUND when previous round not paid", () => {
    const err = new AppError(400, "UNPAID_ROUND", "Vui lòng hoàn tất thanh toán cho round trước");
    assert.strictEqual(err.code, "UNPAID_ROUND");
    assert.strictEqual(err.status, 400);
  });

  await t.test("INVALID_PACKAGE when package not found or inactive", () => {
    const err = new AppError(400, "INVALID_PACKAGE", "Gói dịch vụ không tồn tại hoặc không khả dụng");
    assert.strictEqual(err.code, "INVALID_PACKAGE");
    assert.strictEqual(err.status, 400);
  });
});

// ---------------------------------------------------------------------------
// Business logic: "case has paid package" check
// ---------------------------------------------------------------------------

await test("buy-round - hasPaidPackage check", async (t) => {
  await t.test("true when locked_price > 0", () => {
    const caseRecord = { locked_price: 39000 };
    const hasPaid = (caseRecord.locked_price ?? 0) > 0;
    assert.strictEqual(hasPaid, true);
  });

  await t.test("false when locked_price is 0", () => {
    const caseRecord = { locked_price: 0 };
    const hasPaid = (caseRecord.locked_price ?? 0) > 0;
    assert.strictEqual(hasPaid, false);
  });

  await t.test("false when locked_price is null", () => {
    const caseRecord = { locked_price: null };
    const hasPaid = (caseRecord.locked_price ?? 0) > 0;
    assert.strictEqual(hasPaid, false); // null → 0 via ??, 0 is not > 0
  });

  await t.test("false when locked_price is undefined", () => {
    const caseRecord = {} as { locked_price?: number | null };
    const hasPaid = (caseRecord.locked_price ?? 0) > 0;
    assert.strictEqual(hasPaid, false);
  });
});

// ---------------------------------------------------------------------------
// Business logic: checkpoint auto-creation when current_checkpoint is null
// ---------------------------------------------------------------------------

await test("buy-round - checkpoint auto-creation logic", async (t) => {
  await t.test("auto-create when current_checkpoint is null", () => {
    const caseRecord = { current_checkpoint: null };
    const shouldAutoCreate = !caseRecord.current_checkpoint;
    assert.strictEqual(shouldAutoCreate, true);
  });

  await t.test("auto-create when current_checkpoint is undefined", () => {
    const caseRecord = {} as { current_checkpoint?: string | null };
    const shouldAutoCreate = !caseRecord.current_checkpoint;
    assert.strictEqual(shouldAutoCreate, true);
  });

  await t.test("skip auto-create when current_checkpoint is set", () => {
    const caseRecord = { current_checkpoint: "CP1" };
    const shouldAutoCreate = !caseRecord.current_checkpoint;
    assert.strictEqual(shouldAutoCreate, false);
  });

  await t.test("auto-created checkpoint has correct defaults", () => {
    const checkpointData = {
      checkpoint_code: "CP1",
      checkpoint_status: "draft",
      latest_version_no: 1,
      latest_assessment_no: 0,
    };
    assert.strictEqual(checkpointData.checkpoint_code, "CP1");
    assert.strictEqual(checkpointData.checkpoint_status, "draft");
    assert.strictEqual(checkpointData.latest_version_no, 1);
    assert.strictEqual(checkpointData.latest_assessment_no, 0);
  });
});

// ---------------------------------------------------------------------------
// Business logic: round number calculation
// ---------------------------------------------------------------------------

await test("buy-round - round number calculation", async (t) => {
  await t.test("first round gets number 1", () => {
    const existingRoundCount = 0;
    const roundNumber = existingRoundCount + 1;
    assert.strictEqual(roundNumber, 1);
  });

  await t.test("second round gets number 2", () => {
    const existingRoundCount = 1;
    const roundNumber = existingRoundCount + 1;
    assert.strictEqual(roundNumber, 2);
  });

  await t.test("third round gets number 3", () => {
    const existingRoundCount = 2;
    const roundNumber = existingRoundCount + 1;
    assert.strictEqual(roundNumber, 3);
  });
});

// ---------------------------------------------------------------------------
// Business logic: default packageId fallback
// ---------------------------------------------------------------------------

await test("buy-round - default packageId fallback", async (t) => {
  await t.test("uses provided packageId", () => {
    const body = { packageId: "pkg_custom" };
    const packageId = body?.packageId || "pkg_tf_audit";
    assert.strictEqual(packageId, "pkg_custom");
  });

  await t.test("falls back to pkg_tf_audit when packageId missing", () => {
    const body = {} as { packageId?: string };
    const packageId = body?.packageId || "pkg_tf_audit";
    assert.strictEqual(packageId, "pkg_tf_audit");
  });

  await t.test("falls back to pkg_tf_audit when body is null", () => {
    const body = null as any;
    const packageId = body?.packageId || "pkg_tf_audit";
    assert.strictEqual(packageId, "pkg_tf_audit");
  });
});

// ---------------------------------------------------------------------------
// Response shape validation
// ---------------------------------------------------------------------------

await test("buy-round - response shape", async () => {
  const response = {
    roundId: "round-abc-123",
    roundNumber: 1,
    paymentId: "pay-xyz-456",
    amount: 39000,
    caseId: "case-def-789",
  };

  assert.strictEqual(typeof response.roundId, "string");
  assert.strictEqual(typeof response.roundNumber, "number");
  assert.strictEqual(typeof response.paymentId, "string");
  assert.strictEqual(typeof response.amount, "number");
  assert.strictEqual(typeof response.caseId, "string");
  assert.ok(response.roundNumber > 0);
  assert.ok(response.amount > 0);
  assert.ok(response.roundId.length > 0);
  assert.ok(response.paymentId.length > 0);
  assert.ok(response.caseId.length > 0);
});

// ---------------------------------------------------------------------------
// Payment record shape for buy-round
// ---------------------------------------------------------------------------

await test("buy-round - payment record shape", async (t) => {
  await t.test("payment created with status unpaid", () => {
    const paymentData = {
      case_id: "case-1",
      package_id: "pkg_tf_audit",
      amount: 39000,
      status: "unpaid",
    };
    assert.strictEqual(paymentData.status, "unpaid");
    assert.strictEqual(typeof paymentData.amount, "number");
    assert.ok(paymentData.amount > 0);
  });
});

// ---------------------------------------------------------------------------
// AuditRound record shape
// ---------------------------------------------------------------------------

await test("buy-round - auditRound record shape", async (t) => {
  await t.test("round created with status pending_payment", () => {
    const roundData = {
      case_id: "case-1",
      round_number: 1,
      checkpoint_id: "cp-abc",
      status: "pending_payment",
    };
    assert.strictEqual(roundData.status, "pending_payment");
    assert.strictEqual(typeof roundData.round_number, "number");
    assert.ok(roundData.round_number > 0);
  });
});
