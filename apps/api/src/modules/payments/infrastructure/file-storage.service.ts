import path from "node:path";
import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../../../shared/domain/app-error.js";
import {
  ALLOWED_PROOF_EXTENSIONS,
  MAX_PROOF_FILE_SIZE_BYTES,
} from "../domain/payment.types.js";

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
const CLOUDINARY_RESOURCE_TYPE = "raw";
let cloudinaryConfigured = false;

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new AppError(500, "CLOUDINARY_CONFIG_ERROR", `${name} is required`);
  }

  return value;
}

function ensureCloudinaryConfig() {
  if (cloudinaryConfigured) {
    return;
  }

  cloudinary.config({
    cloud_name: requiredEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requiredEnv("CLOUDINARY_API_KEY"),
    api_secret: requiredEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  cloudinaryConfigured = true;
}

function uploadBuffer(buffer: Buffer, options: Record<string, unknown>): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}

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

    ensureCloudinaryConfig();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uniqueId = crypto.randomUUID();

      const result = await uploadBuffer(buffer, {
        folder: CLOUDINARY_FOLDER,
        public_id: uniqueId,
        resource_type: CLOUDINARY_RESOURCE_TYPE,
        overwrite: false,
      });

      const fileUrl = result?.secure_url || result?.url;
      const publicId = result?.public_id;

      if (!fileUrl || !publicId) {
        throw new Error("Cloudinary upload missing url or public_id");
      }

      return {
        fileUrl,
        publicId,
        resourceType: CLOUDINARY_RESOURCE_TYPE,
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
    if (!publicId) {
      return;
    }

    try {
      ensureCloudinaryConfig();
      await cloudinary.uploader.destroy(publicId, {
        resource_type: "auto",
        invalidate: true,
      });
    } catch (err) {
      console.error("Failed to delete Cloudinary file:", publicId, err);
    }
  }
}

export const fileStorageService = new FileStorageService();
