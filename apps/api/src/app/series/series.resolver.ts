import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { SeriesService } from "./series.service";
import { Series } from "./entities/series.entity";
import { CreateSeriesInput } from "./dto/create-series.input";
import { UpdateSeriesInput } from "./dto/update-series.input";
import { PaginatedSeries } from "./dto/paginated-series.response";
import { PaginationArgs } from "@open-cinema/core";

@Resolver(() => Series)
export class SeriesResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @Mutation(() => Series)
  createSeries(
    @Args("createSeriesInput") createSeriesInput: CreateSeriesInput
  ) {
    return this.seriesService.create(createSeriesInput);
  }

  @Query(() => PaginatedSeries, { name: "seriesList" })
  findAll(@Args() paginationArgs: PaginationArgs) {
    return this.seriesService.findAll(paginationArgs);
  }

  @Query(() => Series, { name: "series" })
  findOne(@Args("id") id: string) {
    return this.seriesService.findOne(id);
  }

  @Mutation(() => Series)
  updateSeries(
    @Args("updateSeriesInput") updateSeriesInput: UpdateSeriesInput
  ) {
    return this.seriesService.update(updateSeriesInput.id, updateSeriesInput);
  }

  @Mutation(() => Boolean)
  removeSeries(@Args("id") id: string) {
    return this.seriesService.remove(id);
  }
}
