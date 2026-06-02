import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ReviewResolver } from "./review.resolver";
import { ReviewService } from "./review.service";

@Module({
  imports: [PrismaModule],
  providers: [ReviewResolver, ReviewService],
  exports: [ReviewService]
})
export class ReviewModule {}
