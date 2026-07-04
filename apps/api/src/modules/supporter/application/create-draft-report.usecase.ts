import { AppError } from "../../../shared/domain/app-error.js";
import { isFinalCaseStage } from "../../cases/domain/case.types.js";
import { generateReportDraft } from "../../../services/ai.js";
import { upsertReportDraft } from "../../reports/infrastructure/persistence/report.repository.js";
import { findCaseById, findLatestIntakeUnit } from "../../cases/infrastructure/persistence/case.repository.js";

export async function createDraftReportUseCase(
  userId: string,
  caseId: string,
) {
  const caseRecord = await findCaseById(caseId);

  if (!caseRecord) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  if (isFinalCaseStage(caseRecord.user_facing_stage)) {
    throw new AppError(
      409,
      "INVALID_CASE_STAGE",
      "Dự án đã ở trạng thái cuối, không thể tạo bản nháp mới",
    );
  }

  const latestUnit = await findLatestIntakeUnit(caseId);

  if (!latestUnit?.content) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy dữ liệu intake");
  }

  let rawData: any;
  try {
    rawData = JSON.parse(latestUnit.content);
  } catch {
    throw new AppError(400, "VALIDATION_ERROR", "Dữ liệu intake bị lỗi định dạng JSON");
  }

  let aiOutput: any;
  try {
    aiOutput = await generateReportDraft(rawData);
  } catch (aiError: any) {
    console.error("AI Generation failed:", aiError);
    throw new AppError(
      502,
      "AI_SERVICE_ERROR",
      "Dịch vụ AI phản biện gặp sự cố, vui lòng thử lại sau",
    );
  }

  const contentMd = JSON.stringify(aiOutput);

  return await upsertReportDraft({
    caseId,
    checkpointId: latestUnit.checkpoint_id,
    lifecycleUnitId: latestUnit.id,
    contentMd,
    userId,
  });
}
