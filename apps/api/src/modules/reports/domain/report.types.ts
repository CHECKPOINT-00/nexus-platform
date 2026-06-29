export type FindingStatus = string;

export interface ReportFinding {
  field: string;
  status: FindingStatus;
  evidence: string;
  reason: string;
  question: string;
  next_action: string;
}

export interface AiCritiqueReport {
  overall_summary: string;
  completeness_score: number;
  findings: ReportFinding[];
}

export type ReportDraftContentInput = Partial<AiCritiqueReport> & {
  findings?: unknown;
};

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeFinding(finding: unknown): ReportFinding | null {
  if (!finding || typeof finding !== "object") {
    return null;
  }

  const candidate = finding as Record<string, unknown>;
  const field = toText(candidate.field);
  const status = toText(candidate.status);
  const evidence = toText(candidate.evidence);
  const reason = toText(candidate.reason);
  const question = toText(candidate.question);
  const next_action = toText(candidate.next_action);

  if (!field || !status || !reason || !question || !next_action) {
    return null;
  }

  return {
    field,
    status,
    evidence,
    reason,
    question,
    next_action,
  };
}

export function normalizeReportDraftContent(
  payload: ReportDraftContentInput,
): AiCritiqueReport {
  return {
    overall_summary: toText(payload.overall_summary),
    completeness_score: Math.min(100, Math.max(0, toNumber(payload.completeness_score))),
    findings: Array.isArray(payload.findings)
      ? payload.findings.map(normalizeFinding).filter((finding): finding is ReportFinding => Boolean(finding))
      : [],
  };
}

export function serializeReportDraftContent(payload: ReportDraftContentInput): string {
  return JSON.stringify(normalizeReportDraftContent(payload));
}

export function parseReportDraftContent(contentMd: string): AiCritiqueReport | null {
  try {
    const parsed = JSON.parse(contentMd);
    return normalizeReportDraftContent(parsed);
  } catch {
    return null;
  }
}
