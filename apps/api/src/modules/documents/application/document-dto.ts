import {
  deriveSourceKindFromUrl,
  DOCUMENT_SOURCE_KINDS,
  DOCUMENT_TYPES,
  DOCUMENT_DIRECTIONS,
} from "../domain/document-types.js";
import type {
  DocumentDirection,
  DocumentSourceKind,
  DocumentType,
  SourceBehaviorPolicy,
} from "../domain/document-types.js";
import type {
  DocumentCheckpoint,
  DocumentFile,
  DocumentUnit,
  DocumentWorkspace,
} from "../domain/document-contract.js";

export { deriveSourceKindFromUrl };
export { DOCUMENT_SOURCE_KINDS, DOCUMENT_TYPES, DOCUMENT_DIRECTIONS };

/**
 * Prisma-style persistence shape for the `document_records` table.
 *
 * All ownership/identity fields (`case_id`, `checkpoint_id`,
 * `lifecycle_unit_id`, `uploaded_by_auth_user_id`, `is_primary`, `seq`,
 * `source_kind`, `canonical_name`) are server-derived and are NOT writable by
 * the client.
 */
export interface DocumentRecord {
  id: string;
  case_id: string;
  checkpoint_id: string;
  /** Nullable for orphan artifacts or report rows without a lifecycle unit. */
  lifecycle_unit_id: string | null;
  /** Derived from the owning lifecycle unit, if any. */
  unit_code: string | null;
  direction: DocumentDirection | null;
  doc_type: DocumentType | string;
  seq: number;
  is_primary: boolean;
  source_kind: DocumentSourceKind;
  /** Stable identity handle; usually a normalized public_id or slug. */
  canonical_name: string | null;
  /** Display name supplied by the client. */
  original_name: string | null;
  extension: string | null;
  mime_type: string | null;
  file_url: string | null;
  download_url: string | null;
  cloudinary_public_id: string | null;
  uploaded_by_auth_user_id: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Client-writable allowlist for document write DTOs (intake, revision, and
 * supporter uploads).
 *
 * The server is responsible for deriving:
 *   case_id, checkpoint_id, lifecycle_unit_id,
 *   uploaded_by_auth_user_id, is_primary, seq, source_kind,
 *   canonical_name, cloudinary_public_id
 *
 * Backward-compatible aliases:
 *   - `drive_url` is treated as `file_url`.
 *   - `document_type` is treated as `doc_type`.
 */
export interface DocumentWriteInput {
  /** Original file name as shown to users. Optional but recommended. */
  original_name?: string;
  /** Public or shareable URL. */
  file_url?: string;
  /** Backward-compatible alias for `file_url`. */
  drive_url?: string;
  /** Normalized document type. Optional; defaults to a sensible value per flow. */
  doc_type?: string;
  /** Legacy alias for `doc_type`. */
  document_type?: string;
  /** File extension, including leading dot. */
  extension?: string;
  /** MIME type. */
  mime_type?: string;
}

/**
 * Resolved URL after validation. The value is the canonical URL string that was
 * accepted for persistence.
 */
export type ValidatedDocumentUrl = string;

export interface DocumentUrlValidationOptions {
  cloudinaryCloudName: string;
}


/**
 * Validates a document URL according to the source-aware policy:
 *
 *   - Must parse with `new URL()`.
 *   - Protocol must be `http:` or `https:`.
 *   - Drive URLs must be hosted on `drive.google.com` or `docs.google.com`.
 *   - Cloudinary URLs must be hosted on `res.cloudinary.com` and the first path
 *     segment must equal the configured cloud name.
 *   - Generated URLs are reserved for server-produced artifacts only; client
 *     URLs must be drive or cloudinary.
 *
 * Throws on validation failure. Returns the parsed `URL` on success.
 */
export function validateDocumentUrl(
  url: string,
  sourceKind: DocumentSourceKind,
  options: DocumentUrlValidationOptions,
): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("INVALID_URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("INVALID_URL_SCHEME");
  }

  if (sourceKind === "drive") {
    const allowedHosts = ["drive.google.com", "docs.google.com"];
    if (!allowedHosts.includes(parsed.hostname)) {
      throw new Error("INVALID_DRIVE_HOST");
    }
  }

  if (sourceKind === "cloudinary") {
    // Use unified Cloudinary service for validation
    if (parsed.hostname !== "res.cloudinary.com") {
      throw new Error("INVALID_CLOUDINARY_HOST");
    }
    const firstPathSegment = parsed.pathname.split("/")[1] ?? "";
    if (firstPathSegment !== options.cloudinaryCloudName) {
      throw new Error("INVALID_CLOUDINARY_CLOUD_NAME");
    }
  }

  // generated: reserved for server-produced artifacts only
  // Client URLs must be drive or cloudinary
  if (sourceKind === "generated") {
    throw new Error("GENERATED_URLS_NOT_ALLOWED_FROM_CLIENT");
  }

  return parsed;
}

/**
 * Extracts the Cloudinary public_id from a validated Cloudinary URL.
 *
 * Cloudinary URL shape:
 *   /:cloud_name/:asset_type/:delivery_type/:transformations/:version/:public_id
 *
 * This is a best-effort extraction; malformed URLs return `null`.
 * 
 * @deprecated Use `extractPublicId` from `../../../services/cloudinary.js` instead.
 */
export function extractCloudinaryPublicId(
  url: string,
  cloudName: string,
): string | null {
  // Delegate to unified service
  const { extractPublicId } = require('../../../services/cloudinary.js');
  return extractPublicId(url);
}

/**
 * Re-export the contract response shapes so application code can import them
 * from the DTO file while the canonical definitions live in the domain layer.
 */
export type {
  DocumentWorkspace,
  DocumentCheckpoint,
  DocumentUnit,
  DocumentFile,
  SourceBehaviorPolicy,
};

/**
 * Full response shape for the document workspace read path. This is the type
 * that will be merged into the case detail response under the key
 * `document_workspace`.
 */
export interface DocumentReadResponse {
  document_workspace: DocumentWorkspace;
}

