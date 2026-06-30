import type {
  DocumentCheckpoint,
  DocumentCheckpointOverview,
  DocumentFile,
  DocumentUnit,
  DocumentWorkspace,
} from '../domain/document-contract.js';
import { deriveSourceBehaviorPolicy, deriveSourceKindFromUrl } from '../domain/document-types.js';
import type { DocumentSourceKind } from '../domain/document-types.js';

type PrismaCaseWithRelations = {
  id: string;
  current_checkpoint?: string | null;
  checkpoints: Array<{
    id: string;
    checkpoint_code: string;
    latest_version_no: number;
    latest_assessment_no: number;
  }>;
  lifecycle_units: Array<{
    id: string;
    checkpoint_id: string;
    unit_code: string;
    unit_type: string;
    version_no: number;
    assessment_no: number;
    linked_version_no: number | null;
    file_url: string | null;
    content: string | null;
  }>;
  document_records: Array<{
    id: string;
    checkpoint_id: string;
    lifecycle_unit_id: string | null;
    unit_code: string | null;
    doc_type: string;
    seq: number;
    is_primary: boolean;
    source_kind: string;
    canonical_name: string | null;
    original_name: string | null;
    extension: string | null;
    mime_type: string | null;
    file_url: string | null;
    download_url: string | null;
  }>;
};

export function assembleDocumentWorkspace(
  caseRecord: PrismaCaseWithRelations,
): DocumentWorkspace {
  const checkpoints = caseRecord.checkpoints || [];
  const selectedCheckpoint = selectCheckpoint(caseRecord, checkpoints);

  const workspaceCheckpoints: DocumentCheckpoint[] = checkpoints.map((cp) => {
    const units = caseRecord.lifecycle_units.filter((u) => u.checkpoint_id === cp.id);
    const records = caseRecord.document_records.filter((r) => r.checkpoint_id === cp.id);

    const versionUnits = buildVersionUnits(units, records);
    const assessmentUnits = buildAssessmentUnits(records);

    const totalFiles = versionUnits.reduce((sum, unit) => sum + unit.files.length, 0) +
    assessmentUnits.reduce((sum, unit) => sum + unit.files.length, 0);

    const overview: DocumentCheckpointOverview = {
      total_files: totalFiles,
      version_count: versionUnits.length,
      assessment_count: assessmentUnits.length,
      selected_label:
        selectedCheckpoint?.id === cp.id ? 'Đang chọn ' + cp.checkpoint_code : cp.checkpoint_code,
    };

    return {
      checkpoint_id: cp.id,
      checkpoint_code: cp.checkpoint_code,
      overview,
      version_units: versionUnits,
      assessment_units: assessmentUnits,
    };
  });

  return {
    selected_checkpoint_id: selectedCheckpoint?.id ?? null,
    checkpoints: workspaceCheckpoints,
  };
}

function selectCheckpoint(
  caseRecord: PrismaCaseWithRelations,
  checkpoints: PrismaCaseWithRelations['checkpoints'],
) {
  if (caseRecord.current_checkpoint) {
    const matched = checkpoints.find((cp) => cp.checkpoint_code === caseRecord.current_checkpoint);
    if (matched) return matched;
  }

  let selected = checkpoints[0] ?? null;
  for (const checkpoint of checkpoints) {
    if (!selected || checkpoint.latest_version_no > selected.latest_version_no) {
      selected = checkpoint;
      continue;
    }

    if (
      checkpoint.latest_version_no === selected.latest_version_no &&
      checkpoint.latest_assessment_no > selected.latest_assessment_no
    ) {
      selected = checkpoint;
    }
  }

  return selected;
}

function buildVersionUnits(
  units: PrismaCaseWithRelations['lifecycle_units'],
  records: PrismaCaseWithRelations['document_records'],
): DocumentUnit[] {
  const versionUnits = units.filter((u) => u.unit_type === 'version');

  return versionUnits
    .map((unit) => {
      const unitRecords = records.filter((r) => r.lifecycle_unit_id === unit.id);
      const files = unitRecords.length > 0 ? unitRecords.map(toDocumentFile) : legacyFilesFromUnit(unit);

      return {
        unit_code: unit.unit_code,
        version_no: unit.version_no,
        assessment_no: 0,
        linked_version_no: null,
        files,
      };
    })
    .sort((a, b) => b.version_no - a.version_no);
}

function buildAssessmentUnits(
  records: PrismaCaseWithRelations['document_records'],
): DocumentUnit[] {
  const assessmentRecords = records.filter((r) => r.doc_type === 'assessment_report');

  const grouped = new Map<string, typeof assessmentRecords>();
  for (const record of assessmentRecords) {
    const key = record.unit_code || 'orphan-' + record.id;
    const group = grouped.get(key) || [];
    group.push(record);
    grouped.set(key, group);
  }

  return Array.from(grouped.entries())
    .map(([unitCode, group]) => {
      return {
        unit_code: unitCode,
        version_no: 0,
        assessment_no: parseAssessmentNo(unitCode),
        linked_version_no: parseLinkedVersionNo(unitCode),
        files: group.map(toDocumentFile),
      };
    })
    .sort((a, b) => {
      const byAssessment = b.assessment_no - a.assessment_no;
      if (byAssessment !== 0) return byAssessment;
      const left = b.linked_version_no ?? -1;
      const right = a.linked_version_no ?? -1;
      return left - right;
    });
}

function legacyFilesFromUnit(
  unit: PrismaCaseWithRelations['lifecycle_units'][number],
): DocumentFile[] {
  const files: DocumentFile[] = [];
  if (unit.file_url) {
    const policy = deriveSourceBehaviorPolicy(deriveSourceKindFromUrl(unit.file_url));
    files.push({
      id: 'legacy-' + unit.id,
      seq: 0,
      is_primary: true,
      source_kind: deriveSourceKindFromUrl(unit.file_url),
      canonical_name: null,
      original_name: null,
      extension: null,
      mime_type: null,
      file_url: unit.file_url,
      download_url: unit.file_url,
      open_action: policy.open_action,
      download_action: policy.download_action,
    });
  }
  return files;
}

function toDocumentFile(record: {
  id: string;
  seq: number;
  is_primary: boolean;
  source_kind: string;
  canonical_name: string | null;
  original_name: string | null;
  extension: string | null;
  mime_type: string | null;
  file_url: string | null;
  download_url: string | null;
}): DocumentFile {
  const sourceKind = record.source_kind as DocumentSourceKind;
  const policy = deriveSourceBehaviorPolicy(sourceKind);
  return {
    id: record.id,
    seq: record.seq,
    is_primary: record.is_primary,
    source_kind: sourceKind,
    canonical_name: record.canonical_name,
    original_name: record.original_name,
    extension: record.extension,
    mime_type: record.mime_type,
    file_url: record.file_url,
    download_url: record.download_url,
    open_action: record.file_url ? policy.open_action : null,
    download_action: record.download_url ? policy.download_action : null,
  };
}

function parseAssessmentNo(unitCode: string): number {
  const match = /^a(\d+)-v\d+$/.exec(unitCode);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function parseLinkedVersionNo(unitCode: string): number | null {
  const match = /^a\d+-v(\d+)$/.exec(unitCode);
  return match ? Number.parseInt(match[1], 10) : null;
}
