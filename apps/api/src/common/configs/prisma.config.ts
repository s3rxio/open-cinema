import "dotenv/config";
import path from "path";
import { defineConfig, env } from "prisma/config";

const prismaDir = path.join(__dirname, "..", "..", "..", "prisma");

export default defineConfig({
  schema: path.join(prismaDir, "schema.prisma"),
  migrations: {
    path: path.join(prismaDir, "migrations"),
    seed: `tsx ${path.join(prismaDir, "seed.ts")}`
  },
  datasource: {
    url: env("API_DB_URL")
  }
});
