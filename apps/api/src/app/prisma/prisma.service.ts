import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.API_DB_URL });
    super({ adapter, log: ["info", "warn", "error", "query"] });
  }
}
