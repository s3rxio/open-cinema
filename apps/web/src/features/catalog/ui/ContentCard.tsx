"use client";

import Link from "next/link";
import { Card, CardContent } from "@open-cinema/ui";
import { useBookmarks } from "@/features/favorites/lib/useBookmarks";
import { Bookmark } from "lucide-react";
import { cn } from "@open-cinema/ui";
import { useState } from "react";
import type { ContentType } from "@/shared/api/operation-types";
import { routes } from "@/shared/lib/routes";

interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  posterUrl?: string;
  rating?: number;
  type: ContentType;
}

export function ContentCard({
  id,
  title,
  description,
  posterUrl,
  rating,
  type
}: ContentCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(id);
  const [pending, setPending] = useState(false);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    setPending(true);
    try {
      await toggleBookmark(id, type);
    } catch {
      // optimistic revert handled in hook
    } finally {
      setPending(false);
    }
  };

  const href = type === "MOVIE" ? routes.movie(id) : routes.series(id);

  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-muted overflow-hidden">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleBookmarkClick}
              disabled={pending}
              aria-label={bookmarked ? "Убрать из закладок" : "Добавить в закладки"}
              className={cn(
                "absolute top-2 right-2 rounded-full p-2 transition-colors",
                "bg-black/50 hover:bg-black/70",
                bookmarked && "bg-yellow-500/90 hover:bg-yellow-500"
              )}
            >
              <Bookmark
                className={cn(
                  "h-5 w-5",
                  bookmarked
                    ? "fill-yellow-300 text-yellow-300"
                    : "fill-none text-white"
                )}
              />
            </button>
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-semibold line-clamp-2">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
            {rating != null && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium">
                  ⭐ {rating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {type === "MOVIE" ? "Фильм" : "Сериал"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
