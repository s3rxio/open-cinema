import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  Int
} from "@nestjs/graphql";
import { ContentService } from "./content.service";
import { ContentMediaService } from "./content-media.service";
import { SearchContentInput } from "./dto/search-content.input";
import { ContentSearchResult } from "./dto/content-search.result";
import { Content } from "./content.entity";
import { UpdateContentInput } from "./dto/update-content.input";
import { UploadContentPosterInput } from "./dto/upload-content-poster.input";
import { UploadContentBannerInput } from "./dto/upload-content-banner.input";
import { SearchResultItem, ContentType } from "./content.types";
import { Genre } from "./genre.enum";
import { BypassAuth } from "../auth/bypass-auth.decorator";
import { Permission, RequiredPermission } from "../rbac";

@Resolver(() => Content)
export class ContentResolver {
  constructor(
    private contentService: ContentService,
    private contentMediaService: ContentMediaService
  ) {}

  @BypassAuth()
  @Query(() => ContentSearchResult, {
    description: "Search content with full text search, filters, and sorting"
  })
  async searchContent(@Args("input") input: SearchContentInput) {
    const result = await this.contentService.searchContent(input);
    return result as unknown as ContentSearchResult;
  }

  @BypassAuth()
  @Query(() => Content, {
    nullable: true,
    description: "Get content by ID"
  })
  async getContent(@Args("id") id: string) {
    const result = await this.contentService.getContentById(id);
    return result;
  }

  @BypassAuth()
  @Query(() => ContentSearchResult, {
    description: "Get trending content by rating"
  })
  async getTrendingContent(
    @Args("take", { type: () => Int, defaultValue: 10 }) take: number,
    @Args("skip", { type: () => Int, defaultValue: 0 }) skip: number
  ) {
    const result = await this.contentService.searchContent({
      skip,
      take,
      sortBy: "rating",
      sortOrder: "DESC"
    });
    return result;
  }

  @BypassAuth()
  @Query(() => ContentSearchResult, {
    description: "Get recently released content"
  })
  async getRecentContent(
    @Args("take", { type: () => Int, defaultValue: 10 }) take: number,
    @Args("skip", { type: () => Int, defaultValue: 0 }) skip: number
  ) {
    const result = await this.contentService.searchContent({
      skip,
      take,
      sortBy: "releaseDate",
      sortOrder: "DESC"
    });
    return result;
  }

  @BypassAuth()
  @Query(() => ContentSearchResult, {
    description: "Get content filtered by genre"
  })
  async getContentByGenre(
    @Args("genre", { type: () => Genre }) genre: Genre,
    @Args("take", { type: () => Int, defaultValue: 12 }) take: number,
    @Args("skip", { type: () => Int, defaultValue: 0 }) skip: number
  ) {
    return this.contentService.searchContent({
      genre,
      skip,
      take,
      sortBy: "rating",
      sortOrder: "DESC"
    });
  }

  @RequiredPermission(Permission.ContentUpdate)
  @Mutation(() => Content, {
    nullable: true,
    description: "Update content"
  })
  async updateContent(@Args("input") input: UpdateContentInput) {
    const { id, ...data } = input;

    // Попробуем обновить фильм, затем серию
    let result = await this.contentService
      .updateContent(ContentType.MOVIE, id, {
        ...data,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined
      })
      .catch(() => null);

    if (!result) {
      result = await this.contentService.updateContent(ContentType.SERIES, id, {
        ...data,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined
      });
    }

    return result;
  }

  @RequiredPermission(Permission.ContentUpdate)
  @Mutation(() => Content, {
    description: "Upload poster image for movie or series"
  })
  async uploadContentPoster(
    @Args("input") input: UploadContentPosterInput
  ): Promise<Content> {
    return this.contentMediaService.uploadPoster(input.contentId, input.file);
  }

  @RequiredPermission(Permission.ContentUpdate)
  @Mutation(() => Content, {
    description: "Upload banner image for movie or series"
  })
  async uploadContentBanner(
    @Args("input") input: UploadContentBannerInput
  ): Promise<Content> {
    return this.contentMediaService.uploadBanner(input.contentId, input.file);
  }

  @RequiredPermission(Permission.ContentDelete)
  @Mutation(() => Boolean, {
    description: "Delete content"
  })
  async deleteContent(@Args("id") id: string) {
    try {
      await this.contentService
        .deleteContent(ContentType.MOVIE, id)
        .catch(() => null);
      await this.contentService
        .deleteContent(ContentType.SERIES, id)
        .catch(() => null);
      return true;
    } catch {
      return false;
    }
  }

  @BypassAuth()
  @ResolveField(() => String, { nullable: true })
  contentType(@Parent() content: SearchResultItem): ContentType {
    return content.type;
  }
}
