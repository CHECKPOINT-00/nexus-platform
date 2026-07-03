import { prisma } from "../../../../db.js";

export async function findAllPackages() {
  return await prisma.servicePackage.findMany({
    orderBy: { price: "asc" },
  });
}

export async function createPackage(data: { name: string; price: number; features: string[] }) {
  return await prisma.servicePackage.create({
    data,
  });
}

export async function findPackageById(id: string) {
  return await prisma.servicePackage.findUnique({
    where: { id },
  });
}

type PriceChangeMetadata = {
  previousPrice: number;
  changedBy: string;
  changedAt: Date;
};

export async function updatePackagePrice(
  id: string,
  price: number,
  metadata: PriceChangeMetadata,
) {
  return await prisma.servicePackage.update({
    where: { id },
    data: {
      price,
      previous_price: metadata.previousPrice,
      last_price_changed_by: metadata.changedBy,
      last_price_changed_at: metadata.changedAt,
    },
  });
}

