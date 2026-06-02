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
    releaseDate: toDateInputValue(episode.releaseDate),
    rating: String(episode.rating)
  };
}

export function toDateInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

export function toReleaseDateIso(dateValue: string): string {
  if (dateValue.includes("T")) {
    return new Date(dateValue).toISOString();
  }

  return `${dateValue}T00:00:00.000Z`;
}
