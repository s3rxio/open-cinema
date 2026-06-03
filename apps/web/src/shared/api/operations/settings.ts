import { gql } from "@apollo/client";
import type {
  ChangePasswordMutation,
  ChangePasswordMutationVariables,
  SettingsMeQuery,
  TypedDocumentNode,
  UpdateProfileMutation,
  UpdateProfileMutationVariables
} from "../operation-types";

export const SETTINGS_ME_QUERY = gql`
  query SettingsMe {
    me {
      id
      email
      username
      birthdate
    }
  }
` as TypedDocumentNode<SettingsMeQuery>;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($updateProfileInput: UpdateProfileInput!) {
    updateProfile(updateProfileInput: $updateProfileInput) {
      id
      email
      username
      birthdate
    }
  }
` as TypedDocumentNode<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
>;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($changePasswordInput: ChangePasswordInput!) {
    changePassword(changePasswordInput: $changePasswordInput)
  }
` as TypedDocumentNode<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
>;
