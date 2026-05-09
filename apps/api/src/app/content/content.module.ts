import { Module } from "@nestjs/common";
import { ContentResolver } from "./content.resolver";
import { ContentService } from "./content.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [ContentResolver, ContentService],
  exports: [ContentService]
})
export class ContentModule {}
