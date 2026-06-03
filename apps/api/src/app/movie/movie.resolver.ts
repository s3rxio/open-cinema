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
import { BypassAuth } from "../auth/bypass-auth.decorator";
import { Permission, RequiredPermission, RbacService } from "../rbac";
import { ReviewService } from "../review/review.service";
import { UserMe } from "../user/user-me.decorator";
import { User } from "../user/entities/user.entity";

@Resolver(() => Movie)
export class MovieResolver {
  constructor(
    private readonly movieService: MovieService,
    private readonly reviewService: ReviewService,
    private readonly rbacService: RbacService
  ) {}

  @BypassAuth()
  @ResolveField(() => Number, { nullable: true })
  async userRating(@Parent() movie: Movie) {
    const stats = await this.reviewService.getStatsForMovie(movie.id);
    return stats.userRating;
  }

  @BypassAuth()
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

  @BypassAuth()
  @Query(() => PaginatedMovies, { name: "movies" })
  async findAll(
    @Args("first", { type: () => Int, defaultValue: 10 }) first: number,
    @Args("cursor", { nullable: true, type: () => String }) cursor?: string,
    @Args("search", { nullable: true, type: () => String }) search?: string,
    @Args("includeUnpublished", {
      nullable: true,
      type: () => Boolean,
      defaultValue: false
    })
    includeUnpublished?: boolean,
    @UserMe() user?: User | null
  ) {
    const canIncludeUnpublished = await this.canIncludeUnpublished(
      user?.id,
      includeUnpublished ?? false
    );

    return this.movieService.findAll(
      { first, cursor, search },
      { includeUnpublished: canIncludeUnpublished }
    );
  }

  @BypassAuth()
  @Query(() => Movie, { name: "movie" })
  async findOne(@Args("id") id: string, @UserMe() user?: User | null) {
    const includeUnpublished = await this.canViewUnpublished(user?.id);

    return this.movieService.findOne(id, { includeUnpublished });
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

  private async canViewUnpublished(userId?: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const permissions = await this.rbacService.getPermissionsForUser(userId);

    return this.rbacService.hasEveryPermission(permissions, [
      Permission.MovieRead
    ]);
  }

  private async canIncludeUnpublished(
    userId: string | undefined,
    requested: boolean
  ): Promise<boolean> {
    if (!requested) {
      return false;
    }

    return this.canViewUnpublished(userId);
  }
}
