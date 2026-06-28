import { Hono } from "hono";
import { prisma } from "../../../../db.js";
import { generateReportDraft } from "../../../../services/ai.js";
import { requireCaseAccess, requireReportCaseAccess } from "../../../../shared/infrastructure/authorization.js";

export const supporterRouter = new Hono();

// 1. POST /api/supporter/cases/:caseId/reports/draft - Create draft report
supporterRouter.post("/cases/:caseId/reports/draft", async (c) => {
  const caseId = c.req.param("caseId");
  const access = await requireCaseAccess(c, caseId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const latestUnit = await prisma.lifecycleUnit.findFirst({
      where: {
        case_id: caseId,
        unit_code: "intake",
      },
      orderBy: { version_no: "desc" },
    });

    if (!latestUnit?.content) {
      return c.json({ error: "Không tìm thấy dữ liệu intake" }, 404);
    }

    let rawData: any;
    try {
      rawData = JSON.parse(latestUnit.content);
    } catch {
      return c.json({ error: "Dữ liệu intake bị lỗi định dạng JSON" }, 400);
    }

    const aiOutput = await generateReportDraft(rawData);
    const contentMd = JSON.stringify(aiOutput);

    const existingDraft = await prisma.report.findFirst({
      where: {
        case_id: caseId,
        status: "draft",
      },
      orderBy: { updated_at: "desc" },
    });

    const report = existingDraft
      ? await prisma.report.update({
          where: { id: existingDraft.id },
          data: {
            checkpoint_id: latestUnit.checkpoint_id,
            lifecycle_unit_id: latestUnit.id,
            report_type: "checkpoint_1_review",
            content_md: contentMd,
            created_by: access.session.user.id,
          },
        })
      : await prisma.report.create({
          data: {
            case_id: caseId,
            checkpoint_id: latestUnit.checkpoint_id,
            lifecycle_unit_id: latestUnit.id,
            report_type: "checkpoint_1_review",
            content_md: contentMd,
            status: "draft",
            created_by: access.session.user.id,
          },
        });

    return c.json(report, existingDraft ? 200 : 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 2. GET /api/supporter/cases/:caseId/reports/draft - Get draft report
supporterRouter.get("/cases/:caseId/reports/draft", async (c) => {
  const caseId = c.req.param("caseId");
  const access = await requireCaseAccess(c, caseId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const report = await prisma.report.findFirst({
      where: {
        case_id: caseId,
        status: "draft",
      },
      orderBy: { updated_at: "desc" },
    });

    return c.json(report);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 3. PUT /api/supporter/reports/:reportId - Edit draft report content
supporterRouter.put("/reports/:reportId", async (c) => {
  const reportId = c.req.param("reportId");
  const access = await requireReportCaseAccess(c, reportId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const { contentMd } = await c.req.json();
    if (typeof contentMd !== "string" || !contentMd.trim()) {
      return c.json({ error: "Nội dung báo cáo không được để trống" }, 400);
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        content_md: contentMd,
      },
    });

    return c.json(updated);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 4. POST /api/supporter/reports/:reportId/publish - Publish draft report
supporterRouter.post("/reports/:reportId/publish", async (c) => {
  const reportId = c.req.param("reportId");
  const access = await requireReportCaseAccess(c, reportId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return c.json({ error: "Không tìm thấy báo cáo" }, 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedReport = await tx.report.update({
        where: { id: reportId },
        data: {
          status: "APPROVED",
          approved_by_auth_user_id: access.session.user.id,
          sent_at: new Date(),
        },
      });

      await tx.case.update({
        where: { id: report.case_id },
        data: {
          user_facing_stage: "report_ready",
          internal_status: "report_ready_to_publish",
        },
      });

      return updatedReport;
    });

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 5. POST /api/supporter/cases/:caseId/request-more-info - Supporter request more info
supporterRouter.post("/cases/:caseId/request-more-info", async (c) => {
  const caseId = c.req.param("caseId");
  const access = await requireCaseAccess(c, caseId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const body = await c.req.json();
    const query = typeof body.query === "string" ? body.query : "";

    if (!query.trim()) {
      return c.json({ error: "Thiếu nội dung yêu cầu bổ sung" }, 400);
    }

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        user_facing_stage: "need_more_information",
        internal_status: "waiting_user",
      },
    });

    await prisma.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "request_more_info",
        actor_auth_user_id: access.session.user.id,
        metadata_json: { query },
      },
    });

    return c.json(updatedCase);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 6. POST /api/supporter/cases/:caseId/close - Close case
supporterRouter.post("/cases/:caseId/close", async (c) => {
  const caseId = c.req.param("caseId");
  const access = await requireCaseAccess(c, caseId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  try {
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        user_facing_stage: "closed",
        internal_status: "done",
      },
    });

    await prisma.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "case_closed",
        actor_auth_user_id: access.session.user.id,
      },
    });

    return c.json(updatedCase);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});