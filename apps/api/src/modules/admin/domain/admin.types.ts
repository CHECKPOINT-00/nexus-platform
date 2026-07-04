// Valid stage / status lists used by admin filter queries
export const ADMIN_VALID_CASE_STAGES = [
  "submitted",
  "need_more_information",
  "under_review",
  "report_ready",
  "waiting_for_revision",
  "revision_submitted",
  "completed",
  "rejected",
  "closed",
] as const;

export const ADMIN_VALID_INTERNAL_STATUSES = [
  "triage_pending",
  "accepted_unassigned",
  "assigned",
  "waiting_user",
  "supporter_working",
  "report_ready_to_publish",
  "done",
  "cancelled",
] as const;

export function isValidAdminCaseStage(stage: string): boolean {
  return (ADMIN_VALID_CASE_STAGES as readonly string[]).includes(stage);
}

export function isValidAdminInternalStatus(status: string): boolean {
  return (ADMIN_VALID_INTERNAL_STATUSES as readonly string[]).includes(status);
}
