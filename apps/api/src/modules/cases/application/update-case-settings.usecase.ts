import { AppError } from "../../../shared/domain/app-error.js";
import { asNonEmptyString } from "../../../shared/infrastructure/http-helpers.js";
import { isFinalCaseStage } from "../domain/case.types.js";
import {
  findCaseByIdWithMembers,
  updateCaseSettings,
} from "../infrastructure/persistence/case.repository.js";
import type { UpdateCaseSettingsRequest } from "./cases.dto.js";

export async function updateCaseSettingsUseCase(
  userId: string,
  userRole: string,
  caseId: string,
  body: UpdateCaseSettingsRequest,
) {
  const existingCase = await findCaseByIdWithMembers(caseId);

  if (!existingCase) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy case");
  }

  const isOwner = existingCase.owner_auth_user_id === userId;
  const isMember = existingCase.members.some((m: any) => m.auth_user_id === userId);
  const isAdmin = userRole === "admin";

  if (!isOwner && !isMember && !isAdmin) {
    throw new AppError(403, "FORBIDDEN", "Không có quyền chỉnh sửa dự án này");
  }

  if (isFinalCaseStage(existingCase.user_facing_stage)) {
    throw new AppError(
      400,
      "INVALID_CASE_STAGE",
      "Dự án đã ở trạng thái cuối, không thể chỉnh sửa cài đặt",
    );
  }

  if (body.team_name !== undefined) {
    if (
      typeof body.team_name !== "string" ||
      (body.team_name.trim().length > 0 && body.team_name.trim().length < 2) ||
      body.team_name.trim().length > 100
    ) {
      throw new AppError(400, "VALIDATION_ERROR", "Tên nhóm phải từ 2 đến 100 ký tự");
    }
  }
  if (body.school !== undefined) {
    if (
      typeof body.school !== "string" ||
      (body.school.trim().length > 0 && body.school.trim().length < 2) ||
      body.school.trim().length > 100
    ) {
      throw new AppError(400, "VALIDATION_ERROR", "Tên trường phải từ 2 đến 100 ký tự");
    }
  }
  if (body.course_context !== undefined) {
    if (
      typeof body.course_context !== "string" ||
      (body.course_context.trim().length > 0 &&
        body.course_context.trim().length < 2) ||
      body.course_context.trim().length > 100
    ) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Thông tin môn học phải từ 2 đến 100 ký tự",
      );
    }
  }
  if (body.group_no !== undefined) {
    if (
      typeof body.group_no !== "string" ||
      (body.group_no.trim().length > 0 && body.group_no.trim().length > 10)
    ) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Số thứ tự nhóm không hợp lệ (tối đa 10 ký tự)",
      );
    }
  }

  const team_name =
    body.team_name === undefined
      ? existingCase.team_name
      : asNonEmptyString(body.team_name, 2) || null;
  const school =
    body.school === undefined
      ? existingCase.school
      : asNonEmptyString(body.school, 2) || null;
  const course_context =
    body.course_context === undefined
      ? existingCase.course_context
      : asNonEmptyString(body.course_context, 2) || null;
  const group_no =
    body.group_no === undefined
      ? existingCase.group_no
      : asNonEmptyString(body.group_no, 1) || null;

  return await updateCaseSettings(caseId, {
    team_name,
    school,
    course_context,
    group_no,
  });
}
