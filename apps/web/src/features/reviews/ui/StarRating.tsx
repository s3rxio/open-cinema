"use client";

import { Star } from "lucide-react";
import { cn } from "@open-cinema/ui";

const MAX_STARS = 5;

export function ratingToStars(rating: number): number {
  return Math.max(0, Math.min(MAX_STARS, Math.round(rating / 2)));
}

export function starsToRating(stars: number): number {
  return stars * 2;
}

type StarRatingProps = {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md"
}: StarRatingProps) {
  const activeStars = ratingToStars(value);
  const iconSize = size === "sm" ? 16 : 22;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`Оценка ${value.toFixed(1)} из 10`}
    >
      {Array.from({ length: MAX_STARS }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= activeStars;

        if (readOnly) {
          return (
            <Star
              key={starValue}
              size={iconSize}
              fill={filled ? "currentColor" : "none"}
              className={cn(
                filled ? "text-yellow-400" : "text-muted-foreground/30"
              )}
              aria-hidden
            />
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange?.(starsToRating(starValue))}
            className={cn(
              "rounded-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filled
                ? "text-yellow-400"
                : "text-muted-foreground/40 hover:text-yellow-300"
            )}
            aria-label={`${starValue} из ${MAX_STARS}`}
            aria-checked={filled}
            role="radio"
          >
            <Star size={iconSize} fill={filled ? "currentColor" : "none"} />
          </button>
        );
      })}
    </div>
  );
}
