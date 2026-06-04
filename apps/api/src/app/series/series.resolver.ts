import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent
} from "@nestjs/graphql";
import { SeriesService } from "./series.service";
import { Series } from "./entities/series.entity";
import { CreateSeriesInput } from "./dto/create-series.input";
import { UpdateSeriesInput } from "./dto/update-series.input";
import { PaginatedSeries } from "./dto/paginated-series.response";
import { BypassAuth } from "../auth/bypass-auth.decorator";
import { Permission, RequiredPermission, RbacService } from "../rbac";
import { ReviewService } from "../review/review.service";
import { UserMe } from "../user/user-me.decorator";
import { User } from "../user/entities/user.entity";

@Resolver(() => Series)
export class SeriesResolver {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly reviewService: ReviewService,
    private readonly rbacService: RbacService
  ) {}

  @BypassAuth()
  @ResolveField(() => Number, { nullable: true })
  async userRating(@Parent() series: Series) {
    const stats = await this.reviewService.getStatsForSeries(series.id);
    return stats.userRating;
  }

  @BypassAuth()
  @ResolveField(() => Int, { nullable: true })
  async reviewCount(@Parent() series: Series) {
    const stats = await this.reviewService.getStatsForSeries(series.id);
    return stats.reviewCount;
  }

  @RequiredPermission(Permission.SeriesCreate)
  @Mutation(() => Series)
  createSeries(
    @Args("createSeriesInput") createSeriesInput: CreateSeriesInput
  ) {
    return this.seriesService.create(createSeriesInput);
  }

  @BypassAuth()
  @Query(() => PaginatedSeries, { name: "seriesList" })
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

    return this.seriesService.findAll(
      { first, cursor, search },
      { includeUnpublished: canIncludeUnpublished }
    );
  }

  @BypassAuth()
  @Query(() => Series, { name: "series" })
  async findOne(
    @Args("id") id: string,
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

    return this.seriesService.findOne(id, {
      includeUnpublished: canIncludeUnpublished
    });
  }

  @RequiredPermission(Permission.SeriesUpdate)
  @Mutation(() => Series)
  updateSeries(
    @Args("updateSeriesInput") updateSeriesInput: UpdateSeriesInput
  ) {
    return this.seriesService.update(updateSeriesInput.id, updateSeriesInput);
  }

  @RequiredPermission(Permission.SeriesDelete)
  @Mutation(() => Boolean)
  removeSeries(@Args("id") id: string) {
    return this.seriesService.remove(id);
  }

  private async canViewUnpublished(userId?: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const permissions = await this.rbacService.getPermissionsForUser(userId);

    return this.rbacService.hasEveryPermission(permissions, [
      Permission.SeriesRead
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
