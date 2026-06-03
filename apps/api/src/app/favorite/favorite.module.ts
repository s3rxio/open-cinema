import { Module } from "@nestjs/common";
import { FavoriteService } from "./favorite.service";
import { FavoriteResolver } from "./favorite.resolver";
import { PrismaModule } from "../prisma/prisma.module";
import { ContentModule } from "../content/content.module";

@Module({
  imports: [PrismaModule, ContentModule],
  providers: [FavoriteResolver, FavoriteService],
  exports: [FavoriteService]
})
export class FavoriteModule {}
