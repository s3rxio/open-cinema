import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ContentModule } from "../content/content.module";
import { WatchHistoryResolver } from "./watch-history.resolver";
import { WatchHistoryService } from "./watch-history.service";

@Module({
  imports: [PrismaModule, ContentModule],
  providers: [WatchHistoryResolver, WatchHistoryService],
  exports: [WatchHistoryService]
})
export class WatchHistoryModule {}
