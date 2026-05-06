import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { MovieService } from "./movie.service";
import { Movie } from "./entities/movie.entity";
import { CreateMovieInput } from "./dto/create-movie.input";
import { UpdateMovieInput } from "./dto/update-movie.input";
import { PaginatedMovies } from "./dto/paginated-movie.response";
import { PaginationArgs } from "@open-cinema/core";

@Resolver(() => Movie)
export class MovieResolver {
  constructor(private readonly movieService: MovieService) {}

  @Mutation(() => Movie)
  createMovie(@Args("createMovieInput") createMovieInput: CreateMovieInput) {
    return this.movieService.create(createMovieInput);
  }

  @Query(() => PaginatedMovies, { name: "movies" })
  findAll(@Args() paginationArgs: PaginationArgs) {
    return this.movieService.findAll(paginationArgs);
  }

  @Query(() => Movie, { name: "movie" })
  findOne(@Args("id") id: string) {
    return this.movieService.findOne(id);
  }

  @Mutation(() => Movie)
  updateMovie(@Args("updateMovieInput") updateMovieInput: UpdateMovieInput) {
    return this.movieService.update(updateMovieInput.id, updateMovieInput);
  }

  @Mutation(() => Boolean)
  removeMovie(@Args("id") id: string) {
    return this.movieService.remove(id);
  }
}
