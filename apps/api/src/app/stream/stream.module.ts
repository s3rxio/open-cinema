import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";
import { MediaProcessingModule } from "../media-processing/media-processing.module";
import { StreamService } from "./stream.service";
import { StreamResolver } from "./stream.resolver";
import { ContentModule } from "../content/content.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    MediaProcessingModule,
    ContentModule,
    ConfigModule
  ],
  providers: [StreamService, StreamResolver],
  exports: [StreamService]
})
export class StreamModule {}
