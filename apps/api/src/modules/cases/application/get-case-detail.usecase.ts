import { AppError } from "../../../shared/domain/app-error.js";
import {
  findCaseByIdWithAllRelations,
  findFirstIntakeUnit,
  findFirstUserEvent,
  findLifecycleUnits,
  findOpenRequestsForMoreInfo,
} from "../infrastructure/persistence/case.repository.js";
import {
  findLatestApprovedReport,
  findApprovedReports,
} from "../../reports/infrastructure/persistence/report.repository.js";

function normalizeIntakeSnapshot(rawContent: string | null) {
  if (!rawContent) return null;

  try {
    const parsed = JSON.parse(rawContent);
    const legacySituations = Array.isArray(parsed.current_situations)
      ? parsed.current_situations.filter((item: unknown) => typeof item === "string" && item.trim().length > 0)
      : [];

    return {
      ...parsed,
      current_situations: legacySituations,
      current_blocker:
        parsed.current_blocker ||
        parsed.case_summary ||
        legacySituations.join(" ") ||
        "",
    };
  } catch {
    return null;
  }
}

export async function getCaseDetailUseCase(userId: string, userRole: string, caseId: string) {
  const caseDetails = await findCaseByIdWithAllRelations(caseId);

  if (!caseDetails) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy dự án");
  }

  const isOwner = caseDetails.owner_auth_user_id === userId;
  const isMember = caseDetails.members.some((m: any) => m.auth_user_id === userId);
  const isSupporter = caseDetails.assigned_supporter_auth_user_id === userId;
  const isAdmin = userRole === "admin";

  if (!isOwner && !isMember && !isSupporter && !isAdmin) {
    throw new AppError(403, "FORBIDDEN", "Không có quyền truy cập dự án này");
  }

  const intakeUnit = await findFirstIntakeUnit(caseId);
  const intake_snapshot = normalizeIntakeSnapshot(intakeUnit?.content || null);

  const latest_report = await findLatestApprovedReport(caseId);
  const latest_user_action = await findFirstUserEvent(caseId);

  const lifecycleUnits = await findLifecycleUnits(caseId);
  const reports = await findApprovedReports(caseId);

  const team_submissions = lifecycleUnits.filter((u: any) => u.unit_type === "intake");
  const team_revisions = lifecycleUnits.filter((u: any) => u.unit_type === "revision");
  const nexus_reports = reports;

  const round_history = lifecycleUnits
    .map((unit: any) => {
      const report = reports.find((r: any) => r.lifecycle_unit_id === unit.id);
      return {
        round_no: unit.version_no,
        submitted_at: unit.created_at,
        submission: unit,
        report: report || null,
      };
    })
    .sort((a: any, b: any) => b.round_no - a.round_no);

  const open_requests_for_more_info = await findOpenRequestsForMoreInfo(caseId);

  return {
    case: caseDetails,
    intake_snapshot,
    latest_report,
    latest_user_action,
    document_board_sections: {
      team_submissions,
      nexus_reports,
      team_revisions,
    },
    round_history,
    open_requests_for_more_info,
  };
}
