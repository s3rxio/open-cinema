import { gql } from "@apollo/client";
import type {
  GetRecentContentQuery,
  GetRecentContentQueryVariables,
  GetTrendingContentQuery,
  GetTrendingContentQueryVariables,
  TypedDocumentNode
} from "../operation-types";

export const GET_RECENT_CONTENT_QUERY = gql`
  query GetRecentContent($skip: Int!, $take: Int!) {
    getRecentContent(skip: $skip, take: $take) {
      total
      hasMore
      items {
        id
        title
        description
        releaseDate
        rating
        type
        posterUrl
      }
    }
  }
` as TypedDocumentNode<GetRecentContentQuery, GetRecentContentQueryVariables>;

export const GET_TRENDING_CONTENT_QUERY = gql`
  query GetTrendingContent($skip: Int!, $take: Int!) {
    getTrendingContent(skip: $skip, take: $take) {
      total
      hasMore
      items {
        id
        title
        description
        releaseDate
        rating
        type
        posterUrl
      }
    }
  }
` as TypedDocumentNode<
  GetTrendingContentQuery,
  GetTrendingContentQueryVariables
>;
