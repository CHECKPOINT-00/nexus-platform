export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".xlsx",
  ".pptx",
  ".md",
  ".txt",
] as const;

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export function isAllowedDocumentExtension(extension: string): boolean {
  return (ALLOWED_DOCUMENT_EXTENSIONS as readonly string[]).includes(extension.toLowerCase());
}
