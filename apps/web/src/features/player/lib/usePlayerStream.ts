"use client";

import { useQuery } from "@apollo/client/react";
import {
  GET_STREAM_FOR_CONTENT_QUERY,
  GET_STREAM_INFO_QUERY
} from "@/entities/stream";
import { resolvePlaybackUrl } from "./resolvePlaybackUrl";

export function usePlayerStream(contentId?: string, streamId?: string | null) {
  const useContentQuery = Boolean(contentId);
  const useStreamIdQuery = Boolean(streamId) && !useContentQuery;

  const streamByContentQuery = useQuery(GET_STREAM_FOR_CONTENT_QUERY, {
    variables: { contentId: contentId ?? "" },
    skip: !useContentQuery
  });

  const streamByIdQuery = useQuery(GET_STREAM_INFO_QUERY, {
    variables: { streamId: streamId ?? "" },
    skip: !useStreamIdQuery
  });

  const activeQuery = useContentQuery ? streamByContentQuery : streamByIdQuery;

  const streamInfo = useContentQuery
    ? streamByContentQuery.data?.getStreamForContent
    : streamByIdQuery.data?.getStreamInfo;

  const playbackUrl = streamInfo ? resolvePlaybackUrl(streamInfo) : null;
  const subtitleMetas = streamInfo?.subtitleMetas ?? [];
  const hasSource = useContentQuery || useStreamIdQuery;

  const playbackReady =
    !activeQuery.loading &&
    !activeQuery.error &&
    Boolean(streamInfo && playbackUrl);

  const streamErrorMessage =
    activeQuery.error?.message ?? "Для этой серии ещё не загружен стрим";

  return {
    hasSource,
    loading: activeQuery.loading,
    error: activeQuery.error,
    streamInfo,
    playbackUrl,
    subtitleMetas,
    playbackReady,
    streamErrorMessage,
    activeQuery
  };
}
