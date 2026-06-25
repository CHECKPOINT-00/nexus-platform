import { Hono } from "hono";
import { prisma } from "../../../../db.js";
import { auth } from "../../../../auth.js";

export const casesRouter = new Hono();

// Helper to get authenticated session
async function getSession(c: any) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  return session;
}

// 1. GET /api/cases - List cases based on role
casesRouter.get("/", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Chưa đăng nhập" }, 401);
  }

  try {
    const role = session.user.role;
    let cases = [];

    if (role === "admin") {
      cases = await prisma.case.findMany({
        include: {
          owner: true,
          assigned_supporter: true,
          package: true,
        },
        orderBy: { created_at: "desc" },
      });
    } else if (role === "supporter") {
      cases = await prisma.case.findMany({
        where: {
          assigned_supporter_auth_user_id: session.user.id,
        },
        include: {
          owner: true,
          package: true,
        },
        orderBy: { created_at: "desc" },
      });
    } else {
      // Normal user: owner or team member
      cases = await prisma.case.findMany({
        where: {
          OR: [
            { owner_auth_user_id: session.user.id },
            { members: { some: { auth_user_id: session.user.id } } },
          ],
        },
        include: {
          assigned_supporter: true,
          package: true,
        },
        orderBy: { created_at: "desc" },
      });
    }

    return c.json(cases);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 2. POST /api/cases - Create a new case (Intake submission)
casesRouter.post("/", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Chưa đăng nhập" }, 401);
  }

  try {
    const body = await c.req.json();
    const {
      idea,
      pain_point,
      customer,
      alternatives,
      team_capability,
      deadline,
      drive_url,
      package_id,
      team_name,
      school,
      course_context,
    } = body;

    if (!idea || !pain_point || !customer || !drive_url || !package_id) {
      return c.json({ error: "Thiếu thông tin bắt buộc" }, 400);
    }

    // Generate random unique case code: NX-XXXXXX
    const randomCode = `NX-${Math.floor(100000 + Math.random() * 900000)}`;

    // DB Transaction to create case, default checkpoint and lifecycle unit
    const result = await prisma.$transaction(async (tx) => {
      // Create case
      const newCase = await tx.case.create({
        data: {
          case_code: randomCode,
          owner_auth_user_id: session.user.id,
          team_name: team_name || null,
          school: school || null,
          course_context: course_context || null,
          package_id,
          deadline: deadline ? new Date(deadline) : null,
          user_facing_stage: "intake",
          internal_status: "unassigned",
          payment_status: "unpaid",
          current_checkpoint: "CP1",
        },
      });

      // Create default checkpoint CP1
      const checkpoint = await tx.checkpoint.create({
        data: {
          case_id: newCase.id,
          checkpoint_code: "CP1",
          checkpoint_status: "draft",
          latest_version_no: 1,
        },
      });

      // Create intake lifecycle unit (v00)
      const contentObj = {
        idea,
        pain_point,
        customer,
        alternatives,
        team_capability,
      };

      await tx.lifecycleUnit.create({
        data: {
          case_id: newCase.id,
          checkpoint_id: checkpoint.id,
          unit_code: "v00",
          unit_type: "intake",
          version_no: 0,
          content: JSON.stringify(contentObj),
          file_url: drive_url,
        },
      });

      // Create log event
      await tx.caseEvent.create({
        data: {
          case_id: newCase.id,
          event_type: "case_created",
          actor_auth_user_id: session.user.id,
          metadata_json: { case_code: randomCode },
        },
      });

      return newCase;
    });

    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 2.5 GET /api/cases/supporters - Get list of supporters/admins (Admin only)
casesRouter.get("/supporters", async (c) => {
  const session = await getSession(c);
  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Không có quyền quản trị" }, 403);
  }

  try {
    const supporters = await prisma.user.findMany({
      where: {
        OR: [
          { role: "supporter" },
          { role: "admin" },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return c.json(supporters);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 3. GET /api/cases/:id - Get case details
casesRouter.get("/:id", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id");

  try {
    const caseDetails = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        owner: true,
        assigned_supporter: true,
        package: true,
        checkpoints: {
          include: {
            lifecycle_units: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        events: {
          include: {
            actor: true,
          },
          orderBy: { created_at: "desc" },
        },
        payments: {
          orderBy: { created_at: "desc" },
        },
        reports: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!caseDetails) {
      return c.json({ error: "Không tìm thấy dự án" }, 404);
    }

    // Role-based auth check
    const isOwner = caseDetails.owner_auth_user_id === session.user.id;
    const isMember = caseDetails.members.some((m) => m.auth_user_id === session.user.id);
    const isSupporter = caseDetails.assigned_supporter_auth_user_id === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isMember && !isSupporter && !isAdmin) {
      return c.json({ error: "Không có quyền truy cập dự án này" }, 403);
    }

    return c.json(caseDetails);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 4. POST /api/cases/:id/assign - Assign supporter (Admin only)
casesRouter.post("/:id/assign", async (c) => {
  const session = await getSession(c);
  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Không có quyền quản trị" }, 403);
  }

  const caseId = c.req.param("id");
  const { supporter_id } = await c.req.json();

  try {
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        assigned_supporter_auth_user_id: supporter_id || null,
        internal_status: supporter_id ? "assigned" : "unassigned",
      },
    });

    // Create log event
    await prisma.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "supporter_assigned",
        actor_auth_user_id: session.user.id,
        metadata_json: { supporter_id },
      },
    });

    return c.json(updatedCase);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 5. POST /api/cases/:id/status - Update stage/status (Admin/Supporter only)
casesRouter.post("/:id/status", async (c) => {
  const session = await getSession(c);
  if (!session || (session.user.role !== "admin" && session.user.role !== "supporter")) {
    return c.json({ error: "Không có quyền cập nhật trạng thái" }, 403);
  }

  const caseId = c.req.param("id");
  const { user_facing_stage, internal_status } = await c.req.json();

  try {
    // Check permission: if supporter, must be assigned
    if (session.user.role === "supporter") {
      const caseObj = await prisma.case.findUnique({ where: { id: caseId } });
      if (caseObj?.assigned_supporter_auth_user_id !== session.user.id) {
        return c.json({ error: "Không được phân công quản lý dự án này" }, 403);
      }
    }

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        user_facing_stage: user_facing_stage || undefined,
        internal_status: internal_status || undefined,
      },
    });

    // Create log event
    await prisma.caseEvent.create({
      data: {
        case_id: caseId,
        event_type: "status_updated",
        actor_auth_user_id: session.user.id,
        metadata_json: { user_facing_stage, internal_status },
      },
    });

    return c.json(updatedCase);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 6. GET /api/cases/:id/messages - Fetch messages
casesRouter.get("/:id/messages", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id");

  try {
    const messages = await prisma.caseMessage.findMany({
      where: { case_id: caseId },
      include: {
        sender: true,
      },
      orderBy: { created_at: "asc" },
    });

    return c.json(messages);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 7. POST /api/cases/:id/messages - Send message
casesRouter.post("/:id/messages", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id");
  const { content } = await c.req.json();

  if (!content) {
    return c.json({ error: "Nội dung tin nhắn trống" }, 400);
  }

  try {
    const newMessage = await prisma.caseMessage.create({
      data: {
        case_id: caseId,
        sender_auth_user_id: session.user.id,
        sender_role_snapshot: session.user.role,
        content,
      },
      include: {
        sender: true,
      },
    });

    return c.json(newMessage, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 8. PUT /api/cases/:id/settings - Update case settings (Owner, member, or admin only)
casesRouter.put("/:id/settings", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id");
  const { team_name, school, course_context, group_no } = await c.req.json();

  try {
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: { members: true },
    });

    if (!existingCase) {
      return c.json({ error: "Không tìm thấy case" }, 404);
    }

    const isOwner = existingCase.owner_auth_user_id === session.user.id;
    const isMember = existingCase.members.some((m) => m.auth_user_id === session.user.id);
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isMember && !isAdmin) {
      return c.json({ error: "Không có quyền chỉnh sửa dự án này" }, 403);
    }

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        team_name: team_name !== undefined ? team_name : existingCase.team_name,
        school: school !== undefined ? school : existingCase.school,
        course_context: course_context !== undefined ? course_context : existingCase.course_context,
        group_no: group_no !== undefined ? group_no : existingCase.group_no,
      },
    });

    return c.json(updatedCase);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
