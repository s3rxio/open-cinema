import type { Genre } from "@/shared/lib/genres";
import { GENRE_VALUES } from "@/shared/lib/genres";

export type CatalogContentType = "" | "MOVIE" | "SERIES";
export type CatalogSortBy = "title" | "releaseDate" | "rating";
export type CatalogSortOrder = "ASC" | "DESC";

export type CatalogFilters = {
  q: string;
  genre: Genre | "";
  contentType: CatalogContentType;
  minRating: number;
  maxRating: number;
  sortBy: CatalogSortBy;
  sortOrder: CatalogSortOrder;
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  q: "",
  genre: "",
  contentType: "",
  minRating: 0,
  maxRating: 10,
  sortBy: "title",
  sortOrder: "ASC"
};

const SORT_BY_VALUES: CatalogSortBy[] = ["title", "releaseDate", "rating"];
const SORT_ORDER_VALUES: CatalogSortOrder[] = ["ASC", "DESC"];
const CONTENT_TYPE_VALUES: CatalogContentType[] = ["", "MOVIE", "SERIES"];

function parseNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseCatalogFilters(
  params: URLSearchParams
): CatalogFilters {
  const genreParam = params.get("genre") ?? "";
  const genre = GENRE_VALUES.includes(genreParam as Genre)
    ? (genreParam as Genre)
    : "";

  const contentTypeParam = params.get("type") ?? "";
  const contentType = CONTENT_TYPE_VALUES.includes(
    contentTypeParam as CatalogContentType
  )
    ? (contentTypeParam as CatalogContentType)
    : "";

  const sortByParam = params.get("sortBy") ?? DEFAULT_CATALOG_FILTERS.sortBy;
  const sortBy = SORT_BY_VALUES.includes(sortByParam as CatalogSortBy)
    ? (sortByParam as CatalogSortBy)
    : DEFAULT_CATALOG_FILTERS.sortBy;

  const sortOrderParam =
    params.get("sortOrder") ?? DEFAULT_CATALOG_FILTERS.sortOrder;
  const sortOrder = SORT_ORDER_VALUES.includes(
    sortOrderParam as CatalogSortOrder
  )
    ? (sortOrderParam as CatalogSortOrder)
    : DEFAULT_CATALOG_FILTERS.sortOrder;

  return {
    q: params.get("q") ?? "",
    genre,
    contentType,
    minRating: parseNumber(
      params.get("minRating"),
      DEFAULT_CATALOG_FILTERS.minRating
    ),
    maxRating: parseNumber(
      params.get("maxRating"),
      DEFAULT_CATALOG_FILTERS.maxRating
    ),
    sortBy,
    sortOrder
  };
}

export function catalogFiltersToQueryString(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  if (filters.q.trim()) {
    params.set("q", filters.q.trim());
  }
  if (filters.genre) {
    params.set("genre", filters.genre);
  }
  if (filters.contentType) {
    params.set("type", filters.contentType);
  }
  if (filters.minRating !== DEFAULT_CATALOG_FILTERS.minRating) {
    params.set("minRating", String(filters.minRating));
  }
  if (filters.maxRating !== DEFAULT_CATALOG_FILTERS.maxRating) {
    params.set("maxRating", String(filters.maxRating));
  }
  if (filters.sortBy !== DEFAULT_CATALOG_FILTERS.sortBy) {
    params.set("sortBy", filters.sortBy);
  }
  if (filters.sortOrder !== DEFAULT_CATALOG_FILTERS.sortOrder) {
    params.set("sortOrder", filters.sortOrder);
  }

  return params.toString();
}

export function catalogFiltersToSearchInput(
  filters: CatalogFilters,
  skip: number,
  take: number
) {
  return {
    query: filters.q.trim() || undefined,
    skip,
    take,
    genre: filters.genre || undefined,
    contentType: filters.contentType || undefined,
    minRating: filters.minRating,
    maxRating: filters.maxRating,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  };
}

export function hasActiveCatalogFilters(filters: CatalogFilters): boolean {
  return (
    Boolean(filters.q.trim()) ||
    Boolean(filters.genre) ||
    Boolean(filters.contentType) ||
    filters.minRating !== DEFAULT_CATALOG_FILTERS.minRating ||
    filters.maxRating !== DEFAULT_CATALOG_FILTERS.maxRating ||
    filters.sortBy !== DEFAULT_CATALOG_FILTERS.sortBy ||
    filters.sortOrder !== DEFAULT_CATALOG_FILTERS.sortOrder
  );
}
