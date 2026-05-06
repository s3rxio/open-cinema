import { Module } from "@nestjs/common";
import { MovieService } from "./movie.service";
import { MovieResolver } from "./movie.resolver";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [MovieResolver, MovieService],
  exports: [MovieService]
})
export class MovieModule {}
