import type { Metadata } from "next";
import { graphqlRequest } from "@/shared/api/graphqlClient";
import { formatGenres, type Genre } from "@/shared/lib/genres";
import { routes } from "@/shared/lib/routes";
import { buildPageMetadata } from "./metadata";

type MovieSeo = {
  id: string;
  title: string;
  description: string;
  posterUrl?: string | null;
  releaseDate: string;
  rating: number;
  director: string;
  genres: Genre[];
};

type SeriesSeo = MovieSeo;

const MOVIE_SEO_QUERY = `
  query MovieSeo($id: String!) {
    movie(id: $id) {
      id
      title
      description
      posterUrl
      releaseDate
      rating
      director
      genres
    }
  }
`;

const SERIES_SEO_QUERY = `
  query SeriesSeo($id: String!) {
    series(id: $id) {
      id
      title
      description
      posterUrl
      releaseDate
      rating
      director
      genres
    }
  }
`;

const SITEMAP_CONTENT_QUERY = `
  query SitemapContent($input: SearchContentInput!) {
    searchContent(input: $input) {
      total
      hasMore
      items {
        id
        type
        releaseDate
      }
    }
  }
`;

type SitemapContentItem = {
  id: string;
  type: "MOVIE" | "SERIES";
  releaseDate: string;
};

export async function fetchMovieForSeo(id: string): Promise<MovieSeo | null> {
  try {
    const data = await graphqlRequest<{ movie: MovieSeo | null }>({
      query: MOVIE_SEO_QUERY,
      variables: { id }
    });
    return data.movie;
  } catch {
    return null;
  }
}

export async function fetchSeriesForSeo(id: string): Promise<SeriesSeo | null> {
  try {
    const data = await graphqlRequest<{ series: SeriesSeo | null }>({
      query: SERIES_SEO_QUERY,
      variables: { id }
    });
    return data.series;
  } catch {
    return null;
  }
}

export async function fetchPublishedContentForSitemap(): Promise<
  SitemapContentItem[]
> {
  const pageSize = 100;
  const items: SitemapContentItem[] = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const data = await graphqlRequest<{
      searchContent: {
        hasMore: boolean;
        items: SitemapContentItem[];
      };
    }>({
      query: SITEMAP_CONTENT_QUERY,
      variables: {
        input: {
          skip,
          take: pageSize,
          sortBy: "releaseDate",
          sortOrder: "DESC"
        }
      }
    });

    items.push(...data.searchContent.items);
    hasMore = data.searchContent.hasMore;
    skip += pageSize;

    if (skip > 10_000) {
      break;
    }
  }

  return items;
}

function buildContentDescription(
  content: MovieSeo | SeriesSeo,
  kind: "фильм" | "сериал"
): string {
  const genres = formatGenres(content.genres);
  return `${content.description} Режиссёр: ${content.director}. Жанры: ${genres}. Рейтинг: ${content.rating}. Смотреть ${kind} «${content.title}» онлайн в Open Cinema.`;
}

export async function generateMovieMetadata(id: string): Promise<Metadata> {
  const movie = await fetchMovieForSeo(id);

  if (!movie) {
    return buildPageMetadata({
      title: "Фильм не найден",
      description: "Запрошенный фильм не найден или недоступен.",
      path: routes.movie(id),
      noIndex: true
    });
  }

  return buildPageMetadata({
    title: movie.title,
    description: buildContentDescription(movie, "фильм"),
    path: routes.movie(id),
    imageUrl: movie.posterUrl
  });
}

export async function generateSeriesMetadata(id: string): Promise<Metadata> {
  const series = await fetchSeriesForSeo(id);

  if (!series) {
    return buildPageMetadata({
      title: "Сериал не найден",
      description: "Запрошенный сериал не найден или недоступен.",
      path: routes.series(id),
      noIndex: true
    });
  }

  return buildPageMetadata({
    title: series.title,
    description: buildContentDescription(series, "сериал"),
    path: routes.series(id),
    imageUrl: series.posterUrl
  });
}
