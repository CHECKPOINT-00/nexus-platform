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

// Helper function to validate CP1 Intake payload
function validateCp1Intake(body: any): string[] {
  const errors: string[] = [];
  if (!body) {
    errors.push("Dữ liệu trống");
    return errors;
  }

  // 1. Contact validation
  const contact = body.contact;
  if (!contact) {
    errors.push("Thiếu thông tin liên hệ");
  } else {
    if (!contact.full_name || typeof contact.full_name !== "string" || contact.full_name.trim().length < 2) {
      errors.push("Họ tên người liên hệ không hợp lệ (tối thiểu 2 ký tự)");
    }
    if (!contact.student_code || typeof contact.student_code !== "string" || contact.student_code.trim().length < 5) {
      errors.push("Mã số sinh viên không hợp lệ (tối thiểu 5 ký tự)");
    }
    if (!contact.team_role || typeof contact.team_role !== "string" || contact.team_role.trim().length < 2) {
      errors.push("Vai trò trong nhóm không hợp lệ");
    }
    if (!contact.zalo || typeof contact.zalo !== "string" || !/^\d{10}$/.test(contact.zalo.trim())) {
      errors.push("Số điện thoại Zalo không hợp lệ (phải bao gồm chính xác 10 chữ số)");
    }
    if (!contact.email || typeof contact.email !== "string" || !contact.email.includes("@")) {
      errors.push("Email liên hệ không hợp lệ");
    }
  }

  // 2. Main content validation
  const current_situations = body.current_situations;
  const case_summary = body.case_summary;
  const support_needs = body.support_needs;

  const hasSituation = Array.isArray(current_situations) && current_situations.length > 0 && current_situations.some(s => typeof s === "string" && s.trim().length > 0);
  const hasSummary = typeof case_summary === "string" && case_summary.trim().length >= 20;
  const hasPrimaryNeed = support_needs && typeof support_needs.primary_need === "string" && support_needs.primary_need.trim().length >= 5;

  if (!hasSituation && !hasSummary && !hasPrimaryNeed) {
    errors.push("Cần cung cấp ít nhất một trong các thông tin: Tình huống hiện tại, Tóm tắt dự án (tối thiểu 20 ký tự), hoặc Nhu cầu hỗ trợ chính");
  }

  // 3. Documents validation (Single Google Drive folder + checked document types)
  const documents = body.documents;
  if (!Array.isArray(documents) || documents.length === 0) {
    errors.push("Thư mục Google Drive tài liệu là bắt buộc");
  } else {
    const folderDoc = documents[0];
    if (!folderDoc.drive_url || typeof folderDoc.drive_url !== "string" || !/^https?:\/\/(drive|docs)\.google\.com\/.*/.test(folderDoc.drive_url.trim())) {
      errors.push("Đường dẫn thư mục Google Drive không hợp lệ (phải bắt đầu bằng drive.google.com hoặc docs.google.com)");
    }
    if (!folderDoc.document_type || typeof folderDoc.document_type !== "string" || folderDoc.document_type.trim().length === 0) {
      errors.push("Vui lòng chọn ít nhất một loại tài liệu có trong thư mục");
    }
  }

  // 4. Boundary confirmations validation
  const boundary_confirmations = body.boundary_confirmations;
  if (!Array.isArray(boundary_confirmations) || boundary_confirmations.length < 3) {
    errors.push("Phải xác nhận đầy đủ ít nhất 3 cam kết ranh giới");
  }

  return errors;
}

// 2. POST /api/cases - Create a new case (Intake submission)
casesRouter.post("/", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Chưa đăng nhập" }, 401);
  }

  try {
    const body = await c.req.json();
    const validationErrors = validateCp1Intake(body);
    if (validationErrors.length > 0) {
      return c.json({ error: "Dữ liệu không hợp lệ", details: validationErrors }, 400);
    }

    const {
      package_id,
      deadline,
      team_context,
    } = body;

    if (!package_id) {
      return c.json({ error: "Thiếu gói dịch vụ (package_id)" }, 400);
    }

    // Generate random unique case code: NX-XXXXXX
    let randomCode = `NX-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Check duplication (retry up to 3 times)
    let isUnique = false;
    let retries = 0;
    while (!isUnique && retries < 3) {
      const existing = await prisma.case.findUnique({ where: { case_code: randomCode } });
      if (!existing) {
        isUnique = true;
      } else {
        randomCode = `NX-${Math.floor(100000 + Math.random() * 900000)}`;
        retries++;
      }
    }

    if (!isUnique) {
      return c.json({ error: "Không thể tạo mã case duy nhất, vui lòng thử lại." }, 500);
    }

    const team_name = team_context?.project_name || null;
    const school = body.school || null;
    const course_context = body.course_context || null;
    const group_no = team_context?.group_no || null;

    // DB Transaction to create case, default checkpoint and lifecycle unit
    const result = await prisma.$transaction(async (tx) => {
      // Check package price to determine initial payment status
      const servicePackage = await tx.servicePackage.findUnique({
        where: { id: package_id },
      });
      const isFree = servicePackage ? servicePackage.price === 0 : false;

      // Create case
      const newCase = await tx.case.create({
        data: {
          case_code: randomCode,
          owner_auth_user_id: session.user.id,
          team_name,
          school,
          course_context,
          group_no,
          package_id,
          deadline: deadline ? new Date(deadline) : null,
          user_facing_stage: "submitted",
          internal_status: "triage_pending",
          payment_status: isFree ? "paid" : "unpaid",
          current_checkpoint: "CP1",
        },
      });

      // Create default checkpoint CP1
      const checkpoint = await tx.checkpoint.create({
        data: {
          case_id: newCase.id,
          checkpoint_code: "CP1",
          checkpoint_status: "submitted",
          latest_version_no: 1,
        },
      });

      // Create intake lifecycle unit (v00)
      await tx.lifecycleUnit.create({
        data: {
          case_id: newCase.id,
          checkpoint_id: checkpoint.id,
          unit_code: "v00",
          unit_type: "intake",
          version_no: 1,
          content: JSON.stringify(body),
          file_url: body.documents?.[0]?.drive_url || null,
        },
      });

      // Create log event
      await tx.caseEvent.create({
        data: {
          case_id: newCase.id,
          event_type: "case_submitted",
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

// 3. GET /api/cases/:id - Get case details (Normalized shape for Workspace)
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

    // 1. Get intake snapshot from LifecycleUnit v00
    const intakeUnit = await prisma.lifecycleUnit.findFirst({
      where: {
        case_id: caseId,
        unit_type: "intake",
        unit_code: "v00",
      },
    });
    let intake_snapshot = null;
    if (intakeUnit && intakeUnit.content) {
      try {
        intake_snapshot = JSON.parse(intakeUnit.content);
      } catch (e) {}
    }

    // 2. Get latest approved report
    const latest_report = await prisma.report.findFirst({
      where: {
        case_id: caseId,
        status: "APPROVED",
      },
      orderBy: { created_at: "desc" },
    });

    // 3. Get latest user action
    const latest_user_action = await prisma.caseEvent.findFirst({
      where: {
        case_id: caseId,
        actor: {
          role: "user",
        },
      },
      orderBy: { created_at: "desc" },
    });

    // 4. Get document board sections
    const lifecycleUnits = await prisma.lifecycleUnit.findMany({
      where: { case_id: caseId },
      orderBy: { created_at: "desc" },
    });
    const reports = await prisma.report.findMany({
      where: { case_id: caseId, status: "APPROVED" },
      orderBy: { created_at: "desc" },
    });

    const team_submissions = lifecycleUnits.filter(u => u.unit_type === "intake");
    const team_revisions = lifecycleUnits.filter(u => u.unit_type === "revision");
    const nexus_reports = reports;

    // 5. Get round history
    const round_history = lifecycleUnits.map(unit => {
      const report = reports.find(r => r.lifecycle_unit_id === unit.id);
      return {
        round_no: unit.version_no,
        submitted_at: unit.created_at,
        submission: unit,
        report: report || null,
      };
    }).sort((a, b) => b.round_no - a.round_no); // Latest rounds first

    // 6. Get open requests for more info
    const open_requests_for_more_info = await prisma.caseEvent.findMany({
      where: {
        case_id: caseId,
        event_type: "more_info_requested",
      },
      orderBy: { created_at: "desc" },
    });

    return c.json({
      case: caseDetails,
      intake_snapshot,
      latest_report,
      latest_user_action,
      document_board_sections: {
        team_submissions,
        nexus_reports,
        team_revisions,
      },
      round_history,
      open_requests_for_more_info,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 3.5 POST /api/cases/:id/revisions - Student submits a revision
casesRouter.post("/:id/revisions", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Chưa đăng nhập" }, 401);
  }

  const caseId = c.req.param("id");

  try {
    const caseDetails = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        members: true,
        checkpoints: true,
      },
    });

    if (!caseDetails) {
      return c.json({ error: "Không tìm thấy dự án" }, 404);
    }

    const isOwner = caseDetails.owner_auth_user_id === session.user.id;
    const isMember = caseDetails.members.some((m) => m.auth_user_id === session.user.id);
    if (!isOwner && !isMember) {
      return c.json({ error: "Không có quyền nộp sửa đổi cho dự án này" }, 403);
    }

    // Ensure status allows revision
    const validStages = ["report_ready", "waiting_for_revision", "need_more_information"];
    if (!validStages.includes(caseDetails.user_facing_stage)) {
      return c.json({ error: "Trạng thái hiện tại của dự án không cho phép nộp bản sửa đổi" }, 400);
    }

    const body = await c.req.json();
    const { change_summary, documents, remaining_blockers } = body;

    if (!change_summary || change_summary.trim().length < 10) {
      return c.json({ error: "Tóm tắt thay đổi tối thiểu phải 10 ký tự" }, 400);
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return c.json({ error: "Phải đính kèm ít nhất một tài liệu sửa đổi" }, 400);
    }

    const checkpoint = caseDetails.checkpoints[0];
    if (!checkpoint) {
      return c.json({ error: "Không tìm thấy thông tin checkpoint" }, 404);
    }

    const nextVersion = checkpoint.latest_version_no + 1;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update checkpoint latest version
      await tx.checkpoint.update({
        where: { id: checkpoint.id },
        data: {
          latest_version_no: nextVersion,
        },
      });

      // 2. Create LifecycleUnit for revision
      const revisionUnit = await tx.lifecycleUnit.create({
        data: {
          case_id: caseId,
          checkpoint_id: checkpoint.id,
          unit_code: `v0${nextVersion}`,
          unit_type: "revision",
          version_no: nextVersion,
          content: JSON.stringify({ change_summary, documents, remaining_blockers }),
          file_url: documents[0]?.drive_url || documents[0]?.file_url || null,
        },
      });

      // 3. Update case status
      const updatedCase = await tx.case.update({
        where: { id: caseId },
        data: {
          user_facing_stage: "revision_submitted",
          internal_status: "assigned", // Return to supporter queue
        },
      });

      // 4. Create event
      await tx.caseEvent.create({
        data: {
          case_id: caseId,
          event_type: "revision_submitted",
          actor_auth_user_id: session.user.id,
          metadata_json: { version_no: nextVersion, change_summary },
        },
      });

      return revisionUnit;
    });

    return c.json(result, 201);
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
