"use client";

import { useEffect, useState } from "react";
import { AUTO_NEXT_SECONDS } from "./constants";
import type { EpisodeOption } from "../model/types";

type UseAutoNextEpisodeOptions = {
  nextEpisode: EpisodeOption | null;
  onEpisodeChange?: (episodeId: string) => void;
  partyGuest: boolean;
  sourceKey: string;
  selectedEpisodeId?: string;
  onCountdownStart?: () => void;
};

export function useAutoNextEpisode({
  nextEpisode,
  onEpisodeChange,
  partyGuest,
  sourceKey,
  selectedEpisodeId,
  onCountdownStart
}: UseAutoNextEpisodeOptions) {
  const [autoNextSeconds, setAutoNextSeconds] = useState<number | null>(null);

  useEffect(() => {
    setAutoNextSeconds(null);
  }, [selectedEpisodeId, sourceKey]);

  useEffect(() => {
    if (autoNextSeconds === null) return;

    if (autoNextSeconds <= 0) {
      if (nextEpisode && onEpisodeChange && !partyGuest) {
        onEpisodeChange(nextEpisode.id);
      }
      setAutoNextSeconds(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      setAutoNextSeconds(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [autoNextSeconds, nextEpisode, onEpisodeChange, partyGuest]);

  const startAutoNext = () => {
    setAutoNextSeconds(AUTO_NEXT_SECONDS);
    onCountdownStart?.();
  };

  const cancelAutoNext = () => {
    if (autoNextSeconds !== null) setAutoNextSeconds(null);
  };

  return { autoNextSeconds, startAutoNext, cancelAutoNext };
}
