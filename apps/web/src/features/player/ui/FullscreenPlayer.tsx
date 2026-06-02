"use client";

import Link from "next/link";
import { Loader } from "@open-cinema/ui";
import { ChevronLeft } from "lucide-react";
import { EpisodeSelector } from "./EpisodeSelector";
import { VideoPlayer } from "./VideoPlayer";

type EpisodeOption = {
  id: string;
  title: string;
  season: number;
  episode: number;
};

type FullscreenPlayerProps = {
  backHref: string;
  backLabel?: string;
  title: string;
  contentId?: string;
  streamId?: string | null;
  seasons?: { season: number; episodes: EpisodeOption[] }[];
  selectedSeason?: number;
  selectedEpisodeId?: string;
  onEpisodeChange?: (episodeId: string) => void;
  loading?: boolean;
  notFoundMessage?: string;
};

export function FullscreenPlayer({
  backHref,
  backLabel = "Назад",
  title,
  contentId,
  streamId,
  seasons,
  selectedSeason,
  selectedEpisodeId,
  onEpisodeChange,
  loading,
  notFoundMessage
}: FullscreenPlayerProps) {
  const canPlay = Boolean(contentId || streamId);

  if (notFoundMessage) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center text-white">
        <p>{notFoundMessage}</p>
        <Link href={backHref} className="text-primary hover:underline">
          {backLabel}
        </Link>
      </div>
    );
  }

  const showEpisodePicker =
    seasons &&
    seasons.length > 0 &&
    onEpisodeChange &&
    selectedEpisodeId &&
    selectedSeason !== undefined;

  return (
    <div className="relative flex h-full w-full flex-col bg-black">
      <div className="absolute inset-0 z-0">
        {canPlay ? (
          <VideoPlayer
            contentId={contentId}
            streamId={streamId}
            title={title}
            variant="cinema"
            autoPlay
          />
        ) : loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-white px-4 text-center">
            <p>Видео для этого контента ещё не загружено</p>
          </div>
        )}
      </div>

      <div className="pointer-events-none relative z-10 flex shrink-0 flex-col gap-3 bg-gradient-to-b from-black/90 via-black/40 to-transparent p-4 sm:p-6">
        <div className="pointer-events-auto flex flex-wrap items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <h1 className="text-base sm:text-lg font-semibold text-white line-clamp-2 flex-1 min-w-0">
            {title}
          </h1>
        </div>

        {showEpisodePicker && (
          <div className="pointer-events-auto max-w-xl rounded-lg bg-black/60 p-3 backdrop-blur-sm border border-white/10 [&_label]:text-white/90">
            <EpisodeSelector
              seasons={seasons}
              selectedSeason={selectedSeason}
              selectedEpisodeId={selectedEpisodeId}
              onEpisodeChange={onEpisodeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
