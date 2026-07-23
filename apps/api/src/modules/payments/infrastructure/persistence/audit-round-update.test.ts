import { test } from "node:test";
import assert from "node:assert";

import { updateAuditRoundAfterPayment } from "./audit-round-update.js";

test("updateAuditRoundAfterPayment - paid sets all rounds in_progress + SLA on lowest round_number", async () => {
  const updatedManyIds: string[] = [];
  let updatedOneId: string | null = null;
  let updatedOneData: any = null;

  const mockTx = {
    auditRound: {
      updateMany: async (args: any) => {
        // Capture all updateMany calls
        updatedManyIds.push(args.where.payment_id);
        return { count: 3 }; // 3 rounds linked
      },
      findFirst: async (args: any) => {
        // Return the lowest round_number (round 1)
        return { id: "round-1", round_number: 1, status: "in_progress" };
      },
      update: async (args: any) => {
        updatedOneId = args.where.id;
        updatedOneData = args.data;
        return { id: args.where.id, ...args.data };
      },
    },
  };

  await updateAuditRoundAfterPayment(mockTx, "pay-1", "paid");

  assert.strictEqual(updatedManyIds.length, 1);
  assert.strictEqual(updatedManyIds[0], "pay-1");
  assert.strictEqual(updatedOneId, "round-1");
  assert.strictEqual(updatedOneData.status, "in_progress");
  assert.ok(updatedOneData.sla_deadline_at instanceof Date);
  const diffMs = updatedOneData.sla_deadline_at.getTime() - Date.now();
  assert.ok(diffMs > 47 * 60 * 60 * 1000, "sla_deadline_at should be ~48h in future");
  assert.ok(diffMs < 49 * 60 * 60 * 1000, "sla_deadline_at should be ~48h in future");
});

test("updateAuditRoundAfterPayment - rejected sets all rounds payment_rejected", async () => {
  let capturedWhere: any = null;
  let capturedData: any = null;

  const mockTx = {
    auditRound: {
      updateMany: async (args: any) => {
        capturedWhere = args.where;
        capturedData = args.data;
        return { count: 2 };
      },
      findFirst: async () => null,
      update: async () => ({}),
    },
  };

  await updateAuditRoundAfterPayment(mockTx, "pay-reject", "rejected");

  assert.deepStrictEqual(capturedWhere, { payment_id: "pay-reject" });
  assert.deepStrictEqual(capturedData, { status: "payment_rejected" });
});

test("updateAuditRoundAfterPayment - no linked audit_rounds does not crash (paid)", async () => {
  let updateOneCalled = false;

  const mockTx = {
    auditRound: {
      updateMany: async () => ({ count: 0 }),
      findFirst: async () => null,
      update: async () => {
        updateOneCalled = true;
        return {};
      },
    },
  };

  await updateAuditRoundAfterPayment(mockTx, "pay-nonexistent", "paid");

  assert.strictEqual(updateOneCalled, false);
});

test("updateAuditRoundAfterPayment - paid sets only round 1 SLA when many rounds", async () => {
  const findFirstCalls: any[] = [];
  const updateCalls: any[] = [];

  const mockTx = {
    auditRound: {
      updateMany: async () => ({ count: 5 }), // 5 rounds
      findFirst: async (args: any) => {
        findFirstCalls.push(args);
        // Return round with number 3 (lowest among the 5)
        return { id: "round-lowest", round_number: 3 };
      },
      update: async (args: any) => {
        updateCalls.push(args);
        return { id: args.where.id, ...args.data };
      },
    },
  };

  await updateAuditRoundAfterPayment(mockTx, "pay-multi", "paid");

  assert.strictEqual(updateCalls.length, 1);
  assert.strictEqual(updateCalls[0].where.id, "round-lowest");
  assert.ok(findFirstCalls[0].orderBy.round_number === "asc");
});
