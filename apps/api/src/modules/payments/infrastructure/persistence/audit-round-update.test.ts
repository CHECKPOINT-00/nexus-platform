import { test } from "node:test";
import assert from "node:assert";

import { updateAuditRoundAfterPayment } from "./audit-round-update.js";

test("updateAuditRoundAfterPayment - paid sets status + sla_deadline", async () => {
  let updatedId: string | null = null;
  let updatedData: any = null;

  const mockTx = {
    auditRound: {
      findFirst: async () => ({ id: "round-1", status: "pending_payment" }),
      update: async (args: any) => {
        updatedId = args.where.id;
        updatedData = args.data;
        return { id: args.where.id, ...args.data };
      },
    },
  };

  await updateAuditRoundAfterPayment(mockTx, "pay-1");

  assert.strictEqual(updatedId, "round-1");
  assert.strictEqual(updatedData.status, "payment_verified");
  assert.ok(updatedData.sla_deadline_at instanceof Date);
  const diffMs = updatedData.sla_deadline_at.getTime() - Date.now();
  assert.ok(diffMs > 47 * 60 * 60 * 1000, "sla_deadline_at should be ~48h in future");
  assert.ok(diffMs < 49 * 60 * 60 * 1000, "sla_deadline_at should be ~48h in future");
});

test("updateAuditRoundAfterPayment - no linked audit_round does not crash", async () => {
  let updateCalled = false;

  const mockTx = {
    auditRound: {
      findFirst: async () => null,
      update: async () => {
        updateCalled = true;
        return {};
      },
    },
  };

  await updateAuditRoundAfterPayment(mockTx, "pay-nonexistent");

  assert.strictEqual(updateCalled, false);
});

test("updateAuditRoundAfterPayment - findFirst is called with correct payment_id", async () => {
  let capturedWhere: any = null;

  const mockTx = {
    auditRound: {
      findFirst: async (args: any) => {
        capturedWhere = args.where;
        return null;
      },
      update: async () => ({}),
    },
  };

  await updateAuditRoundAfterPayment(mockTx, "pay-specific");

  assert.deepStrictEqual(capturedWhere, { payment_id: "pay-specific" });
});
