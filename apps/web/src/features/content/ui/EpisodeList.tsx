"use client";

import Link from "next/link";
import { routes } from "@/shared/lib/routes";
import type { SeriesEpisode } from "@/shared/api/operation-types";

type EpisodeListProps = {
  seriesId: string;
  seasons: { season: number; episodes: SeriesEpisode[] }[];
};

export function EpisodeList({ seriesId, seasons }: EpisodeListProps) {
  return (
    <div className="space-y-8">
      {seasons.map(({ season, episodes }) => (
        <div key={season}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Сезон {season}
          </h3>
          <ul className="space-y-2">
            {episodes.map(ep => (
              <li key={ep.id}>
                <Link
                  href={routes.watchSeries(seriesId, ep.id)}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 hover:bg-accent transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      Серия {ep.episode}. {ep.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ep.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-primary">Смотреть</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
