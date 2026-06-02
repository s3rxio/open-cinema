"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  CREATE_FAVORITE_MUTATION,
  ME_QUERY,
  REMOVE_FAVORITE_MUTATION
} from "@/shared/api/operations/favorites";
import type { ContentType } from "@/shared/api/operation-types";
import { useAuth } from "@/shared/auth/AuthContext";
import { useFavoritesStore } from "@/shared/state/useFavoritesStore";

export function useBookmarks() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const isBookmarked = useFavoritesStore(state => state.isBookmarked);
  const getFavoriteId = useFavoritesStore(state => state.getFavoriteId);
  const addBookmark = useFavoritesStore(state => state.addBookmark);
  const removeBookmark = useFavoritesStore(state => state.removeBookmark);

  const [createFavorite] = useMutation(CREATE_FAVORITE_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }]
  });

  const [removeFavorite] = useMutation(REMOVE_FAVORITE_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }]
  });

  const toggleBookmark = useCallback(
    async (contentId: string, type: ContentType) => {
      if (!isAuthenticated || !user?.id) {
        router.push("/auth/login");
        return;
      }

      if (isBookmarked(contentId)) {
        const favoriteId = getFavoriteId(contentId);
        if (!favoriteId) return;

        removeBookmark(contentId);
        try {
          await removeFavorite({ variables: { id: favoriteId } });
        } catch {
          addBookmark(contentId, favoriteId);
          throw new Error("Не удалось удалить закладку");
        }
        return;
      }

      try {
        const { data } = await createFavorite({
          variables: {
            createFavoriteInput: {
              userId: user.id,
              ...(type === "MOVIE"
                ? { movieId: contentId }
                : { seriesId: contentId })
            }
          }
        });
        const favoriteId = data?.createFavorite.id;
        if (favoriteId) {
          addBookmark(contentId, favoriteId);
        }
      } catch {
        throw new Error("Не удалось добавить закладку");
      }
    },
    [
      isAuthenticated,
      user?.id,
      router,
      isBookmarked,
      getFavoriteId,
      removeBookmark,
      addBookmark,
      removeFavorite,
      createFavorite
    ]
  );

  return { isBookmarked, toggleBookmark };
}
