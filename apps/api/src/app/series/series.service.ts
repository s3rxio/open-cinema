import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { CreateSeriesInput } from "./dto/create-series.input";
import { UpdateSeriesInput } from "./dto/update-series.input";
import { PaginatedSeries } from "./dto/paginated-series.response";
import { PaginationArgs } from "@open-cinema/core";
import { PrismaService } from "../prisma/prisma.service";
import { Series } from "./entities/series.entity";

@Injectable()
export class SeriesService {
  private readonly logger = new Logger(SeriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createSeriesInput: CreateSeriesInput): Promise<Series> {
    try {
      return this.prisma.series.create({
        data: {
          title: createSeriesInput.title,
          description: createSeriesInput.description,
          releaseDate: createSeriesInput.releaseDate,
          genre: createSeriesInput.genre,
          director: createSeriesInput.director,
          rating: createSeriesInput.rating
        },
        include: {
          episodes: {
            orderBy: [{ season: "asc" }, { episode: "asc" }]
          }
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<PaginatedSeries> {
    const { first, cursor } = paginationArgs;
    const series = await this.prisma.series.findMany({
      orderBy: { createdAt: "asc" },
      take: first,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        episodes: {
          orderBy: [{ season: "asc" }, { episode: "asc" }]
        }
      }
    });

    const nextCursor = series.length > 0 ? series[series.length - 1].id : null;

    return {
      data: series,
      total: await this.prisma.series.count(),
      nextCursor: nextCursor,
      prevCursor: cursor
    };
  }

  async findOne(id: string): Promise<Series> {
    const series = await this.prisma.series.findUnique({
      where: { id: id },
      include: {
        episodes: {
          orderBy: [{ season: "asc" }, { episode: "asc" }]
        }
      }
    });

    if (!series) {
      throw new NotFoundException(`Series with id ${id} not found`);
    }

    return series;
  }

  async findById(id: string): Promise<Series | null> {
    return this.prisma.series.findUnique({
      where: { id: id },
      include: {
        episodes: {
          orderBy: [{ season: "asc" }, { episode: "asc" }]
        }
      }
    });
  }

  async update(
    id: string,
    updateSeriesInput: UpdateSeriesInput
  ): Promise<Series> {
    await this.findOne(id);

    try {
      return this.prisma.series.update({
        where: { id: id },
        data: {
          title: updateSeriesInput.title,
          description: updateSeriesInput.description,
          releaseDate: updateSeriesInput.releaseDate,
          genre: updateSeriesInput.genre,
          director: updateSeriesInput.director,
          rating: updateSeriesInput.rating
        },
        include: {
          episodes: {
            orderBy: [{ season: "asc" }, { episode: "asc" }]
          }
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<boolean> {
    await this.findOne(id);

    const deleted = await this.prisma.series.delete({
      where: { id: id }
    });

    return deleted ? true : false;
  }
}
