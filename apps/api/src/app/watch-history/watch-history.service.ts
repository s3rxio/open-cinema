import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RecordWatchHistoryInput } from "./dto/record-watch-history.input";
import { UpdateWatchHistoryInput } from "./dto/update-watch-history.input";
import { WatchHistory } from "./entities/watch-history.entity";

const watchHistoryInclude = {
  movie: true,
  episode: true
} as const;

@Injectable()
export class WatchHistoryService {
  private readonly logger = new Logger(WatchHistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  private assertValidRecordInput(input: RecordWatchHistoryInput) {
    const hasMovie = input.movieId !== undefined && input.movieId !== null;
    const hasEpisode =
      input.episodeId !== undefined && input.episodeId !== null;

    if (hasMovie === hasEpisode) {
      throw new BadRequestException(
        "Provide exactly one of movieId or episodeId"
      );
    }

    if (hasMovie && !input.movieId) {
      throw new BadRequestException("movieId must be non-empty");
    }

    if (hasEpisode && !input.episodeId) {
      throw new BadRequestException("episodeId must be non-empty");
    }
  }

  private async movieExists(id: string) {
    const exists = await this.prisma.movie.findFirst({
      where: { id }
    });

    if (!exists) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return exists;
  }

  private async episodeExists(id: string) {
    const exists = await this.prisma.episode.findFirst({
      where: { id }
    });

    if (!exists) {
      throw new NotFoundException(`Episode with id ${id} not found`);
    }

    return exists;
  }

  async record(input: RecordWatchHistoryInput): Promise<WatchHistory> {
    this.assertValidRecordInput(input);

    if (input.movieId) {
      await this.movieExists(input.movieId);
    }

    if (input.episodeId) {
      await this.episodeExists(input.episodeId);
    }

    const data = {
      progress: input.progress,
      duration: input.duration ?? null,
      completed: input.completed ?? false
    };

    try {
      if (input.movieId) {
        return this.prisma.watchHistory.upsert({
          where: {
            userId_movieId: {
              userId: input.userId,
              movieId: input.movieId
            }
          },
          create: {
            userId: input.userId,
            movieId: input.movieId,
            ...data
          },
          update: data,
          include: watchHistoryInclude
        });
      }

      return this.prisma.watchHistory.upsert({
        where: {
          userId_episodeId: {
            userId: input.userId,
            episodeId: input.episodeId!
          }
        },
        create: {
          userId: input.userId,
          episodeId: input.episodeId,
          ...data
        },
        update: data,
        include: watchHistoryInclude
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(): Promise<WatchHistory[]> {
    return this.prisma.watchHistory.findMany({
      orderBy: { updatedAt: "desc" },
      include: watchHistoryInclude
    });
  }

  async findByUserId(userId: string): Promise<WatchHistory[]> {
    return this.prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: watchHistoryInclude
    });
  }

  async findOne(id: string): Promise<WatchHistory> {
    const entry = await this.prisma.watchHistory.findUnique({
      where: { id },
      include: watchHistoryInclude
    });

    if (!entry) {
      throw new NotFoundException(`Watch history entry with id ${id} not found`);
    }

    return entry;
  }

  async update(
    id: string,
    updateWatchHistoryInput: UpdateWatchHistoryInput
  ): Promise<WatchHistory> {
    await this.findOne(id);

    const { progress, duration, completed } = updateWatchHistoryInput;

    try {
      return this.prisma.watchHistory.update({
        where: { id },
        data: {
          ...(progress !== undefined && { progress }),
          ...(duration !== undefined && { duration }),
          ...(completed !== undefined && { completed })
        },
        include: watchHistoryInclude
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<boolean> {
    await this.findOne(id);
    await this.prisma.watchHistory.delete({ where: { id } });
    return true;
  }
}
