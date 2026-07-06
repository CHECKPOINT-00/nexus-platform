import { AppError } from "../../../shared/domain/app-error.js";
import { isFinalCaseStage } from "../domain/case.types.js";
import {
  assignCaseSupporter as defaultAssignCaseSupporter,
  findCaseById as defaultFindCaseById,
  findSupporterById as defaultFindSupporterById,
} from "../infrastructure/persistence/case.repository.js";
import { auditLogger } from "../../../shared/infrastructure/audit-logger.js";

type AssignSupporterDeps = {
  findCaseById?: typeof defaultFindCaseById;
  findSupporterById?: typeof defaultFindSupporterById;
  assignCaseSupporter?: typeof defaultAssignCaseSupporter;
};

const defaultDeps = {
  findCaseById: defaultFindCaseById,
  findSupporterById: defaultFindSupporterById,
  assignCaseSupporter: defaultAssignCaseSupporter,
};

export async function assignSupporterUseCase(
  adminId: string,
  caseId: string,
  supporterId: string,
  deps: AssignSupporterDeps = {}
) {
  const { findCaseById, findSupporterById, assignCaseSupporter } = { ...defaultDeps, ...deps };
  const timer = auditLogger.startTimer();
  const existingCase = await findCaseById(caseId);

  if (!existingCase) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  if (isFinalCaseStage(existingCase.user_facing_stage)) {
    throw new AppError(
      400,
      "INVALID_CASE_STAGE",
      "Dự án đã ở trạng thái cuối, không thể gán supporter",
    );
  }

  const unassign = !supporterId || supporterId.trim().length === 0;

  let supporterName = "";
  if (!unassign) {
    const { assertPaymentSatisfied } = await import("../../payments/domain/payment-gating.js");
    assertPaymentSatisfied(existingCase);

    const supporterUser = await findSupporterById(supporterId);

    if (
      !supporterUser ||
      (supporterUser.role !== "supporter" && supporterUser.role !== "admin")
    ) {
      throw new AppError(400, "VALIDATION_ERROR", "Supporter được gán không hợp lệ");
    }
    supporterName = supporterUser.name;
  }

  const nextSupporterId = unassign ? null : supporterId;
  if (existingCase.assigned_supporter_auth_user_id === nextSupporterId) {
    auditLogger.log({
      operation: "case.assign_supporter",
      actor_id: adminId,
      actor_role: "admin",
      case_id: caseId,
      action: "no_op",
      old_state: { supporter_id: existingCase.assigned_supporter_auth_user_id },
      new_state: { supporter_id: nextSupporterId },
      duration_ms: timer(),
    });
    return {
      id: existingCase.id,
      assigned_supporter_auth_user_id: existingCase.assigned_supporter_auth_user_id,
      internal_status: existingCase.internal_status,
    };
  }

  const result = await assignCaseSupporter(
    caseId,
    adminId,
    nextSupporterId,
    nextSupporterId ? "assigned" : "accepted_unassigned",
    unassign ? undefined : supporterName,
  );
  auditLogger.log({
    operation: "case.assign_supporter",
    actor_id: adminId,
    actor_role: "admin",
    case_id: caseId,
    action: unassign ? "unassigned" : "assigned",
    old_state: { supporter_id: existingCase.assigned_supporter_auth_user_id, status: existingCase.internal_status },
    new_state: { supporter_id: nextSupporterId, status: result.internal_status, supporter_name: supporterName },
    duration_ms: timer(),
  });
  return result;
}
