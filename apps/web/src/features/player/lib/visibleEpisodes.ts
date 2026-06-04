import type { SeriesEpisode } from "@/shared/api/operation-types";

export function visibleEpisodes(episodes: SeriesEpisode[]): SeriesEpisode[] {
  return episodes.filter(episode => episode.isPublished);
}
