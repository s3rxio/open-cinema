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
import { buildContentListSearchFilter } from "../common/list-search-filters";

@Injectable()
export class SeriesService {
  private readonly logger = new Logger(SeriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createSeriesInput: CreateSeriesInput): Promise<Series> {
    try {
      const series = await this.prisma.series.create({
        data: {
          title: createSeriesInput.title,
          description: createSeriesInput.description,
          releaseDate: createSeriesInput.releaseDate,
          genres: createSeriesInput.genres,
          director: createSeriesInput.director,
          rating: createSeriesInput.rating
        },
        include: {
          episodes: {
            orderBy: [{ season: "asc" }, { episode: "asc" }]
          }
        }
      });
      return series as Series;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<PaginatedSeries> {
    const { first, cursor, search } = paginationArgs;
    const where = buildContentListSearchFilter(search);
    const series = await this.prisma.series.findMany({
      where,
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
      data: series as Series[],
      total: await this.prisma.series.count({ where }),
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

    return series as Series;
  }

  async findById(id: string): Promise<Series | null> {
    return this.prisma.series.findUnique({
      where: { id: id },
      include: {
        episodes: {
          orderBy: [{ season: "asc" }, { episode: "asc" }]
        }
      }
    }) as Promise<Series | null>;
  }

  async update(
    id: string,
    updateSeriesInput: UpdateSeriesInput
  ): Promise<Series> {
    await this.findOne(id);

    try {
      const series = await this.prisma.series.update({
        where: { id: id },
        data: {
          title: updateSeriesInput.title,
          description: updateSeriesInput.description,
          releaseDate: updateSeriesInput.releaseDate,
          genres: updateSeriesInput.genres,
          director: updateSeriesInput.director,
          rating: updateSeriesInput.rating
        },
        include: {
          episodes: {
            orderBy: [{ season: "asc" }, { episode: "asc" }]
          }
        }
      });
      return series as Series;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<boolean> {
    await this.findOne(id);

    await this.prisma.$transaction(async tx => {
      const episodes = await tx.episode.findMany({
        where: { seriesId: id },
        select: { streamId: true }
      });

      const streamIds = episodes
        .map(episode => episode.streamId)
        .filter((streamId): streamId is string => Boolean(streamId));

      if (streamIds.length > 0) {
        await tx.stream.deleteMany({ where: { id: { in: streamIds } } });
      }

      await tx.series.delete({ where: { id } });
    });

    return true;
  }
}
