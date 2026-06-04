"use client";

import { useQuery } from "@apollo/client/react";
import { Loader } from "@open-cinema/ui";
import { ContentDetail } from "@/features/content/ui/ContentDetail";
import { ReviewsSection } from "@/features/reviews/ui/ReviewsSection";
import { EpisodeList } from "@/features/content/ui/EpisodeList";
import { Container } from "@/shared/ui/Container";
import { groupEpisodesBySeason } from "@/features/player/lib/groupEpisodesBySeason";
import { SERIES_BY_ID_QUERY } from "@/shared/api/operations/content";
import { routes } from "@/shared/lib/routes";
import { formatGenres } from "@/shared/lib/genres";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function SeriesPage() {
  const params = useParams();
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
  const firstEpisode = seasons[0]?.episodes[0];

  if (!id) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-muted-foreground">Сериал не найден</p>
      </div>
    );
  }

  if (seriesQuery.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-center text-muted-foreground">Сериал не найден</p>
      </div>
    );
  }

  const releaseDate = new Date(series.releaseDate).toLocaleDateString("ru-RU");
  const userRatingLabel =
    series.userRating != null
      ? `⭐ ${series.userRating.toFixed(1)} (${series.reviewCount ?? 0})`
      : "—";

  return (
    <>
      <ContentDetail
        title={series.title}
        description={series.description}
        posterUrl={series.posterUrl}
        releaseDate={releaseDate}
        watchHref={
          firstEpisode
            ? routes.watchSeries(id, firstEpisode.id)
            : routes.watchSeries(id)
        }
        watchDisabled={!firstEpisode}
        meta={[
          { label: "Режиссёр", value: series.director },
          { label: "Жанры", value: formatGenres(series.genres) },
          { label: "Официальный рейтинг", value: `⭐ ${series.rating}` },
          { label: "Рейтинг пользователей", value: userRatingLabel }
        ]}
      >
        {seasons.length > 0 ? (
          <EpisodeList seriesId={id} seasons={seasons} />
        ) : (
          <p className="text-center text-muted-foreground">
            Эпизоды пока не добавлены
          </p>
        )}
      </ContentDetail>
      <section className="pb-8">
        <Container>
          <ReviewsSection contentId={id} type="SERIES" />
        </Container>
      </section>
    </>
  );
}
