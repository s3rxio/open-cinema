"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@open-cinema/ui";

interface Episode {
  id: string;
  title: string;
  season: number;
  episode: number;
}

interface EpisodeSelectorProps {
  seasons: { season: number; episodes: Episode[] }[];
  onEpisodeChange: (episodeId: string) => void;
  selectedSeason: number;
  selectedEpisodeId: string;
}

export function EpisodeSelector({
  seasons,
  onEpisodeChange,
  selectedSeason,
  selectedEpisodeId
}: EpisodeSelectorProps) {
  const currentSeason = seasons.find(s => s.season === selectedSeason);
  const episodes = currentSeason?.episodes ?? [];

  const handleSeasonChange = (value: string) => {
    const season = parseInt(value, 10);
    const seasonData = seasons.find(s => s.season === season);
    const firstEpisode = seasonData?.episodes[0];
    if (firstEpisode) {
      onEpisodeChange(firstEpisode.id);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Сезон</label>
        <Select value={String(selectedSeason)} onValueChange={handleSeasonChange}>
          <SelectTrigger>
            <SelectValue placeholder="Выбрать сезон" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map(season => (
              <SelectItem key={season.season} value={String(season.season)}>
                Сезон {season.season}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Серия</label>
        <Select value={selectedEpisodeId} onValueChange={onEpisodeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Выбрать серию" />
          </SelectTrigger>
          <SelectContent>
            {episodes.map(episode => (
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
