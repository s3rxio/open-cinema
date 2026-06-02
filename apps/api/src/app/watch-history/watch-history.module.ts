import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { WatchHistoryResolver } from "./watch-history.resolver";
import { WatchHistoryService } from "./watch-history.service";

@Module({
  imports: [PrismaModule],
  providers: [WatchHistoryResolver, WatchHistoryService],
  exports: [WatchHistoryService]
})
export class WatchHistoryModule {}
