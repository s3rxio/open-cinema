import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  schema: path.join(root, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(root, "prisma", "migrations"),
    seed: `tsx ${path.join(root, "prisma", "seed.ts")}`
  },
  datasource: {
    url: env("API_DB_URL")
  }
});
