import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { Prisma } from "../../../prisma/generated/client";
import { PrismaService } from "../prisma/prisma.service";
import { RbacService } from "../rbac/rbac.service";
import { RoleSlug } from "../rbac/permissions";
import { CreateReviewInput } from "./dto/create-review.input";
import { UpdateReviewInput } from "./dto/update-review.input";
import { Review } from "./entities/review.entity";

const reviewInclude = {
  user: {
    select: {
      id: true,
      username: true,
      email: true,
      birthdate: true,
      gender: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    }
  }
} satisfies Prisma.ReviewInclude;

export type ContentRatingStats = {
  userRating: number | null;
  reviewCount: number;
};

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rbacService: RbacService
  ) {}

  private assertValidTarget(input: { movieId?: string; seriesId?: string }) {
    const hasMovie = input.movieId !== undefined && input.movieId !== null;
    const hasSeries = input.seriesId !== undefined && input.seriesId !== null;

    if (hasMovie === hasSeries) {
      throw new BadRequestException(
        "Provide exactly one of movieId or seriesId"
      );
    }
  }

  private async assertMovieExists(id: string) {
    const movie = await this.prisma.movie.findFirst({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
  }

  private async assertSeriesExists(id: string) {
    const series = await this.prisma.series.findFirst({ where: { id } });
    if (!series) {
      throw new NotFoundException(`Series with id ${id} not found`);
    }
  }

  private roundRating(value: number) {
    return Math.round(value * 10) / 10;
  }

  async getStatsForMovie(movieId: string): Promise<ContentRatingStats> {
    const aggregate = await this.prisma.review.aggregate({
      where: { movieId, deletedAt: null },
      _avg: { rating: true },
      _count: { _all: true }
    });

    const reviewCount = aggregate._count._all;
    if (reviewCount === 0 || aggregate._avg.rating == null) {
      return { userRating: null, reviewCount: 0 };
    }

    return {
      userRating: this.roundRating(aggregate._avg.rating),
      reviewCount
    };
  }

  async getStatsForSeries(seriesId: string): Promise<ContentRatingStats> {
    const aggregate = await this.prisma.review.aggregate({
      where: { seriesId, deletedAt: null },
      _avg: { rating: true },
      _count: { _all: true }
    });

    const reviewCount = aggregate._count._all;
    if (reviewCount === 0 || aggregate._avg.rating == null) {
      return { userRating: null, reviewCount: 0 };
    }

    return {
      userRating: this.roundRating(aggregate._avg.rating),
      reviewCount
    };
  }

  async findByMovieId(movieId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { movieId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: reviewInclude
    });
  }

  async findBySeriesId(seriesId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { seriesId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: reviewInclude
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.prisma.review.findFirst({
      where: { id, deletedAt: null },
      include: reviewInclude
    });

    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    return review;
  }

  async create(createReviewInput: CreateReviewInput): Promise<Review> {
    this.assertValidTarget(createReviewInput);

    if (createReviewInput.movieId) {
      await this.assertMovieExists(createReviewInput.movieId);
    }

    if (createReviewInput.seriesId) {
      await this.assertSeriesExists(createReviewInput.seriesId);
    }

    try {
      return await this.prisma.review.create({
        data: {
          userId: createReviewInput.userId,
          content: createReviewInput.content,
          rating: createReviewInput.rating,
          movieId: createReviewInput.movieId ?? null,
          seriesId: createReviewInput.seriesId ?? null
        },
        include: reviewInclude
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException("You have already reviewed this title");
      }

      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async update(updateReviewInput: UpdateReviewInput): Promise<Review> {
    const existing = await this.findOne(updateReviewInput.id);

    if (!updateReviewInput.userId) {
      throw new BadRequestException("userId is required");
    }

    if (existing.userId !== updateReviewInput.userId) {
      throw new BadRequestException("You can only edit your own review");
    }

    try {
      return await this.prisma.review.update({
        where: { id: updateReviewInput.id },
        data: {
          content: updateReviewInput.content,
          rating: updateReviewInput.rating
        },
        include: reviewInclude
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      const isAdmin = await this.rbacService.userHasRole(
        userId,
        RoleSlug.Admin
      );
      if (!isAdmin) {
        throw new BadRequestException("You can only delete your own review");
      }
    }

    await this.prisma.review.delete({ where: { id } });
    return true;
  }
}
