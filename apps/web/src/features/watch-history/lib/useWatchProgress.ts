"use client";

import { useMutation } from "@apollo/client/react";
import { useCallback, useEffect, useRef } from "react";
import { RECORD_WATCH_HISTORY_MUTATION } from "@/shared/api/operations/watch-history";
import { useAuth } from "@/shared/auth/AuthContext";
import { useWatchHistoryStore } from "@/shared/state/useWatchHistoryStore";

const SAVE_INTERVAL_MS = 15_000;
const RESUME_MIN_SECONDS = 10;
const COMPLETED_RATIO = 0.9;

type UseWatchProgressOptions = {
  movieId?: string;
  episodeId?: string;
  enabled?: boolean;
};

function isNearlyComplete(progress: number, duration: number) {
  if (duration <= 0) return false;
  return progress / duration >= COMPLETED_RATIO;
}

export function useWatchProgress({
  movieId,
  episodeId,
  enabled = true
}: UseWatchProgressOptions) {
  const { isAuthenticated, user } = useAuth();
  const upsertEntry = useWatchHistoryStore(state => state.upsertEntry);
  const getByMovieId = useWatchHistoryStore(state => state.getByMovieId);
  const getByEpisodeId = useWatchHistoryStore(state => state.getByEpisodeId);

  const [recordWatchHistory] = useMutation(RECORD_WATCH_HISTORY_MUTATION);

  const lastSavedAtRef = useRef(0);
  const lastProgressRef = useRef<{ progress: number; duration: number } | null>(
    null
  );
  const resumeAppliedRef = useRef(false);

  const savedEntry = movieId
    ? getByMovieId(movieId)
    : episodeId
      ? getByEpisodeId(episodeId)
      : undefined;

  const canRecord =
    enabled && isAuthenticated && !!user?.id && (!!movieId || !!episodeId);

  const saveProgress = useCallback(
    async (progress: number, duration: number, completed: boolean) => {
      if (!canRecord || !user?.id) return;

      const normalizedProgress = Math.max(0, Math.floor(progress));
      const normalizedDuration =
        duration > 0 ? Math.floor(duration) : savedEntry?.duration ?? null;
      const isCompleted =
        completed ||
        (normalizedDuration !== null &&
          normalizedDuration > 0 &&
          isNearlyComplete(normalizedProgress, normalizedDuration));

      lastSavedAtRef.current = Date.now();
      lastProgressRef.current = {
        progress: normalizedProgress,
        duration: normalizedDuration ?? 0
      };

      try {
        const { data } = await recordWatchHistory({
          variables: {
            recordWatchHistoryInput: {
              userId: user.id,
              movieId,
              episodeId,
              progress: normalizedProgress,
              duration: normalizedDuration ?? undefined,
              completed: isCompleted
            }
          }
        });

        if (data?.recordWatchHistory) {
          upsertEntry(data.recordWatchHistory);
        }
      } catch {
        // progress sync is best-effort
      }
    },
    [
      canRecord,
      user?.id,
      movieId,
      episodeId,
      recordWatchHistory,
      upsertEntry,
      savedEntry?.duration
    ]
  );

  const getResumeTime = useCallback(
    (duration: number) => {
      if (!savedEntry || savedEntry.completed || duration <= 0) return 0;
      if (savedEntry.progress < RESUME_MIN_SECONDS) return 0;
      if (isNearlyComplete(savedEntry.progress, duration)) return 0;
      return Math.min(savedEntry.progress, duration - 1);
    },
    [savedEntry]
  );

  const applyResume = useCallback(
    (video: HTMLVideoElement) => {
      if (resumeAppliedRef.current || !canRecord) return;

      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const resumeAt = getResumeTime(duration);
      if (resumeAt > 0) {
        video.currentTime = resumeAt;
      }
      resumeAppliedRef.current = true;
    },
    [canRecord, getResumeTime]
  );

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      if (!canRecord) return;

      lastProgressRef.current = { progress: currentTime, duration };

      const now = Date.now();
      if (now - lastSavedAtRef.current < SAVE_INTERVAL_MS) return;

      void saveProgress(currentTime, duration, false);
    },
    [canRecord, saveProgress]
  );

  const handlePause = useCallback(
    (currentTime: number, duration: number) => {
      if (!canRecord) return;
      void saveProgress(currentTime, duration, false);
    },
    [canRecord, saveProgress]
  );

  const handleEnded = useCallback(
    (duration: number) => {
      if (!canRecord) return;
      void saveProgress(duration, duration, true);
    },
    [canRecord, saveProgress]
  );

  useEffect(() => {
    resumeAppliedRef.current = false;
    lastSavedAtRef.current = 0;
    lastProgressRef.current = null;
  }, [movieId, episodeId]);

  useEffect(() => {
    return () => {
      const last = lastProgressRef.current;
      if (!canRecord || !last) return;
      void saveProgress(last.progress, last.duration, false);
    };
  }, [canRecord, saveProgress]);

  return {
    applyResume,
    handleTimeUpdate,
    handlePause,
    handleEnded
  };
}
