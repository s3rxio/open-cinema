import { Module } from "@nestjs/common";
import { FavoriteService } from "./favorite.service";
import { FavoriteResolver } from "./favorite.resolver";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [FavoriteResolver, FavoriteService],
  exports: [FavoriteService]
})
export class FavoriteModule {}
