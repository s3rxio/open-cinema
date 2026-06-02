"use client";

import dynamic from "next/dynamic";
import Hls from "hls.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Button, cn, Loader } from "@open-cinema/ui";
import {
  GET_STREAM_FOR_CONTENT_QUERY,
  GET_STREAM_INFO_QUERY
} from "@/shared/api/operations/stream";
import { usePlayerStore } from "@/shared/state/usePlayerStore";
import { resolvePlaybackUrl } from "../lib/resolvePlaybackUrl";
import { usePlayerKeyboard } from "../lib/usePlayerKeyboard";
import { AUTO_QUALITY, useHlsTracks } from "../lib/useHlsTracks";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX
} from "lucide-react";
import {
  PlayerActionFlash,
  type PlayerFlashAction
} from "./PlayerActionFlash";
import { PlayerBufferingOverlay } from "./PlayerBufferingOverlay";
import { formatTime, PlayerProgressBar } from "./PlayerProgressBar";
import { PlayerSettingsMenu } from "./PlayerSettingsMenu";

const ReactHlsPlayer = dynamic(() => import("./ReactHlsPlayer"), { ssr: false });

const CONTROLS_HIDE_MS = 3000;
const FLASH_DURATION_MS = 1000;
const SEEK_STEP_SEC = 10;
const CLICK_DELAY_MS = 250;

function SeekButton({
  direction,
  onClick
}: {
  direction: "back" | "forward";
  onClick: () => void;
}) {
  const label =
    direction === "back" ? "Отмотать на 10 секунд" : "Перемотать на 10 секунд";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className="relative h-9 w-9 shrink-0 hover:bg-white/20 text-white"
    >
      <svg
        viewBox="0 0 24 24"
        className={cn(
          "h-5 w-5 fill-current",
          direction === "forward" && "scale-x-[-1]"
        )}
        aria-hidden
      >
        <path d="M12.5 8c-2.65 0-5.05 1.04-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8zm-1 11h-2v-6h2v6zm4 0h-2v-6h2v6z" />
      </svg>
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold leading-none">
        10
      </span>
    </Button>
  );
}

interface VideoPlayerProps {
  /** Movie or episode id (same as createStream contentId). */
  contentId?: string;
  streamId?: string | null;
  title?: string;
  variant?: "embedded" | "cinema";
  autoPlay?: boolean;
}

export function VideoPlayer({
  contentId,
  streamId,
  title,
  variant = "embedded",
  autoPlay = false
}: VideoPlayerProps) {
  const isCinema = variant === "cinema";
  const shellClass = isCinema
    ? "relative h-full w-full overflow-hidden bg-black"
    : "relative w-full bg-black rounded-lg overflow-hidden aspect-video";
  const stateShellClass = isCinema
    ? "flex h-full w-full items-center justify-center text-white bg-black"
    : "w-full aspect-video bg-black flex items-center justify-center text-white rounded-lg";

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressPlayPauseFlashRef = useRef(false);
  const suppressPlayPauseFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const skipPlayPauseFlashRef = useRef(autoPlay || isCinema);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [flash, setFlash] = useState<{
    action: PlayerFlashAction;
    key: number;
  } | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  const playerState = usePlayerStore();
  const resetPlayer = usePlayerStore(s => s.reset);
  const { setQuality, setAudio, setSubtitle } = useHlsTracks(hlsRef);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideTimeout();
    if (!playerState.isPlaying || settingsOpen || isHovering) return;

    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, CONTROLS_HIDE_MS);
  }, [clearHideTimeout, playerState.isPlaying, settingsOpen, isHovering]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  const triggerFlash = useCallback((action: PlayerFlashAction) => {
    if (flashClearRef.current) clearTimeout(flashClearRef.current);
    setFlash({ action, key: Date.now() });
    flashClearRef.current = setTimeout(() => {
      setFlash(null);
      flashClearRef.current = null;
    }, FLASH_DURATION_MS);
  }, []);

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

  const seekBy = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      const next = Math.min(
        duration > 0 ? duration : video.duration || 0,
        Math.max(0, video.currentTime + delta)
      );
      video.currentTime = next;
      playerState.setCurrentTime(next);
      triggerFlash(delta > 0 ? "seek-forward" : "seek-back");
      revealControls();
    },
    [duration, playerState, revealControls, triggerFlash]
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
    revealControls();
  }, [revealControls]);

  const useContentQuery = Boolean(contentId);
  const useStreamIdQuery = Boolean(streamId) && !useContentQuery;

  const streamByContentQuery = useQuery(GET_STREAM_FOR_CONTENT_QUERY, {
    variables: { contentId: contentId ?? "" },
    skip: !useContentQuery
  });

  const streamByIdQuery = useQuery(GET_STREAM_INFO_QUERY, {
    variables: { streamId: streamId ?? "" },
    skip: !useStreamIdQuery
  });

  const activeQuery = useContentQuery ? streamByContentQuery : streamByIdQuery;

  const streamInfo = useContentQuery
    ? streamByContentQuery.data?.getStreamForContent
    : streamByIdQuery.data?.getStreamInfo;
  const playbackUrl = streamInfo ? resolvePlaybackUrl(streamInfo) : null;
  const subtitleMetas = streamInfo?.subtitleMetas ?? [];
  const keyboardEnabled = Boolean(
    playbackUrl && streamInfo && !activeQuery.loading && !activeQuery.error
  );

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
    revealControls();
  }, [revealControls]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextVolume = playerState.volume > 0 ? 0 : 1;
    video.volume = nextVolume;
    playerState.setVolume(nextVolume);
    revealControls();
  }, [playerState, revealControls]);

  const cycleSubtitles = useCallback(() => {
    if (subtitleMetas.length === 0) return;

    const current = playerState.currentSubtitle;
    if (!current) {
      const first = subtitleMetas[0];
      playerState.setSubtitle(first.id);
      setSubtitle(first.id, subtitleMetas);
    } else {
      const index = subtitleMetas.findIndex(m => m.id === current);
      if (index < 0 || index >= subtitleMetas.length - 1) {
        playerState.setSubtitle(null);
        setSubtitle(null, subtitleMetas);
      } else {
        const next = subtitleMetas[index + 1];
        playerState.setSubtitle(next.id);
        setSubtitle(next.id, subtitleMetas);
      }
    }
    revealControls();
  }, [subtitleMetas, playerState, setSubtitle, revealControls]);

  const handleVideoClick = useCallback(() => {
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      togglePlay();
    }, CLICK_DELAY_MS);
  }, [togglePlay]);

  const handleVideoDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      toggleFullscreen();
    },
    [toggleFullscreen]
  );

  usePlayerKeyboard({
    enabled: keyboardEnabled,
    onTogglePlay: togglePlay,
    onSeekBackward: () => seekBy(-SEEK_STEP_SEC),
    onSeekForward: () => seekBy(SEEK_STEP_SEC),
    onToggleMute: toggleMute,
    onCycleSubtitles: cycleSubtitles,
    onToggleFullscreen: toggleFullscreen
  });

  const clearBuffering = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      setIsBuffering(false);
    }
  }, []);

  const handleHlsReady = useCallback(
    (hls: Hls) => {
      hlsRef.current = hls;

      const showBuffering = () => setIsBuffering(true);

      hls.on(Hls.Events.AUDIO_TRACK_SWITCHING, showBuffering);
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, clearBuffering);
      hls.on(Hls.Events.LEVEL_SWITCHING, showBuffering);
      hls.on(Hls.Events.LEVEL_SWITCHED, clearBuffering);
    },
    [clearBuffering]
  );

  const sourceKey = contentId ?? streamId ?? "";

  useEffect(() => {
    resetPlayer();
    hlsRef.current = null;
    skipPlayPauseFlashRef.current = autoPlay || isCinema;
    setIsBuffering(false);
  }, [sourceKey, resetPlayer, autoPlay, isCinema]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onDurationChange = () => setDuration(video.duration || 0);
    const onSeeking = () => {
      suppressPlayPauseFlash();
      setIsBuffering(true);
    };
    const onWaiting = () => setIsBuffering(true);
    const onStalled = () => setIsBuffering(true);
    const onCanPlay = () => clearBuffering();
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
  }, [playbackUrl, suppressPlayPauseFlash, clearBuffering]);

  useEffect(() => {
    if (playbackUrl) setIsBuffering(true);
  }, [playbackUrl]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!playerState.isPlaying || settingsOpen) {
      setShowControls(true);
      clearHideTimeout();
      return;
    }
    scheduleHideControls();
    return clearHideTimeout;
  }, [
    playerState.isPlaying,
    settingsOpen,
    scheduleHideControls,
    clearHideTimeout
  ]);

  useEffect(
    () => () => {
      clearHideTimeout();
      if (flashClearRef.current) clearTimeout(flashClearRef.current);
      if (suppressPlayPauseFlashTimeoutRef.current) {
        clearTimeout(suppressPlayPauseFlashTimeoutRef.current);
      }
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    },
    [clearHideTimeout]
  );

  const hasSource = useContentQuery || useStreamIdQuery;

  if (!hasSource) {
    return (
      <div className={stateShellClass}>
        <p>Видео для этого контента ещё не загружено</p>
      </div>
    );
  }

  if (activeQuery.loading) {
    return (
      <div className={isCinema ? stateShellClass : `${stateShellClass} rounded-lg`}>
        <Loader size="lg" />
      </div>
    );
  }

  if (activeQuery.error || !streamInfo || !playbackUrl) {
    return (
      <div className={stateShellClass}>
        <div className="text-center px-4">
          <p className="mb-2">Ошибка загрузки видео</p>
          <p className="text-sm text-gray-400">
            {activeQuery.error?.message ?? "Стрим недоступен"}
          </p>
        </div>
      </div>
    );
  }

  const videoMetas = streamInfo.videoMetas ?? [];
  const audioMetas = streamInfo.audioMetas ?? [];
  const useMaster = Boolean(streamInfo.masterPlaylistUrl);

  const defaultAudio = audioMetas.find(m => m.isDefault) ?? audioMetas[0];
  const defaultQuality = useMaster
    ? AUTO_QUALITY
    : videoMetas[videoMetas.length - 1]?.id;

  const qualityValue = playerState.currentQuality ?? defaultQuality ?? AUTO_QUALITY;
  const audioValue = playerState.currentAudio ?? defaultAudio?.id ?? "";
  const subtitleValue = playerState.currentSubtitle ?? "off";

  const controlsVisible = showControls || !playerState.isPlaying || settingsOpen;

  return (
    <div
      ref={containerRef}
      className={shellClass}
      onMouseEnter={() => {
        setIsHovering(true);
        revealControls();
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        scheduleHideControls();
      }}
      onMouseMove={revealControls}
      onDoubleClick={handleVideoDoubleClick}
    >
      {title && !isCinema && (
        <div
          className={`pointer-events-none absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            controlsVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <h1 className="text-lg font-semibold text-white line-clamp-2">{title}</h1>
        </div>
      )}

      <ReactHlsPlayer
        key={playbackUrl}
        playerRef={videoRef}
        src={playbackUrl}
        autoPlay={autoPlay || isCinema}
        className="w-full h-full object-contain"
        controls={false}
        playsInline
        onHlsReady={handleHlsReady}
        onClick={handleVideoClick}
        onPlay={() => {
          playerState.setIsPlaying(true);
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
          playerState.setIsPlaying(false);
          if (!suppressPlayPauseFlashRef.current) {
            triggerFlash("pause");
          }
          setShowControls(true);
          clearHideTimeout();
        }}
        onTimeUpdate={e =>
          playerState.setCurrentTime((e.target as HTMLVideoElement).currentTime)
        }
        onVolumeChange={e =>
          playerState.setVolume((e.target as HTMLVideoElement).volume)
        }
      />

      <PlayerBufferingOverlay visible={isBuffering} />

      {flash && (
        <PlayerActionFlash action={flash.action} animationKey={flash.key} />
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent px-3 pb-3 pt-8 sm:px-4 sm:pb-4 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={e => e.stopPropagation()}
        onDoubleClick={e => e.stopPropagation()}
      >
        <PlayerProgressBar
          className="mb-2"
          value={playerState.currentTime}
          max={duration > 0 ? duration : 100}
          onChange={value => {
            playerState.setCurrentTime(value);
            if (videoRef.current) {
              videoRef.current.currentTime = value;
            }
            revealControls();
          }}
        />

        <div className="flex items-center gap-1 text-white sm:gap-2">
          <SeekButton
            direction="back"
            onClick={() => seekBy(-SEEK_STEP_SEC)}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-9 w-9 shrink-0 hover:bg-white/20 text-white"
            aria-label={playerState.isPlaying ? "Пауза" : "Воспроизведение"}
          >
            {playerState.isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <SeekButton
            direction="forward"
            onClick={() => seekBy(SEEK_STEP_SEC)}
          />

          <span className="ml-1 hidden text-xs tabular-nums text-white/90 sm:inline sm:text-sm">
            {formatTime(playerState.currentTime)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-9 w-9 shrink-0 hover:bg-white/20 text-white"
                aria-label={playerState.volume > 0 ? "Выключить звук" : "Включить звук"}
              >
                {playerState.volume > 0 ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={playerState.volume}
                onChange={e => {
                  const volume = parseFloat(e.target.value);
                  playerState.setVolume(volume);
                  if (videoRef.current) {
                    videoRef.current.volume = volume;
                  }
                }}
                aria-label="Громкость"
                className="hidden h-1 w-16 cursor-pointer accent-white sm:block md:w-24"
              />
            </div>

            <PlayerSettingsMenu
              open={settingsOpen}
              onOpenChange={open => {
                setSettingsOpen(open);
                if (open) {
                  setShowControls(true);
                  clearHideTimeout();
                } else {
                  scheduleHideControls();
                }
              }}
              qualityValue={qualityValue}
              audioValue={audioValue}
              subtitleValue={subtitleValue}
              videoMetas={videoMetas}
              audioMetas={audioMetas}
              subtitleMetas={subtitleMetas}
              useMaster={useMaster}
              onQualityChange={value => {
                setIsBuffering(true);
                playerState.setQuality(value);
                if (useMaster) {
                  setQuality(value, videoMetas);
                } else {
                  const meta = videoMetas.find(m => m.id === value);
                  if (meta && videoRef.current) {
                    videoRef.current.src = meta.url;
                    void videoRef.current.play();
                  }
                }
                revealControls();
              }}
              onAudioChange={value => {
                setIsBuffering(true);
                playerState.setAudio(value);
                setAudio(value, audioMetas);
                revealControls();
              }}
              onSubtitleChange={value => {
                const id = value === "off" ? null : value;
                playerState.setSubtitle(id);
                setSubtitle(id, subtitleMetas);
                revealControls();
              }}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-9 w-9 shrink-0 hover:bg-white/20 text-white"
              aria-label={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <span className="mt-1 text-xs tabular-nums text-white/90 sm:hidden">
          {formatTime(playerState.currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
