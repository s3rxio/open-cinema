"use client";

import Link from "next/link";
import { Card, CardContent } from "@open-cinema/ui";
import { useFavoritesStore } from "@/shared/state/useFavoritesStore";
import { Heart } from "lucide-react";

interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  posterUrl?: string;
  rating?: number;
  type: "MOVIE" | "SERIES";
  onToggleFavorite?: (id: string, isFavorite: boolean) => Promise<void>;
}

export function ContentCard({
  id,
  title,
  description,
  posterUrl,
  rating,
  type,
  onToggleFavorite,
}: ContentCardProps) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id));
  const toggleFavorite = useFavoritesStore((state) =>
    state.isFavorite(id) ? state.removeFavorite : state.addFavorite
  );

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const newFavorite = !isFavorite;
    toggleFavorite(id);

    if (onToggleFavorite) {
      try {
        await onToggleFavorite(id, newFavorite);
      } catch (error) {
        // Revert on error
        toggleFavorite(id);
      }
    }
  };

  const href = type === "MOVIE" ? `/player/${id}` : `/series/${id}`;

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
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              <Heart
                className="w-5 h-5"
                fill={isFavorite ? "currentColor" : "none"}
                color={isFavorite ? "#ef4444" : "#fff"}
              />
            </button>
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-semibold line-clamp-2">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
            {rating && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium">⭐ {rating.toFixed(1)}</span>
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

