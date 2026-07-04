import {
  createPackage as defaultCreatePackage,
  findActivePackages as defaultFindActivePackages,
  findAllPackages as defaultFindAllPackages,
} from "../infrastructure/persistence/package.repository.js";
import { DEFAULT_PACKAGES } from "../domain/package.types.js";

type ListPackagesDeps = {
  findActivePackages?: typeof defaultFindActivePackages;
  findAllPackages?: typeof defaultFindAllPackages;
  createPackage?: typeof defaultCreatePackage;
  defaultPackages?: typeof DEFAULT_PACKAGES;
};

const defaultDeps = {
  findActivePackages: defaultFindActivePackages,
  findAllPackages: defaultFindAllPackages,
  createPackage: defaultCreatePackage,
  defaultPackages: DEFAULT_PACKAGES,
};

/**
 * Lists active service packages for customer-facing flows.
 * If no packages exist in the database, seeds the default packages first.
 */
export async function listPackagesUseCase(deps: ListPackagesDeps = {}) {
  const { findActivePackages, findAllPackages, createPackage, defaultPackages } = {
    ...defaultDeps,
    ...deps,
  };

  let packages = await findActivePackages();
  if (packages.length > 0) {
    return packages;
  }

  const allPackages = await findAllPackages();
  if (allPackages.length > 0) {
    return packages;
  }

  for (const pkg of defaultPackages) {
    await createPackage({
      name: pkg.name,
      price: pkg.price,
      features: [...pkg.features],
    });
  }

  return await findActivePackages();
}
