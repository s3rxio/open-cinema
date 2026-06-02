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
          seriesId: createEpisodeInput.seriesId
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
        rating: input.rating
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

  async findAll(paginationArgs: PaginationArgs): Promise<PaginatedEpisodes> {
    const { first, cursor } = paginationArgs;
    const episodes = await this.prisma.episode.findMany({
      orderBy: [{ season: "asc" }, { episode: "asc" }],
      take: first,
      cursor: cursor ? { id: cursor } : undefined
    });

    const nextCursor =
      episodes.length > 0 ? episodes[episodes.length - 1].id : null;

    return {
      data: episodes,
      total: await this.prisma.episode.count(),
      nextCursor: nextCursor,
      prevCursor: cursor
    };
  }

  async findOne(id: string): Promise<Episode> {
    const episode = await this.prisma.episode.findUnique({
      where: { id: id }
    });

    if (!episode) {
      throw new NotFoundException(`Episode with id ${id} not found`);
    }

    return episode;
  }

  async findById(id: string): Promise<Episode | null> {
    return this.prisma.episode.findUnique({
      where: { id: id }
    });
  }

  async findBySeriesId(
    seriesId: string,
    paginationArgs: PaginationArgs
  ): Promise<PaginatedEpisodes> {
    const { first, cursor } = paginationArgs;
    const episodes = await this.prisma.episode.findMany({
      where: { seriesId: seriesId },
      orderBy: [{ season: "asc" }, { episode: "asc" }],
      take: first,
      cursor: cursor ? { id: cursor } : undefined
    });

    const nextCursor =
      episodes.length > 0 ? episodes[episodes.length - 1].id : null;

    return {
      data: episodes,
      total: await this.prisma.episode.count({ where: { seriesId: seriesId } }),
      nextCursor: nextCursor,
      prevCursor: cursor
    };
  }

  async update(
    id: string,
    updateEpisodeInput: UpdateEpisodeInput
  ): Promise<Episode> {
    await this.findOne(id);

    try {
      return this.prisma.episode.update({
        where: { id: id },
        data: {
          title: updateEpisodeInput.title,
          description: updateEpisodeInput.description,
          releaseDate: updateEpisodeInput.releaseDate,
          rating: updateEpisodeInput.rating,
          season: updateEpisodeInput.season,
          episode: updateEpisodeInput.episode,
          seriesId: updateEpisodeInput.seriesId
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<boolean> {
    const episode = await this.findOne(id);

    await this.prisma.$transaction(async tx => {
      if (episode.streamId) {
        await tx.stream.delete({ where: { id: episode.streamId } });
      }

      await tx.episode.delete({ where: { id } });
    });

    return true;
  }
}
