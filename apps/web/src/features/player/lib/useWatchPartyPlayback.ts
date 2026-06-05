"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getExpectedPartyTime,
  tryPlayVideo,
  WATCH_PARTY_GUEST_DRIFT_CHECK_MS,
  WATCH_PARTY_SYNC_THRESHOLD_SEC
} from "@/shared/lib/playback/sync";
import type { WatchPartyConfig, WatchPartyPlayback } from "../model/types";

type PlayerStateSlice = {
  setCurrentTime: (time: number) => void;
};

type UseWatchPartyPlaybackOptions = {
  watchParty?: WatchPartyConfig;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  playerState: PlayerStateSlice;
  suppressPlayPauseFlash: () => void;
};

export function useWatchPartyPlayback({
  watchParty,
  videoRef,
  playerState,
  suppressPlayPauseFlash
}: UseWatchPartyPlaybackOptions) {
  const applyingRemoteRef = useRef(false);
  const remotePlaybackRef = useRef<WatchPartyPlayback | null>(null);
  const guestPendingPlayRef = useRef(false);

  const [guestPlayBlocked, setGuestPlayBlocked] = useState(false);

  const partyEnabled = Boolean(watchParty?.enabled);
  const partyIsHost = Boolean(watchParty?.isHost);
  const partyGuest = partyEnabled && !partyIsHost;

  remotePlaybackRef.current = watchParty?.remotePlayback ?? null;

  const emitPartyPlayback = useCallback(
    (currentTime: number, isPlaying: boolean) => {
      if (!partyEnabled || !partyIsHost || applyingRemoteRef.current) return;
      watchParty?.onLocalPlaybackChange({ currentTime, isPlaying });
    },
    [partyEnabled, partyIsHost, watchParty]
  );

  const applyRemotePlayback = useCallback(
    async (remote: WatchPartyPlayback, options?: { userGesture?: boolean }) => {
      const video = videoRef.current;
      if (!video) return;

      applyingRemoteRef.current = true;
      suppressPlayPauseFlash();

      const expectedTime = getExpectedPartyTime(remote);
      const drift = Math.abs(video.currentTime - expectedTime);

      if (drift > WATCH_PARTY_SYNC_THRESHOLD_SEC) {
        video.currentTime = expectedTime;
        playerState.setCurrentTime(expectedTime);
      }

      if (remote.isPlaying && video.paused) {
        const playResult = await tryPlayVideo(video, {
          mutedFallback: partyGuest && !options?.userGesture
        });

        if (playResult === "not-ready") {
          guestPendingPlayRef.current = true;
        } else if (playResult === "blocked") {
          guestPendingPlayRef.current = true;
          setGuestPlayBlocked(true);
        } else {
          guestPendingPlayRef.current = false;
          setGuestPlayBlocked(false);
        }
      } else if (!remote.isPlaying && !video.paused) {
        video.pause();
        guestPendingPlayRef.current = false;
        setGuestPlayBlocked(false);
      } else if (!remote.isPlaying) {
        guestPendingPlayRef.current = false;
        setGuestPlayBlocked(false);
      }

      setTimeout(() => {
        applyingRemoteRef.current = false;
      }, 400);
    },
    [videoRef, playerState, suppressPlayPauseFlash, partyGuest]
  );

  const handleGuestUnlockPlayback = useCallback(() => {
    const remote = remotePlaybackRef.current;
    if (!remote?.isPlaying) {
      setGuestPlayBlocked(false);
      guestPendingPlayRef.current = false;
      return;
    }
    void applyRemotePlayback(remote, { userGesture: true });
  }, [applyRemotePlayback]);

  const remoteUpdatedAt = watchParty?.remotePlayback?.updatedAt;
  const remoteIsPlaying = watchParty?.remotePlayback?.isPlaying;
  const remoteCurrentTime = watchParty?.remotePlayback?.currentTime;

  useEffect(() => {
    if (!partyGuest) {
      setGuestPlayBlocked(false);
      guestPendingPlayRef.current = false;
    }
  }, [partyGuest]);

  useEffect(() => {
    if (!partyEnabled || partyIsHost || !watchParty?.remotePlayback) return;
    void applyRemotePlayback(watchParty.remotePlayback);
  }, [
    partyEnabled,
    partyIsHost,
    remoteUpdatedAt,
    remoteIsPlaying,
    remoteCurrentTime,
    applyRemotePlayback,
    watchParty?.remotePlayback
  ]);

  useEffect(() => {
    if (!partyGuest) return;

    const checkDrift = () => {
      const remote = remotePlaybackRef.current;
      const video = videoRef.current;
      if (!remote?.isPlaying || !video || applyingRemoteRef.current) return;

      const expectedTime = getExpectedPartyTime(remote);
      if (
        Math.abs(video.currentTime - expectedTime) <=
        WATCH_PARTY_SYNC_THRESHOLD_SEC
      ) {
        return;
      }

      void applyRemotePlayback(remote);
    };

    const intervalId = setInterval(
      checkDrift,
      WATCH_PARTY_GUEST_DRIFT_CHECK_MS
    );
    return () => clearInterval(intervalId);
  }, [partyGuest, applyRemotePlayback, videoRef]);

  return {
    partyEnabled,
    partyIsHost,
    partyGuest,
    guestPlayBlocked,
    guestPendingPlayRef,
    remotePlaybackRef,
    emitPartyPlayback,
    handleGuestUnlockPlayback,
    applyRemotePlayback
  };
}
