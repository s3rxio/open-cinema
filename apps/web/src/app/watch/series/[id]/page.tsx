"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { Loader } from "@open-cinema/ui";
import { groupEpisodesBySeason } from "@/features/player/lib/groupEpisodesBySeason";
import { FullscreenPlayer } from "@/features/player/ui/FullscreenPlayer";
import { SERIES_BY_ID_QUERY } from "@/shared/api/operations/content";
import { routes } from "@/shared/lib/routes";
import { useParams, useRouter, useSearchParams } from "next/navigation";

function WatchSeriesContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

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
  const episodeIdFromUrl = searchParams.get("episode");

  const selectedEpisode = useMemo(() => {
    const episodes = series?.episodes ?? [];
    if (episodeIdFromUrl) {
      return episodes.find(ep => ep.id === episodeIdFromUrl) ?? defaultEpisode;
    }
    return defaultEpisode;
  }, [series?.episodes, episodeIdFromUrl, defaultEpisode]);

  const handleEpisodeChange = useCallback(
    (nextEpisodeId: string) => {
      router.replace(routes.watchSeries(id, nextEpisodeId), { scroll: false });
    },
    [id, router]
  );

  const activeEpisodeId = episodeIdFromUrl ?? selectedEpisode?.id;

  if (!id) {
    return (
      <FullscreenPlayer
        backHref={routes.home}
        title=""
        notFoundMessage="Сериал не найден"
      />
    );
  }

  const playerTitle = selectedEpisode
    ? `${series?.title ?? ""} · S${selectedEpisode.season}E${selectedEpisode.episode}`
    : (series?.title ?? "");

  return (
    <FullscreenPlayer
      backHref={routes.series(id)}
      backLabel="К сериалу"
      title={playerTitle || "Загрузка…"}
      contentId={activeEpisodeId}
      seasons={seasons}
      selectedSeason={selectedEpisode?.season}
      selectedEpisodeId={selectedEpisode?.id}
      onEpisodeChange={handleEpisodeChange}
      loading={seriesQuery.loading && !activeEpisodeId}
      notFoundMessage={
        !seriesQuery.loading && !series
          ? "Сериал не найден"
          : !seriesQuery.loading && series && !selectedEpisode
            ? "Эпизоды пока не добавлены"
            : undefined
      }
    />
  );
}

export default function WatchSeriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader size="lg" />
        </div>
      }
    >
      <WatchSeriesContent />
    </Suspense>
  );
}
