import { Hono } from "hono";
import {
  listCasesHandler,
  createCaseHandler,
  listSupportersHandler,
  getCaseDetailHandler,
  submitRevisionHandler,
  assignSupporterHandler,
  updateCaseStatusHandler,
  listMessagesHandler,
  sendMessageHandler,
  updateCaseSettingsHandler,
} from "./cases.controller.js";

export const casesRouter = new Hono();

casesRouter.get("/", listCasesHandler);
casesRouter.post("/", createCaseHandler);
casesRouter.get("/supporters", listSupportersHandler);
casesRouter.get("/:id", getCaseDetailHandler);
casesRouter.post("/:id/revisions", submitRevisionHandler);
casesRouter.post("/:id/assign", assignSupporterHandler);
casesRouter.post("/:id/status", updateCaseStatusHandler);
casesRouter.get("/:id/messages", listMessagesHandler);
casesRouter.post("/:id/messages", sendMessageHandler);
casesRouter.put("/:id/settings", updateCaseSettingsHandler);
