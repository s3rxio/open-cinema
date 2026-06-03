import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { Prisma } from "../../../prisma/generated/client";
import { CreateEpisodeInput } from "./dto/create-episode.input";
import { CreateEpisodesBulkInput } from "./dto/create-episodes-bulk.input";
import { UpdateEpisodeInput } from "./dto/update-episode.input";
import { PaginatedEpisodes } from "./dto/paginated-episode.response";
import { PaginationArgs } from "@open-cinema/core";
import { PrismaService } from "../prisma/prisma.service";
import { Episode } from "./entities/episode.entity";
import { withPublishedFilter } from "../common/content-publish.filter";
import { EpisodeUpdateInput } from "../../../prisma/generated/models";

@Injectable()
export class EpisodeService {
  private readonly logger = new Logger(EpisodeService.name);

  constructor(private prisma: PrismaService) {}

  async create(createEpisodeInput: CreateEpisodeInput): Promise<Episode> {
    await this.assertSeriesExists(createEpisodeInput.seriesId);

    try {
      return await this.prisma.episode.create({
        data: {
          title: createEpisodeInput.title,
          description: createEpisodeInput.description,
          releaseDate: new Date(createEpisodeInput.releaseDate),
          rating: createEpisodeInput.rating,
          season: createEpisodeInput.season,
          episode: createEpisodeInput.episode,
          seriesId: createEpisodeInput.seriesId,
          isPublished: false
        }
      });
    } catch (error) {
      throw this.toEpisodeException(error);
    }
  }

  async createBulk(input: CreateEpisodesBulkInput): Promise<Episode[]> {
    const series = await this.prisma.series.findUnique({
      where: { id: input.seriesId }
    });

    if (!series) {
      throw new NotFoundException(`Series with id ${input.seriesId} not found`);
    }

    const startEpisode = input.startEpisode ?? 1;
    const titlePrefix = input.titlePrefix?.trim() || series.title;
    const data = Array.from({ length: input.count }, (_, index) => {
      const episodeNumber = startEpisode + index;

      return {
        seriesId: input.seriesId,
        season: input.season,
        episode: episodeNumber,
        title: `${titlePrefix} — S${input.season}E${episodeNumber}`,
        description: input.description,
        releaseDate: new Date(input.releaseDate),
        rating: input.rating,
        isPublished: false
      };
    });

    try {
      return await this.prisma.$transaction(
        data.map(episode =>
          this.prisma.episode.create({
            data: episode
          })
        )
      );
    } catch (error) {
      throw this.toEpisodeException(error);
    }
  }

  private async assertSeriesExists(seriesId: string): Promise<void> {
    const series = await this.prisma.series.findUnique({
      where: { id: seriesId },
      select: { id: true }
    });

    if (!series) {
      throw new NotFoundException(`Series with id ${seriesId} not found`);
    }
  }

  private toEpisodeException(error: unknown): never {
    this.logger.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        throw new BadRequestException("Сериал не найден или недоступен");
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException();
  }

  async findAll(
    paginationArgs: PaginationArgs,
    options?: { includeUnpublished?: boolean }
  ): Promise<PaginatedEpisodes> {
    const { first, cursor } = paginationArgs;
    const where = withPublishedFilter(undefined, options?.includeUnpublished ?? false);
    const episodes = await this.prisma.episode.findMany({
      where,
      orderBy: [{ season: "asc" }, { episode: "asc" }],
      take: first,
      cursor: cursor ? { id: cursor } : undefined
    });

    const nextCursor =
      episodes.length > 0 ? episodes[episodes.length - 1].id : null;

    return {
      data: episodes,
      total: await this.prisma.episode.count({ where }),
      nextCursor: nextCursor,
      prevCursor: cursor
    };
  }

  async findOne(
    id: string,
    options?: { includeUnpublished?: boolean }
  ): Promise<Episode> {
    const episode = await this.prisma.episode.findUnique({
      where: { id: id },
      include: {
        series: { select: { isPublished: true } }
      }
    });

    if (!episode) {
      throw new NotFoundException(`Episode with id ${id} not found`);
    }

    if (!this.isEpisodeVisible(episode, options?.includeUnpublished ?? false)) {
      throw new NotFoundException(`Episode with id ${id} not found`);
    }

    const { series: _series, ...rest } = episode;
    return rest;
  }

  async findById(
    id: string,
    options?: { includeUnpublished?: boolean }
  ): Promise<Episode | null> {
    const episode = await this.prisma.episode.findUnique({
      where: { id: id },
      include: {
        series: { select: { isPublished: true } }
      }
    });

    if (!episode) {
      return null;
    }

    if (!this.isEpisodeVisible(episode, options?.includeUnpublished ?? false)) {
      return null;
    }

    const { series: _series, ...rest } = episode;
    return rest;
  }

  async findBySeriesId(
    seriesId: string,
    paginationArgs: PaginationArgs,
    options?: { includeUnpublished?: boolean }
  ): Promise<PaginatedEpisodes> {
    const { first, cursor } = paginationArgs;
    const where = withPublishedFilter(
      { seriesId },
      options?.includeUnpublished ?? false
    );
    const episodes = await this.prisma.episode.findMany({
      where,
      orderBy: [{ season: "asc" }, { episode: "asc" }],
      take: first,
      cursor: cursor ? { id: cursor } : undefined
    });

    const nextCursor =
      episodes.length > 0 ? episodes[episodes.length - 1].id : null;

    return {
      data: episodes,
      total: await this.prisma.episode.count({ where }),
      nextCursor: nextCursor,
      prevCursor: cursor
    };
  }

  async update(
    id: string,
    updateEpisodeInput: UpdateEpisodeInput
  ): Promise<Episode> {
    await this.findOne(id, { includeUnpublished: true });

    try {
      return this.prisma.episode.update({
        where: { id: id },
        data: this.buildUpdateData(updateEpisodeInput)
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<boolean> {
    const episode = await this.findOne(id, { includeUnpublished: true });

    await this.prisma.$transaction(async tx => {
      if (episode.streamId) {
        await tx.stream.delete({ where: { id: episode.streamId } });
      }

      await tx.episode.delete({ where: { id } });
    });

    return true;
  }

  private isEpisodeVisible(
    episode: {
      isPublished: boolean;
      series: { isPublished: boolean };
    },
    includeUnpublished: boolean
  ): boolean {
    if (includeUnpublished) {
      return true;
    }

    return episode.isPublished && episode.series.isPublished;
  }

  private buildUpdateData(
    updateEpisodeInput: UpdateEpisodeInput
  ): EpisodeUpdateInput {
    const data: EpisodeUpdateInput = {};

    if (updateEpisodeInput.title !== undefined) {
      data.title = updateEpisodeInput.title;
    }
    if (updateEpisodeInput.description !== undefined) {
      data.description = updateEpisodeInput.description;
    }
    if (updateEpisodeInput.releaseDate !== undefined) {
      data.releaseDate = updateEpisodeInput.releaseDate;
    }
    if (updateEpisodeInput.rating !== undefined) {
      data.rating = updateEpisodeInput.rating;
    }
    if (updateEpisodeInput.season !== undefined) {
      data.season = updateEpisodeInput.season;
    }
    if (updateEpisodeInput.episode !== undefined) {
      data.episode = updateEpisodeInput.episode;
    }
    if (updateEpisodeInput.seriesId !== undefined) {
      data.series = { connect: { id: updateEpisodeInput.seriesId } };
    }
    if (updateEpisodeInput.isPublished !== undefined) {
      data.isPublished = updateEpisodeInput.isPublished;
    }

    return data;
  }
}
