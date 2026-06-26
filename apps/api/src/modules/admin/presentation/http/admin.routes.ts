import { Hono } from "hono";
import { prisma } from "../../../../db.js";
import { auth } from "../../../../auth.js";

export const adminRouter = new Hono();

// Helper to get authenticated session and verify admin role
async function getAdminSession(c: any) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return null;
  if (session.user.role !== "admin") return null;
  return session;
}

// 1. GET /api/admin/cases - List all cases with triage filter options
adminRouter.get("/cases", async (c) => {
  const session = await getAdminSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền quản trị" }, 403);
  }

  try {
    const { stage, internal_status, limit } = c.req.query();
    
    // Build query conditions
    const where: any = {};
    if (stage) {
      where.user_facing_stage = stage;
    }
    if (internal_status) {
      where.internal_status = internal_status;
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
      take: limit ? parseInt(limit) : undefined,
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
  const session = await getAdminSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền quản trị" }, 403);
  }

  const caseId = c.req.param("id");

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
  const session = await getAdminSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền quản trị" }, 403);
  }

  const caseId = c.req.param("id");

  try {
    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      return c.json({ error: "Không tìm thấy case" }, 404);
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
  const session = await getAdminSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền quản trị" }, 403);
  }

  const caseId = c.req.param("id");
  try {
    const { reason } = await c.req.json();
    if (!reason || reason.trim().length < 10) {
      return c.json({ error: "Lý do từ chối tối thiểu phải 10 ký tự" }, 400);
    }

    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      return c.json({ error: "Không tìm thấy case" }, 404);
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
  const session = await getAdminSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền quản trị" }, 403);
  }

  const caseId = c.req.param("id");
  try {
    const { query } = await c.req.json();
    if (!query || query.trim().length < 5) {
      return c.json({ error: "Yêu cầu làm rõ tối thiểu phải 5 ký tự" }, 400);
    }

    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      return c.json({ error: "Không tìm thấy case" }, 404);
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
  const session = await getAdminSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền quản trị" }, 403);
  }

  const caseId = c.req.param("id");
  try {
    const { supporter_id } = await c.req.json();
    if (!supporter_id) {
      return c.json({ error: "Thiếu ID của supporter chuyên môn" }, 400);
    }

    // Verify supporter exists
    const supporterUser = await prisma.user.findUnique({
      where: { id: supporter_id },
    });
    if (!supporterUser || (supporterUser.role !== "supporter" && supporterUser.role !== "admin")) {
      return c.json({ error: "Supporter được gán không hợp lệ" }, 400);
    }

    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      return c.json({ error: "Không tìm thấy case" }, 404);
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
