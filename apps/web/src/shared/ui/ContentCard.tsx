"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useState } from "react";
import type { ContentItem } from "@/shared/api/operation-types";
import { useBookmarks } from "@/features/favorites/lib/useBookmarks";
import { routes } from "@/shared/lib/routes";
import { primaryGenreLabel } from "@/shared/lib/genres";
import { cn } from "@open-cinema/ui";

export const CONTENT_CARD_GRID_CLASS =
  "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 max-md:grid-cols-[repeat(auto-fill,minmax(165px,1fr))] max-md:gap-3";

/** @deprecated Use CONTENT_CARD_GRID_CLASS */
export const contentCardStyles = { grid: CONTENT_CARD_GRID_CLASS };

export type ContentCardProps = ContentItem & {
  href?: string;
  progressPercent?: number;
  statusLabel?: string;
  statusCompleted?: boolean;
  showBookmark?: boolean;
  fluid?: boolean;
};

export function ContentCard({
  id,
  title,
  description,
  posterUrl,
  rating,
  type,
  genres,
  href: hrefOverride,
  progressPercent,
  statusLabel,
  statusCompleted = false,
  showBookmark = true,
  fluid = false
}: ContentCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(id);
  const [pending, setPending] = useState(false);

  const href =
    hrefOverride ?? (type === "MOVIE" ? routes.movie(id) : routes.series(id));
  const typeLabel = type === "MOVIE" ? "Фильм" : "Сериал";
  const genreLabel = primaryGenreLabel(genres);
  const badgeLabel = genreLabel ? `${typeLabel} · ${genreLabel}` : typeLabel;

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    setPending(true);
    try {
      await toggleBookmark(id, type);
    } finally {
      setPending(false);
    }
  };

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full min-h-[380px] flex-col overflow-hidden rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass-bg,rgba(255,255,255,0.04))] text-inherit no-underline backdrop-blur-[var(--home-blur,blur(12px))] transition-[transform,box-shadow,border-color] duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)] max-md:min-h-[290px]",
        fluid ? "w-full" : "w-[260px] max-md:w-[185px]"
      )}
    >
      <div className="relative flex h-[300px] items-center justify-center border-b border-[var(--glass-border)] bg-black/15 p-5 max-md:h-[190px] max-md:p-2.5">
        <span className="absolute left-2.5 top-3 z-10 max-w-[calc(100%-56px)] rounded-lg border border-[var(--glass-border)] bg-white/10 px-3 py-1 text-[11px] font-semibold leading-[1.3] text-foreground backdrop-blur-sm">
          {badgeLabel}
        </span>
        {showBookmark ? (
          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={pending}
            aria-label={
              bookmarked ? "Убрать из закладок" : "Добавить в закладки"
            }
            className={cn(
              "absolute right-2.5 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--glass-border)] bg-black/35 text-foreground backdrop-blur-md transition-[transform,background] duration-200 ease-in-out hover:scale-[1.08] hover:bg-black/50",
              bookmarked &&
                "border-[rgba(255,59,48,0.9)] bg-[rgba(255,59,48,0.9)] text-white"
            )}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={bookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        ) : null}
        <div className="relative flex h-full items-center justify-center transition-transform duration-[550ms] ease-in-out group-hover:scale-[1.03]">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="h-full aspect-[2/3] rounded-[3px_6px_6px_3px] object-cover shadow-[0_4px_10px_rgba(0,0,0,0.25),5px_5px_15px_rgba(0,0,0,0.2)]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full aspect-[2/3] items-center justify-center rounded-md bg-muted text-[13px] text-muted-foreground">
              Нет постера
            </div>
          )}
        </div>
        {progressPercent != null && progressPercent > 0 && !statusCompleted ? (
          <div
            className="absolute bottom-3 left-5 right-5 z-10 h-1 overflow-hidden rounded-full bg-black/45"
            aria-hidden
          >
            <div
              className="h-full rounded-[inherit] bg-[#ff9f0a] transition-[width] duration-300 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h4 className="m-0 line-clamp-2 text-[17px] font-bold leading-[1.3] text-foreground max-md:text-sm">
          {title}
        </h4>
        <p className="line-clamp-2 text-sm text-muted-foreground max-md:text-xs">
          {description}
        </p>
      </div>
      <div className="flex items-center justify-between px-4 pb-4 pt-3">
        {statusLabel ? (
          <span
            className={cn(
              "text-[13px] font-medium text-muted-foreground",
              statusCompleted && "text-[#34c759]"
            )}
          >
            {statusLabel}
          </span>
        ) : (
          <div className="flex items-center gap-1 text-[13px] font-medium text-muted-foreground">
            <Star
              className="text-[#faad14]"
              size={14}
              fill="#faad14"
              stroke="#faad14"
            />
            <span>{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
