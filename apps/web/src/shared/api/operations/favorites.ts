import { gql } from "@apollo/client";
import type {
  CreateFavoriteMutation,
  CreateFavoriteMutationVariables,
  MeQuery,
  RemoveFavoriteMutation,
  RemoveFavoriteMutationVariables,
  TypedDocumentNode
} from "../operation-types";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      username
      birthdate
      roles {
        slug
      }
      favorites {
        id
        movie {
          id
          title
          description
          rating
          posterUrl
          releaseDate
        }
        series {
          id
          title
          description
          rating
          posterUrl
          releaseDate
        }
      }
      watchHistory {
        id
        progress
        duration
        completed
        updatedAt
        movie {
          id
          title
          description
          rating
          posterUrl
          releaseDate
        }
        episode {
          id
          title
          description
          season
          episode
          seriesId
          posterUrl
        }
      }
    }
  }
` as TypedDocumentNode<MeQuery>;

export const CREATE_FAVORITE_MUTATION = gql`
  mutation CreateFavorite($createFavoriteInput: CreateFavoriteInput!) {
    createFavorite(createFavoriteInput: $createFavoriteInput) {
      id
      movie {
        id
        title
      }
      series {
        id
        title
      }
    }
  }
` as TypedDocumentNode<CreateFavoriteMutation, CreateFavoriteMutationVariables>;

export const REMOVE_FAVORITE_MUTATION = gql`
  mutation RemoveFavorite($id: String!) {
    removeFavorite(id: $id)
  }
` as TypedDocumentNode<RemoveFavoriteMutation, RemoveFavoriteMutationVariables>;
