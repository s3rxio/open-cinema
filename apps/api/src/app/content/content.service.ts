import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ContentMediaUrlService } from "./content-media-url.service";
import { SearchContentInput } from "./dto/search-content.input";
import {
  ContentType,
  CreateContentData,
  UpdateContentData
} from "./content.types";
import {
  MovieModel,
  MovieWhereInput,
  SeriesModel,
  SeriesWhereInput
} from "../../../prisma/generated/models";
import { Content } from "./content.entity";
import { ContentSearchResult } from "./dto/content-search.result";
import { Genre } from "./genre.enum";
import { publishedOnlyWhere } from "../common/content-publish.filter";

type ContentWhereInput = MovieWhereInput & SeriesWhereInput;

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private readonly contentMediaUrl: ContentMediaUrlService
  ) {}

  async searchContent(input: SearchContentInput): Promise<ContentSearchResult> {
    try {
      return await this.searchContentPrimary(input);
    } catch (error) {
      console.error("Search error:", error);
      return this.fallbackSearch(input);
    }
  }

  private async searchContentPrimary(
    input: SearchContentInput
  ): Promise<ContentSearchResult> {
    const { contentType, skip = 0, take = 10 } = input;

    if (contentType === "MOVIE") {
      return this.searchMovies(input, skip, take);
    }

    if (contentType === "SERIES") {
      return this.searchSeries(input, skip, take);
    }

    return this.searchAllContent(input, skip, take);
  }

  private buildWhere(input: SearchContentInput): ContentWhereInput {
    const {
      query,
      minRating = 0,
      maxRating = 10,
      genre
    } = input;

    const where: ContentWhereInput = {
      rating: {
        gte: minRating,
        lte: maxRating
      }
    };

    if (genre) {
      where.genres = { has: genre };
    }

    if (query?.trim()) {
      where.OR = [
        { title: { search: query.trim() } },
        { description: { search: query.trim() } }
      ];
    }

    return where;
  }

  private buildOrderBy(
    input: SearchContentInput,
    includeRelevance: boolean
  ): Record<string, unknown> {
    const { query, sortBy = "title", sortOrder = "ASC" } = input;
    const order = sortOrder.toLowerCase();

    if (includeRelevance && query?.trim()) {
      return {
        _relevance: {
          fields: ["title", "description"],
          search: query.trim(),
          sort: order
        }
      };
    }

    const sortFields: Record<string, string> = {
      title: "title",
      releaseDate: "releaseDate",
      rating: "rating"
    };
    const field = sortFields[sortBy] ?? "title";
    return { [field]: order };
  }

  private compareContent(
    a: Content,
    b: Content,
    sortBy: string,
    sortOrder: "ASC" | "DESC"
  ): number {
    const direction = sortOrder === "DESC" ? -1 : 1;

    if (sortBy === "rating") {
      return (a.rating - b.rating) * direction;
    }

    if (sortBy === "releaseDate") {
      return (
        (a.releaseDate.getTime() - b.releaseDate.getTime()) * direction
      );
    }

    return a.title.localeCompare(b.title, "ru") * direction;
  }

  private async searchMovies(
    input: SearchContentInput,
    skip: number,
    take: number
  ): Promise<ContentSearchResult> {
    const where = { ...this.buildWhere(input), ...publishedOnlyWhere() };
    const orderBy = this.buildOrderBy(input, Boolean(input.query?.trim()));

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({ where, orderBy, skip, take }),
      this.prisma.movie.count({ where })
    ]);

    return {
      items: movies.map(movie => this.mapMovieToSearchResult(movie)),
      total,
      hasMore: skip + take < total
    };
  }

  private async searchSeries(
    input: SearchContentInput,
    skip: number,
    take: number
  ): Promise<ContentSearchResult> {
    const where = { ...this.buildWhere(input), ...publishedOnlyWhere() };
    const orderBy = this.buildOrderBy(input, Boolean(input.query?.trim()));

    const [series, total] = await Promise.all([
      this.prisma.series.findMany({ where, orderBy, skip, take }),
      this.prisma.series.count({ where })
    ]);

    return {
      items: series.map(ser => this.mapSeriesToSearchResult(ser)),
      total,
      hasMore: skip + take < total
    };
  }

  private async searchAllContent(
    input: SearchContentInput,
    skip: number,
    take: number
  ): Promise<ContentSearchResult> {
    const where = this.buildWhere(input);
    const publishedWhere = { ...where, ...publishedOnlyWhere() };
    const orderBy = this.buildOrderBy(input, Boolean(input.query?.trim()));
    const sortBy = input.sortBy ?? "title";
    const sortOrder = input.sortOrder ?? "ASC";

    const [moviesCount, seriesCount] = await Promise.all([
      this.prisma.movie.count({ where: publishedWhere }),
      this.prisma.series.count({ where: publishedWhere })
    ]);
    const total = moviesCount + seriesCount;

    const fetchLimit = skip + take;
    const [movies, series] = await Promise.all([
      this.prisma.movie.findMany({
        where: publishedWhere,
        orderBy,
        take: fetchLimit
      }),
      this.prisma.series.findMany({
        where: publishedWhere,
        orderBy,
        take: fetchLimit
      })
    ]);

    const items = [
      ...movies.map(movie => this.mapMovieToSearchResult(movie)),
      ...series.map(ser => this.mapSeriesToSearchResult(ser))
    ]
      .sort((a, b) => this.compareContent(a, b, sortBy, sortOrder))
      .slice(skip, skip + take);

    return {
      items,
      total,
      hasMore: skip + take < total
    };
  }

  private async fallbackSearch(
    input: SearchContentInput
  ): Promise<ContentSearchResult> {
    const {
      query,
      skip = 0,
      take = 10,
      minRating = 0,
      maxRating = 10,
      genre,
      contentType,
      sortBy = "title",
      sortOrder = "ASC"
    } = input;

    const where: ContentWhereInput = {
      rating: {
        gte: minRating,
        lte: maxRating
      }
    };

    if (genre) {
      where.genres = { has: genre };
    }

    if (query?.trim()) {
      where.OR = [
        {
          title: { contains: query.trim(), mode: "insensitive" }
        },
        {
          description: { contains: query.trim(), mode: "insensitive" }
        }
      ];
    }

    const prismaOrderBy = {
      [sortBy === "releaseDate"
        ? "releaseDate"
        : sortBy === "rating"
          ? "rating"
          : "title"]: sortOrder.toLowerCase() as "asc" | "desc"
    };

    const fetchMovies = !contentType || contentType === "MOVIE";
    const fetchSeries = !contentType || contentType === "SERIES";

    const publishedWhere = { ...where, ...publishedOnlyWhere() };

    const [movies, moviesCount, series, seriesCount] = await Promise.all([
      fetchMovies
        ? this.prisma.movie.findMany({
            where: publishedWhere,
            orderBy: prismaOrderBy,
            take: contentType === "MOVIE" ? take : skip + take,
            skip: contentType === "MOVIE" ? skip : 0
          })
        : Promise.resolve([] as MovieModel[]),
      fetchMovies
        ? this.prisma.movie.count({ where: publishedWhere })
        : Promise.resolve(0),
      fetchSeries
        ? this.prisma.series.findMany({
            where: publishedWhere,
            orderBy: prismaOrderBy,
            take: contentType === "SERIES" ? take : skip + take,
            skip: contentType === "SERIES" ? skip : 0
          })
        : Promise.resolve([] as SeriesModel[]),
      fetchSeries
        ? this.prisma.series.count({ where: publishedWhere })
        : Promise.resolve(0)
    ]);

    if (contentType === "MOVIE") {
      return {
        items: movies.map(movie => this.mapMovieToSearchResult(movie)),
        total: moviesCount,
        hasMore: skip + take < moviesCount
      };
    }

    if (contentType === "SERIES") {
      return {
        items: series.map(ser => this.mapSeriesToSearchResult(ser)),
        total: seriesCount,
        hasMore: skip + take < seriesCount
      };
    }

    const items = [
      ...movies.map(movie => this.mapMovieToSearchResult(movie)),
      ...series.map(ser => this.mapSeriesToSearchResult(ser))
    ]
      .sort((a, b) => this.compareContent(a, b, sortBy, sortOrder))
      .slice(skip, skip + take);

    const total = moviesCount + seriesCount;

    return {
      items,
      total,
      hasMore: skip + take < total
    };
  }

  async getContentById(id: string): Promise<Content | null> {
    const movie = await this.prisma.movie.findUnique({
      where: { id }
    });

    if (movie) {
      if (!movie.isPublished) {
        return null;
      }

      return this.mapMovieToSearchResult(movie);
    }

    const series = await this.prisma.series.findUnique({
      where: { id }
    });

    if (series) {
      if (!series.isPublished) {
        return null;
      }

      return this.mapSeriesToSearchResult(series);
    }

    return null;
  }

  async createContent(
    type: ContentType,
    data: CreateContentData
  ): Promise<Record<string, unknown>> {
    if (type === ContentType.MOVIE) {
      return this.prisma.movie.create({
        data: data as Parameters<typeof this.prisma.movie.create>[0]["data"]
      });
    }
    return this.prisma.series.create({
      data: data as Parameters<typeof this.prisma.series.create>[0]["data"]
    });
  }

  async updateContent(
    type: ContentType,
    id: string,
    data: UpdateContentData
  ): Promise<Record<string, unknown>> {
    if (type === ContentType.MOVIE) {
      return this.prisma.movie.update({
        where: { id },
        data: data as Parameters<typeof this.prisma.movie.update>[0]["data"]
      });
    }
    return this.prisma.series.update({
      where: { id },
      data: data as Parameters<typeof this.prisma.series.update>[0]["data"]
    });
  }

  async deleteContent(
    type: ContentType,
    id: string
  ): Promise<Record<string, unknown>> {
    if (type === ContentType.MOVIE) {
      return this.prisma.movie.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    }
    return this.prisma.series.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  private mapMovieToSearchResult(movie: MovieModel): Content {
    return this.contentMediaUrl.withPublicUrls({
      ...movie,
      genres: movie.genres as Genre[],
      rating: Number(movie.rating),
      type: ContentType.MOVIE
    });
  }

  private mapSeriesToSearchResult(series: SeriesModel): Content {
    return this.contentMediaUrl.withPublicUrls({
      ...series,
      genres: series.genres as Genre[],
      releaseDate: new Date(),
      type: ContentType.SERIES
    });
  }
}
