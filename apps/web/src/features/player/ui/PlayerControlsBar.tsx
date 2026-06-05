"use client";

import Link from "next/link";
import { Button } from "@open-cinema/ui";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipForward,
  Users,
  Volume2,
  VolumeX
} from "lucide-react";
import { tryPlayVideo } from "@/shared/lib/playback/sync";
import { usePlayerStore } from "@/shared/state";
import type {
  AudioMeta,
  SubtitleMeta,
  VideoMeta
} from "@/shared/api/operation-types";
import { formatTime, PlayerProgressBar } from "@/shared/ui/PlayerProgressBar";
import { AUTO_QUALITY } from "../lib/useHlsTracks";
import type { EpisodeOption } from "../model/types";
import { SEEK_STEP_SEC } from "../lib/constants";
import { PlayerEpisodeMenu } from "./PlayerEpisodeMenu";
import { PlayerSeekButton } from "./PlayerSeekButton";
import { PlayerSettingsMenu } from "./PlayerSettingsMenu";
import {
  PlayerControlTooltip,
  PlayerControlTooltipWrap
} from "./PlayerControlTooltip";

type PlayerControlsBarProps = {
  visible: boolean;
  playbackReady: boolean;
  duration: number;
  partyGuest: boolean;
  partyEnabled: boolean;
  isFullscreen: boolean;
  nextEpisode: EpisodeOption | null;
  watchPartyHref?: string;
  showEpisodeMenu: boolean;
  seasons?: { season: number; episodes: EpisodeOption[] }[];
  selectedSeason?: number;
  selectedEpisodeId?: string;
  onEpisodeChange?: (episodeId: string) => void;
  settingsOpen: boolean;
  episodeMenuOpen: boolean;
  qualityValue: string;
  audioValue: string;
  subtitleValue: string;
  videoMetas: VideoMeta[];
  audioMetas: AudioMeta[];
  subtitleMetas: SubtitleMeta[];
  useMaster: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onSettingsOpenChange: (open: boolean) => void;
  onEpisodeMenuOpenChange: (open: boolean) => void;
  onSeek: (delta: number) => void;
  onTogglePlay: () => void;
  onGoToNextEpisode: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onProgressChange: (value: number) => void;
  onBuffering: () => void;
  revealControls: () => void;
  setQuality: (value: string, videoMetas: VideoMeta[]) => void;
  setAudio: (value: string, audioMetas: AudioMeta[]) => void;
  setSubtitle: (value: string | null, subtitleMetas: SubtitleMeta[]) => void;
};

export function PlayerControlsBar({
  visible,
  playbackReady,
  duration,
  partyGuest,
  partyEnabled,
  isFullscreen,
  nextEpisode,
  watchPartyHref,
  showEpisodeMenu,
  seasons,
  selectedSeason,
  selectedEpisodeId,
  onEpisodeChange,
  settingsOpen,
  episodeMenuOpen,
  qualityValue,
  audioValue,
  subtitleValue,
  videoMetas,
  audioMetas,
  subtitleMetas,
  useMaster,
  videoRef,
  onSettingsOpenChange,
  onEpisodeMenuOpenChange,
  onSeek,
  onTogglePlay,
  onGoToNextEpisode,
  onToggleMute,
  onToggleFullscreen,
  onProgressChange,
  onBuffering,
  revealControls,
  setQuality,
  setAudio,
  setSubtitle
}: PlayerControlsBarProps) {
  const playerState = usePlayerStore();

  const handleSettingsOpenChange = (open: boolean) => {
    onSettingsOpenChange(open);
    if (open) onEpisodeMenuOpenChange(false);
  };

  const handleEpisodeMenuOpenChange = (open: boolean) => {
    onEpisodeMenuOpenChange(open);
    if (open) onSettingsOpenChange(false);
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent px-3 pb-3 pt-8 sm:px-4 sm:pb-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={e => e.stopPropagation()}
      onDoubleClick={e => e.stopPropagation()}
    >
      {playbackReady && (
        <PlayerProgressBar
          className="mb-2"
          value={playerState.currentTime}
          max={duration > 0 ? duration : 100}
          onChange={onProgressChange}
        />
      )}

      <div className="flex items-center gap-1 text-white sm:gap-2">
        {playbackReady && (
          <>
            <PlayerSeekButton
              direction="back"
              onClick={() => onSeek(-SEEK_STEP_SEC)}
            />

            <PlayerControlTooltip
              label={playerState.isPlaying ? "Пауза" : "Воспроизведение"}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onTogglePlay}
                className="h-9 w-9 shrink-0 hover:bg-white/20 text-white"
                aria-label={
                  playerState.isPlaying ? "Пауза" : "Воспроизведение"
                }
              >
                {playerState.isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </PlayerControlTooltip>

            <PlayerSeekButton
              direction="forward"
              onClick={() => onSeek(SEEK_STEP_SEC)}
            />
          </>
        )}

        {nextEpisode && !partyGuest && (
          <PlayerControlTooltip
            label={`Следующая серия: S${nextEpisode.season}E${nextEpisode.episode}`}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onGoToNextEpisode}
              className="h-9 w-9 shrink-0 hover:bg-white/20 text-white"
              aria-label="Следующая серия"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </PlayerControlTooltip>
        )}

        {playbackReady && (
          <span className="ml-1 hidden text-xs tabular-nums text-white/90 sm:inline sm:text-sm">
            {formatTime(playerState.currentTime)} / {formatTime(duration)}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {playbackReady && (
            <div className="flex items-center gap-1">
              <PlayerControlTooltip
                label={
                  playerState.volume > 0 ? "Выключить звук" : "Включить звук"
                }
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onToggleMute}
                  className="h-9 w-9 shrink-0 hover:bg-white/20 text-white"
                  aria-label={
                    playerState.volume > 0
                      ? "Выключить звук"
                      : "Включить звук"
                  }
                >
                  {playerState.volume > 0 ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <VolumeX className="h-5 w-5" />
                  )}
                </Button>
              </PlayerControlTooltip>
              <PlayerControlTooltipWrap
                label="Громкость"
                className="hidden sm:inline-flex"
              >
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
                  className="h-1 w-16 cursor-pointer accent-white md:w-24"
                />
              </PlayerControlTooltipWrap>
            </div>
          )}

          {playbackReady && watchPartyHref && !partyEnabled && (
            <PlayerControlTooltip label="Совместный просмотр">
              <Link
                href={watchPartyHref}
                aria-label="Совместный просмотр"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/20"
              >
                <Users className="h-5 w-5" />
              </Link>
            </PlayerControlTooltip>
          )}

          {showEpisodeMenu && seasons && selectedEpisodeId && selectedSeason !== undefined && onEpisodeChange && (
            <PlayerEpisodeMenu
              open={episodeMenuOpen}
              onOpenChange={handleEpisodeMenuOpenChange}
              seasons={seasons}
              selectedSeason={selectedSeason}
              selectedEpisodeId={selectedEpisodeId}
              onEpisodeChange={onEpisodeChange}
            />
          )}

          {playbackReady && (
            <PlayerSettingsMenu
              open={settingsOpen}
              onOpenChange={handleSettingsOpenChange}
              qualityValue={qualityValue}
              audioValue={audioValue}
              subtitleValue={subtitleValue}
              videoMetas={videoMetas}
              audioMetas={audioMetas}
              subtitleMetas={subtitleMetas}
              useMaster={useMaster}
              onQualityChange={value => {
                onBuffering();
                playerState.setQuality(value);
                if (useMaster) {
                  setQuality(value, videoMetas);
                } else {
                  const meta = videoMetas.find(m => m.id === value);
                  if (meta?.url && videoRef.current) {
                    videoRef.current.src = meta.url;
                    void tryPlayVideo(videoRef.current);
                  }
                }
                revealControls();
              }}
              onAudioChange={value => {
                onBuffering();
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
          )}

          <PlayerControlTooltip
            label={
              isFullscreen
                ? "Выйти из полноэкранного режима"
                : "Полноэкранный режим"
            }
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-9 w-9 shrink-0 hover:bg-white/20 text-white"
              aria-label={
                isFullscreen
                  ? "Выйти из полноэкранного режима"
                  : "Полноэкранный режим"
              }
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
          </PlayerControlTooltip>
        </div>
      </div>

      {playbackReady && (
        <span className="mt-1 text-xs tabular-nums text-white/90 sm:hidden">
          {formatTime(playerState.currentTime)} / {formatTime(duration)}
        </span>
      )}
    </div>
  );
}

export function resolveTrackDefaults(
  videoMetas: VideoMeta[],
  audioMetas: AudioMeta[],
  useMaster: boolean,
  playerState: ReturnType<typeof usePlayerStore.getState>
) {
  const defaultAudio = audioMetas.find(m => m.isDefault) ?? audioMetas[0];
  const defaultQuality = useMaster
    ? AUTO_QUALITY
    : videoMetas[videoMetas.length - 1]?.id;

  return {
    qualityValue: playerState.currentQuality ?? defaultQuality ?? AUTO_QUALITY,
    audioValue: playerState.currentAudio ?? defaultAudio?.id ?? "",
    subtitleValue: playerState.currentSubtitle ?? "off"
  };
}
