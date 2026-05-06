import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { CreateEpisodeInput } from "./dto/create-episode.input";
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
    try {
      return this.prisma.episode.create({
        data: {
          title: createEpisodeInput.title,
          description: createEpisodeInput.description,
          releaseDate: createEpisodeInput.releaseDate,
          rating: createEpisodeInput.rating,
          season: createEpisodeInput.season,
          episode: createEpisodeInput.episode,
          seriesId: createEpisodeInput.seriesId
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
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
    await this.findOne(id);

    const deleted = await this.prisma.episode.delete({
      where: { id: id }
    });

    return deleted ? true : false;
  }
}
