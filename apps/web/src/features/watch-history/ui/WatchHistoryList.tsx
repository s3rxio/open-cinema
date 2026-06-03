"use client";

import Link from "next/link";
import { Card, CardContent, Loader } from "@open-cinema/ui";
import { ContentCard, contentCardStyles } from "@/shared/ui/ContentCard";
import { formatTime } from "@/features/player/ui/PlayerProgressBar";
import { useAuth } from "@/shared/auth/AuthContext";
import { routes } from "@/shared/lib/routes";
import type { ContentType } from "@/shared/api/operation-types";
import {
  useWatchHistoryStore,
  type WatchHistoryEntry
} from "@/shared/state/useWatchHistoryStore";

function getProgressPercent(entry: WatchHistoryEntry) {
  if (entry.completed) return 100;
  if (!entry.duration || entry.duration <= 0) return 0;
  return Math.min(100, Math.round((entry.progress / entry.duration) * 100));
}

function getStatusLabel(entry: WatchHistoryEntry) {
  if (entry.completed) return "Просмотрено";

  const progressLabel =
    entry.duration && entry.duration > 0
      ? `${formatTime(entry.progress)} / ${formatTime(entry.duration)}`
      : formatTime(entry.progress);

  return `Продолжить · ${progressLabel}`;
}

function historyEntryToCardProps(entry: WatchHistoryEntry) {
  const progressPercent = getProgressPercent(entry);
  const statusLabel = getStatusLabel(entry);

  if (entry.movie) {
    return {
      key: entry.id,
      id: entry.movie.id,
      title: entry.movie.title,
      description: entry.movie.description,
      rating: entry.movie.rating ?? 0,
      type: "MOVIE" as ContentType,
      genres: [] as const,
      posterUrl: entry.movie.posterUrl,
      releaseDate: entry.movie.releaseDate ?? "",
      href: routes.watchMovie(entry.movie.id),
      progressPercent: entry.completed ? undefined : progressPercent,
      statusLabel,
      statusCompleted: entry.completed,
      fluid: true
    };
  }

  if (entry.episode) {
    return {
      key: entry.id,
      id: entry.episode.seriesId,
      title: entry.episode.title,
      description: `S${entry.episode.season}E${entry.episode.episode} · ${entry.episode.description}`,
      rating: 0,
      type: "SERIES" as ContentType,
      genres: [] as const,
      posterUrl: entry.episode.posterUrl ?? null,
      releaseDate: "",
      href: routes.watchSeries(entry.episode.seriesId, entry.episode.id),
      progressPercent: entry.completed ? undefined : progressPercent,
      statusLabel,
      statusCompleted: entry.completed,
      fluid: true
    };
  }

  return null;
}

export function WatchHistoryList() {
  const { isAuthenticated, isUserLoaded } = useAuth();
  const items = useWatchHistoryStore(state => state.entries);

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline">
              Войдите
            </Link>
            , чтобы сохранять историю просмотров
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isUserLoaded) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Вы ещё ничего не смотрели. Начните с каталога — прогресс сохранится
            автоматически.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={contentCardStyles.grid}>
      {items.map(entry => {
        const props = historyEntryToCardProps(entry);
        if (!props) return null;
        const { key, ...cardProps } = props;
        return <ContentCard key={key} {...cardProps} />;
      })}
    </div>
  );
}
