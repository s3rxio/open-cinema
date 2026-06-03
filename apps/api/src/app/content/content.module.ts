import { Module } from "@nestjs/common";
import { ContentResolver } from "./content.resolver";
import { ContentService } from "./content.service";
import { ContentMediaService } from "./content-media.service";
import { ContentMediaUrlService } from "./content-media-url.service";
import { PrismaModule } from "../prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [PrismaModule, StorageModule, ConfigModule],
  providers: [ContentResolver, ContentService, ContentMediaService, ContentMediaUrlService],
  exports: [ContentService, ContentMediaUrlService]
})
export class ContentModule {}
