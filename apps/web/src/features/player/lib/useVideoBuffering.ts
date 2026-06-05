"use client";

import Hls from "hls.js";
import { useCallback, useEffect, useState } from "react";
import type { WatchPartyPlayback } from "../model/types";

type UseVideoBufferingOptions = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  hlsRef: React.MutableRefObject<Hls | null>;
  playbackUrl: string | null;
  suppressPlayPauseFlash: () => void;
  applyResume: (video: HTMLVideoElement) => void;
  partyGuest: boolean;
  guestPendingPlayRef: React.MutableRefObject<boolean>;
  applyRemotePlayback: (
    remote: WatchPartyPlayback,
    options?: { userGesture?: boolean }
  ) => Promise<void>;
  remotePlaybackRef: React.MutableRefObject<WatchPartyPlayback | null>;
};

export function useVideoBuffering({
  videoRef,
  hlsRef,
  playbackUrl,
  suppressPlayPauseFlash,
  applyResume,
  partyGuest,
  guestPendingPlayRef,
  applyRemotePlayback,
  remotePlaybackRef
}: UseVideoBufferingOptions) {
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const clearBuffering = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      setIsBuffering(false);
    }
  }, [videoRef]);

  const handleHlsReady = useCallback(
    (hls: Hls) => {
      hlsRef.current = hls;

      const showBuffering = () => setIsBuffering(true);

      hls.on(Hls.Events.AUDIO_TRACK_SWITCHING, showBuffering);
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, clearBuffering);
      hls.on(Hls.Events.LEVEL_SWITCHING, showBuffering);
      hls.on(Hls.Events.LEVEL_SWITCHED, clearBuffering);
    },
    [hlsRef, clearBuffering]
  );

  useEffect(() => {
    if (playbackUrl) setIsBuffering(true);
  }, [playbackUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onDurationChange = () => {
      setDuration(video.duration || 0);
      applyResume(video);
    };
    const onSeeking = () => {
      suppressPlayPauseFlash();
      setIsBuffering(true);
    };
    const onWaiting = () => setIsBuffering(true);
    const onStalled = () => setIsBuffering(true);
    const onCanPlay = () => {
      clearBuffering();
      if (partyGuest && guestPendingPlayRef.current) {
        const remote = remotePlaybackRef.current;
        if (remote?.isPlaying) {
          void applyRemotePlayback(remote);
        }
      }
    };
    const onPlaying = () => clearBuffering();

    video.addEventListener("loadedmetadata", onDurationChange);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);

    return () => {
      video.removeEventListener("loadedmetadata", onDurationChange);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
    };
  }, [
    playbackUrl,
    suppressPlayPauseFlash,
    clearBuffering,
    applyResume,
    partyGuest,
    applyRemotePlayback,
    videoRef,
    guestPendingPlayRef,
    remotePlaybackRef
  ]);

  return {
    duration,
    isBuffering,
    setIsBuffering,
    handleHlsReady,
    clearBuffering
  };
}
