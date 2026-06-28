import { AppError } from "../../../shared/domain/app-error.js";
import {
  findCaseByIdWithLifecycleUnitsAndEvents,
} from "../../cases/infrastructure/persistence/case.repository.js";

export async function getAdminCaseDetailUseCase(caseId: string) {
  if (!caseId || typeof caseId !== "string" || !caseId.trim()) {
    throw new AppError(400, "VALIDATION_ERROR", "ID dự án không hợp lệ");
  }

  const item = await findCaseByIdWithLifecycleUnitsAndEvents(caseId);

  if (!item) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  const intakeUnit = item.lifecycle_units.find(
    (u: any) => u.unit_type === "intake" && u.unit_code === "v00",
  );
  let intake_snapshot = null;
  if (intakeUnit && intakeUnit.content) {
    try {
      intake_snapshot = JSON.parse(intakeUnit.content);
    } catch (_) {}
  }

  return { case: item, intake_snapshot };
}
