import { Hono } from "hono";
import { prisma } from "../../../../db.js";
import { generateReportDraft } from "../../../../services/ai.js";
import { requireCaseAccess, requireReportCaseAccess, isFinalCaseStage } from "../../../../shared/infrastructure/authorization.js";

export const reportsRouter = new Hono();

// 1. POST /api/reports/:caseId/draft - Generate AI draft report (Supporter/Admin only)
reportsRouter.post("/:caseId/draft", async (c) => {
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
    if (isFinalCaseStage(access.caseRecord.user_facing_stage)) {
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
      return c.json({ error: "Không tìm thấy dữ liệu intake của dự án" }, 404);
    }

    let intakeData: any;
    try {
      intakeData = JSON.parse(latestUnit.content);
    } catch {
      return c.json({ error: "Dữ liệu intake bị lỗi định dạng JSON" }, 400);
    }

    let aiOutput;
    try {
      aiOutput = await generateReportDraft(intakeData);
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

// 2. GET /api/reports/:caseId/draft - Get draft report (Supporter/Admin only)
reportsRouter.get("/:caseId/draft", async (c) => {
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

// 3. PUT /api/reports/:id - Edit draft report (Supporter/Admin only)
reportsRouter.put("/:id", async (c) => {
  const reportId = c.req.param("id");
  const access = await requireReportCaseAccess(c, reportId, {
    allowStudent: false,
    allowSupporter: true,
    allowAdmin: true,
  });

  if (!access.ok) {
    return access.response;
  }

  const report = access.report;
  if (!report || !report.case) {
    return c.json({ error: "Không tìm thấy báo cáo" }, 404);
  }

  if (report.case.id !== access.caseRecord.id) {
    return c.json({ error: "Không có quyền chỉnh sửa báo cáo này" }, 403);
  }

  try {
    const dbReport = await prisma.report.findUnique({
      where: { id: reportId },
      select: { status: true },
    });

    if (!dbReport) {
      return c.json({ error: "Không tìm thấy báo cáo" }, 404);
    }

    if (dbReport.status !== "draft") {
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

// 4. POST /api/reports/:id/approve - Approve and send report to student (Supporter/Admin only)
reportsRouter.post("/:id/approve", async (c) => {
  const reportId = c.req.param("id");
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

// 5. GET /api/reports/:caseId/latest - Get latest approved report (Student & Supporter)
reportsRouter.get("/:caseId/latest", async (c) => {
  const caseId = c.req.param("caseId");
  const access = await requireCaseAccess(c, caseId, {
    allowStudent: true,
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
        status: "APPROVED",
      },
      orderBy: { updated_at: "desc" },
    });

    return c.json(report);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});