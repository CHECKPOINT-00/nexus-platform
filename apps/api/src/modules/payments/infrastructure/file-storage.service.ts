import path from "node:path";
import crypto from "node:crypto";
import { AppError } from "../../../shared/domain/app-error.js";
import {
  ALLOWED_PROOF_EXTENSIONS,
  MAX_PROOF_FILE_SIZE_BYTES,
} from "../domain/payment.types.js";
import { uploadFile, deleteFile } from "../../../services/cloudinary.js";

type ProofFile = {
  name: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

type SavedProofFile = {
  fileUrl: string;
  publicId: string;
  resourceType: "raw";
};

const CLOUDINARY_FOLDER = "nexus-platform/payment-proofs";

export class FileStorageService {
  /**
   * Validates a file then uploads it to Cloudinary.
   * Returns public URL + public ID for later rollback.
   */
  async saveProofFile(file: ProofFile): Promise<SavedProofFile> {
    const ext = path.extname(file.name).toLowerCase();
    if (!(ALLOWED_PROOF_EXTENSIONS as readonly string[]).includes(ext)) {
      throw new AppError(
        400,
        "INVALID_FILE_TYPE",
        "Chỉ hỗ trợ tải lên các tệp ảnh .jpg, .jpeg, .png hoặc .pdf",
      );
    }

    if (file.size > MAX_PROOF_FILE_SIZE_BYTES) {
      throw new AppError(
        400,
        "FILE_TOO_LARGE",
        "Dung lượng tệp tối đa là 5MB",
      );
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uniqueId = crypto.randomUUID();

      const result = await uploadFile(buffer, CLOUDINARY_FOLDER, uniqueId, "raw");

      return {
        fileUrl: result.fileUrl,
        publicId: result.publicId,
        resourceType: "raw",
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(500, "CLOUDINARY_UPLOAD_ERROR", `Lỗi khi tải minh chứng lên Cloudinary: ${error?.message ?? "Unknown error"}`);
    }
  }

  /**
   * Delete uploaded Cloudinary asset by public ID.
   */
  async deleteFile(publicId: string): Promise<void> {
    await deleteFile(publicId);
  }
}

export const fileStorageService = new FileStorageService();
