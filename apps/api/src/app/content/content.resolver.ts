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
import { SearchContentInput } from "./dto/search-content.input";
import { ContentSearchResult } from "./dto/content-search.result";
import { Content } from "./content.entity";
import { CreateContentInput } from "./dto/create-content.input";
import { UpdateContentInput } from "./dto/update-content.input";
import { SearchResultItem, ContentType } from "./content.types";
import { BypassAuth } from "../auth/bypass-auth.decorator";

@Resolver(() => Content)
export class ContentResolver {
  constructor(private contentService: ContentService) {}

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

  @Mutation(() => Content, {
    description: "Create new movie content"
  })
  async createMovie(@Args("input") input: CreateContentInput) {
    return this.contentService.createContent(ContentType.MOVIE, {
      ...input,
      releaseDate: new Date(input.releaseDate)
    });
  }

  @Mutation(() => Content, {
    description: "Create new series content"
  })
  async createSeries(@Args("input") input: CreateContentInput) {
    return this.contentService.createContent(ContentType.SERIES, {
      ...input,
      releaseDate: new Date(input.releaseDate)
    });
  }

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
