import path from "node:path";
import crypto from "node:crypto";
import { AppError } from "../../../shared/domain/app-error.js";
import { uploadFile, deleteFile } from "../../../services/cloudinary.js";
import {
  MAX_DOCUMENT_FILE_SIZE_BYTES,
  isAllowedDocumentExtension,
} from "../domain/document-upload-rules.js";

export type ManagedUploadFile = {
  name: string;
  size: number;
  type?: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type UploadedManagedDocument = {
  original_name: string;
  file_url: string;
  download_url: string;
  cloudinary_public_id: string;
  extension: string;
  mime_type: string;
};

const CLOUDINARY_FOLDER = "nexus-platform/case-documents";

function normalizeExtension(fileName: string) {
  return path.extname(fileName).toLowerCase();
}

export function validateManagedDocumentFile(file: ManagedUploadFile) {
  const extension = normalizeExtension(file.name);
  if (!isAllowedDocumentExtension(extension)) {
    throw new AppError(
      400,
      "INVALID_FILE_TYPE",
      "Chỉ hỗ trợ tải lên tệp .pdf, .docx, .xlsx, .pptx, .md, .txt",
    );
  }

  if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    throw new AppError(
      400,
      "FILE_TOO_LARGE",
      "Dung lượng tài liệu tối đa là 15MB",
    );
  }

  return extension;
}

export async function uploadManagedDocumentFile(file: ManagedUploadFile): Promise<UploadedManagedDocument> {
  const extension = validateManagedDocumentFile(file);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const publicId = crypto.randomUUID();
    const result = await uploadFile(buffer, CLOUDINARY_FOLDER, publicId, "raw");

    return {
      original_name: file.name,
      file_url: result.fileUrl,
      download_url: result.fileUrl,
      cloudinary_public_id: result.publicId,
      extension: extension.replace(/^\./, ""),
      mime_type: file.type?.trim() || "application/octet-stream",
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      500,
      "CLOUDINARY_UPLOAD_ERROR",
      `Lỗi khi tải tài liệu lên Cloudinary: ${error?.message ?? "Unknown error"}`,
    );
  }
}

export async function deleteManagedDocumentFile(publicId: string) {
  await deleteFile(publicId);
}
