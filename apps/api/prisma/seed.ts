import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client";
import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";

const connectionString = `${process.env.API_DB_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function loadAndExecuteSeeds() {
  const seedsDir = join(__dirname, "seeds");

  try {
    const files = await readdir(seedsDir);
    const sortedFiles = files.sort();

    for (const file of sortedFiles) {
      const filePath = join(seedsDir, file);
      const ext = extname(file);

      try {
        if (ext === ".ts" || ext === ".js") {
          console.log(`Executing seed: ${file}`);
          const seedModule = await import(filePath);
          const seedFn = seedModule.default || seedModule.seed;

          if (typeof seedFn === "function") {
            await seedFn(prisma, pool);
          } else {
            console.warn(
              `Warning: ${file} does not export a default function or seed function`
            );
          }
        } else if (ext === ".sql") {
          console.log(`Executing SQL seed: ${file}`);
          const sql = await readFile(filePath, "utf-8");
          await pool.query(sql);
        } else {
          console.log(`Skipping unsupported file: ${file}`);
        }
      } catch (error) {
        console.error(`Error executing seed ${file}:`, error);
        throw error;
      }
    }

    console.log("All seeds executed successfully");
  } catch (error) {
    console.error("Error loading seeds:", error);
    throw error;
  }
}

async function main() {
  await loadAndExecuteSeeds();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
