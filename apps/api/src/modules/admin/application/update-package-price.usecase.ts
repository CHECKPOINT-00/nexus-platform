import { AppError } from "../../../shared/domain/app-error.js";
import { updatePackagePrice, findPackageById } from "../../packages/infrastructure/persistence/package.repository.js";

export async function updatePackagePriceUseCase(
  packageId: string,
  price: number,
  adminId: string,
) {
  if (!packageId) {
    throw new AppError(400, "INVALID_PACKAGE_ID", "Mã gói dịch vụ không được trống");
  }
  if (!adminId) {
    throw new AppError(401, "UNAUTHORIZED", "Thiếu thông tin quản trị viên cập nhật giá");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new AppError(400, "INVALID_PRICE", "Giá tiền phải là số lớn hơn hoặc bằng 0");
  }

  const pkg = await findPackageById(packageId);
  if (!pkg) {
    throw new AppError(404, "PACKAGE_NOT_FOUND", "Không tìm thấy gói dịch vụ");
  }

  return await updatePackagePrice(packageId, price, {
    previousPrice: pkg.price,
    changedBy: adminId,
    changedAt: new Date(),
  });
}
