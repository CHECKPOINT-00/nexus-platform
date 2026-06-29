import { test } from "node:test";
import assert from "node:assert";

process.env.NODE_ENV = "test";

test("Phase 04 - Packages & attachments", async (t) => {
  await t.test("package seed - only on empty", async () => {
    const { listPackagesUseCase } = await import(
      "../../../modules/packages/application/list-packages.usecase.js"
    );
    const existing = [{ id: "pkg-1", name: "Existing", price: 0, features: [] }];
    const packages = await listPackagesUseCase({
      findAllPackages: async () => existing as any,
      createPackage: async () => {
        throw new Error("Should not seed");
      },
    } as any);
    assert.strictEqual(packages.length, 1);
  });

  await t.test("payment verify - final status guard", async () => {
    const { verifyPaymentUseCase } = await import("../../../modules/payments/application/verify-payment.usecase.js");
    const { AppError } = await import("../../domain/app-error.js");

    try {
      await verifyPaymentUseCase("admin-1", "pay-1", "paid", "", {
        findPaymentById: async () => ({ id: "pay-1", status: "paid" } as any),
      } as any);
      assert.fail("Should throw");
    } catch (err) {
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.code, "FINAL_STATUS");
    }
  });

  await t.test("revision submit - final stage guard", async () => {
    const { submitRevisionUseCase } = await import(
      "../../../modules/cases/application/submit-revision.usecase.js"
    );
    const { AppError } = await import("../../domain/app-error.js");

    try {
      await submitRevisionUseCase(
        "user-1",
        "case-1",
        { change_summary: "Test", documents: [{ drive_url: "url" }] } as any,
        {
          findCaseByIdWithMembersAndCheckpoints: async () => ({
            id: "case-1",
            owner_auth_user_id: "user-1",
            members: [],
            user_facing_stage: "completed",
            checkpoints: [],
          } as any)
        }
      );
      assert.fail("Should throw");
    } catch (err) {
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.code, "INVALID_CASE_STAGE");
    }
  });
});
