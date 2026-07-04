import { Hono } from "hono";
import {
  listPaymentsHandler,
  uploadPaymentProofHandler,
  verifyPaymentHandler,
} from "./payments.controller.js";

export const paymentsRouter = new Hono();

paymentsRouter.get("/", listPaymentsHandler);
paymentsRouter.post("/proof", uploadPaymentProofHandler);
paymentsRouter.post("/:id/verify", verifyPaymentHandler);
