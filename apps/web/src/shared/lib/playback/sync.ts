/** Drift above this (seconds) triggers a hard seek for guests. */
export const WATCH_PARTY_SYNC_THRESHOLD_SEC = 3;

/** How often guests re-check drift during continuous playback (ms). */
export const WATCH_PARTY_GUEST_DRIFT_CHECK_MS = 8000;

export type PartyPlaybackClock = {
  currentTime: number;
  isPlaying: boolean;
  updatedAt: string;
};

export type VideoPlayResult = "played" | "muted" | "not-ready" | "blocked";

/** Attempt play(); guests may use muted autoplay when the browser blocks sound. */
export async function tryPlayVideo(
  video: HTMLVideoElement,
  options?: { mutedFallback?: boolean }
): Promise<VideoPlayResult> {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return "not-ready";
  }

  try {
    await video.play();
    return "played";
  } catch (error) {
    const isAutoplayBlocked =
      error instanceof DOMException && error.name === "NotAllowedError";

    if (!isAutoplayBlocked || !options?.mutedFallback || video.muted) {
      return "blocked";
    }

    const previousMuted = video.muted;
    video.muted = true;
    try {
      await video.play();
      return "muted";
    } catch {
      video.muted = previousMuted;
      return "blocked";
    }
  }
}

/** Where the host should be right now, accounting for time since the last update. */
export function getExpectedPartyTime(remote: PartyPlaybackClock): number {
  if (!remote.isPlaying) {
    return remote.currentTime;
  }

  const updatedAtMs = Date.parse(remote.updatedAt);
  if (!Number.isFinite(updatedAtMs)) {
    return remote.currentTime;
  }

  const elapsedSec = Math.max(0, (Date.now() - updatedAtMs) / 1000);
  return remote.currentTime + elapsedSec;
}
