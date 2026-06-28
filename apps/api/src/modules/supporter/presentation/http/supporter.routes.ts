import { Hono } from "hono";
import { prisma } from "../../../../db.js";
import { generateReportDraft } from "../../../../services/ai.js";
import { isFinalCaseStage, requireCaseAccess, requireReportCaseAccess } from "../../../../shared/infrastructure/authorization.js";

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
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        user_facing_stage: true,
        internal_status: true,
        assigned_supporter_auth_user_id: true,
      },
    });

    if (!caseRecord) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    if (isFinalCaseStage(caseRecord.user_facing_stage)) {
      return c.json({ error: "Dự án đã ở trạng thái cuối, không thể tạo bản nháp mới" }, 409);
    }

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

    let aiOutput;
    try {
      aiOutput = await generateReportDraft(rawData);
    } catch (aiError: any) {
      console.error("AI Generation failed:", aiError);
      return c.json({ error: "Dịch vụ AI phản biện gặp sự cố, vui lòng thử lại sau" }, 502);
    }
    const contentMd = JSON.stringify(aiOutput);

    const report = await prisma.$transaction(async (tx) => {
      const existingDraft = await tx.report.findFirst({
        where: {
          case_id: caseId,
          status: "draft",
        },
        orderBy: { updated_at: "desc" },
      });

      if (existingDraft) {
        return await tx.report.update({
          where: { id: existingDraft.id },
          data: {
            checkpoint_id: latestUnit.checkpoint_id,
            lifecycle_unit_id: latestUnit.id,
            report_type: "checkpoint_1_review",
            content_md: contentMd,
            created_by: access.session.user.id,
          },
        });
      } else {
        return await tx.report.create({
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
      }
    });

    return c.json(report, 201);
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
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { status: true },
    });

    if (!report) {
      return c.json({ error: "Không tìm thấy báo cáo" }, 404);
    }

    if (report.status !== "draft") {
      return c.json({ error: "Báo cáo đã được xuất bản hoặc đã chốt trạng thái, không thể chỉnh sửa" }, 409);
    }

    const body = await c.req.json();
    const contentMd = typeof body.contentMd === "string" ? body.contentMd.trim() : "";
    if (!contentMd) {
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
      include: {
        case: {
          select: {
            id: true,
            user_facing_stage: true,
            internal_status: true,
          },
        },
      },
    });

    if (!report) {
      return c.json({ error: "Không tìm thấy báo cáo" }, 404);
    }

    if (report.status !== "draft") {
      return c.json({ error: "Báo cáo đã được xuất bản hoặc đã chốt trạng thái" }, 409);
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
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      return c.json({ error: "Thiếu nội dung yêu cầu bổ sung" }, 400);
    }

    const currentCase = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        user_facing_stage: true,
        internal_status: true,
      },
    });

    if (!currentCase) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    if (isFinalCaseStage(currentCase.user_facing_stage)) {
      return c.json({ error: "Dự án đã ở trạng thái cuối, không thể yêu cầu bổ sung thông tin" }, 400);
    }

    if (currentCase.user_facing_stage === "need_more_information" && currentCase.internal_status === "waiting_user") {
      return c.json(currentCase);
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
    const currentCase = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        user_facing_stage: true,
        internal_status: true,
      },
    });

    if (!currentCase) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    if (currentCase.user_facing_stage === "closed" && currentCase.internal_status === "done") {
      return c.json(currentCase);
    }

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