import { test } from "node:test";
import assert from "node:assert";

process.env.NODE_ENV = "test";

test("Phase 02 - Case lifecycle & admin triage", async (t) => {
  await t.test("case transitions - valid paths", async () => {
    const { isValidStageTransition } = await import("../../../modules/cases/domain/case.types.js");
    assert.ok(isValidStageTransition("submitted", "under_review"));
    assert.ok(isValidStageTransition("under_review", "report_ready"));
    assert.ok(!isValidStageTransition("submitted", "completed"));
    assert.ok(!isValidStageTransition("completed", "under_review"));
  });

  await t.test("admin accept - idempotent no-op", async () => {
    const { acceptCaseUseCase } = await import("../../../modules/admin/application/accept-case.usecase.js");
    const result = await acceptCaseUseCase("admin-1", "case-1", {
      findCaseById: async () => ({ id: "case-1", user_facing_stage: "under_review", internal_status: "accepted_unassigned" } as any),
    });
    assert.strictEqual(result.user_facing_stage, "under_review");
  });

  await t.test("admin reject - validation", async () => {
    const { rejectCaseUseCase } = await import("../../../modules/admin/application/reject-case.usecase.js");
    const { AppError } = await import("../../domain/app-error.js");

    try {
      await rejectCaseUseCase("admin-1", "case-1", "short");
      assert.fail("Should throw");
    } catch (err) {
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.code, "VALIDATION_ERROR");
    }
  });

  await t.test("assign supporter - same supporter no-op", async () => {
    const { assignSupporterUseCase } = await import(
      "../../../modules/cases/application/assign-supporter.usecase.js"
    );
    const result = await assignSupporterUseCase("admin-1", "case-1", "sup-1", {
      findCaseById: async () => ({ id: "case-1", assigned_supporter_auth_user_id: "sup-1" } as any),
      findSupporterById: async () => ({ id: "sup-1", role: "supporter", name: "Supporter 1" } as any),
    });
    assert.strictEqual(result.assigned_supporter_auth_user_id, "sup-1");
  });

  await t.test("assign supporter - invalid supporter", async () => {
    const { assignSupporterUseCase } = await import(
      "../../../modules/cases/application/assign-supporter.usecase.js"
    );
    const { AppError } = await import("../../domain/app-error.js");

    try {
      await assignSupporterUseCase("admin-1", "case-1", "invalid-sup", {
        findCaseById: async () => ({ id: "case-1", assigned_supporter_auth_user_id: null } as any),
        findSupporterById: async () => null as any,
      });
      assert.fail("Should throw");
    } catch (err) {
      assert.ok(err instanceof AppError);
      assert.strictEqual(err.code, "VALIDATION_ERROR");
    }
  });

  await t.test("recall revision - success and error flows", async (st) => {
    const { recallRevisionUseCase } = await import(
      "../../../modules/cases/application/recall-revision.usecase.js"
    );
    const { AppError } = await import("../../domain/app-error.js");

    await st.test("throws error if case not found", async () => {
      try {
        await recallRevisionUseCase("user-1", "invalid-case", {
          findCaseByIdWithMembersAndCheckpoints: async () => null,
        });
        assert.fail("Should throw");
      } catch (err: any) {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.status, 404);
        assert.strictEqual(err.code, "NOT_FOUND");
      }
    });

    await st.test("throws error if user is not member or owner", async () => {
      try {
        await recallRevisionUseCase("stranger-1", "case-1", {
          findCaseByIdWithMembersAndCheckpoints: async () => ({
            id: "case-1",
            owner_auth_user_id: "user-1",
            members: [],
          } as any),
        });
        assert.fail("Should throw");
      } catch (err: any) {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.status, 403);
        assert.strictEqual(err.code, "FORBIDDEN");
      }
    });

    await st.test("throws error if case is not in revision_submitted stage", async () => {
      try {
        await recallRevisionUseCase("user-1", "case-1", {
          findCaseByIdWithMembersAndCheckpoints: async () => ({
            id: "case-1",
            owner_auth_user_id: "user-1",
            members: [],
            user_facing_stage: "under_review",
          } as any),
        });
        assert.fail("Should throw");
      } catch (err: any) {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.status, 400);
        assert.strictEqual(err.code, "INVALID_CASE_STAGE");
      }
    });

    await st.test("throws error if latest version is intake (v01)", async () => {
      try {
        await recallRevisionUseCase("user-1", "case-1", {
          findCaseByIdWithMembersAndCheckpoints: async () => ({
            id: "case-1",
            owner_auth_user_id: "user-1",
            members: [],
            user_facing_stage: "revision_submitted",
            checkpoints: [{ id: "cp-1", checkpoint_code: "CP-1", latest_version_no: 1 }],
          } as any),
        });
        assert.fail("Should throw");
      } catch (err: any) {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.status, 400);
        assert.strictEqual(err.code, "INVALID_CASE_STAGE");
        assert.match(err.message, /Không thể thu hồi bản nộp khởi tạo/);
      }
    });

    await st.test("throws error if supporter started auditing", async () => {
      const mockPrisma = {
        lifecycleUnit: {
          findFirst: async () => ({ id: "unit-1" } as any),
        },
        report: {
          count: async () => 1,
        },
      };

      try {
        await recallRevisionUseCase("user-1", "case-1", {
          findCaseByIdWithMembersAndCheckpoints: async () => ({
            id: "case-1",
            owner_auth_user_id: "user-1",
            members: [],
            user_facing_stage: "revision_submitted",
            checkpoints: [{ id: "cp-1", checkpoint_code: "CP-1", latest_version_no: 2 }],
          } as any),
          prisma: mockPrisma as any,
        });
        assert.fail("Should throw");
      } catch (err: any) {
        assert.ok(err instanceof AppError);
        assert.strictEqual(err.status, 400);
        assert.strictEqual(err.code, "SUPPORTER_AUDITING");
      }
    });

    await st.test("successfully recalls a revision and reverts stage", async () => {
      let filesDeleted = false;
      let revertedCheckpoint = false;
      let revertedCase = false;
      let deletedRecords = false;
      let deletedUnit = false;
      let loggedEvent = false;

      const mockPrisma = {
        lifecycleUnit: {
          findFirst: async () => ({ id: "unit-1" } as any),
          delete: async () => { deletedUnit = true; return {}; },
        },
        report: {
          count: async () => 0,
        },
        documentRecord: {
          findMany: async () => [{ id: "doc-1", cloudinary_public_id: "pub-1" }] as any,
          deleteMany: async () => { deletedRecords = true; return {}; },
        },
        checkpoint: {
          update: async () => { revertedCheckpoint = true; return {}; },
        },
        case: {
          update: async () => { revertedCase = true; return {}; },
        },
        caseEvent: {
          create: async () => { loggedEvent = true; return {}; },
        },
        $transaction: async (fn: any) => fn(mockPrisma),
      };

      const result = await recallRevisionUseCase("user-1", "case-1", {
        findCaseByIdWithMembersAndCheckpoints: async () => ({
          id: "case-1",
          owner_auth_user_id: "user-1",
          members: [],
          user_facing_stage: "revision_submitted",
          checkpoints: [{ id: "cp-1", checkpoint_code: "CP-1", latest_version_no: 2 }],
        } as any),
        findOpenRequestsForMoreInfo: async () => [],
        deleteManagedDocumentFile: async (id) => {
          if (id === "pub-1") filesDeleted = true;
        },
        prisma: mockPrisma as any,
      });

      assert.ok(result.success);
      assert.ok(filesDeleted);
      assert.ok(revertedCheckpoint);
      assert.ok(revertedCase);
      assert.ok(deletedRecords);
      assert.ok(deletedUnit);
      assert.ok(loggedEvent);
    });
  });
});
