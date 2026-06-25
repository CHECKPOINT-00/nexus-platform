export function validateDriveLink(url: string): {
  isValid: boolean;
  error: string | null;
  extractedId: string | null;
  type: "file" | "folder" | "document" | null;
} {
  if (!url) {
    return {
      isValid: false,
      error: "Đường dẫn không được để trống.",
      extractedId: null,
      type: null,
    };
  }

  const trimmed = url.trim();

  // Common Google Drive / Docs URL patterns
  const fileRegex = /\/file\/d\/([a-zA-Z0-9-_]+)/;
  const folderRegex = /\/folders\/([a-zA-Z0-9-_]+)/;
  const docRegex = /\/document\/d\/([a-zA-Z0-9-_]+)/;
  const sheetRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const slideRegex = /\/presentation\/d\/([a-zA-Z0-9-_]+)/;

  if (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")) {
    const fileMatch = trimmed.match(fileRegex);
    if (fileMatch) {
      return { isValid: true, error: null, extractedId: fileMatch[1] ?? null, type: "file" };
    }

    const folderMatch = trimmed.match(folderRegex);
    if (folderMatch) {
      return { isValid: true, error: null, extractedId: folderMatch[1] ?? null, type: "folder" };
    }

    const docMatch = trimmed.match(docRegex) || trimmed.match(sheetRegex) || trimmed.match(slideRegex);
    if (docMatch) {
      return { isValid: true, error: null, extractedId: docMatch[1] ?? null, type: "document" };
    }

    return {
      isValid: false,
      error: "Liên kết Google Drive không đúng định dạng tài liệu hoặc thư mục.",
      extractedId: null,
      type: null,
    };
  }

  return {
    isValid: false,
    error: "Vui lòng nhập liên kết hợp lệ từ Google Drive hoặc Google Docs (bắt đầu bằng drive.google.com hoặc docs.google.com).",
    extractedId: null,
    type: null,
  };
}
