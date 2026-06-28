import fs from "fs";
import path from "path";
import { AppError } from "../../../shared/domain/app-error.js";
import {
  ALLOWED_PROOF_EXTENSIONS,
  MAX_PROOF_FILE_SIZE_BYTES,
} from "../domain/payment.types.js";

export class FileStorageService {
  /**
   * Validates and saves a file buffer to the local uploads directory.
   * Returns the relative URL path of the saved file.
   */
  async saveProofFile(file: { name: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> }): Promise<string> {
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

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueFileName = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);
    const fileUrl = `/uploads/${uniqueFileName}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
      return fileUrl;
    } catch (error: any) {
      // Clean up file if it was partially written
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {}
      throw new AppError(500, "FILE_WRITE_ERROR", `Lỗi khi lưu tệp minh chứng: ${error.message}`);
    }
  }

  /**
   * Delete a file from disk if it exists
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(process.cwd(), "uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error("Failed to delete file:", fileUrl, err);
    }
  }
}

export const fileStorageService = new FileStorageService();
