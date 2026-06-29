import { Hono } from "hono";
import {
  approveReportHandler,
  editReportHandler,
  generateDraftReportHandler,
  getDraftReportHandler,
  getLatestReportHandler,
} from "./reports.controller.js";

export const reportsRouter = new Hono();

reportsRouter.post("/:caseId/draft", generateDraftReportHandler);
reportsRouter.get("/:caseId/draft", getDraftReportHandler);
reportsRouter.put("/:id", editReportHandler);
reportsRouter.post("/:id/approve", approveReportHandler);
reportsRouter.get("/:caseId/latest", getLatestReportHandler);
