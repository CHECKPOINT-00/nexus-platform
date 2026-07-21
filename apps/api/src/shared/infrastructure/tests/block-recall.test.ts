import { test } from "node:test";
import assert from "node:assert";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key";
process.env.CLOUDINARY_API_SECRET = "test-secret";

// ---------------------------------------------------------------------------
// Wave 2b Todo 5: Block recallRevision for paid audit rounds
// Guard: package_id === "pkg_tf_audit" → 400 "Không thể thu hồi round đã thanh toán."
// Old packages (Gói 1/2/3) still allowed.
// ---------------------------------------------------------------------------

await test("block-recall - paid audit package throws PAID_PACKAGE_RECALL_BLOCKED", async (t) => {
  const { recallRevisionUseCase } = await import(
    "../../../modules/cases/application/recall-revision.usecase.js"
  );
  const { AppError } = await import("../../domain/app-error.js");

  const mockCasePaid = {
    id: "case-paid-1",
    package_id: "pkg_tf_audit",
    owner_auth_user_id: "user-1",
    members: [],
  };

  await t.test("pkg_tf_audit → 400 PAID_PACKAGE_RECALL_BLOCKED", async () => {
    try {
      await recallRevisionUseCase("user-1", "case-paid-1", {
        findCaseByIdWithMembersAndCheckpoints: async () => mockCasePaid as any,
      });
      assert.fail("Expected AppError to be thrown");
    } catch (err) {
      assert.ok(err instanceof AppError);
      const e = err as any;
      assert.strictEqual(e.status, 400);
      assert.strictEqual(e.code, "PAID_PACKAGE_RECALL_BLOCKED");
      assert.strictEqual(e.message, "Không thể thu hồi round đã thanh toán.");
    }
  });
});

await test("block-recall - free package passes guard (not blocked)", async (t) => {
  const { recallRevisionUseCase } = await import(
    "../../../modules/cases/application/recall-revision.usecase.js"
  );
  const { AppError } = await import("../../domain/app-error.js");

  const mockCaseFree = {
    id: "case-free-1",
    package_id: "pkg_tf_free",
    owner_auth_user_id: "user-2",
    members: [],
    user_facing_stage: "revision_submitted",
    checkpoints: [],
  };

  await t.test("pkg_tf_free → guard passes (fails later on checkpoint)", async () => {
    try {
      await recallRevisionUseCase("user-2", "case-free-1", {
        findCaseByIdWithMembersAndCheckpoints: async () => mockCaseFree as any,
      });
      assert.fail("Expected error after guard (checkpoint not found)");
    } catch (err) {
      assert.ok(err instanceof AppError);
      // Guard passed — error should NOT be PAID_PACKAGE_RECALL_BLOCKED
      assert.notStrictEqual((err as any).code, "PAID_PACKAGE_RECALL_BLOCKED");
    }
  });
});

await test("block-recall - old Gói 1 package passes guard (not blocked)", async (t) => {
  const { recallRevisionUseCase } = await import(
    "../../../modules/cases/application/recall-revision.usecase.js"
  );
  const { AppError } = await import("../../domain/app-error.js");

  const mockCaseOld = {
    id: "case-old-1",
    package_id: "pkg_g1",
    owner_auth_user_id: "user-3",
    members: [],
    user_facing_stage: "revision_submitted",
    checkpoints: [],
  };

  await t.test("pkg_g1 → guard passes (fails later on checkpoint)", async () => {
    try {
      await recallRevisionUseCase("user-3", "case-old-1", {
        findCaseByIdWithMembersAndCheckpoints: async () => mockCaseOld as any,
      });
      assert.fail("Expected error after guard (checkpoint not found)");
    } catch (err) {
      assert.ok(err instanceof AppError);
      assert.notStrictEqual((err as any).code, "PAID_PACKAGE_RECALL_BLOCKED");
    }
  });
});

await test("block-recall - no package_id (null) passes guard", async (t) => {
  const { recallRevisionUseCase } = await import(
    "../../../modules/cases/application/recall-revision.usecase.js"
  );
  const { AppError } = await import("../../domain/app-error.js");

  const mockCaseNoPkg = {
    id: "case-no-pkg-1",
    package_id: null,
    owner_auth_user_id: "user-4",
    members: [],
    user_facing_stage: "revision_submitted",
    checkpoints: [],
  };

  await t.test("null package_id → guard passes", async () => {
    try {
      await recallRevisionUseCase("user-4", "case-no-pkg-1", {
        findCaseByIdWithMembersAndCheckpoints: async () => mockCaseNoPkg as any,
      });
      assert.fail("Expected error after guard");
    } catch (err) {
      assert.ok(err instanceof AppError);
      assert.notStrictEqual((err as any).code, "PAID_PACKAGE_RECALL_BLOCKED");
    }
  });
});

// ---------------------------------------------------------------------------
// AppError shape validation
// ---------------------------------------------------------------------------

await test("block-recall - AppError shape", async (t) => {
  const { AppError } = await import("../../domain/app-error.js");

  await t.test("PAID_PACKAGE_RECALL_BLOCKED has correct shape", () => {
    const err = new AppError(
      400,
      "PAID_PACKAGE_RECALL_BLOCKED",
      "Không thể thu hồi round đã thanh toán.",
    );
    assert.strictEqual(err.status, 400);
    assert.strictEqual(err.code, "PAID_PACKAGE_RECALL_BLOCKED");
    assert.strictEqual(err.message, "Không thể thu hồi round đã thanh toán.");
    assert.strictEqual(err.name, "AppError");
  });
});
