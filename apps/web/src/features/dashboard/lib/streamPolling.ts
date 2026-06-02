import type { StreamInfo } from "@/shared/api/operation-types";

export const STREAM_POLL_INTERVAL_MS = 4_000;

export function streamNeedsPolling(
  stream: StreamInfo | undefined,
  uploading: boolean
): boolean {
  if (uploading) return true;
  if (!stream) return true;

  return (
    stream.videoMetas.some(meta => !meta.isProcessed) ||
    stream.audioMetas.some(meta => !meta.isProcessed)
  );
}
