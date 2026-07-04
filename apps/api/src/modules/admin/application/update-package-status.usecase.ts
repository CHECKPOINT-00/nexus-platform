import { AppError } from "../../../shared/domain/app-error.js";
import {
  findPackageById,
  updatePackageStatus,
} from "../../packages/infrastructure/persistence/package.repository.js";

export async function updatePackageStatusUseCase(
  packageId: string,
  isActive: boolean,
  adminId: string,
) {
  if (!packageId) {
    throw new AppError(400, "INVALID_PACKAGE_ID", "Mã gói dịch vụ không được trống");
  }
  if (!adminId) {
    throw new AppError(401, "UNAUTHORIZED", "Thiếu thông tin quản trị viên cập nhật trạng thái");
  }
  if (typeof isActive !== "boolean") {
    throw new AppError(400, "INVALID_PACKAGE_STATUS", "Trạng thái gói dịch vụ không hợp lệ");
  }

  const pkg = await findPackageById(packageId);
  if (!pkg) {
    throw new AppError(404, "PACKAGE_NOT_FOUND", "Không tìm thấy gói dịch vụ");
  }

  return await updatePackageStatus(packageId, isActive);
}
