import { Hono } from "hono";
import {
  listPaymentsHandler,
  uploadPaymentProofHandler,
  verifyPaymentHandler,
  confirmPackageHandler,
  reactivatePaymentHandler,
  expireOverduePaymentsHandler,
  requestRefundHandler,
} from "./payments.controller.js";

export const paymentsRouter = new Hono();

paymentsRouter.get("/", listPaymentsHandler);
paymentsRouter.post("/proof", uploadPaymentProofHandler);
paymentsRouter.post("/:id/verify", verifyPaymentHandler);
paymentsRouter.post("/cases/:id/confirm-package", confirmPackageHandler);
paymentsRouter.post("/cases/:id/reactivate", reactivatePaymentHandler);
paymentsRouter.post("/expire-overdue", expireOverduePaymentsHandler);
paymentsRouter.post("/cases/:id/refund", requestRefundHandler);
