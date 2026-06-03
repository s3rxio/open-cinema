import { create } from "zustand";

export type WatchHistoryEpisodeFields = {
  id: string;
  title: string;
  season: number;
  episode: number;
  seriesId: string;
  description?: string;
  posterUrl?: string | null;
};

export type WatchHistoryMovieFields = {
  id: string;
  title: string;
  description?: string;
  posterUrl?: string | null;
  releaseDate?: string;
  rating?: number;
};

export type WatchHistoryEntry = {
  id: string;
  progress: number;
  duration: number | null;
  completed: boolean;
  updatedAt?: string;
  movie: WatchHistoryMovieFields | null;
  episode: WatchHistoryEpisodeFields | null;
};

type WatchHistoryServerEntry = WatchHistoryEntry;

export type WatchHistoryState = {
  byMovieId: Record<string, WatchHistoryEntry>;
  byEpisodeId: Record<string, WatchHistoryEntry>;
  entries: WatchHistoryEntry[];
  getByMovieId: (movieId: string) => WatchHistoryEntry | undefined;
  getByEpisodeId: (episodeId: string) => WatchHistoryEntry | undefined;
  upsertEntry: (entry: WatchHistoryEntry) => void;
  setFromServer: (entries: WatchHistoryServerEntry[]) => void;
  clear: () => void;
};

function indexEntries(entries: WatchHistoryEntry[]) {
  const byMovieId: Record<string, WatchHistoryEntry> = {};
  const byEpisodeId: Record<string, WatchHistoryEntry> = {};

  for (const entry of entries) {
    if (entry.movie?.id) {
      byMovieId[entry.movie.id] = entry;
    }
    if (entry.episode?.id) {
      byEpisodeId[entry.episode.id] = entry;
    }
  }

  return { byMovieId, byEpisodeId, entries };
}

export const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
  byMovieId: {},
  byEpisodeId: {},
  entries: [],
  getByMovieId: movieId => get().byMovieId[movieId],
  getByEpisodeId: episodeId => get().byEpisodeId[episodeId],
  upsertEntry: entry =>
    set(state => {
      const existing = state.entries.find(item => item.id === entry.id);
      const merged: WatchHistoryEntry = existing
        ? {
            ...existing,
            ...entry,
            movie: entry.movie
              ? { ...(existing.movie ?? {}), ...entry.movie }
              : existing.movie,
            episode: entry.episode
              ? { ...(existing.episode ?? {}), ...entry.episode }
              : existing.episode
          }
        : entry;

      const nextEntries = [
        merged,
        ...state.entries.filter(item => item.id !== entry.id)
      ];
      return indexEntries(nextEntries);
    }),
  setFromServer: entries => set(indexEntries(entries)),
  clear: () => set({ byMovieId: {}, byEpisodeId: {}, entries: [] })
}));
