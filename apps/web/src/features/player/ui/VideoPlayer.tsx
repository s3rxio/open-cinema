"use client";

import Hls from "hls.js";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePlayerStore } from "@/shared/state";
import { useWatchProgress } from "@/entities/watch-history";
import { getNextEpisode } from "../lib/getNextEpisodeId";
import { usePlayerKeyboard } from "../lib/usePlayerKeyboard";
import { useHlsTracks } from "../lib/useHlsTracks";
import { usePlayerStream } from "../lib/usePlayerStream";
import {
  usePlayerControlsVisibility,
  usePlayerFlash,
  usePlayerFullscreen,
  useSuppressPlayPauseFlash
} from "../lib/usePlayerControlsVisibility";
import { useWatchPartyPlayback } from "../lib/useWatchPartyPlayback";
import { useAutoNextEpisode } from "../lib/useAutoNextEpisode";
import { useVideoBuffering } from "../lib/useVideoBuffering";
import { usePlayerActions } from "../lib/usePlayerActions";
import { SEEK_STEP_SEC } from "../lib/constants";
import type { VideoPlayerProps } from "../model/types";
import { getPlayerShellClasses, PlayerShellState } from "./PlayerShellState";
import { PlayerTitleOverlay } from "./PlayerTitleOverlay";
import { PlayerVideoLayer } from "./PlayerVideoLayer";
import {
  PlayerControlsBar,
  resolveTrackDefaults
} from "./PlayerControlsBar";

export type { VideoPlayerProps } from "../model/types";

export function VideoPlayer({
  contentId,
  movieId,
  episodeId,
  streamId,
  title,
  variant = "embedded",
  autoPlay = false,
  watchPartyHref,
  watchParty,
  seasons,
  selectedSeason,
  selectedEpisodeId,
  onEpisodeChange
}: VideoPlayerProps) {
  const isCinema = variant === "cinema";
  const { shell } = getPlayerShellClasses(variant);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const skipPlayPauseFlashRef = useRef(autoPlay || isCinema);

  const playerState = usePlayerStore();
  const resetPlayer = usePlayerStore(s => s.reset);
  const { setQuality, setAudio, setSubtitle } = useHlsTracks(hlsRef);

  const nextEpisode = useMemo(() => {
    if (!seasons?.length || !selectedEpisodeId) return null;
    return getNextEpisode(seasons, selectedEpisodeId);
  }, [seasons, selectedEpisodeId]);

  const stream = usePlayerStream(contentId, streamId);
  const { suppressPlayPauseFlashRef, suppressPlayPauseFlash } =
    useSuppressPlayPauseFlash();

  const party = useWatchPartyPlayback({
    watchParty,
    videoRef,
    playerState,
    suppressPlayPauseFlash
  });

  const progress = useWatchProgress({
    movieId,
    episodeId,
    enabled: !party.partyEnabled
  });

  const sourceKey = contentId ?? streamId ?? "";
  const autoNext = useAutoNextEpisode({
    nextEpisode,
    onEpisodeChange,
    partyGuest: party.partyGuest,
    sourceKey,
    selectedEpisodeId
  });

  const ui = usePlayerControlsVisibility({
    isPlaying: playerState.isPlaying,
    autoNextSeconds: autoNext.autoNextSeconds
  });

  const startAutoNext = useCallback(() => {
    autoNext.startAutoNext();
    ui.setShowControls(true);
    ui.clearHideTimeout();
  }, [autoNext, ui]);

  const { flash, triggerFlash } = usePlayerFlash();
  const fullscreen = usePlayerFullscreen(containerRef);

  const video = useVideoBuffering({
    videoRef,
    hlsRef,
    playbackUrl: stream.playbackUrl,
    suppressPlayPauseFlash,
    applyResume: progress.applyResume,
    partyGuest: party.partyGuest,
    guestPendingPlayRef: party.guestPendingPlayRef,
    applyRemotePlayback: party.applyRemotePlayback,
    remotePlaybackRef: party.remotePlaybackRef
  });

  useEffect(() => {
    resetPlayer();
    hlsRef.current = null;
    skipPlayPauseFlashRef.current = autoPlay || isCinema;
    video.setIsBuffering(false);
  }, [sourceKey, resetPlayer, autoPlay, isCinema, video.setIsBuffering]);

  const actions = usePlayerActions({
    videoRef,
    duration: video.duration,
    partyGuest: party.partyGuest,
    subtitleMetas: stream.subtitleMetas,
    playerState,
    setSubtitleTrack: setSubtitle,
    emitPartyPlayback: party.emitPartyPlayback,
    triggerFlash,
    revealControls: ui.revealControls,
    cancelAutoNext: autoNext.cancelAutoNext,
    toggleFullscreen: fullscreen.toggleFullscreen
  });

  const goToNextEpisode = useCallback(() => {
    if (!nextEpisode || !onEpisodeChange || party.partyGuest) return;
    autoNext.cancelAutoNext();
    onEpisodeChange(nextEpisode.id);
    ui.revealControls();
  }, [nextEpisode, onEpisodeChange, party.partyGuest, ui, autoNext]);

  const handleSettingsOpenChange = useCallback(
    (open: boolean) => {
      ui.setSettingsOpen(open);
      if (open) {
        ui.setShowControls(true);
        ui.clearHideTimeout();
      } else {
        ui.scheduleHideControls();
      }
    },
    [ui]
  );

  const handleEpisodeMenuOpenChange = useCallback(
    (open: boolean) => {
      ui.setEpisodeMenuOpen(open);
      if (open) {
        ui.setShowControls(true);
        ui.clearHideTimeout();
      } else {
        ui.scheduleHideControls();
      }
    },
    [ui]
  );

  const keyboardEnabled = Boolean(
    stream.playbackUrl &&
      stream.streamInfo &&
      !stream.loading &&
      !stream.error
  );

  usePlayerKeyboard({
    enabled: keyboardEnabled && !party.partyGuest,
    onTogglePlay: actions.togglePlay,
    onSeekBackward: () => actions.seekBy(-SEEK_STEP_SEC),
    onSeekForward: () => actions.seekBy(SEEK_STEP_SEC),
    onToggleMute: actions.toggleMute,
    onCycleSubtitles: actions.cycleSubtitles,
    onToggleFullscreen: actions.handleToggleFullscreen
  });

  const showEpisodeMenu = Boolean(
    seasons &&
      seasons.length > 0 &&
      onEpisodeChange &&
      selectedEpisodeId &&
      selectedSeason !== undefined
  );

  if (!stream.hasSource) {
    return (
      <PlayerShellState
        variant={variant}
        message="Видео для этого контента ещё не загружено"
      />
    );
  }

  if (!stream.playbackReady && !showEpisodeMenu) {
    if (stream.loading) {
      return <PlayerShellState variant={variant} message="" loading />;
    }

    return (
      <PlayerShellState
        variant={variant}
        message="Ошибка загрузки видео"
        detail={stream.streamErrorMessage}
      />
    );
  }

  const videoMetas = stream.streamInfo?.videoMetas ?? [];
  const audioMetas = stream.streamInfo?.audioMetas ?? [];
  const useMaster = Boolean(stream.streamInfo?.masterPlaylistUrl);
  const trackDefaults = resolveTrackDefaults(
    videoMetas,
    audioMetas,
    useMaster,
    playerState
  );

  const controlsVisible = !stream.playbackReady || ui.controlsVisible;

  return (
    <div
      ref={containerRef}
      className={shell}
      onMouseEnter={() => {
        ui.setIsHovering(true);
        ui.revealControls();
      }}
      onMouseLeave={() => {
        ui.setIsHovering(false);
        ui.scheduleHideControls();
      }}
      onMouseMove={ui.revealControls}
      onDoubleClick={actions.handleVideoDoubleClick}
    >
      {title && !isCinema && (
        <PlayerTitleOverlay title={title} visible={controlsVisible} />
      )}

      <PlayerVideoLayer
        loading={stream.loading}
        playbackReady={stream.playbackReady}
        playbackUrl={stream.playbackUrl}
        streamErrorMessage={stream.streamErrorMessage}
        videoRef={videoRef}
        autoPlay={autoPlay || isCinema}
        partyGuest={party.partyGuest}
        isBuffering={video.isBuffering}
        guestPlayBlocked={party.guestPlayBlocked}
        flash={flash}
        autoNextSeconds={autoNext.autoNextSeconds}
        nextEpisode={nextEpisode}
        duration={video.duration}
        skipPlayPauseFlashRef={skipPlayPauseFlashRef}
        suppressPlayPauseFlashRef={suppressPlayPauseFlashRef}
        onHlsReady={video.handleHlsReady}
        onVideoClick={actions.handleVideoClick}
        onGuestUnlock={party.handleGuestUnlockPlayback}
        scheduleHideControls={ui.scheduleHideControls}
        setShowControls={ui.setShowControls}
        clearHideTimeout={ui.clearHideTimeout}
        triggerFlash={triggerFlash}
        emitPartyPlayback={party.emitPartyPlayback}
        handlePause={progress.handlePause}
        handleEnded={progress.handleEnded}
        handleTimeUpdate={progress.handleTimeUpdate}
        onEnded={() => {
          if (nextEpisode && !party.partyGuest) {
            startAutoNext();
          }
        }}
      />

      <PlayerControlsBar
        visible={controlsVisible}
        playbackReady={stream.playbackReady}
        duration={video.duration}
        partyGuest={party.partyGuest}
        partyEnabled={party.partyEnabled}
        isFullscreen={fullscreen.isFullscreen}
        nextEpisode={nextEpisode}
        watchPartyHref={watchPartyHref}
        showEpisodeMenu={showEpisodeMenu}
        seasons={seasons}
        selectedSeason={selectedSeason}
        selectedEpisodeId={selectedEpisodeId}
        onEpisodeChange={onEpisodeChange}
        settingsOpen={ui.settingsOpen}
        episodeMenuOpen={ui.episodeMenuOpen}
        qualityValue={trackDefaults.qualityValue}
        audioValue={trackDefaults.audioValue}
        subtitleValue={trackDefaults.subtitleValue}
        videoMetas={videoMetas}
        audioMetas={audioMetas}
        subtitleMetas={stream.subtitleMetas}
        useMaster={useMaster}
        videoRef={videoRef}
        onSettingsOpenChange={handleSettingsOpenChange}
        onEpisodeMenuOpenChange={handleEpisodeMenuOpenChange}
        onSeek={actions.seekBy}
        onTogglePlay={actions.togglePlay}
        onGoToNextEpisode={goToNextEpisode}
        onToggleMute={actions.toggleMute}
        onToggleFullscreen={actions.handleToggleFullscreen}
        onProgressChange={value => {
          if (party.partyGuest) return;
          autoNext.cancelAutoNext();
          playerState.setCurrentTime(value);
          if (videoRef.current) {
            videoRef.current.currentTime = value;
            party.emitPartyPlayback(value, !videoRef.current.paused);
          }
          ui.revealControls();
        }}
        onBuffering={() => video.setIsBuffering(true)}
        revealControls={ui.revealControls}
        setQuality={setQuality}
        setAudio={setAudio}
        setSubtitle={setSubtitle}
      />
    </div>
  );
}
