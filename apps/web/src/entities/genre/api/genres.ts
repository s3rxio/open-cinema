import { gql } from "@apollo/client";
import type {
  GetContentByGenreQuery,
  GetContentByGenreQueryVariables,
  TypedDocumentNode
} from "@/shared/api/operation-types";

export const GET_CONTENT_BY_GENRE_QUERY = gql`
  query GetContentByGenre($genre: Genre!, $skip: Int!, $take: Int!) {
    getContentByGenre(genre: $genre, skip: $skip, take: $take) {
      total
      hasMore
      items {
        id
        title
        description
        releaseDate
        rating
        type
        genres
        posterUrl
        bannerUrl
      }
    }
  }
` as TypedDocumentNode<GetContentByGenreQuery, GetContentByGenreQueryVariables>;
