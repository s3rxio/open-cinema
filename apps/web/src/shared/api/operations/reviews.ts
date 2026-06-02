import { gql } from "@apollo/client";
import type {
  CreateReviewMutation,
  CreateReviewMutationVariables,
  MovieReviewsQuery,
  MovieReviewsQueryVariables,
  RemoveReviewMutation,
  RemoveReviewMutationVariables,
  SeriesReviewsQuery,
  SeriesReviewsQueryVariables,
  TypedDocumentNode,
  UpdateReviewMutation,
  UpdateReviewMutationVariables
} from "../operation-types";

export const MOVIE_REVIEWS_QUERY = gql`
  query MovieReviews($movieId: String!) {
    movieReviews(movieId: $movieId) {
      id
      content
      rating
      userId
      createdAt
      user {
        id
        username
      }
    }
  }
` as TypedDocumentNode<MovieReviewsQuery, MovieReviewsQueryVariables>;

export const SERIES_REVIEWS_QUERY = gql`
  query SeriesReviews($seriesId: String!) {
    seriesReviews(seriesId: $seriesId) {
      id
      content
      rating
      userId
      createdAt
      user {
        id
        username
      }
    }
  }
` as TypedDocumentNode<SeriesReviewsQuery, SeriesReviewsQueryVariables>;

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($createReviewInput: CreateReviewInput!) {
    createReview(createReviewInput: $createReviewInput) {
      id
      content
      rating
      userId
      movieId
      seriesId
      createdAt
      user {
        id
        username
      }
    }
  }
` as TypedDocumentNode<CreateReviewMutation, CreateReviewMutationVariables>;

export const UPDATE_REVIEW_MUTATION = gql`
  mutation UpdateReview($updateReviewInput: UpdateReviewInput!) {
    updateReview(updateReviewInput: $updateReviewInput) {
      id
      content
      rating
      userId
      createdAt
      user {
        id
        username
      }
    }
  }
` as TypedDocumentNode<UpdateReviewMutation, UpdateReviewMutationVariables>;

export const REMOVE_REVIEW_MUTATION = gql`
  mutation RemoveReview($id: String!, $userId: String!) {
    removeReview(id: $id, userId: $userId)
  }
` as TypedDocumentNode<RemoveReviewMutation, RemoveReviewMutationVariables>;
