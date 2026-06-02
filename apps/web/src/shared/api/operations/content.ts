import { gql } from "@apollo/client";
import type {
  MovieByIdQuery,
  MovieByIdQueryVariables,
  SeriesByIdQuery,
  SeriesByIdQueryVariables,
  TypedDocumentNode
} from "../operation-types";

export const MOVIE_BY_ID_QUERY = gql`
  query MovieById($id: String!) {
    movie(id: $id) {
      id
      title
      description
      director
      genre
      releaseDate
      rating
      posterUrl
      streamId
    }
  }
` as TypedDocumentNode<MovieByIdQuery, MovieByIdQueryVariables>;

export const SERIES_BY_ID_QUERY = gql`
  query SeriesById($id: String!) {
    series(id: $id) {
      id
      title
      description
      director
      genre
      releaseDate
      rating
      posterUrl
      episodes {
        id
        title
        season
        episode
        description
        rating
        streamId
      }
    }
  }
` as TypedDocumentNode<SeriesByIdQuery, SeriesByIdQueryVariables>;
