import { Hono } from "hono";
import { prisma } from "../../../../db.js";
import { auth } from "../../../../auth.js";
import { isFinalCaseStage } from "../../../../shared/infrastructure/authorization.js";

export const adminRouter = new Hono();

// Helper to get authenticated session and verify admin role
async function getAdminSession(c: any) {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return { ok: false as const, error: "Chưa đăng nhập", status: 401 as const };
    }
    if (session.user.role !== "admin") {
      return { ok: false as const, error: "Không có quyền quản trị", status: 403 as const };
    }
    return { ok: true as const, session };
  } catch (error) {
    console.error("Error in getAdminSession:", error);
    return { ok: false as const, error: "Chưa đăng nhập", status: 401 as const };
  }
}

// 1. GET /api/admin/cases - List all cases with triage filter options
adminRouter.get("/cases", async (c) => {
  const authResult = await getAdminSession(c);
  if (!authResult.ok) {
    return c.json({ error: authResult.error }, authResult.status);
  }
  const session = authResult.session;

  try {
    const { stage, internal_status, limit } = c.req.query();

    const where: any = {};
    if (stage) {
      if (!isFinalCaseStage(stage) && !["submitted", "need_more_information", "under_review", "report_ready", "waiting_for_revision", "revision_submitted"].includes(stage)) {
        return c.json({ error: "stage không hợp lệ" }, 400);
      }
      where.user_facing_stage = stage;
    }
    if (internal_status) {
      if (!["triage_pending", "accepted_unassigned", "assigned", "waiting_user", "supporter_working", "report_ready_to_publish", "done", "cancelled"].includes(internal_status)) {
        return c.json({ error: "internal_status không hợp lệ" }, 400);
      }
      where.internal_status = internal_status;
    }

    let take: number | undefined;
    if (limit) {
      const parsedLimit = Number.parseInt(limit, 10);
      if (!Number.isInteger(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
        return c.json({ error: "limit không hợp lệ" }, 400);
      }
      take = parsedLimit;
    }

    const cases = await prisma.case.findMany({
      where,
      include: {
        owner: true,
        assigned_supporter: true,
        package: true,
        lifecycle_units: {
          where: { unit_type: "intake" },
          take: 1,
        },
      },
      orderBy: { created_at: "desc" },
      take,
    });

    // Map case completeness score
    const result = cases.map((item) => {
      let completeness = 0;
      const intakeUnit = item.lifecycle_units?.[0];
      if (intakeUnit && intakeUnit.content) {
        try {
          const content = JSON.parse(intakeUnit.content);
          let score = 0;
          if (content.contact?.full_name) score += 20;
          if (content.contact?.email) score += 20;
          if (content.case_summary) score += 20;
          if (content.documents && content.documents.length > 0) score += 20;
          if (content.boundary_confirmations && content.boundary_confirmations.length > 0) score += 20;
          completeness = score;
        } catch (_) {}
      }

      return {
        id: item.id,
        case_code: item.case_code,
        team_name: item.team_name,
        created_at: item.created_at,
        deadline: item.deadline,
        user_facing_stage: item.user_facing_stage,
        internal_status: item.internal_status,
        payment_status: item.payment_status,
        package_name: item.package?.name || "N/A",
        completeness,
        owner_name: item.owner?.name || "N/A",
        assigned_supporter: item.assigned_supporter ? {
          id: item.assigned_supporter.id,
          name: item.assigned_supporter.name,
        } : null,
      };
    });

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 2. GET /api/admin/cases/:id - Get details of case for triage
adminRouter.get("/cases/:id", async (c) => {
  const authResult = await getAdminSession(c);
  if (!authResult.ok) {
    return c.json({ error: authResult.error }, authResult.status);
  }
  const session = authResult.session;

  const caseId = c.req.param("id");
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    return c.json({ error: "ID dự án không hợp lệ" }, 400);
  }

  try {
    const item = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        owner: true,
        assigned_supporter: true,
        package: true,
        lifecycle_units: true,
        events: {
          include: { actor: true },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!item) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    const intakeUnit = item.lifecycle_units.find(u => u.unit_type === "intake" && u.unit_code === "v00");
    let intake_snapshot = null;
    if (intakeUnit && intakeUnit.content) {
      try {
        intake_snapshot = JSON.parse(intakeUnit.content);
      } catch (_) {}
    }

    return c.json({
      case: item,
      intake_snapshot,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 3. POST /api/admin/cases/:id/accept - Approve case, transition status
adminRouter.post("/cases/:id/accept", async (c) => {
  const authResult = await getAdminSession(c);
  if (!authResult.ok) {
    return c.json({ error: authResult.error }, authResult.status);
  }
  const session = authResult.session;

  const caseId = c.req.param("id");
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    return c.json({ error: "ID dự án không hợp lệ" }, 400);
  }

  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, user_facing_stage: true, internal_status: true },
    });
    if (!caseItem) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    if (caseItem.user_facing_stage === "under_review" && caseItem.internal_status === "accepted_unassigned") {
      return c.json(caseItem);
    }

    const updatedCase = await prisma.$transaction(async (tx) => {
      const updated = await tx.case.update({
        where: { id: caseId },
        data: {
          user_facing_stage: "under_review",
          internal_status: "accepted_unassigned",
        },
      });

      await tx.caseEvent.create({
        data: {
          case_id: caseId,
          event_type: "case_accepted",
          actor_auth_user_id: session.user.id,
        },
      });

      return updated;
    });

    return c.json(updatedCase);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 4. POST /api/admin/cases/:id/reject - Reject case with a reason
adminRouter.post("/cases/:id/reject", async (c) => {
  const authResult = await getAdminSession(c);
  if (!authResult.ok) {
    return c.json({ error: authResult.error }, authResult.status);
  }
  const session = authResult.session;

  const caseId = c.req.param("id");
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    return c.json({ error: "ID dự án không hợp lệ" }, 400);
  }
  try {
    const body = await c.req.json();
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (reason.length < 10) {
      return c.json({ error: "Lý do từ chối tối thiểu phải 10 ký tự" }, 400);
    }

    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, user_facing_stage: true, internal_status: true },
    });
    if (!caseItem) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    if (caseItem.user_facing_stage === "rejected" && caseItem.internal_status === "cancelled") {
      return c.json(caseItem);
    }

    const updatedCase = await prisma.$transaction(async (tx) => {
      const updated = await tx.case.update({
        where: { id: caseId },
        data: {
          user_facing_stage: "rejected",
          internal_status: "cancelled",
        },
      });

      await tx.caseEvent.create({
        data: {
          case_id: caseId,
          event_type: "case_rejected",
          actor_auth_user_id: session.user.id,
          metadata_json: { reason },
        },
      });

      return updated;
    });

    return c.json(updatedCase);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 5. POST /api/admin/cases/:id/request-more-info - Request more details from student
adminRouter.post("/cases/:id/request-more-info", async (c) => {
  const authResult = await getAdminSession(c);
  if (!authResult.ok) {
    return c.json({ error: authResult.error }, authResult.status);
  }
  const session = authResult.session;

  const caseId = c.req.param("id");
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    return c.json({ error: "ID dự án không hợp lệ" }, 400);
  }
  try {
    const body = await c.req.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (query.length < 5) {
      return c.json({ error: "Yêu cầu làm rõ tối thiểu phải 5 ký tự" }, 400);
    }

    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, user_facing_stage: true, internal_status: true },
    });
    if (!caseItem) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    if (caseItem.user_facing_stage === "need_more_information" && caseItem.internal_status === "waiting_user") {
      return c.json(caseItem);
    }

    const updatedCase = await prisma.$transaction(async (tx) => {
      const updated = await tx.case.update({
        where: { id: caseId },
        data: {
          user_facing_stage: "need_more_information",
          internal_status: "waiting_user",
        },
      });

      await tx.caseEvent.create({
        data: {
          case_id: caseId,
          event_type: "more_info_requested",
          actor_auth_user_id: session.user.id,
          metadata_json: { query },
        },
      });

      return updated;
    });

    return c.json(updatedCase);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 6. POST /api/admin/cases/:id/assign - Assign supporter to case
adminRouter.post("/cases/:id/assign", async (c) => {
  const authResult = await getAdminSession(c);
  if (!authResult.ok) {
    return c.json({ error: authResult.error }, authResult.status);
  }
  const session = authResult.session;

  const caseId = c.req.param("id");
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    return c.json({ error: "ID dự án không hợp lệ" }, 400);
  }
  try {
    const body = await c.req.json();
    const supporter_id = typeof body.supporter_id === "string" ? body.supporter_id.trim() : "";
    if (!supporter_id) {
      return c.json({ error: "Thiếu ID của supporter chuyên môn" }, 400);
    }

    const supporterUser = await prisma.user.findUnique({
      where: { id: supporter_id },
      select: { id: true, role: true, name: true },
    });
    if (!supporterUser || (supporterUser.role !== "supporter" && supporterUser.role !== "admin")) {
      return c.json({ error: "Supporter được gán không hợp lệ" }, 400);
    }

    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, assigned_supporter_auth_user_id: true, internal_status: true },
    });
    if (!caseItem) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    if (caseItem.assigned_supporter_auth_user_id === supporter_id) {
      return c.json(caseItem);
    }

    const updatedCase = await prisma.$transaction(async (tx) => {
      const updated = await tx.case.update({
        where: { id: caseId },
        data: {
          assigned_supporter_auth_user_id: supporter_id,
          internal_status: "assigned",
        },
      });

      await tx.caseEvent.create({
        data: {
          case_id: caseId,
          event_type: "supporter_assigned",
          actor_auth_user_id: session.user.id,
          metadata_json: { supporter_id, supporter_name: supporterUser.name },
        },
      });

      return updated;
    });

    return c.json(updatedCase);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
