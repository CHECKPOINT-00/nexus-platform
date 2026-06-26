import { Hono } from "hono";
import { prisma } from "../../../../db.js";
import { auth } from "../../../../auth.js";
import { generateReportDraft } from "../../../../services/ai.js";

export const supporterRouter = new Hono();

// Helper to get authenticated session and verify supporter or admin role
async function getSupporterSession(c: any) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return null;
  if (session.user.role !== "supporter" && session.user.role !== "admin") return null;
  return session;
}

// 1. POST /api/supporter/cases/:caseId/reports/draft - Create draft report
supporterRouter.post("/cases/:caseId/reports/draft", async (c) => {
  const session = await getSupporterSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền supporter" }, 403);
  }

  const caseId = c.req.param("caseId");

  try {
    const caseObj = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        checkpoints: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
    });

    if (!caseObj) {
      return c.json({ error: "Không tìm thấy dự án" }, 404);
    }

    // Supporter authorization check: must be assigned supporter (unless admin)
    if (session.user.role !== "admin" && caseObj.assigned_supporter_auth_user_id !== session.user.id) {
      return c.json({ error: "Bạn không được phân công quản lý dự án này" }, 403);
    }

    const checkpoint = caseObj.checkpoints[0];
    if (!checkpoint) {
      return c.json({ error: "Không tìm thấy checkpoint cho dự án này" }, 404);
    }

    // Find the latest lifecycle unit (could be intake v00 or revision v0x)
    const latestUnit = await prisma.lifecycleUnit.findFirst({
      where: { case_id: caseId },
      orderBy: { version_no: "desc" },
    });

    if (!latestUnit || !latestUnit.content) {
      return c.json({ error: "Không tìm thấy dữ liệu bản nộp nào để phản biện" }, 400);
    }

    // Check if a draft report already exists for this lifecycle unit
    const existingDraft = await prisma.report.findFirst({
      where: {
        case_id: caseId,
        lifecycle_unit_id: latestUnit.id,
        status: "draft",
      },
    });

    if (existingDraft) {
      return c.json(existingDraft);
    }

    // Parse data to feed to AI
    const rawData = JSON.parse(latestUnit.content);

    // Call AI service to generate draft findings
    const aiOutput = await generateReportDraft(rawData);

    // Create draft report
    const report = await prisma.report.create({
      data: {
        case_id: caseId,
        checkpoint_id: checkpoint.id,
        lifecycle_unit_id: latestUnit.id,
        report_type: "ai_audit",
        content_md: JSON.stringify(aiOutput),
        status: "draft",
        created_by: "AI",
      },
    });

    // Create log event
    await prisma.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "report_draft_created",
        actor_auth_user_id: session.user.id,
        metadata_json: { report_id: report.id },
      },
    });

    return c.json(report, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 2. GET /api/supporter/cases/:caseId/reports/draft - Get draft report
supporterRouter.get("/cases/:caseId/reports/draft", async (c) => {
  const session = await getSupporterSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền supporter" }, 403);
  }

  const caseId = c.req.param("caseId");

  try {
    const caseObj = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseObj) {
      return c.json({ error: "Không tìm thấy dự án" }, 404);
    }

    if (session.user.role !== "admin" && caseObj.assigned_supporter_auth_user_id !== session.user.id) {
      return c.json({ error: "Bạn không được phân công quản lý dự án này" }, 403);
    }

    const report = await prisma.report.findFirst({
      where: {
        case_id: caseId,
        status: "draft",
      },
      orderBy: { created_at: "desc" },
    });

    if (!report) {
      return c.json({ error: "Không tìm thấy báo cáo nháp nào" }, 404);
    }

    return c.json(report);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 3. PUT /api/supporter/reports/:reportId - Edit draft report content
supporterRouter.put("/reports/:reportId", async (c) => {
  const session = await getSupporterSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền supporter" }, 403);
  }

  const reportId = c.req.param("reportId");

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { case: true },
    });

    if (!report) {
      return c.json({ error: "Không tìm thấy báo cáo" }, 404);
    }

    if (session.user.role !== "admin" && report.case.assigned_supporter_auth_user_id !== session.user.id) {
      return c.json({ error: "Bạn không được phân công quản lý dự án này" }, 403);
    }

    if (report.status !== "draft") {
      return c.json({ error: "Báo cáo đã xuất bản không thể chỉnh sửa" }, 400);
    }

    const { content_md } = await c.req.json();
    if (!content_md) {
      return c.json({ error: "Nội dung báo cáo không được trống" }, 400);
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { content_md },
    });

    return c.json(updatedReport);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 4. POST /api/supporter/reports/:reportId/publish - Publish draft report
supporterRouter.post("/reports/:reportId/publish", async (c) => {
  const session = await getSupporterSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền supporter" }, 403);
  }

  const reportId = c.req.param("reportId");

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { case: true },
    });

    if (!report) {
      return c.json({ error: "Không tìm thấy báo cáo" }, 404);
    }

    if (session.user.role !== "admin" && report.case.assigned_supporter_auth_user_id !== session.user.id) {
      return c.json({ error: "Bạn không được phân công quản lý dự án này" }, 403);
    }

    if (report.status !== "draft") {
      return c.json({ error: "Báo cáo đã được xuất bản trước đó" }, 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update report status to APPROVED
      const approvedReport = await tx.report.update({
        where: { id: reportId },
        data: {
          status: "APPROVED",
          approved_by_auth_user_id: session.user.id,
          sent_at: new Date(),
        },
      });

      // 2. Update case stage & internal status
      await tx.case.update({
        where: { id: report.case_id },
        data: {
          user_facing_stage: "report_ready",
          internal_status: "waiting_user",
        },
      });

      // 3. Create event
      await tx.caseEvent.create({
        data: {
          case_id: report.case_id,
          event_type: "report_published",
          actor_auth_user_id: session.user.id,
          metadata_json: { report_id: reportId },
        },
      });

      return approvedReport;
    });

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 5. POST /api/supporter/cases/:caseId/request-more-info - Supporter request more info
supporterRouter.post("/cases/:caseId/request-more-info", async (c) => {
  const session = await getSupporterSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền supporter" }, 403);
  }

  const caseId = c.req.param("caseId");

  try {
    const { query } = await c.req.json();
    if (!query || query.trim().length < 5) {
      return c.json({ error: "Nội dung yêu cầu làm rõ tối thiểu phải 5 ký tự" }, 400);
    }

    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    if (session.user.role !== "admin" && caseItem.assigned_supporter_auth_user_id !== session.user.id) {
      return c.json({ error: "Bạn không được phân công quản lý dự án này" }, 403);
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

// 6. POST /api/supporter/cases/:caseId/close - Close case
supporterRouter.post("/cases/:caseId/close", async (c) => {
  const session = await getSupporterSession(c);
  if (!session) {
    return c.json({ error: "Không có quyền supporter" }, 403);
  }

  const caseId = c.req.param("caseId");

  try {
    const { reason } = await c.req.json();
    if (!reason || reason.trim().length < 10) {
      return c.json({ error: "Lý do đóng case tối thiểu phải 10 ký tự" }, 400);
    }

    const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
    if (!caseItem) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    if (session.user.role !== "admin" && caseItem.assigned_supporter_auth_user_id !== session.user.id) {
      return c.json({ error: "Bạn không được phân công quản lý dự án này" }, 403);
    }

    const updatedCase = await prisma.$transaction(async (tx) => {
      const updated = await tx.case.update({
        where: { id: caseId },
        data: {
          user_facing_stage: "completed",
          internal_status: "done",
        },
      });

      await tx.caseEvent.create({
        data: {
          case_id: caseId,
          event_type: "case_closed",
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
