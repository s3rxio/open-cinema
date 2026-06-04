import {
  Parent,
  ResolveField,
  Resolver,
  Query,
  Mutation,
  Args,
  Int
} from "@nestjs/graphql";
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
import { Permission, RequiredPermission, RbacService } from "../rbac";
import { UserMe } from "../user/user-me.decorator";
import { User } from "../user/entities/user.entity";

@Resolver(() => Episode)
export class EpisodeResolver {
  constructor(
    private readonly episodeService: EpisodeService,
    private readonly prisma: PrismaService,
    private readonly s3Storage: S3StorageService,
    private readonly rbacService: RbacService
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
    @Args("createEpisodesBulkInput")
    createEpisodesBulkInput: CreateEpisodesBulkInput
  ) {
    return this.episodeService.createBulk(createEpisodesBulkInput);
  }

  @BypassAuth()
  @Query(() => PaginatedEpisodes, { name: "episodes" })
  async findAll(
    @Args() paginationArgs: PaginationArgs,
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

    return this.episodeService.findAll(paginationArgs, {
      includeUnpublished: canIncludeUnpublished
    });
  }

  @BypassAuth()
  @Query(() => Episode, { name: "episode" })
  async findOne(@Args("id") id: string, @UserMe() user?: User | null) {
    const includeUnpublished = await this.canViewUnpublished(user?.id);

    return this.episodeService.findOne(id, { includeUnpublished });
  }

  @BypassAuth()
  @Query(() => PaginatedEpisodes, { name: "episodesBySeries" })
  async findBySeriesId(
    @Args("seriesId") seriesId: string,
    @Args() paginationArgs: PaginationArgs,
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

    return this.episodeService.findBySeriesId(seriesId, paginationArgs, {
      includeUnpublished: canIncludeUnpublished
    });
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

  private async canViewUnpublished(userId?: string): Promise<boolean> {
    if (!userId) {
      return false;
    }

    const permissions = await this.rbacService.getPermissionsForUser(userId);

    return this.rbacService.hasEveryPermission(permissions, [
      Permission.EpisodeRead
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
