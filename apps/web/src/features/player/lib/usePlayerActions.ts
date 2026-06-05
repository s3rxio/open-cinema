"use client";

import { useCallback, useRef } from "react";
import { tryPlayVideo } from "@/shared/lib/playback/sync";
import type { SubtitleMeta } from "@/shared/api/operation-types";
import type { PlayerFlashAction } from "../ui/PlayerActionFlash";
import { CLICK_DELAY_MS } from "./constants";

type UsePlayerActionsOptions = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  duration: number;
  partyGuest: boolean;
  subtitleMetas: SubtitleMeta[];
  playerState: {
    volume: number;
    currentSubtitle: string | null;
    setCurrentTime: (time: number) => void;
    setVolume: (volume: number) => void;
    setSubtitle: (id: string | null) => void;
  };
  setSubtitleTrack: (id: string | null, subtitleMetas: SubtitleMeta[]) => void;
  emitPartyPlayback: (currentTime: number, isPlaying: boolean) => void;
  triggerFlash: (action: PlayerFlashAction) => void;
  revealControls: () => void;
  cancelAutoNext: () => void;
  toggleFullscreen: () => void;
};

export function usePlayerActions({
  videoRef,
  duration,
  partyGuest,
  subtitleMetas,
  playerState,
  setSubtitleTrack,
  emitPartyPlayback,
  triggerFlash,
  revealControls,
  cancelAutoNext,
  toggleFullscreen
}: UsePlayerActionsOptions) {
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const seekBy = useCallback(
    (delta: number) => {
      if (partyGuest) return;
      cancelAutoNext();
      const video = videoRef.current;
      if (!video) return;
      const next = Math.min(
        duration > 0 ? duration : video.duration || 0,
        Math.max(0, video.currentTime + delta)
      );
      video.currentTime = next;
      playerState.setCurrentTime(next);
      emitPartyPlayback(next, !video.paused);
      triggerFlash(delta > 0 ? "seek-forward" : "seek-back");
      revealControls();
    },
    [
      duration,
      playerState,
      revealControls,
      triggerFlash,
      emitPartyPlayback,
      partyGuest,
      cancelAutoNext,
      videoRef
    ]
  );

  const togglePlay = useCallback(() => {
    if (partyGuest) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void tryPlayVideo(video);
    } else {
      video.pause();
    }
    emitPartyPlayback(video.currentTime, !video.paused);
    revealControls();
  }, [revealControls, emitPartyPlayback, partyGuest, videoRef]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextVolume = playerState.volume > 0 ? 0 : 1;
    video.volume = nextVolume;
    playerState.setVolume(nextVolume);
    revealControls();
  }, [playerState, revealControls, videoRef]);

  const cycleSubtitles = useCallback(() => {
    if (subtitleMetas.length === 0) return;

    const current = playerState.currentSubtitle;
    if (!current) {
      const first = subtitleMetas[0];
      playerState.setSubtitle(first.id);
      setSubtitleTrack(first.id, subtitleMetas);
    } else {
      const index = subtitleMetas.findIndex(m => m.id === current);
      if (index < 0 || index >= subtitleMetas.length - 1) {
        playerState.setSubtitle(null);
        setSubtitleTrack(null, subtitleMetas);
      } else {
        const next = subtitleMetas[index + 1];
        playerState.setSubtitle(next.id);
        setSubtitleTrack(next.id, subtitleMetas);
      }
    }
    revealControls();
  }, [subtitleMetas, playerState, setSubtitleTrack, revealControls]);

  const handleToggleFullscreen = useCallback(() => {
    toggleFullscreen();
    revealControls();
  }, [toggleFullscreen, revealControls]);

  const handleVideoClick = useCallback(() => {
    if (partyGuest) return;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      togglePlay();
    }, CLICK_DELAY_MS);
  }, [togglePlay, partyGuest]);

  const handleVideoDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      handleToggleFullscreen();
    },
    [handleToggleFullscreen]
  );

  return {
    seekBy,
    togglePlay,
    toggleMute,
    cycleSubtitles,
    handleToggleFullscreen,
    handleVideoClick,
    handleVideoDoubleClick
  };
}
