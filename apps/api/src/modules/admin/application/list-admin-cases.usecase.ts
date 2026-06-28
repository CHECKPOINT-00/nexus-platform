import { AppError } from "../../../shared/domain/app-error.js";
import {
  isValidAdminCaseStage,
  isValidAdminInternalStatus,
} from "../domain/admin.types.js";
import { findManyCasesAdmin } from "../../cases/infrastructure/persistence/case.repository.js";
import type { ListAdminCasesRequest } from "./admin.dto.js";

export async function listAdminCasesUseCase(filters: ListAdminCasesRequest) {
  const { stage, internal_status, limit } = filters;

  const where: any = {};
  if (stage) {
    if (!isValidAdminCaseStage(stage)) {
      throw new AppError(400, "VALIDATION_ERROR", "stage không hợp lệ");
    }
    where.user_facing_stage = stage;
  }
  if (internal_status) {
    if (!isValidAdminInternalStatus(internal_status)) {
      throw new AppError(400, "VALIDATION_ERROR", "internal_status không hợp lệ");
    }
    where.internal_status = internal_status;
  }

  let take: number | undefined;
  if (limit) {
    const parsedLimit = Number.parseInt(limit, 10);
    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit <= 0 ||
      parsedLimit > 100
    ) {
      throw new AppError(400, "VALIDATION_ERROR", "limit không hợp lệ");
    }
    take = parsedLimit;
  }

  const cases = await findManyCasesAdmin(where, take);

  return cases.map((item: any) => {
    let completeness = 0;
    const intakeUnit = item.lifecycle_units?.[0];
    if (intakeUnit && intakeUnit.content) {
      try {
        const content = JSON.parse(intakeUnit.content);
        let score = 0;
        if (content.contact?.full_name) score += 20;
        if (content.contact?.email) score += 20;
        if (content.case_summary) score += 20;
        if (content.documents && content.documents.length > 0) score += 20;
        if (
          content.boundary_confirmations &&
          content.boundary_confirmations.length > 0
        )
          score += 20;
        completeness = score;
      } catch (_) {}
    }

    return {
      id: item.id,
      case_code: item.case_code,
      team_name: item.team_name,
      created_at: item.created_at,
      deadline: item.deadline,
      user_facing_stage: item.user_facing_stage,
      internal_status: item.internal_status,
      payment_status: item.payment_status,
      package_name: item.package?.name || "N/A",
      completeness,
      owner_name: item.owner?.name || "N/A",
      assigned_supporter: item.assigned_supporter
        ? {
            id: item.assigned_supporter.id,
            name: item.assigned_supporter.name,
          }
        : null,
    };
  });
}
