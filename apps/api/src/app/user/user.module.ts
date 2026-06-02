import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserResolver } from "./user.resolver";
import { PrismaModule } from "../prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { FavoriteModule } from "../favorite/favorite.module";
import { WatchHistoryModule } from "../watch-history/watch-history.module";

@Module({
  imports: [PrismaModule, ConfigModule, FavoriteModule, WatchHistoryModule],
  providers: [UserResolver, UserService],
  exports: [UserService]
})
export class UserModule {}
