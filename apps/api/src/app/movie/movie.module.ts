import { Module } from "@nestjs/common";
import { MovieService } from "./movie.service";
import { MovieResolver } from "./movie.resolver";
import { PrismaModule } from "../prisma/prisma.module";
import { ReviewModule } from "../review/review.module";

@Module({
  imports: [PrismaModule, ReviewModule],
  providers: [MovieResolver, MovieService],
  exports: [MovieService]
})
export class MovieModule {}
