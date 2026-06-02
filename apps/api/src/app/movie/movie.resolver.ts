import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { MovieService } from "./movie.service";
import { Movie } from "./entities/movie.entity";
import { CreateMovieInput } from "./dto/create-movie.input";
import { UpdateMovieInput } from "./dto/update-movie.input";
import { PaginatedMovies } from "./dto/paginated-movie.response";
import { PaginationArgs } from "@open-cinema/core";
import { Permission, RequiredPermission } from "../rbac";

@Resolver(() => Movie)
export class MovieResolver {
  constructor(private readonly movieService: MovieService) {}

  @RequiredPermission(Permission.MovieCreate)
  @Mutation(() => Movie)
  createMovie(@Args("createMovieInput") createMovieInput: CreateMovieInput) {
    return this.movieService.create(createMovieInput);
  }

  @RequiredPermission(Permission.MovieRead)
  @Query(() => PaginatedMovies, { name: "movies" })
  findAll(@Args() paginationArgs: PaginationArgs) {
    return this.movieService.findAll(paginationArgs);
  }

  @RequiredPermission(Permission.MovieRead)
  @Query(() => Movie, { name: "movie" })
  findOne(@Args("id") id: string) {
    return this.movieService.findOne(id);
  }

  @RequiredPermission(Permission.MovieUpdate)
  @Mutation(() => Movie)
  updateMovie(@Args("updateMovieInput") updateMovieInput: UpdateMovieInput) {
    return this.movieService.update(updateMovieInput.id, updateMovieInput);
  }

  @RequiredPermission(Permission.MovieDelete)
  @Mutation(() => Boolean)
  removeMovie(@Args("id") id: string) {
    return this.movieService.remove(id);
  }
}
