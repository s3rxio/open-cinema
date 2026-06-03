"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@open-cinema/ui";
import { routes } from "@/shared/lib/routes";
import type { SeriesEpisode } from "@/shared/api/operation-types";

type EpisodeListProps = {
  seriesId: string;
  seasons: { season: number; episodes: SeriesEpisode[] }[];
};

export function EpisodeList({ seriesId, seasons }: EpisodeListProps) {
  const [collapsedSeasons, setCollapsedSeasons] = useState<Set<number>>(
    () => new Set(seasons.map(({ season }) => season))
  );

  const toggleSeason = (season: number) => {
    setCollapsedSeasons(prev => {
      const next = new Set(prev);
      if (next.has(season)) {
        next.delete(season);
      } else {
        next.add(season);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {seasons.map(({ season, episodes }) => {
        const collapsed = collapsedSeasons.has(season);

        return (
          <div
            key={season}
            className="flex flex-col rounded-lg border border-border bg-card"
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/60"
              onClick={() => toggleSeason(season)}
              aria-expanded={!collapsed}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  collapsed && "-rotate-90"
                )}
              />
              <span className="font-semibold">Сезон {season}</span>
              <span className="text-xs text-muted-foreground">
                ({episodes.length})
              </span>
            </button>

            {!collapsed && (
              <ul className="max-h-64 space-y-1 overflow-y-auto border-t border-border p-2 pr-1">
                {episodes.map(ep => (
                  <li key={ep.id}>
                    <Link
                      href={routes.watchSeries(seriesId, ep.id)}
                      className="block rounded-md px-3 py-2 transition-colors hover:bg-muted/60"
                    >
                      <p className="font-medium">
                        Серия {ep.episode}. {ep.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {ep.description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
