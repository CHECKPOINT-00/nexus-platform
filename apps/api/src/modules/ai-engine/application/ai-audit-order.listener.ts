import { onEvent } from "../../../shared/infrastructure/event-bus.js";
import { DOMAIN_EVENTS, type DomainEvent } from "../../../shared/domain/domain-events.js";
import logger from "../../../shared/infrastructure/logger.js";
import {
  initOmpQueueListener,
  triggerOmpAuditForCase,
} from "./omp-audit-coordinator.js";

/**
 * Initialize listener for ORDER_PAID domain event.
 * Automatically dispatches OMP evaluation into BullMQ queue.
 */
export function initAiAuditOrderListener(): void {
  // Initialize BullMQ QueueEvents listener for job completions
  initOmpQueueListener();

  onEvent(DOMAIN_EVENTS.ORDER_PAID, (event: DomainEvent) => {
    void handleOrderPaidForAiAudit(event).catch((error) => {
      logger.error({ eventId: event.eventId, err: error }, "ai-audit-order listener unhandled error");
    });
  });
}

async function handleOrderPaidForAiAudit(event: DomainEvent): Promise<void> {
  const payload = event.payload as Record<string, unknown> | null;
  if (!payload) return;

  const caseId = typeof payload["caseId"] === "string" ? (payload["caseId"] as string) : undefined;
  const orderId = typeof payload["orderId"] === "string" ? (payload["orderId"] as string) : undefined;

  if (!caseId) {
    logger.debug({ orderId }, "ORDER_PAID event has no associated caseId, skipping AI audit");
    return;
  }

  logger.info({ orderId, caseId }, "AI Audit Listener received ORDER_PAID. Dispatching OMP audit to BullMQ queue...");

  try {
    await triggerOmpAuditForCase(caseId);
    logger.info({ caseId, orderId }, "Case successfully enqueued to BullMQ OMP worker");
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logger.error({ caseId, errMsg }, "Failed to trigger OMP audit workflow for paid order");
  }
}
