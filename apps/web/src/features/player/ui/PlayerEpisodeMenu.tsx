"use client";

import { useEffect, useRef, useState } from "react";
import { Captions, Check, ChevronDown } from "lucide-react";
import { Button, cn } from "@open-cinema/ui";
import { PlayerControlTooltip } from "./PlayerControlTooltip";

type EpisodeOption = {
  id: string;
  title: string;
  season: number;
  episode: number;
};

type PlayerEpisodeMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasons: { season: number; episodes: EpisodeOption[] }[];
  selectedSeason: number;
  selectedEpisodeId: string;
  onEpisodeChange: (episodeId: string) => void;
};

export function PlayerEpisodeMenu({
  open,
  onOpenChange,
  seasons,
  selectedSeason,
  selectedEpisodeId,
  onEpisodeChange
}: PlayerEpisodeMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(
    selectedSeason
  );

  useEffect(() => {
    if (open) {
      setExpandedSeason(selectedSeason);
    }
  }, [open, selectedSeason]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      const trigger = (e.target as HTMLElement).closest(
        "[data-episode-trigger]"
      );
      if (trigger) return;
      onOpenChange(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onOpenChange]);

  if (seasons.length === 0) return null;

  const toggleSeason = (season: number) => {
    setExpandedSeason(prev => (prev === season ? null : season));
  };

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <PlayerControlTooltip label="Серии и эпизоды">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-episode-trigger
          aria-expanded={open}
          aria-haspopup="true"
          aria-label="Выбор серии"
          onClick={() => onOpenChange(!open)}
          className={cn(
            "h-9 w-9 shrink-0 hover:bg-white/20 text-white",
            open && "bg-white/20"
          )}
        >
          <Captions className="h-5 w-5" />
        </Button>
      </PlayerControlTooltip>

      {open && (
        <div
          className="absolute bottom-full right-0 z-50 mb-2 h-[300px] w-72 overflow-y-auto rounded-lg bg-[#212121]/95 py-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="menu"
        >
          {seasons.map(({ season, episodes }) => {
            const isExpanded = expandedSeason === season;

            return (
              <div key={season} className="py-0.5">
                <button
                  type="button"
                  onClick={() => toggleSeason(season)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-white/50 transition-transform duration-200",
                      !isExpanded && "-rotate-90"
                    )}
                  />
                  <span className="flex-1">Сезон {season}</span>
                  <span className="text-xs text-white/40">
                    {episodes.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="pb-1">
                    {episodes.map(episode => {
                      const selected = episode.id === selectedEpisodeId;

                      return (
                        <button
                          key={episode.id}
                          type="button"
                          onClick={() => {
                            onEpisodeChange(episode.id);
                            onOpenChange(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded px-3 py-2 pl-9 text-left text-sm text-white/90 transition-colors hover:bg-white/10",
                            selected && "bg-white/10"
                          )}
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                            {selected ? (
                              <Check className="h-4 w-4 text-white" />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {episode.episode}. {episode.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
