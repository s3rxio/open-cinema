import { Module } from "@nestjs/common";
import { EpisodeService } from "./episode.service";
import { EpisodeResolver } from "./episode.resolver";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [EpisodeResolver, EpisodeService],
  exports: [EpisodeService]
})
export class EpisodeModule {}
