import { Hono } from "hono";
import { prisma } from "../../../../db.js";
import { auth } from "../../../../auth.js";
import fs from "fs";
import path from "path";
import { isFinalPaymentStatus, normalizePaymentStatus, requireCaseAccess } from "../../../../shared/infrastructure/authorization.js";

export const paymentsRouter = new Hono();

// Helper to get authenticated session
async function getSession(c: any) {
  try {
    return await auth.api.getSession({ headers: c.req.raw.headers });
  } catch (error) {
    console.error("Error in payments getSession:", error);
    return null;
  }
}

// 1. GET /api/payments - Get all payments (Admin only)
paymentsRouter.get("/", async (c) => {
  const session = await getSession(c);
  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Không có quyền quản trị" }, 403);
  }

  try {
    const payments = await prisma.payment.findMany({
      include: {
        case: {
          select: {
            case_code: true,
            team_name: true,
            owner: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return c.json(
      payments.map((payment) => ({
        ...payment,
        status: normalizePaymentStatus(payment.status),
      })),
    );
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 2. POST /api/payments/proof - Upload proof of payment (Student only)
paymentsRouter.post("/proof", async (c) => {
  const session = await getSession(c);
  if (!session) {
    return c.json({ error: "Chưa đăng nhập" }, 401);
  }

  try {
    const body = await c.req.parseBody();
    const file = body["file"] as any; // File or Blob object
    const caseId = (body["case_id"] || body["caseId"]) as string;

    if (!file || !caseId) {
      return c.json({ error: "Thiếu tệp minh chứng hoặc ID dự án" }, 400);
    }

    const access = await requireCaseAccess(c, caseId, {
      allowStudent: true,
      allowSupporter: false,
      allowAdmin: true,
    });
    if (!access.ok) {
      return access.response;
    }

    // 1. Validate file format (jpg, jpeg, png, pdf)
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return c.json({ error: "Chỉ hỗ trợ tải lên các tệp ảnh .jpg, .jpeg, .png hoặc .pdf" }, 400);
    }

    // 2. Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: "Dung lượng tệp tối đa là 5MB" }, 400);
    }

    // 3. Find case and package price to set amount
    const caseObj = await prisma.case.findUnique({
      where: { id: caseId },
      include: { package: true },
    });

    if (!caseObj) {
      return c.json({ error: "Không tìm thấy dự án" }, 404);
    }

    const packageId = caseObj.package_id;
    if (!packageId || !caseObj.package) {
      return c.json({ error: "Dự án chưa có gói dịch vụ hợp lệ" }, 400);
    }

    if (caseObj.payment_status && caseObj.payment_status !== "unpaid" && caseObj.payment_status !== "rejected") {
      return c.json({ error: "Dự án đã có trạng thái thanh toán khác, không thể tạo minh chứng mới" }, 409);
    }

    const amount = caseObj.package.price;
    if (amount <= 0) {
      return c.json({ error: "Gói dịch vụ không hợp lệ để tạo minh chứng thanh toán" }, 400);
    }

    // 4. Save file to disk in apps/api/uploads/
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueFileName = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);
    const fileUrl = `/uploads/${uniqueFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // 5. Update DB inside a transaction: Create Payment and update Case state
    const result = await prisma.$transaction(async (tx) => {
      try {
        // Create payment proof record
        const payment = await tx.payment.create({
          data: {
            case_id: caseId,
            package_id: packageId,
            amount,
            status: "pending_verification",
            proof_file_url: fileUrl,
          },
        });

        // Update case status
        await tx.case.update({
          where: { id: caseId },
          data: {
            payment_status: "pending_verification",
          },
        });

        // Log event
        await tx.caseEvent.create({
          data: {
            case_id: caseId,
            event_type: "payment_proof_uploaded",
            actor_auth_user_id: session.user.id,
            metadata_json: { payment_id: payment.id, amount },
          },
        });

        return payment;
      } catch (error) {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch {}
        throw error;
      }
    });

    return c.json(
      {
        ...result,
        status: normalizePaymentStatus(result.status),
      },
      201,
    );
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 3. POST /api/payments/:id/verify - Approve / Reject payment (Admin only)
paymentsRouter.post("/:id/verify", async (c) => {
  const session = await getSession(c);
  if (!session || session.user.role !== "admin") {
    return c.json({ error: "Không có quyền quản trị" }, 403);
  }

  const paymentId = c.req.param("id");
  const body = await c.req.json();
  const status = typeof body.status === "string" ? body.status : "";
  const rejection_reason = typeof body.rejection_reason === "string" ? body.rejection_reason.trim() : "";

  if (status !== "paid" && status !== "rejected") {
    return c.json({ error: "Trạng thái phê duyệt không hợp lệ" }, 400);
  }

  if (status === "rejected" && rejection_reason.length < 10) {
    return c.json({ error: "Lý do từ chối tối thiểu phải có 10 ký tự" }, 400);
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return c.json({ error: "Không tìm thấy thông tin giao dịch" }, 404);
    }

    if (isFinalPaymentStatus(payment.status)) {
      return c.json({ error: "Giao dịch đã ở trạng thái cuối, không thể cập nhật lại" }, 409);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: status === "paid" ? "paid" : "rejected",
          rejection_reason: status === "rejected" ? rejection_reason : null,
          verified_by_auth_user_id: session.user.id,
          verified_at: new Date(),
        },
      });

      // Update case payment status
      await tx.case.update({
        where: { id: payment.case_id },
        data: {
          payment_status: status === "paid" ? "paid" : "unpaid",
        },
      });

      // Log event
      await tx.caseEvent.create({
        data: {
          case_id: payment.case_id,
          event_type: status === "paid" ? "payment_verified" : "payment_rejected",
          actor_auth_user_id: session.user.id,
          metadata_json: { payment_id: paymentId, rejection_reason },
        },
      });

      return updatedPayment;
    });

    return c.json({
      ...result,
      status: normalizePaymentStatus(result.status),
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});