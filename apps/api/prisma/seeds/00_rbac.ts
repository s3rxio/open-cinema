import { PrismaClient } from "../generated/client";
import { Pool } from "pg";
import { seedRbac } from "./lib/rbac.seed";

export default async function seed(prisma: PrismaClient, _pool: Pool) {
  console.log("Seeding RBAC permissions and roles...");
  await seedRbac(prisma);
  console.log("RBAC seeded");
}
