import type { SeriesEpisode } from "@/shared/api/operation-types";

export function groupEpisodesBySeason(episodes: SeriesEpisode[]) {
  const seasonsMap = new Map<number, SeriesEpisode[]>();

  for (const episode of episodes) {
    const list = seasonsMap.get(episode.season) ?? [];
    list.push(episode);
    seasonsMap.set(episode.season, list);
  }

  return Array.from(seasonsMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([season, seasonEpisodes]) => ({
      season,
      episodes: seasonEpisodes.sort((a, b) => a.episode - b.episode)
    }));
}
