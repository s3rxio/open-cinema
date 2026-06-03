import { Module } from "@nestjs/common";
import { EpisodeService } from "./episode.service";
import { EpisodeResolver } from "./episode.resolver";
import { PrismaModule } from "../prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [PrismaModule, StorageModule],
  providers: [EpisodeResolver, EpisodeService],
  exports: [EpisodeService]
})
export class EpisodeModule {}
