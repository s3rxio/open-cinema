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

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(private prisma: PrismaService) {}

  async create(createMovieInput: CreateMovieInput): Promise<Movie> {
    try {
      return this.prisma.movie.create({
        data: {
          title: createMovieInput.title,
          description: createMovieInput.description,
          releaseDate: createMovieInput.releaseDate,
          genre: createMovieInput.genre,
          director: createMovieInput.director,
          rating: createMovieInput.rating
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<PaginatedMovies> {
    const { first, cursor } = paginationArgs;
    const movies = await this.prisma.movie.findMany({
      orderBy: { createdAt: "asc" },
      take: first,
      cursor: cursor ? { id: cursor } : undefined
    });

    const nextCursor = movies.length > 0 ? movies[movies.length - 1].id : null;

    return {
      data: movies,
      total: await this.prisma.movie.count(),
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

    return movie;
  }

  async findById(id: string): Promise<Movie | null> {
    return this.prisma.movie.findUnique({
      where: { id: id }
    });
  }

  async update(id: string, updateMovieInput: UpdateMovieInput): Promise<Movie> {
    await this.findOne(id);

    try {
      return this.prisma.movie.update({
        where: { id: id },
        data: {
          title: updateMovieInput.title,
          description: updateMovieInput.description,
          releaseDate: updateMovieInput.releaseDate,
          genre: updateMovieInput.genre,
          director: updateMovieInput.director,
          rating: updateMovieInput.rating
        }
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<boolean> {
    await this.findOne(id);

    const deleted = await this.prisma.movie.delete({
      where: { id: id }
    });

    return deleted ? true : false;
  }
}
