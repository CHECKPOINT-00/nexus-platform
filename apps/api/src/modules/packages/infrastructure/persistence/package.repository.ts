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
