import { gql } from "@apollo/client";
import type {
  GetStreamForContentQuery,
  GetStreamForContentQueryVariables,
  GetStreamForEpisodeQuery,
  GetStreamForEpisodeQueryVariables,
  GetStreamForMovieQuery,
  GetStreamForMovieQueryVariables,
  GetStreamInfoQuery,
  GetStreamInfoQueryVariables,
  TypedDocumentNode
} from "../operation-types";

const STREAM_INFO_FIELDS = gql`
  fragment StreamInfoFields on Stream {
    id
    masterPlaylistUrl
    videoMetas {
      id
      displayName
      bitrate
      width
      height
      url
      slug
      streamId
      isProcessed
    }
    audioMetas {
      id
      displayName
      bitrate
      url
      slug
      streamId
      isDefault
      isProcessed
      orderNumer
    }
    subtitleMetas {
      id
      displayName
      url
      slug
      streamId
      orderNumer
    }
  }
`;

export const GET_STREAM_INFO_QUERY = gql`
  query GetStreamInfo($streamId: String!) {
    getStreamInfo(streamId: $streamId) {
      ...StreamInfoFields
    }
  }
  ${STREAM_INFO_FIELDS}
` as TypedDocumentNode<GetStreamInfoQuery, GetStreamInfoQueryVariables>;

export const GET_STREAM_FOR_CONTENT_QUERY = gql`
  query GetStreamForContent($contentId: String!) {
    getStreamForContent(contentId: $contentId) {
      ...StreamInfoFields
    }
  }
  ${STREAM_INFO_FIELDS}
` as TypedDocumentNode<
  GetStreamForContentQuery,
  GetStreamForContentQueryVariables
>;

/** @deprecated Use GET_STREAM_FOR_CONTENT_QUERY */
export const GET_STREAM_FOR_MOVIE_QUERY = gql`
  query GetStreamForMovie($movieId: String!) {
    getStreamForMovie(movieId: $movieId) {
      ...StreamInfoFields
    }
  }
  ${STREAM_INFO_FIELDS}
` as TypedDocumentNode<GetStreamForMovieQuery, GetStreamForMovieQueryVariables>;

/** @deprecated Use GET_STREAM_FOR_CONTENT_QUERY */
export const GET_STREAM_FOR_EPISODE_QUERY = gql`
  query GetStreamForEpisode($episodeId: String!) {
    getStreamForEpisode(episodeId: $episodeId) {
      ...StreamInfoFields
    }
  }
  ${STREAM_INFO_FIELDS}
` as TypedDocumentNode<
  GetStreamForEpisodeQuery,
  GetStreamForEpisodeQueryVariables
>;
