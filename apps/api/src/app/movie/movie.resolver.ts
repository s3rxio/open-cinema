import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent
} from "@nestjs/graphql";
import { MovieService } from "./movie.service";
import { Movie } from "./entities/movie.entity";
import { CreateMovieInput } from "./dto/create-movie.input";
import { UpdateMovieInput } from "./dto/update-movie.input";
import { PaginatedMovies } from "./dto/paginated-movie.response";
import { Permission, RequiredPermission } from "../rbac";
import { ReviewService } from "../review/review.service";

@Resolver(() => Movie)
export class MovieResolver {
  constructor(
    private readonly movieService: MovieService,
    private readonly reviewService: ReviewService
  ) {}

  @RequiredPermission(Permission.ReviewsRead)
  @ResolveField(() => Number, { nullable: true })
  async userRating(@Parent() movie: Movie) {
    const stats = await this.reviewService.getStatsForMovie(movie.id);
    return stats.userRating;
  }

  @RequiredPermission(Permission.ReviewsRead)
  @ResolveField(() => Int, { nullable: true })
  async reviewCount(@Parent() movie: Movie) {
    const stats = await this.reviewService.getStatsForMovie(movie.id);
    return stats.reviewCount;
  }

  @RequiredPermission(Permission.MovieCreate)
  @Mutation(() => Movie)
  createMovie(@Args("createMovieInput") createMovieInput: CreateMovieInput) {
    return this.movieService.create(createMovieInput);
  }

  @RequiredPermission(Permission.MovieRead)
  @Query(() => PaginatedMovies, { name: "movies" })
  findAll(
    @Args("first", { type: () => Int, defaultValue: 10 }) first: number,
    @Args("cursor", { nullable: true, type: () => String }) cursor?: string,
    @Args("search", { nullable: true, type: () => String }) search?: string
  ) {
    return this.movieService.findAll({ first, cursor, search });
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
