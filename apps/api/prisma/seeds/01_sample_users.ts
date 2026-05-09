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

  console.log("Sample users created");
}
