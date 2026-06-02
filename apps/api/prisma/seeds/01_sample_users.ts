import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/client";
import { UserCreateInput } from "../generated/models/User";
import { Pool } from "pg";

const users: UserCreateInput[] = [
  {
    username: "admin",
    email: "admin@example.com",
    password: bcrypt.hashSync("admin123", process.env.API_BCRYPT_SALT)
  }
];

export default async function seed(prisma: PrismaClient, pool: Pool) {
  console.log("Creating sample users...");

  for (const user of users) {
    await prisma.user
      .create({
        data: user
      })
      .catch(() => {
        // User might already exist
      });
  }

  const adminRole = await prisma.role.findUnique({
    where: { slug: "admin" }
  });
  const adminUser = await prisma.user.findFirst({
    where: { username: "admin" }
  });

  if (adminRole && adminUser) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      },
      create: {
        userId: adminUser.id,
        roleId: adminRole.id
      },
      update: {}
    });
  }

  console.log("Sample users created");
}
