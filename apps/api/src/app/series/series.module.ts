import { Module } from "@nestjs/common";
import { SeriesService } from "./series.service";
import { SeriesResolver } from "./series.resolver";
import { PrismaModule } from "../prisma/prisma.module";
import { ReviewModule } from "../review/review.module";
import { ContentModule } from "../content/content.module";

@Module({
  imports: [PrismaModule, ReviewModule, ContentModule],
  providers: [SeriesResolver, SeriesService],
  exports: [SeriesService]
})
export class SeriesModule {}
