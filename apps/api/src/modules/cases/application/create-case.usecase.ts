import { AppError } from "../../../shared/domain/app-error.js";
import { asNonEmptyString } from "../../../shared/infrastructure/http-helpers.js";
import { validateCp1Intake } from "../http/cases.schema.js";
import {
  createCaseWithCheckpointAndIntake,
  findCaseByCode,
} from "../infrastructure/persistence/case.repository.js";
import { findPackageById } from "../../packages/infrastructure/persistence/package.repository.js";
import type { CreateCaseRequest } from "./cases.dto.js";

export async function createCaseUseCase(userId: string, body: CreateCaseRequest) {
  const validationErrors = validateCp1Intake(body);
  if (validationErrors.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", validationErrors);
  }

  const { package_id, deadline, team_context } = body;

  if (!asNonEmptyString(package_id)) {
    throw new AppError(400, "VALIDATION_ERROR", "Thiếu gói dịch vụ (package_id)");
  }

  const parsedDeadline = deadline ? new Date(deadline) : null;
  if (deadline && Number.isNaN(parsedDeadline?.getTime())) {
    throw new AppError(400, "VALIDATION_ERROR", "Deadline không hợp lệ");
  }

  // Generate random unique case code: NX-XXXXXX
  let randomCode = `NX-${Math.floor(100000 + Math.random() * 900000)}`;

  // Check duplication (retry up to 3 times)
  let isUnique = false;
  let retries = 0;
  while (!isUnique && retries < 3) {
    const existing = await findCaseByCode(randomCode);
    if (!existing) {
      isUnique = true;
    } else {
      randomCode = `NX-${Math.floor(100000 + Math.random() * 900000)}`;
      retries++;
    }
  }

  if (!isUnique) {
    throw new AppError(
      500,
      "INTERNAL_ERROR",
      "Không thể tạo mã case duy nhất, vui lòng thử lại.",
    );
  }

  const team_name = team_context?.project_name || null;
  const school = body.school || null;
  const course_context = body.course_context || null;
  const group_no = team_context?.group_no || null;

  const servicePackage = await findPackageById(package_id);
  const isFree = servicePackage ? servicePackage.price === 0 : false;

  return await createCaseWithCheckpointAndIntake({
    caseCode: randomCode,
    userId,
    teamName: team_name,
    school,
    courseContext: course_context,
    groupNo: group_no,
    packageId: package_id,
    deadline: parsedDeadline,
    isFree,
    rawBody: body,
  });
}
