import { Module } from "@nestjs/common";
import { ContentResolver } from "./content.resolver";
import { ContentService } from "./content.service";
import { ContentMediaService } from "./content-media.service";
import { ContentMediaUrlService } from "./content-media-url.service";
import { PrismaModule } from "../prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";
import { ConfigModule } from "@nestjs/config";
import { MediaProcessingModule } from "../media-processing/media-processing.module";

@Module({
  imports: [PrismaModule, StorageModule, ConfigModule, MediaProcessingModule],
  providers: [
    ContentResolver,
    ContentService,
    ContentMediaService,
    ContentMediaUrlService
  ],
  exports: [ContentService, ContentMediaUrlService]
})
export class ContentModule {}
