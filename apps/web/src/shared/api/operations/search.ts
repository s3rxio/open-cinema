import { gql } from "@apollo/client";
import type {
  SearchContentQuery,
  SearchContentQueryVariables,
  TypedDocumentNode
} from "../operation-types";

export const SEARCH_CONTENT_QUERY = gql`
  query SearchContent($input: SearchContentInput!) {
    searchContent(input: $input) {
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
` as TypedDocumentNode<SearchContentQuery, SearchContentQueryVariables>;
