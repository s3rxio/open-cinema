"use client";

import dynamic from "next/dynamic";
import type Hls from "hls.js";
import { Loader } from "@open-cinema/ui";
import { usePlayerStore } from "@/shared/state";
import { PlayerActionFlash, type PlayerFlashAction } from "./PlayerActionFlash";
import { PlayerBufferingOverlay } from "./PlayerBufferingOverlay";
import { PlayerAutoNextOverlay } from "./PlayerAutoNextOverlay";
import { PlayerGuestUnlockOverlay } from "./PlayerGuestUnlockOverlay";
import type { EpisodeOption } from "../model/types";

const ReactHlsPlayer = dynamic(() => import("./ReactHlsPlayer"), {
  ssr: false
});

type PlayerVideoLayerProps = {
  loading: boolean;
  playbackReady: boolean;
  playbackUrl: string | null;
  streamErrorMessage: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  autoPlay: boolean;
  partyGuest: boolean;
  isBuffering: boolean;
  guestPlayBlocked: boolean;
  flash: { action: PlayerFlashAction; key: number } | null;
  autoNextSeconds: number | null;
  nextEpisode: EpisodeOption | null;
  duration: number;
  skipPlayPauseFlashRef: React.MutableRefObject<boolean>;
  suppressPlayPauseFlashRef: React.MutableRefObject<boolean>;
  onHlsReady: (hls: Hls) => void;
  onVideoClick: () => void;
  onGuestUnlock: () => void;
  scheduleHideControls: () => void;
  setShowControls: (visible: boolean) => void;
  clearHideTimeout: () => void;
  triggerFlash: (action: PlayerFlashAction) => void;
  emitPartyPlayback: (currentTime: number, isPlaying: boolean) => void;
  handlePause: (currentTime: number, duration: number) => void;
  handleEnded: (duration: number) => void;
  handleTimeUpdate: (currentTime: number, duration: number) => void;
  onEnded: () => void;
};

export function PlayerVideoLayer({
  loading,
  playbackReady,
  playbackUrl,
  streamErrorMessage,
  videoRef,
  autoPlay,
  partyGuest,
  isBuffering,
  guestPlayBlocked,
  flash,
  autoNextSeconds,
  nextEpisode,
  duration,
  skipPlayPauseFlashRef,
  suppressPlayPauseFlashRef,
  onHlsReady,
  onVideoClick,
  onGuestUnlock,
  scheduleHideControls,
  setShowControls,
  clearHideTimeout,
  triggerFlash,
  emitPartyPlayback,
  handlePause,
  handleEnded,
  handleTimeUpdate,
  onEnded
}: PlayerVideoLayerProps) {
  const playerState = usePlayerStore();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!playbackReady) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-white">
        <div>
          <p className="mb-2 text-lg font-medium">Видео недоступно</p>
          <p className="text-sm text-white/60">{streamErrorMessage}</p>
          <p className="mt-3 text-sm text-white/50">Выберите другую серию</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReactHlsPlayer
        key={playbackUrl}
        playerRef={videoRef}
        src={playbackUrl!}
        autoPlay={autoPlay && !partyGuest}
        className="w-full h-full object-contain"
        controls={false}
        playsInline
        onHlsReady={onHlsReady}
        onClick={onVideoClick}
        onPlay={() => {
          const video = videoRef.current;
          playerState.setIsPlaying(true);
          if (video) {
            emitPartyPlayback(video.currentTime, true);
          }
          if (
            !suppressPlayPauseFlashRef.current &&
            !skipPlayPauseFlashRef.current
          ) {
            triggerFlash("play");
          }
          if (skipPlayPauseFlashRef.current) {
            skipPlayPauseFlashRef.current = false;
          }
          scheduleHideControls();
        }}
        onPause={() => {
          const video = videoRef.current;
          playerState.setIsPlaying(false);
          if (video) {
            emitPartyPlayback(video.currentTime, false);
            handlePause(video.currentTime, video.duration || duration);
          }
          if (!suppressPlayPauseFlashRef.current) {
            triggerFlash("pause");
          }
          setShowControls(true);
          clearHideTimeout();
        }}
        onEnded={() => {
          const video = videoRef.current;
          playerState.setIsPlaying(false);
          if (video) {
            handleEnded(video.duration || duration);
          }
          onEnded();
        }}
        onTimeUpdate={e => {
          const video = e.target as HTMLVideoElement;
          playerState.setCurrentTime(video.currentTime);
          handleTimeUpdate(video.currentTime, video.duration || duration);
        }}
        onVolumeChange={e =>
          playerState.setVolume((e.target as HTMLVideoElement).volume)
        }
      />

      <PlayerBufferingOverlay visible={isBuffering} />

      {partyGuest && guestPlayBlocked && (
        <PlayerGuestUnlockOverlay onUnlock={onGuestUnlock} />
      )}

      {flash && (
        <PlayerActionFlash action={flash.action} animationKey={flash.key} />
      )}

      {autoNextSeconds !== null && nextEpisode && (
        <PlayerAutoNextOverlay seconds={autoNextSeconds} nextEpisode={nextEpisode} />
      )}
    </>
  );
}