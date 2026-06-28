import { Hono } from "hono";
import {
  createDraftReportHandler,
  getDraftReportHandler,
  editDraftReportHandler,
  publishReportHandler,
  supporterRequestMoreInfoHandler,
  closeCaseHandler,
} from "./supporter.controller.js";

export const supporterRouter = new Hono();

supporterRouter.post("/cases/:caseId/reports/draft", createDraftReportHandler);
supporterRouter.get("/cases/:caseId/reports/draft", getDraftReportHandler);
supporterRouter.put("/reports/:reportId", editDraftReportHandler);
supporterRouter.post("/reports/:reportId/publish", publishReportHandler);
supporterRouter.post("/cases/:caseId/request-more-info", supporterRequestMoreInfoHandler);
supporterRouter.post("/cases/:caseId/close", closeCaseHandler);
