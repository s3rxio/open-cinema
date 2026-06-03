import { Parent, ResolveField, Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { EpisodeService } from "./episode.service";
import { Episode } from "./entities/episode.entity";
import { PrismaService } from "../prisma/prisma.service";
import { S3StorageService } from "../storage/s3-storage.service";
import { CreateEpisodeInput } from "./dto/create-episode.input";
import { CreateEpisodesBulkInput } from "./dto/create-episodes-bulk.input";
import { UpdateEpisodeInput } from "./dto/update-episode.input";
import { PaginatedEpisodes } from "./dto/paginated-episode.response";
import { PaginationArgs } from "@open-cinema/core";
import { BypassAuth } from "../auth/bypass-auth.decorator";
import { Permission, RequiredPermission } from "../rbac";

@Resolver(() => Episode)
export class EpisodeResolver {
  constructor(
    private readonly episodeService: EpisodeService,
    private readonly prisma: PrismaService,
    private readonly s3Storage: S3StorageService
  ) {}

  @BypassAuth()
  @ResolveField(() => String, { nullable: true })
  async posterUrl(@Parent() episode: Episode): Promise<string | null> {
    const series = await this.prisma.series.findUnique({
      where: { id: episode.seriesId },
      select: { posterUrl: true }
    });

    return this.s3Storage.resolvePublicMediaUrl(series?.posterUrl);
  }

  @RequiredPermission(Permission.EpisodeCreate)
  @Mutation(() => Episode)
  createEpisode(
    @Args("createEpisodeInput") createEpisodeInput: CreateEpisodeInput
  ) {
    return this.episodeService.create(createEpisodeInput);
  }

  @RequiredPermission(Permission.EpisodeCreate)
  @Mutation(() => [Episode])
  createEpisodesBulk(
    @Args("createEpisodesBulkInput") createEpisodesBulkInput: CreateEpisodesBulkInput
  ) {
    return this.episodeService.createBulk(createEpisodesBulkInput);
  }

  @BypassAuth()
  @Query(() => PaginatedEpisodes, { name: "episodes" })
  findAll(@Args() paginationArgs: PaginationArgs) {
    return this.episodeService.findAll(paginationArgs);
  }

  @BypassAuth()
  @Query(() => Episode, { name: "episode" })
  findOne(@Args("id") id: string) {
    return this.episodeService.findOne(id);
  }

  @BypassAuth()
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
