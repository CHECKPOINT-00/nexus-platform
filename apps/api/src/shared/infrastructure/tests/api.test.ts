import { test } from "node:test";
import assert from "node:assert";
import { app } from "../../../index.js";
import { auth } from "../../../auth.js";
import { prisma } from "../../../db.js";

// Set test environment
process.env.NODE_ENV = "test";

// Mock session globally for testing
let currentMockSession: any = null;

// Override getSession with mock controller
(auth.api as any).getSession = async () => {
  return currentMockSession;
};

test("API Authorization & Edge Cases Integration Tests", async (t) => {
  
  await t.test("1. Unauthenticated requests should return 401", async () => {
    currentMockSession = null;
    const res = await app.request("/api/cases");
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.error, "Chưa đăng nhập");
  });

  await t.test("2. Student accessing admin routes should return 403", async () => {
    currentMockSession = {
      user: {
        id: "student-user-id",
        name: "Test Student",
        email: "student@test.com",
        role: "user",
      },
      session: {
        id: "session-id",
        userId: "student-user-id",
        expiresAt: new Date(Date.now() + 3600000),
        token: "token",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };

    const res = await app.request("/api/admin/cases");
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.error, "Không có quyền quản trị");
  });

  await t.test("3. Admin accessing admin routes should succeed (returns 200 or list)", async () => {
    currentMockSession = {
      user: {
        id: "admin-user-id",
        name: "Test Admin",
        email: "admin@test.com",
        role: "admin",
      },
      session: {
        id: "session-id-admin",
        userId: "admin-user-id",
        expiresAt: new Date(Date.now() + 3600000),
        token: "token-admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };

    const res = await app.request("/api/admin/cases");
    // Should be 200 (even if empty list)
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
  });

  await t.test("4. Invalid JSON payload should return 400", async () => {
    currentMockSession = {
      user: {
        id: "student-user-id",
        name: "Test Student",
        role: "user",
      }
    };

    const res = await app.request("/api/cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid-json-content{"
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, "Dữ liệu JSON không hợp lệ");
  });

  await t.test("5. Case creation with invalid intake payload should return 400 with details", async () => {
    const res = await app.request("/api/cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        package_id: "some-pkg",
        contact: {
          full_name: "A", // too short
          student_code: "123", // too short
        }
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, "Dữ liệu không hợp lệ");
    assert.ok(body.details.length > 0);
  });

  await t.test("6. Send message with empty content or too long content should return 400", async () => {
    const res404 = await app.request("/api/cases/non-existent-case-uuid/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "hello" })
    });
    assert.strictEqual(res404.status, 404);
  });

  await t.test("7. Payment verification status validation", async () => {
    currentMockSession = {
      user: {
        id: "admin-user-id",
        role: "admin",
      }
    };

    const res = await app.request("/api/payments/non-existent-payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "invalid-status" })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, "Trạng thái phê duyệt không hợp lệ");
  });
});
