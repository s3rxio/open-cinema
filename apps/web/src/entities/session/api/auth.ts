import { gql } from "@apollo/client";
import type {
  LoginMutation,
  LoginMutationVariables,
  RegisterMutation,
  RegisterMutationVariables,
  TypedDocumentNode
} from "@/shared/api/operation-types";
import { REFRESH_TOKEN_MUTATION } from "@/shared/api/authMutations";

export { REFRESH_TOKEN_MUTATION };

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      refreshToken
    }
  }
` as TypedDocumentNode<LoginMutation, LoginMutationVariables>;

export const REGISTER_MUTATION = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      accessToken
      refreshToken
    }
  }
` as TypedDocumentNode<RegisterMutation, RegisterMutationVariables>;

