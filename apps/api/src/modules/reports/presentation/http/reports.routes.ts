import { Hono } from "hono";
import { prisma } from "../../../../db.js";
import { auth } from "../../../../auth.js";
import { generateReportDraft } from "../../../../services/ai.js";

export const reportsRouter = new Hono();

// Helper to get authenticated session
async function getSession(c: any) {
  return await auth.api.getSession({ headers: c.req.raw.headers });
}

// 1. POST /api/reports/:caseId/draft - Generate AI draft report (Supporter/Admin only)
reportsRouter.post("/:caseId/draft", async (c) => {
  const session = await getSession(c);
  if (!session || (session.user.role !== "supporter" && session.user.role !== "admin")) {
    return c.json({ error: "Không có quyền thực hiện hành động này" }, 403);
  }

  const caseId = c.req.param("caseId");

  try {
    // 1. Fetch case details and latest checkpoint
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

    const checkpoint = caseObj.checkpoints[0];
    if (!checkpoint) {
      return c.json({ error: "Không tìm thấy checkpoint cho dự án này" }, 404);
    }

    // 2. Fetch the latest intake lifecycle unit (v00) to get business details
    const lifecycleUnit = await prisma.lifecycleUnit.findFirst({
      where: {
        case_id: caseId,
        unit_type: "intake",
      },
      orderBy: { created_at: "desc" },
    });

    if (!lifecycleUnit || !lifecycleUnit.content) {
      return c.json({ error: "Không tìm thấy dữ liệu Intake hợp lệ" }, 400);
    }

    const intakeData = JSON.parse(lifecycleUnit.content);

    // 3. Call AI service to generate report findings
    const aiOutput = await generateReportDraft({
      idea: intakeData.idea,
      customer: intakeData.customer,
      pain_point: intakeData.pain_point,
      alternatives: intakeData.alternatives,
      team_capability: intakeData.team_capability,
      drive_url: lifecycleUnit.file_url || undefined,
    });

    // 4. Create new Report record with status 'draft'
    const report = await prisma.report.create({
      data: {
        case_id: caseId,
        checkpoint_id: checkpoint.id,
        lifecycle_unit_id: lifecycleUnit.id,
        report_type: "ai_audit",
        content_md: JSON.stringify(aiOutput),
        status: "draft",
        created_by: "AI",
      },
    });

    // 5. Create AI Job record for logging
    await prisma.aiJob.create({
      data: {
        case_id: caseId,
        job_type: "audit_generation",
        status: "completed",
        input_json: intakeData as any,
        output_json: aiOutput as any,
      },
    });

    // 6. Create CaseEvent
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
    // Log job failure
    try {
      await prisma.aiJob.create({
        data: {
          case_id: caseId,
          job_type: "audit_generation",
          status: "failed",
          attempt_count: 1,
        },
      });
    } catch (_) {}

    return c.json({ error: error.message }, 500);
  }
});

// 2. GET /api/reports/:caseId/draft - Get draft report (Supporter/Admin only)
reportsRouter.get("/:caseId/draft", async (c) => {
  const session = await getSession(c);
  if (!session || (session.user.role !== "supporter" && session.user.role !== "admin")) {
    return c.json({ error: "Không có quyền truy cập báo cáo nháp" }, 403);
  }

  const caseId = c.req.param("caseId");

  try {
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

// 3. PUT /api/reports/:id - Edit draft report (Supporter/Admin only)
reportsRouter.put("/:id", async (c) => {
  const session = await getSession(c);
  if (!session || (session.user.role !== "supporter" && session.user.role !== "admin")) {
    return c.json({ error: "Không có quyền chỉnh sửa báo cáo" }, 403);
  }

  const id = c.req.param("id");
  const { content_md } = await c.req.json();

  try {
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        content_md,
      },
    });

    return c.json(updatedReport);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 4. POST /api/reports/:id/approve - Approve and send report to student (Supporter/Admin only)
reportsRouter.post("/:id/approve", async (c) => {
  const session = await getSession(c);
  if (!session || (session.user.role !== "supporter" && session.user.role !== "admin")) {
    return c.json({ error: "Không có quyền phê duyệt báo cáo" }, 403);
  }

  const id = c.req.param("id");

  try {
    // 1. Fetch current report
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return c.json({ error: "Không tìm thấy báo cáo" }, 404);
    }

    // 2. Transaction to update report and case status
    const result = await prisma.$transaction(async (tx) => {
      const approvedReport = await tx.report.update({
        where: { id },
        data: {
          status: "APPROVED",
          approved_by_auth_user_id: session.user.id,
          sent_at: new Date(),
        },
      });

      await tx.case.update({
        where: { id: report.case_id },
        data: {
          user_facing_stage: "done",
          internal_status: "done",
        },
      });

      // Log event
      await tx.caseEvent.create({
        data: {
          case_id: report.case_id,
          event_type: "report_approved",
          actor_auth_user_id: session.user.id,
          metadata_json: { report_id: id },
        },
      });

      return approvedReport;
    });

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 5. GET /api/reports/:caseId/latest - Get latest approved report (Student & Supporter)
reportsRouter.get("/:caseId/latest", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("caseId");

  try {
    const report = await prisma.report.findFirst({
      where: {
        case_id: caseId,
        status: "APPROVED",
      },
      orderBy: { created_at: "desc" },
    });

    if (!report) {
      return c.json({ error: "Không tìm thấy báo cáo đã phê duyệt" }, 404);
    }

    return c.json(report);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
