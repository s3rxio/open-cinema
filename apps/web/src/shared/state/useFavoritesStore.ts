import { create } from "zustand";

export type FavoritesState = {
  favorites: string[];
  addFavorite: (contentId: string) => void;
  removeFavorite: (contentId: string) => void;
  isFavorite: (contentId: string) => boolean;
  setFavorites: (ids: string[]) => void;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  addFavorite: (contentId) =>
    set((state) => ({
      favorites: [...new Set([...state.favorites, contentId])],
    })),
  removeFavorite: (contentId) =>
    set((state) => ({
      favorites: state.favorites.filter((id) => id !== contentId),
    })),
  isFavorite: (contentId) => get().favorites.includes(contentId),
  setFavorites: (ids) => set({ favorites: ids }),
}));
