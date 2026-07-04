import { findAllPackages } from "../../packages/infrastructure/persistence/package.repository.js";

export async function listAdminPackagesUseCase() {
  return await findAllPackages();
}
