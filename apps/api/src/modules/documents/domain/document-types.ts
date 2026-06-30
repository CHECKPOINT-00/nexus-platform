/**
 * Domain-level enums and helper types for the normalized document workspace.
 *
 * These types are intentionally free of Prisma runtime imports and application
 * concerns. They are the source of truth for document source kinds, document
 * types, and flow directions.
 */

export const DOCUMENT_SOURCE_KINDS = ["drive", "cloudinary", "generated"] as const;

export type DocumentSourceKind = (typeof DOCUMENT_SOURCE_KINDS)[number];

export const DOCUMENT_TYPES = [
  "intake_document",
  "revision_document",
  "assessment_report",
  "payment_proof",
  "evidence",
  "generic",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_DIRECTIONS = ["inbound", "outbound", "system"] as const;

export type DocumentDirection = (typeof DOCUMENT_DIRECTIONS)[number];

/**
 * Canonical unit code patterns.
 *
 * - v00 represents the intake unit (version_no = 1, assessment_no = 0).
 * - vNN represents a revision unit (version_no > 0, assessment_no = 0).
 * - aNN-vNN represents an assessment unit linked to a specific version.
 */
export type VersionUnitCode = `v${string}`;
export type AssessmentUnitCode = `a${string}-v${string}`;

/**
 * Human-readable policy for how a document source kind is opened or downloaded.
 *
 * - drive: public/share link; open in a new tab. No server proxy.
 * - cloudinary: public URL or short-TTL signed URL; open in a new tab.
 * - generated: download via the download_url; no server proxy for now.
 */
export interface SourceBehaviorPolicy {
  open_action: "open_url_new_tab" | "download";
  download_action: "open_url_new_tab" | "download";
}

export function deriveSourceBehaviorPolicy(
  sourceKind: DocumentSourceKind,
): SourceBehaviorPolicy {
  switch (sourceKind) {
    case "drive":
      return {
        open_action: "open_url_new_tab",
        download_action: "open_url_new_tab",
      };
    case "cloudinary":
      return {
        open_action: "open_url_new_tab",
        download_action: "open_url_new_tab",
      };
    case "generated":
      return {
        open_action: "download",
        download_action: "download",
      };
    default:
      // Exhaustiveness guard; should never happen for validated source kinds.
      return {
        open_action: "download",
        download_action: "download",
      };
  }
}
/**
 * Canonical naming helpers.
 */
export function canonicalNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const lastSegment = pathname.split("/").pop() || "";
    return decodeURIComponent(lastSegment).replace(/\s+/g, "_").slice(0, 255) || "untitled";
  } catch {
    return "untitled";
  }
}

export function extensionFromFilename(name: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(name);
  return match ? match[1].toLowerCase() : "";
}

export function mimeTypeFromExtension(ext: string): string {
  const map: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    md: "text/markdown",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    zip: "application/zip",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}
export function deriveSourceKindFromUrl(url: string): DocumentSourceKind {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === "drive.google.com" ||
      parsed.hostname === "docs.google.com"
    ) {
      return "drive";
    }
    if (parsed.hostname === "res.cloudinary.com") {
      return "cloudinary";
    }
  } catch {
    // fall through
  }
  return "generated";
}


