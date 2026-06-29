import {
  createPackage as defaultCreatePackage,
  findAllPackages as defaultFindAllPackages,
} from "../infrastructure/persistence/package.repository.js";
import { DEFAULT_PACKAGES } from "../domain/package.types.js";

type ListPackagesDeps = {
  findAllPackages?: typeof defaultFindAllPackages;
  createPackage?: typeof defaultCreatePackage;
  defaultPackages?: typeof DEFAULT_PACKAGES;
};

const defaultDeps = {
  findAllPackages: defaultFindAllPackages,
  createPackage: defaultCreatePackage,
  defaultPackages: DEFAULT_PACKAGES,
};

/**
 * Lists all service packages. If none exist in the database,
 * seeds the default packages first.
 */
export async function listPackagesUseCase(deps: ListPackagesDeps = {}) {
  const { findAllPackages, createPackage, defaultPackages } = {
    ...defaultDeps,
    ...deps,
  };

  let packages = await findAllPackages();

  if (packages.length === 0) {
    for (const pkg of defaultPackages) {
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
