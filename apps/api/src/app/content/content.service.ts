import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SearchContentInput } from "./dto/search-content.input";
import {
  ContentType,
  SearchResult,
  SearchResultItem,
  CreateContentData,
  UpdateContentData
} from "./content.types";
import {
  MovieModel,
  MovieWhereInput,
  SeriesModel,
  SeriesWhereInput
} from "../../../prisma/generated/models";

type ContentWhereInput = MovieWhereInput & SeriesWhereInput;

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async searchContent(input: SearchContentInput): Promise<SearchResult> {
    const {
      query,
      skip = 0,
      take = 10,
      minRating = 0,
      maxRating = 10,
      sortBy = "title",
      sortOrder = "ASC",
      genre
    } = input;

    const ratingFilter: ContentWhereInput["rating"] = {
      gte: minRating,
      lte: maxRating
    };

    const genreFilter: ContentWhereInput = genre
      ? {
          genre: {
            contains: genre,
            mode: "insensitive" as const
          }
        }
      : {};

    const searchCondition: ContentWhereInput = query
      ? {
          OR: [
            {
              title: {
                search: query
              }
            },
            {
              description: {
                search: query
              }
            }
          ]
        }
      : {};

    const buildOrderBy = (
      includeRelevance: boolean
    ): Record<string, unknown> => {
      if (includeRelevance && query) {
        return {
          _relevance: {
            fields: ["title", "description"],
            search: query,
            sort: sortOrder.toLocaleLowerCase()
          }
        };
      }

      const sortFields: Record<string, string> = {
        title: "title",
        releaseDate: "releaseDate",
        rating: "rating"
      };
      const field = sortFields[sortBy] || "title";
      return { [field]: sortOrder.toLocaleLowerCase() };
    };

    try {
      const [movies, moviesCount] = await Promise.all([
        this.prisma.movie.findMany({
          where: {
            rating: ratingFilter,
            ...genreFilter,
            ...searchCondition
          },
          orderBy: buildOrderBy(true),
          skip,
          take
        }),
        this.prisma.movie.count({
          where: {
            rating: ratingFilter,
            ...genreFilter,
            ...searchCondition
          }
        })
      ]);

      const [series, seriesCount] = await Promise.all([
        this.prisma.series.findMany({
          where: {
            rating: ratingFilter,
            ...genreFilter,
            ...searchCondition
          },
          orderBy: buildOrderBy(true),
          skip,
          take
        }),
        this.prisma.series.count({
          where: {
            rating: ratingFilter,
            ...genreFilter,
            ...searchCondition
          }
        })
      ]);

      const items: SearchResultItem[] = [
        ...movies.map(movie => this.mapMovieToSearchResult(movie)),
        ...series.map(ser => this.mapSeriesToSearchResult(ser))
      ];

      const total = moviesCount + seriesCount;

      return {
        items,
        total,
        hasMore: skip + take < total
      };
    } catch (error) {
      console.error("Search error:", error);

      return this.fallbackSearch(input);
    }
  }

  private async fallbackSearch(
    input: SearchContentInput
  ): Promise<SearchResult> {
    const { query, skip = 0, take = 10, minRating = 0, maxRating = 10 } = input;

    const where: ContentWhereInput = {
      rating: {
        gte: minRating,
        lte: maxRating
      }
    };

    if (query && query.trim().length > 0) {
      Object.assign(where, {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            description: {
              contains: query,
              mode: "insensitive"
            }
          }
        ]
      });
    }

    const [movies, series, moviesCount, seriesCount] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take,
        orderBy: {
          title: "asc"
        }
      }),
      this.prisma.series.findMany({
        where,
        skip,
        take,
        orderBy: {
          title: "asc"
        }
      }),
      this.prisma.movie.count({ where }),
      this.prisma.series.count({ where })
    ]);

    const items: SearchResultItem[] = [
      ...movies.map(movie => this.mapMovieToSearchResult(movie)),
      ...series.map(ser => this.mapSeriesToSearchResult(ser))
    ];

    const total = moviesCount + seriesCount;

    return {
      items,
      total,
      hasMore: skip + take < total
    };
  }

  async getContentById(id: string): Promise<SearchResultItem | null> {
    const movie = await this.prisma.movie.findUnique({
      where: { id }
    });

    if (movie) {
      return this.mapMovieToSearchResult(movie);
    }

    const series = await this.prisma.series.findUnique({
      where: { id }
    });

    if (series) {
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

  /* Mappers */
  private mapMovieToSearchResult(movie: MovieModel): SearchResultItem {
    return {
      id: String(movie.id),
      title: String(movie.title),
      description: String(movie.description),
      releaseDate: movie.releaseDate,
      rating: Number(movie.rating),
      type: ContentType.MOVIE,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      deletedAt: movie.deletedAt
    };
  }

  private mapSeriesToSearchResult(series: SeriesModel): SearchResultItem {
    return {
      id: String(series.id),
      title: String(series.title),
      description: String(series.description),
      releaseDate: series.releaseDate,
      rating: Number(series.rating),
      type: ContentType.SERIES,
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
      deletedAt: series.deletedAt
    };
  }
}
