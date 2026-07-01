import type {
  DocumentCheckpoint,
  DocumentCheckpointOverview,
  DocumentFile,
  DocumentUnit,
  DocumentWorkspace,
  ExternalFeedbackUnit,
  ExternalFeedbackMetadata,
} from '../domain/document-contract.js';
import { deriveSourceBehaviorPolicy, deriveSourceKindFromUrl } from '../domain/document-types.js';
import type { DocumentSourceKind } from '../domain/document-types.js';
import { generateSignedUrl, extractPublicId } from '../../../services/cloudinary.js';

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
    metadata_json?: unknown;
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
    const supportFlowDocuments = buildSupportFlowDocuments(units, records);
    const externalFeedbackDocuments = buildExternalFeedbackDocuments(units, records);

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
      support_flow_documents: supportFlowDocuments,
      external_feedback_documents: externalFeedbackDocuments,
      latest_version_no: cp.latest_version_no,
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
    const sourceKind = deriveSourceKindFromUrl(unit.file_url);
    const policy = deriveSourceBehaviorPolicy(sourceKind);

    // VERIFY-002 fix: sign Cloudinary URLs with short-TTL
    let fileUrl = unit.file_url;
    if (sourceKind === 'cloudinary') {
      const publicId = extractPublicId(fileUrl);
      if (publicId) {
        fileUrl = generateSignedUrl(publicId);
      }
    }

    files.push({
      id: 'legacy-' + unit.id,
      seq: 0,
      is_primary: true,
      source_kind: sourceKind,
      canonical_name: null,
      original_name: null,
      extension: null,
      mime_type: null,
      file_url: fileUrl,
      download_url: fileUrl,
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

  // VERIFY-002 fix: sign Cloudinary URLs with short-TTL
  let fileUrl = record.file_url;
  let downloadUrl = record.download_url;

  if (sourceKind === 'cloudinary') {
    if (fileUrl) {
      const publicId = extractPublicId(fileUrl);
      if (publicId) {
        fileUrl = generateSignedUrl(publicId);
      }
    }
    if (downloadUrl) {
      const publicId = extractPublicId(downloadUrl);
      if (publicId) {
        downloadUrl = generateSignedUrl(publicId);
      }
    }
  }

  return {
    id: record.id,
    seq: record.seq,
    is_primary: record.is_primary,
    source_kind: sourceKind,
    canonical_name: record.canonical_name,
    original_name: record.original_name,
    extension: record.extension,
    mime_type: record.mime_type,
    file_url: fileUrl,
    download_url: downloadUrl,
    open_action: fileUrl ? policy.open_action : null,
    download_action: downloadUrl ? policy.download_action : null,
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

function buildSupportFlowDocuments(
  units: PrismaCaseWithRelations['lifecycle_units'],
  records: PrismaCaseWithRelations['document_records'],
): DocumentUnit[] {
  const versionUnits = units.filter((u) => u.unit_type === 'version');
  const supportDocTypes = ['intake_document', 'revision_document', 'revision_attachment', 'supporter_output', 'supporter_attachment', 'evidence', 'generic'];

  return versionUnits
    .map((unit) => {
      const unitRecords = records.filter((r) => r.lifecycle_unit_id === unit.id);
      const supportRecords = unitRecords.filter((r) => supportDocTypes.includes(r.doc_type));

      if (supportRecords.length === 0 && unitRecords.length === 0) {
        return null;
      }

      const files = supportRecords.length > 0
        ? supportRecords.map(toDocumentFile)
        : legacyFilesFromUnit(unit);

      return {
        unit_code: unit.unit_code,
        version_no: unit.version_no,
        assessment_no: 0,
        linked_version_no: null,
        files,
      };
    })
    .filter((unit): unit is DocumentUnit => unit !== null)
    .sort((a, b) => b.version_no - a.version_no);
}

function buildExternalFeedbackDocuments(
  units: PrismaCaseWithRelations['lifecycle_units'],
  records: PrismaCaseWithRelations['document_records'],
): ExternalFeedbackUnit[] {
  const assessmentUnits = units.filter((u) => u.unit_type === 'assessment');
  const feedbackDocTypes = ['external_feedback', 'external_evidence'];

  const feedbackUnits: ExternalFeedbackUnit[] = [];

  for (const unit of assessmentUnits) {
    const unitRecords = records.filter((r) => r.lifecycle_unit_id === unit.id);
    const feedbackRecords = unitRecords.filter((r) => feedbackDocTypes.includes(r.doc_type));

    if (feedbackRecords.length === 0) continue;

    const metadata = extractExternalFeedbackMetadata(feedbackRecords[0]);

    feedbackUnits.push({
      unit_code: unit.unit_code,
      assessment_no: unit.assessment_no,
      linked_version_no: unit.linked_version_no,
      files: feedbackRecords.map(toDocumentFile),
      metadata,
    });
  }

  return feedbackUnits.sort((a, b) => {
    const byAssessment = b.assessment_no - a.assessment_no;
    if (byAssessment !== 0) return byAssessment;
    const left = b.linked_version_no ?? -1;
    const right = a.linked_version_no ?? -1;
    return left - right;
  });
}

function extractExternalFeedbackMetadata(
  record: PrismaCaseWithRelations['document_records'][number],
): ExternalFeedbackMetadata | null {
  if (!record.metadata_json || typeof record.metadata_json !== 'object') {
    return null;
  }

  const meta = record.metadata_json as Record<string, unknown>;
  const source = typeof meta.source === 'string' ? meta.source : null;
  const timing = typeof meta.timing === 'string' ? meta.timing : null;
  const selectedVersionNo = typeof meta.selected_version_no === 'number' ? meta.selected_version_no : null;

  if (!source || !timing || selectedVersionNo === null) {
    return null;
  }

  return {
    source: source as ExternalFeedbackMetadata['source'],
    source_other_text: typeof meta.source_other_text === 'string' ? meta.source_other_text : null,
    timing: timing as ExternalFeedbackMetadata['timing'],
    selected_version_no: selectedVersionNo,
  };
}
