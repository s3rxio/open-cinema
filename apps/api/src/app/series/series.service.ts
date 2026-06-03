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
import { ContentMediaUrlService } from "../content/content-media-url.service";
import { withPublishedFilter } from "../common/content-publish.filter";
import { SeriesUpdateInput } from "../../../prisma/generated/models";

@Injectable()
export class SeriesService {
  private readonly logger = new Logger(SeriesService.name);

  constructor(
    private prisma: PrismaService,
    private readonly contentMediaUrl: ContentMediaUrlService
  ) {}

  private episodesInclude(includeUnpublished: boolean) {
    return {
      episodes: {
        where: includeUnpublished ? {} : { isPublished: true },
        orderBy: [{ season: "asc" as const }, { episode: "asc" as const }]
      }
    };
  }

  async create(createSeriesInput: CreateSeriesInput): Promise<Series> {
    try {
      const series = await this.prisma.series.create({
        data: {
          title: createSeriesInput.title,
          description: createSeriesInput.description,
          releaseDate: createSeriesInput.releaseDate,
          genres: createSeriesInput.genres,
          director: createSeriesInput.director,
          rating: createSeriesInput.rating,
          isPublished: false
        },
        include: this.episodesInclude(true)
      });
      return this.contentMediaUrl.withPublicUrls(series as Series);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(
    paginationArgs: PaginationArgs,
    options?: { includeUnpublished?: boolean }
  ): Promise<PaginatedSeries> {
    const { first, cursor, search } = paginationArgs;
    const includeUnpublished = options?.includeUnpublished ?? false;
    const where = withPublishedFilter(
      buildContentListSearchFilter(search),
      includeUnpublished
    );
    const series = await this.prisma.series.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: first,
      cursor: cursor ? { id: cursor } : undefined,
      include: this.episodesInclude(includeUnpublished)
    });

    const nextCursor = series.length > 0 ? series[series.length - 1].id : null;

    return {
      data: series.map(item =>
        this.contentMediaUrl.withPublicUrls(item as Series)
      ),
      total: await this.prisma.series.count({ where }),
      nextCursor: nextCursor,
      prevCursor: cursor
    };
  }

  async findOne(
    id: string,
    options?: { includeUnpublished?: boolean }
  ): Promise<Series> {
    const includeUnpublished = options?.includeUnpublished ?? false;
    const series = await this.prisma.series.findUnique({
      where: { id: id },
      include: this.episodesInclude(includeUnpublished)
    });

    if (!series) {
      throw new NotFoundException(`Series with id ${id} not found`);
    }

    if (!series.isPublished && !includeUnpublished) {
      throw new NotFoundException(`Series with id ${id} not found`);
    }

    return this.contentMediaUrl.withPublicUrls(series as Series);
  }

  async findById(
    id: string,
    options?: { includeUnpublished?: boolean }
  ): Promise<Series | null> {
    const includeUnpublished = options?.includeUnpublished ?? false;
    const series = await this.prisma.series.findUnique({
      where: { id: id },
      include: this.episodesInclude(includeUnpublished)
    });

    if (!series) {
      return null;
    }

    if (!series.isPublished && !includeUnpublished) {
      return null;
    }

    return this.contentMediaUrl.withPublicUrls(series as Series);
  }

  async update(
    id: string,
    updateSeriesInput: UpdateSeriesInput
  ): Promise<Series> {
    await this.findOne(id, { includeUnpublished: true });

    try {
      const series = await this.prisma.series.update({
        where: { id: id },
        data: this.buildUpdateData(updateSeriesInput),
        include: this.episodesInclude(true)
      });
      return this.contentMediaUrl.withPublicUrls(series as Series);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<boolean> {
    await this.findOne(id, { includeUnpublished: true });

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

  private buildUpdateData(updateSeriesInput: UpdateSeriesInput): SeriesUpdateInput {
    const data: SeriesUpdateInput = {};

    if (updateSeriesInput.title !== undefined) {
      data.title = updateSeriesInput.title;
    }
    if (updateSeriesInput.description !== undefined) {
      data.description = updateSeriesInput.description;
    }
    if (updateSeriesInput.releaseDate !== undefined) {
      data.releaseDate = updateSeriesInput.releaseDate;
    }
    if (updateSeriesInput.genres !== undefined) {
      data.genres = updateSeriesInput.genres;
    }
    if (updateSeriesInput.director !== undefined) {
      data.director = updateSeriesInput.director;
    }
    if (updateSeriesInput.rating !== undefined) {
      data.rating = updateSeriesInput.rating;
    }
    if (updateSeriesInput.isPublished !== undefined) {
      data.isPublished = updateSeriesInput.isPublished;
    }

    return data;
  }
}
