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
import { Permission, RequiredPermission } from "../rbac";
import { ReviewService } from "../review/review.service";

@Resolver(() => Series)
export class SeriesResolver {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly reviewService: ReviewService
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
  findAll(
    @Args("first", { type: () => Int, defaultValue: 10 }) first: number,
    @Args("cursor", { nullable: true, type: () => String }) cursor?: string,
    @Args("search", { nullable: true, type: () => String }) search?: string
  ) {
    return this.seriesService.findAll({ first, cursor, search });
  }

  @BypassAuth()
  @Query(() => Series, { name: "series" })
  findOne(@Args("id") id: string) {
    return this.seriesService.findOne(id);
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
}
