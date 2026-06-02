import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { EpisodeService } from "./episode.service";
import { Episode } from "./entities/episode.entity";
import { CreateEpisodeInput } from "./dto/create-episode.input";
import { UpdateEpisodeInput } from "./dto/update-episode.input";
import { PaginatedEpisodes } from "./dto/paginated-episode.response";
import { PaginationArgs } from "@open-cinema/core";
import { Permission, RequiredPermission } from "../rbac";

@Resolver(() => Episode)
export class EpisodeResolver {
  constructor(private readonly episodeService: EpisodeService) {}

  @RequiredPermission(Permission.EpisodeCreate)
  @Mutation(() => Episode)
  createEpisode(
    @Args("createEpisodeInput") createEpisodeInput: CreateEpisodeInput
  ) {
    return this.episodeService.create(createEpisodeInput);
  }

  @RequiredPermission(Permission.EpisodeRead)
  @Query(() => PaginatedEpisodes, { name: "episodes" })
  findAll(@Args() paginationArgs: PaginationArgs) {
    return this.episodeService.findAll(paginationArgs);
  }

  @RequiredPermission(Permission.EpisodeRead)
  @Query(() => Episode, { name: "episode" })
  findOne(@Args("id") id: string) {
    return this.episodeService.findOne(id);
  }

  @RequiredPermission(Permission.EpisodeRead)
  @Query(() => PaginatedEpisodes, { name: "episodesBySeries" })
  findBySeriesId(
    @Args("seriesId") seriesId: string,
    @Args() paginationArgs: PaginationArgs
  ) {
    return this.episodeService.findBySeriesId(seriesId, paginationArgs);
  }

  @RequiredPermission(Permission.EpisodeUpdate)
  @Mutation(() => Episode)
  updateEpisode(
    @Args("updateEpisodeInput") updateEpisodeInput: UpdateEpisodeInput
  ) {
    return this.episodeService.update(
      updateEpisodeInput.id,
      updateEpisodeInput
    );
  }

  @RequiredPermission(Permission.EpisodeDelete)
  @Mutation(() => Boolean)
  removeEpisode(@Args("id") id: string) {
    return this.episodeService.remove(id);
  }
}
