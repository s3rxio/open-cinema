"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerFlashAction } from "../ui/PlayerActionFlash";
import { CONTROLS_HIDE_MS, FLASH_DURATION_MS } from "./constants";

type UsePlayerControlsVisibilityOptions = {
  isPlaying: boolean;
  autoNextSeconds: number | null;
};

export function usePlayerControlsVisibility({
  isPlaying,
  autoNextSeconds
}: UsePlayerControlsVisibilityOptions) {
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showControls, setShowControls] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [episodeMenuOpen, setEpisodeMenuOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideTimeout();
    if (
      !isPlaying ||
      settingsOpen ||
      episodeMenuOpen ||
      autoNextSeconds !== null ||
      isHovering
    ) {
      return;
    }

    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, CONTROLS_HIDE_MS);
  }, [
    clearHideTimeout,
    isPlaying,
    settingsOpen,
    episodeMenuOpen,
    autoNextSeconds,
    isHovering
  ]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  useEffect(() => {
    if (isPlaying && !settingsOpen && !episodeMenuOpen && autoNextSeconds === null) {
      scheduleHideControls();
      return clearHideTimeout;
    }

    setShowControls(true);
    clearHideTimeout();
  }, [
    isPlaying,
    settingsOpen,
    episodeMenuOpen,
    autoNextSeconds,
    scheduleHideControls,
    clearHideTimeout
  ]);

  useEffect(
    () => () => {
      clearHideTimeout();
    },
    [clearHideTimeout]
  );

  const controlsVisible =
    showControls ||
    !isPlaying ||
    settingsOpen ||
    episodeMenuOpen ||
    autoNextSeconds !== null;

  return {
    showControls,
    setShowControls,
    settingsOpen,
    setSettingsOpen,
    episodeMenuOpen,
    setEpisodeMenuOpen,
    isHovering,
    setIsHovering,
    controlsVisible,
    clearHideTimeout,
    scheduleHideControls,
    revealControls
  };
}

export function usePlayerFlash() {
  const flashClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flash, setFlash] = useState<{
    action: PlayerFlashAction;
    key: number;
  } | null>(null);

  const triggerFlash = useCallback((action: PlayerFlashAction) => {
    if (flashClearRef.current) clearTimeout(flashClearRef.current);
    setFlash({ action, key: Date.now() });
    flashClearRef.current = setTimeout(() => {
      setFlash(null);
      flashClearRef.current = null;
    }, FLASH_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (flashClearRef.current) clearTimeout(flashClearRef.current);
    },
    []
  );

  return { flash, triggerFlash };
}

export function usePlayerFullscreen(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [containerRef]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  }, [containerRef]);

  return { isFullscreen, toggleFullscreen };
}

export function useSuppressPlayPauseFlash() {
  const suppressPlayPauseFlashRef = useRef(false);
  const suppressPlayPauseFlashTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const suppressPlayPauseFlash = useCallback(() => {
    suppressPlayPauseFlashRef.current = true;
    if (suppressPlayPauseFlashTimeoutRef.current) {
      clearTimeout(suppressPlayPauseFlashTimeoutRef.current);
    }
    suppressPlayPauseFlashTimeoutRef.current = setTimeout(() => {
      suppressPlayPauseFlashRef.current = false;
      suppressPlayPauseFlashTimeoutRef.current = null;
    }, 500);
  }, []);

  useEffect(
    () => () => {
      if (suppressPlayPauseFlashTimeoutRef.current) {
        clearTimeout(suppressPlayPauseFlashTimeoutRef.current);
      }
    },
    []
  );

  return { suppressPlayPauseFlashRef, suppressPlayPauseFlash };
}
