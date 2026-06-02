import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFavoriteInput } from "./dto/create-favorite.input";
import { UpdateFavoriteInput } from "./dto/update-favorite.input";
import { Favorite } from "./entities/favorite.entity";

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(private readonly prisma: PrismaService) {}

  private assertValidCreateInput(input: CreateFavoriteInput) {
    const hasMovie = input.movieId !== undefined && input.movieId !== null;
    const hasSeries = input.seriesId !== undefined && input.seriesId !== null;

    if (hasMovie === hasSeries) {
      throw new BadRequestException(
        "Provide exactly one of movieId or seriesId"
      );
    }

    if (hasMovie && !input.movieId) {
      throw new BadRequestException("movieId must be non-empty");
    }

    if (hasSeries && !input.seriesId) {
      throw new BadRequestException("seriesId must be non-empty");
    }
  }

  private async movieExists(id: string) {
    const exists = await this.prisma.movie.findFirst({
      where: {
        id
      }
    });

    if (!exists) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return exists;
  }

  private async seriesExists(id: string) {
    const exists = await this.prisma.series.findFirst({
      where: {
        id
      }
    });

    if (!exists) {
      throw new NotFoundException(`Series with id ${id} not found`);
    }

    return exists;
  }

  private async favoriteIncludesInUserExists(
    userId: string,
    movieOrContentId: string
  ) {
    const exists = await this.prisma.favorite.findFirst({
      where: {
        userId,
        OR: [{ movieId: movieOrContentId }, { seriesId: movieOrContentId }]
      }
    });

    if (exists) {
      throw new BadRequestException(
        `Favorite with userId ${userId} and movieId or seriesId ${movieOrContentId} already exists`
      );
    }

    return exists;
  }

  async create(createFavoriteInput: CreateFavoriteInput): Promise<Favorite> {
    this.assertValidCreateInput(createFavoriteInput);

    await this.favoriteIncludesInUserExists(
      createFavoriteInput.userId,
      createFavoriteInput.seriesId || createFavoriteInput.movieId || ""
    );

    if (createFavoriteInput.movieId) {
      await this.movieExists(createFavoriteInput.movieId);
    }

    if (createFavoriteInput.seriesId) {
      await this.seriesExists(createFavoriteInput.seriesId);
    }

    try {
      return this.prisma.favorite.create({
        data: {
          userId: createFavoriteInput.userId,
          movieId: createFavoriteInput.movieId,
          seriesId: createFavoriteInput.seriesId
        },
        include: {
          movie: true,
          series: true
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(): Promise<Favorite[]> {
    return this.prisma.favorite.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        movie: true,
        series: true
      }
    });
  }

  async findByUserId(userId: string): Promise<Favorite[]> {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        movie: true,
        series: true
      }
    });
  }

  async findOne(id: string): Promise<Favorite> {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id },
      include: {
        movie: true,
        series: true
      }
    });

    console.log(favorite);

    if (!favorite) {
      throw new NotFoundException(`Favorite with id ${id} not found`);
    }

    return favorite;
  }

  async update(
    id: string,
    updateFavoriteInput: UpdateFavoriteInput
  ): Promise<Favorite> {
    await this.findOne(id);

    try {
      return this.prisma.favorite.update({
        where: { id },
        data: {
          userId: updateFavoriteInput.userId,
          movieId: updateFavoriteInput.movieId || null,
          seriesId: updateFavoriteInput.seriesId || null
        },
        include: {
          movie: true,
          series: true
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<boolean> {
    await this.findOne(id);

    await this.prisma.favorite.delete({ where: { id } });
    return true;
  }
}
