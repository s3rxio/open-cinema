import { gql } from "@apollo/client";
import type {
  RecordWatchHistoryMutation,
  RecordWatchHistoryMutationVariables,
  TypedDocumentNode
} from "../operation-types";

export const RECORD_WATCH_HISTORY_MUTATION = gql`
  mutation RecordWatchHistory($recordWatchHistoryInput: RecordWatchHistoryInput!) {
    recordWatchHistory(recordWatchHistoryInput: $recordWatchHistoryInput) {
      id
      progress
      duration
      completed
      updatedAt
      movie {
        id
        title
        posterUrl
      }
      episode {
        id
        title
        season
        episode
        seriesId
      }
    }
  }
` as TypedDocumentNode<
  RecordWatchHistoryMutation,
  RecordWatchHistoryMutationVariables
>;
