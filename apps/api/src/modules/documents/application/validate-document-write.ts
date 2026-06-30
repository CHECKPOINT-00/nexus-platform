import { deriveSourceKindFromUrl } from "../domain/document-types.js";
import { validateDocumentUrl } from "../application/document-dto.js";
import type { DocumentWriteInput } from "../application/document-dto.js";
import type { DocumentSourceKind } from "../domain/document-types.js";
import { getCloudName } from "../../../services/cloudinary.js";

export interface ValidatedDocumentWriteInput {
  original_name?: string;
  file_url?: string;
  drive_url?: string;
  doc_type?: string;
  document_type?: string;
  extension?: string;
  mime_type?: string;
  /** Server-derived source kind from the validated URL. */
  source_kind: DocumentSourceKind;
}

export function validateDocumentWriteInputs(
  documents: unknown[],
): { ok: true; inputs: DocumentWriteInput[] } | { ok: false; error: string } {
  if (!Array.isArray(documents)) {
    return { ok: false, error: "Phải cung cấp ít nhất một tài liệu" };
  }

  if (documents.length === 0) {
    return { ok: true, inputs: [] };
  }

  const inputs: DocumentWriteInput[] = [];
  for (const doc of documents) {
    if (typeof doc !== "object" || doc === null) {
      return { ok: false, error: "Tài liệu không hợp lệ" };
    }
    const d = doc as Record<string, unknown>;
    const url =
      typeof d.file_url === "string" ? d.file_url.trim() : typeof d.drive_url === "string" ? d.drive_url.trim() : "";
    if (!url) {
      return { ok: false, error: "Tài liệu phải có file_url hoặc drive_url" };
    }

    const sourceKind = deriveSourceKindFromUrl(url);
    try {
      validateDocumentUrl(url, sourceKind, {
        cloudinaryCloudName: getCloudName(),
      });
    } catch {
      return { ok: false, error: `URL tài liệu không hợp lệ: ${url}` };
    }

    inputs.push({
      original_name: typeof d.original_name === "string" ? d.original_name : undefined,
      file_url: url,
      drive_url: typeof d.drive_url === "string" ? d.drive_url.trim() : undefined,
      doc_type: typeof d.doc_type === "string" ? d.doc_type : undefined,
      document_type: typeof d.document_type === "string" ? d.document_type : undefined,
      extension: typeof d.extension === "string" ? d.extension : undefined,
      mime_type: typeof d.mime_type === "string" ? d.mime_type : undefined,
    });
  }

  return { ok: true, inputs };
}
