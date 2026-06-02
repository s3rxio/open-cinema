"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Button,
  Loader,
} from "@open-cinema/ui";
import { QUERIES } from "@/shared/api/queries";
import { usePlayerStore } from "@/shared/state/usePlayerStore";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  MessageSquare,
} from "lucide-react";

interface VideoPlayerProps {
  streamId: string;
  onStreamInfoLoaded?: (info: any) => void;
}

export function VideoPlayer({ streamId, onStreamInfoLoaded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout>();

  const playerState = usePlayerStore();
  const {
    data: streamData,
    loading: streamLoading,
    error: streamError,
  } = useQuery<any>(QUERIES.getStreamInfo, {
    variables: { streamId },
  });

  const streamInfo = streamData?.getStreamInfo;

  useEffect(() => {
    if (streamInfo && onStreamInfoLoaded) {
      onStreamInfoLoaded(streamInfo);
    }
  }, [streamInfo, onStreamInfoLoaded]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimeout);
      const timeout = setTimeout(() => setShowControls(false), 3000);
      setControlsTimeout(timeout);
    };

    const playerElement = videoRef.current?.parentElement;
    if (playerElement) {
      playerElement.addEventListener("mousemove", handleMouseMove);
      return () => {
        playerElement.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [controlsTimeout]);

  if (streamLoading) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (streamError || !streamInfo) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p className="mb-2">Ошибка загрузки видео</p>
          <p className="text-sm text-gray-400">{streamError?.message}</p>
        </div>
      </div>
    );
  }

  const videoMetas = streamInfo.videoMetas || [];
  const audioMetas = streamInfo.audioMetas || [];
  const subtitleMetas = streamInfo.subtitleMetas || [];

  const defaultQuality = videoMetas.find((m: any) => m.isDefault);
  const defaultAudio = audioMetas.find((m: any) => m.isDefault);

  return (
    <div
      className="relative w-full bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-auto"
        controls={false}
        src={defaultQuality?.url || streamInfo.masterPlaylistUrl}
        onPlay={() => playerState.setIsPlaying(true)}
        onPause={() => playerState.setIsPlaying(false)}
        onTimeUpdate={(e) =>
          playerState.setCurrentTime((e.target as HTMLVideoElement).currentTime)
        }
        onVolumeChange={(e) =>
          playerState.setVolume((e.target as HTMLVideoElement).volume)
        }
      />

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 transition-opacity ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[playerState.currentTime]}
            onValueChange={([value]) => {
              playerState.setCurrentTime(value);
              if (videoRef.current) {
                videoRef.current.currentTime = value;
              }
            }}
            max={videoRef.current?.duration || 100}
            step={0.1}
            className="cursor-pointer"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2 text-white">
          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (videoRef.current) {
                if (videoRef.current.paused) {
                  videoRef.current.play();
                } else {
                  videoRef.current.pause();
                }
              }
            }}
            className="hover:bg-white/20"
          >
            {playerState.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (videoRef.current) {
                  if (playerState.volume > 0) {
                    videoRef.current.volume = 0;
                  } else {
                    videoRef.current.volume = 1;
                  }
                }
              }}
              className="hover:bg-white/20"
            >
              {playerState.volume > 0 ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={playerState.volume}
              onChange={(e) => {
                const volume = parseFloat(e.target.value);
                playerState.setVolume(volume);
                if (videoRef.current) {
                  videoRef.current.volume = volume;
                }
              }}
              className="w-20 h-1 cursor-pointer"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Quality Select */}
            {videoMetas.length > 1 && (
              <Select
                value={playerState.currentQuality || defaultQuality?.id}
                onValueChange={(value) => playerState.setQuality(value)}
              >
                <SelectTrigger className="w-32 bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <SelectValue placeholder="Качество" />
                </SelectTrigger>
                <SelectContent>
                  {videoMetas.map((meta: any) => (
                    <SelectItem key={meta.id} value={meta.id}>
                      {meta.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Audio Select */}
            {audioMetas.length > 1 && (
              <Select
                value={playerState.currentAudio || defaultAudio?.id}
                onValueChange={(value) => playerState.setAudio(value)}
              >
                <SelectTrigger className="w-32 bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <SelectValue placeholder="Аудио" />
                </SelectTrigger>
                <SelectContent>
                  {audioMetas.map((meta: any) => (
                    <SelectItem key={meta.id} value={meta.id}>
                      {meta.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Subtitles Select */}
            {subtitleMetas.length > 0 && (
              <Select
                value={playerState.currentSubtitle || "off"}
                onValueChange={(value) => {
                  playerState.setSubtitle(value === "off" ? null : value);
                }}
              >
                <SelectTrigger className="w-32 bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Субтитры" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Нет</SelectItem>
                  {subtitleMetas.map((meta: any) => (
                    <SelectItem key={meta.id} value={meta.id}>
                      {meta.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (videoRef.current?.parentElement) {
                  videoRef.current.parentElement.requestFullscreen?.();
                }
              }}
              className="hover:bg-white/20"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
