import { Hono } from "hono";
import {
  listAdminCasesHandler,
  getAdminCaseDetailHandler,
  acceptCaseHandler,
  rejectCaseHandler,
  adminRequestMoreInfoHandler,
  adminAssignSupporterHandler,
} from "./admin.controller.js";

export const adminRouter = new Hono();

adminRouter.get("/cases", listAdminCasesHandler);
adminRouter.get("/cases/:id", getAdminCaseDetailHandler);
adminRouter.post("/cases/:id/accept", acceptCaseHandler);
adminRouter.post("/cases/:id/reject", rejectCaseHandler);
adminRouter.post("/cases/:id/request-more-info", adminRequestMoreInfoHandler);
adminRouter.post("/cases/:id/assign", adminAssignSupporterHandler);
