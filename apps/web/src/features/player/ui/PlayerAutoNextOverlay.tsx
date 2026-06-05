"use client";

import type { EpisodeOption } from "../model/types";

type PlayerAutoNextOverlayProps = {
  seconds: number;
  nextEpisode: EpisodeOption;
};

export function PlayerAutoNextOverlay({
  seconds,
  nextEpisode
}: PlayerAutoNextOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/40">
      <div className="rounded-lg bg-black/80 px-6 py-4 text-center text-white backdrop-blur-sm">
        <p className="text-lg font-medium">
          Следующая серия через {seconds} сек
        </p>
        <p className="mt-1 text-sm text-white/70">
          S{nextEpisode.season}E{nextEpisode.episode} · {nextEpisode.title}
        </p>
      </div>
    </div>
  );
}
