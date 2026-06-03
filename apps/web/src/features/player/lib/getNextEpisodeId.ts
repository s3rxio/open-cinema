type EpisodeOption = {
  id: string;
  title: string;
  season: number;
  episode: number;
};

export function getNextEpisode(
  seasons: { season: number; episodes: EpisodeOption[] }[],
  currentEpisodeId: string
): EpisodeOption | null {
  const episodes = seasons.flatMap(season => season.episodes);
  const index = episodes.findIndex(episode => episode.id === currentEpisodeId);
  if (index < 0 || index >= episodes.length - 1) return null;
  return episodes[index + 1] ?? null;
}

export function getNextEpisodeId(
  seasons: { season: number; episodes: EpisodeOption[] }[],
  currentEpisodeId: string
): string | null {
  return getNextEpisode(seasons, currentEpisodeId)?.id ?? null;
}
