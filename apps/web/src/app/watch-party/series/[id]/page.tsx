"use client";

import { groupEpisodesBySeason } from "@/features/player/lib/groupEpisodesBySeason";
import { WatchPartyShell } from "@/features/watch-party/ui/WatchPartyShell";
import { SERIES_BY_ID_QUERY } from "@/shared/api/operations/content";
import { routes } from "@/shared/lib/routes";
import { useQuery } from "@apollo/client/react";
import { Loader } from "@open-cinema/ui";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function WatchPartySeriesContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const roomCode = searchParams.get("room");
  const episodeIdFromUrl = searchParams.get("episode");

  const seriesQuery = useQuery(SERIES_BY_ID_QUERY, {
    variables: { id },
    skip: !id
  });

  const series = seriesQuery.data?.series;
  const seasons = useMemo(
    () => groupEpisodesBySeason(series?.episodes ?? []),
    [series?.episodes]
  );

  const defaultEpisode = seasons[0]?.episodes[0];
  const selectedEpisode = useMemo(() => {
    const episodes = series?.episodes ?? [];
    if (episodeIdFromUrl) {
      return episodes.find(ep => ep.id === episodeIdFromUrl) ?? defaultEpisode;
    }
    return defaultEpisode;
  }, [series?.episodes, episodeIdFromUrl, defaultEpisode]);

  const activeEpisodeId = episodeIdFromUrl ?? selectedEpisode?.id;

  if (!id) {
    return (
      <WatchPartyShell
        backHref={routes.home}
        title=""
        contentId=""
        contentType="episode"
        roomCode={roomCode}
      />
    );
  }

  if (seriesQuery.loading && !series) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!series || !activeEpisodeId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-white">
        <p>{!series ? "Сериал не найден" : "Эпизоды пока не добавлены"}</p>
      </div>
    );
  }

  const playerTitle = selectedEpisode
    ? `${series.title} · S${selectedEpisode.season}E${selectedEpisode.episode}`
    : series.title;

  return (
    <WatchPartyShell
      backHref={routes.watchSeries(id, activeEpisodeId)}
      backLabel="К просмотру"
      title={playerTitle}
      contentId={activeEpisodeId}
      contentType="episode"
      roomCode={roomCode}
    />
  );
}

export default function WatchPartySeriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader size="lg" />
        </div>
      }
    >
      <WatchPartySeriesContent />
    </Suspense>
  );
}
