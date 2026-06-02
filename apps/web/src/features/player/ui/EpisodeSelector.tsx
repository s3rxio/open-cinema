"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@open-cinema/ui";
import { useState } from "react";

interface Episode {
  id: string;
  title: string;
  season: number;
  episode: number;
}

interface EpisodeSelectorProps {
  seasons: { season: number; episodes: Episode[] }[];
  onEpisodeChange: (episodeId: string) => void;
  defaultSeason?: number;
  defaultEpisode?: number;
}

export function EpisodeSelector({
  seasons,
  onEpisodeChange,
  defaultSeason = 1,
  defaultEpisode = 1,
}: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(defaultSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(defaultEpisode);

  const currentSeason = seasons.find((s) => s.season === selectedSeason);
  const episodes = currentSeason?.episodes || [];

  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(1);
    const firstEpisode = episodes[0];
    if (firstEpisode) {
      onEpisodeChange(firstEpisode.id);
    }
  };

  const handleEpisodeChange = (episodeId: string) => {
    const episode = episodes.find((e) => e.id === episodeId);
    if (episode) {
      setSelectedEpisode(episode.episode);
      onEpisodeChange(episodeId);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Сезон</label>
        <Select
          value={String(selectedSeason)}
          onValueChange={(value) => handleSeasonChange(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выбрать сезон" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem key={season.season} value={String(season.season)}>
                Сезон {season.season}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Серия</label>
        <Select
          value={
            episodes.find((e) => e.episode === selectedEpisode)?.id || ""
          }
          onValueChange={handleEpisodeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выбрать серию" />
          </SelectTrigger>
          <SelectContent>
            {episodes.map((episode) => (
              <SelectItem key={episode.id} value={episode.id}>
                Серия {episode.episode}: {episode.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
