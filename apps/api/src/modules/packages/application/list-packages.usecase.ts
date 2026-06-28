import { findAllPackages, createPackage } from "../infrastructure/persistence/package.repository.js";
import { DEFAULT_PACKAGES } from "../domain/package.types.js";

/**
 * Lists all service packages. If none exist in the database,
 * seeds the default packages first.
 */
export async function listPackagesUseCase() {
  let packages = await findAllPackages();

  if (packages.length === 0) {
    // Seed default packages for MVP
    for (const pkg of DEFAULT_PACKAGES) {
      await createPackage({
        name: pkg.name,
        price: pkg.price,
        features: [...pkg.features],
      });
    }

    packages = await findAllPackages();
  }

  return packages;
}
