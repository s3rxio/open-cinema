import { create } from "zustand";
import type { ContentType } from "@/shared/api/operation-types";

export type FavoritesState = {
  /** contentId → favoriteId */
  byContentId: Record<string, string>;
  addBookmark: (contentId: string, favoriteId: string) => void;
  removeBookmark: (contentId: string) => void;
  isBookmarked: (contentId: string) => boolean;
  getFavoriteId: (contentId: string) => string | undefined;
  setFromServer: (
    favorites: Array<{
      id: string;
      movie: { id: string } | null;
      series: { id: string } | null;
    }>
  ) => void;
  clear: () => void;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  byContentId: {},
  addBookmark: (contentId, favoriteId) =>
    set(state => ({
      byContentId: { ...state.byContentId, [contentId]: favoriteId }
    })),
  removeBookmark: contentId =>
    set(state => {
      const { [contentId]: _, ...rest } = state.byContentId;
      return { byContentId: rest };
    }),
  isBookmarked: contentId => contentId in get().byContentId,
  getFavoriteId: contentId => get().byContentId[contentId],
  setFromServer: favorites => {
    const byContentId: Record<string, string> = {};
    for (const fav of favorites) {
      const contentId = fav.movie?.id ?? fav.series?.id;
      if (contentId) {
        byContentId[contentId] = fav.id;
      }
    }
    set({ byContentId });
  },
  clear: () => set({ byContentId: {} })
}));

export type { ContentType };
