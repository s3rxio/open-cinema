import { gql } from "@apollo/client";
import type {
  MovieByIdQuery,
  MovieByIdQueryVariables,
  SeriesByIdQuery,
  SeriesByIdQueryVariables,
  TypedDocumentNode
} from "@/shared/api/operation-types";

export const MOVIE_BY_ID_QUERY = gql`
  query MovieById($id: String!) {
    movie(id: $id) {
      id
      title
      description
      director
      releaseDate
      rating
      genres
      userRating
      reviewCount
      posterUrl
      bannerUrl
      streamId
      isPublished
    }
  }
` as TypedDocumentNode<MovieByIdQuery, MovieByIdQueryVariables>;

export function seriesByIdQueryVariables(
  id: string,
  options?: { includeUnpublished?: boolean }
) {
  return {
    id,
    includeUnpublished: options?.includeUnpublished ? true : undefined
  };
}

export const SERIES_BY_ID_QUERY = gql`
  query SeriesById($id: String!, $includeUnpublished: Boolean) {
    series(id: $id, includeUnpublished: $includeUnpublished) {
      id
      title
      description
      director
      releaseDate
      rating
      genres
      userRating
      reviewCount
      posterUrl
      bannerUrl
      isPublished
      episodes {
        id
        title
        season
        episode
        description
        rating
        releaseDate
        streamId
        isPublished
      }
    }
  }
` as TypedDocumentNode<SeriesByIdQuery, SeriesByIdQueryVariables>;
