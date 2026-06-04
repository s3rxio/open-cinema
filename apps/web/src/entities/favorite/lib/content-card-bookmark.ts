"use client";

import { useCallback, useState } from "react";
import type { ContentType } from "@/shared/api";
import { useBookmarks } from "../model/useBookmarks";

export function useContentCardBookmark(contentId: string, contentType: ContentType) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [pending, setPending] = useState(false);

  const handleBookmarkClick = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (pending) return;

      setPending(true);
      try {
        await toggleBookmark(contentId, contentType);
      } finally {
        setPending(false);
      }
    },
    [contentId, contentType, pending, toggleBookmark]
  );

  return {
    showBookmark: true,
    bookmarked: isBookmarked(contentId),
    bookmarkPending: pending,
    onBookmarkClick: handleBookmarkClick
  };
}
