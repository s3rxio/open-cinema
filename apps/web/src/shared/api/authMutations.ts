import { gql } from "@apollo/client";
import type {
  RefreshTokenMutation,
  RefreshTokenMutationVariables,
  TypedDocumentNode
} from "./operation-types";

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshTokenInput: RefreshTokenInput!) {
    refreshToken(refreshTokenInput: $refreshTokenInput) {
      accessToken
      refreshToken
    }
  }
` as TypedDocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
