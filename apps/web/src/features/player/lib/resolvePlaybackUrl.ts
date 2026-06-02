import type { StreamInfo } from "@/shared/api/operation-types";

export function resolvePlaybackUrl(streamInfo: StreamInfo): string | null {
  if (streamInfo.masterPlaylistUrl) {
    return streamInfo.masterPlaylistUrl;
  }

  const processed = streamInfo.videoMetas.filter(meta => meta.isProcessed);
  const variants = processed.length > 0 ? processed : streamInfo.videoMetas;

  if (variants.length === 0) return null;

  return [...variants].sort((a, b) => b.bitrate - a.bitrate)[0]?.url ?? null;
}
