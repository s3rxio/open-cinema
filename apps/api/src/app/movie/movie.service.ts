import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { CreateMovieInput } from "./dto/create-movie.input";
import { UpdateMovieInput } from "./dto/update-movie.input";
import { PaginatedMovies } from "./dto/paginated-movie.response";
import { PaginationArgs } from "@open-cinema/core";
import { PrismaService } from "../prisma/prisma.service";
import { Movie } from "./entities/movie.entity";
import { buildContentListSearchFilter } from "../common/list-search-filters";
import { ContentMediaUrlService } from "../content/content-media-url.service";

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(
    private prisma: PrismaService,
    private readonly contentMediaUrl: ContentMediaUrlService
  ) {}

  async create(createMovieInput: CreateMovieInput): Promise<Movie> {
    try {
      const movie = await this.prisma.movie.create({
        data: {
          title: createMovieInput.title,
          description: createMovieInput.description,
          releaseDate: createMovieInput.releaseDate,
          genres: createMovieInput.genres,
          director: createMovieInput.director,
          rating: createMovieInput.rating
        }
      });
      return this.contentMediaUrl.withPublicUrls(movie as Movie);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<PaginatedMovies> {
    const { first, cursor, search } = paginationArgs;
    const where = buildContentListSearchFilter(search);
    const movies = await this.prisma.movie.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: first,
      cursor: cursor ? { id: cursor } : undefined
    });

    const nextCursor = movies.length > 0 ? movies[movies.length - 1].id : null;

    return {
      data: movies.map(movie =>
        this.contentMediaUrl.withPublicUrls(movie as Movie)
      ),
      total: await this.prisma.movie.count({ where }),
      nextCursor: nextCursor,
      prevCursor: cursor
    };
  }

  async findOne(id: string): Promise<Movie> {
    const movie = await this.prisma.movie.findUnique({
      where: { id: id }
    });

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return this.contentMediaUrl.withPublicUrls(movie as Movie);
  }

  async findById(id: string): Promise<Movie | null> {
    const movie = await this.prisma.movie.findUnique({
      where: { id: id }
    });

    return movie
      ? this.contentMediaUrl.withPublicUrls(movie as Movie)
      : null;
  }

  async update(id: string, updateMovieInput: UpdateMovieInput): Promise<Movie> {
    await this.findOne(id);

    try {
      const movie = await this.prisma.movie.update({
        where: { id: id },
        data: {
          title: updateMovieInput.title,
          description: updateMovieInput.description,
          releaseDate: updateMovieInput.releaseDate,
          genres: updateMovieInput.genres,
          director: updateMovieInput.director,
          rating: updateMovieInput.rating
        }
      });
      return this.contentMediaUrl.withPublicUrls(movie as Movie);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<boolean> {
    const movie = await this.findOne(id);

    await this.prisma.$transaction(async tx => {
      if (movie.streamId) {
        await tx.stream.delete({ where: { id: movie.streamId } });
      }

      await tx.movie.delete({ where: { id } });
    });

    return true;
  }
}
