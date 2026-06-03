"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useState } from "react";
import type { ContentItem } from "@/shared/api/operation-types";
import { useBookmarks } from "@/features/favorites/lib/useBookmarks";
import { routes } from "@/shared/lib/routes";
import { primaryGenreLabel } from "@/shared/lib/genres";
import { cn } from "@open-cinema/ui";
import styles from "./ContentCard.module.css";

export { styles as contentCardStyles };

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
      className={cn(styles.card, fluid && styles.cardFluid)}
    >
      <div className={styles.cover}>
        <span className={styles.typeBadge}>{badgeLabel}</span>
        {showBookmark ? (
          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={pending}
            aria-label={bookmarked ? "Убрать из закладок" : "Добавить в закладки"}
            className={cn(styles.bookmarkBtn, bookmarked && styles.bookmarkBtnActive)}
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
        <div className={styles.posterWrapper}>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className={styles.posterImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.posterPlaceholder}>Нет постера</div>
          )}
        </div>
        {progressPercent != null && progressPercent > 0 && !statusCompleted ? (
          <div className={styles.progressTrack} aria-hidden>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className={styles.info}>
        <h4 className={styles.cardTitle}>{title}</h4>
        <p className={styles.cardSubtitle}>{description}</p>
      </div>
      <div className={styles.footer}>
        {statusLabel ? (
          <span
            className={cn(
              styles.statusLabel,
              statusCompleted && styles.statusCompleted
            )}
          >
            {statusLabel}
          </span>
        ) : (
          <div className={styles.rating}>
            <Star
              className={styles.starIcon}
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
