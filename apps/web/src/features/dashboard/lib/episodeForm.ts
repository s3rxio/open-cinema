import { parseIsoDateFromApi, toDateTimeIso } from "@open-cinema/ui";
import type { SeriesEpisode } from "@/shared/api/operation-types";

export type EpisodeFormValues = {
  season: string;
  episode: string;
  title: string;
  description: string;
  releaseDate: string;
  rating: string;
};

export function episodeToFormValues(episode: SeriesEpisode): EpisodeFormValues {
  return {
    season: String(episode.season),
    episode: String(episode.episode),
    title: episode.title,
    description: episode.description,
    releaseDate: parseIsoDateFromApi(episode.releaseDate),
    rating: String(episode.rating)
  };
}

export function toReleaseDateIso(dateValue: string): string {
  return toDateTimeIso(dateValue);
}
