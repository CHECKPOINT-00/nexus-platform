import { Hono } from "hono";
import {
  approveReportHandler,
  downloadCaseReportPdfHandler,
  editReportHandler,
  getDraftReportHandler,
  getLatestReportHandler,
} from "./reports.controller.js";

export const reportsRouter = new Hono();

reportsRouter.get("/:caseId/draft", getDraftReportHandler);
reportsRouter.put("/:id", editReportHandler);
reportsRouter.post("/:id/approve", approveReportHandler);
reportsRouter.get("/:caseId/latest", getLatestReportHandler);
reportsRouter.get("/:caseId/pdf", downloadCaseReportPdfHandler);
reportsRouter.get("/:caseId/report.pdf", downloadCaseReportPdfHandler);
reportsRouter.get("/:caseId/:filename", downloadCaseReportPdfHandler);
