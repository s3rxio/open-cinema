"use client";

import { useQuery } from "@apollo/client/react";
import { Loader } from "@open-cinema/ui";
import { ContentDetail } from "@/features/content";
import { ReviewsSection } from "@/features/reviews";
import { Container } from "@/shared/ui/Container";
import { MOVIE_BY_ID_QUERY } from "@/entities/content";
import { routes } from "@/shared/lib/routes";
import { formatGenres } from "@/shared/lib/genres";
import { useParams } from "next/navigation";

export function MovieDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const movieQuery = useQuery(MOVIE_BY_ID_QUERY, {
    variables: { id },
    skip: !id
  });

  const movie = movieQuery.data?.movie;

  if (!id) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Фильм не найден</p>
      </div>
    );
  }

  if (movieQuery.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Фильм не найден</p>
      </div>
    );
  }

  const releaseDate = new Date(movie.releaseDate).toLocaleDateString("ru-RU");
  const userRatingLabel =
    movie.userRating != null
      ? `⭐ ${movie.userRating.toFixed(1)} (${movie.reviewCount ?? 0})`
      : "—";

  return (
    <>
      <ContentDetail
        title={movie.title}
        description={movie.description}
        posterUrl={movie.posterUrl}
        releaseDate={releaseDate}
        watchHref={routes.watchMovie(id)}
        meta={[
          { label: "Режиссёр", value: movie.director },
          { label: "Жанры", value: formatGenres(movie.genres) },
          { label: "Официальный рейтинг", value: `⭐ ${movie.rating}` },
          { label: "Рейтинг пользователей", value: userRatingLabel }
        ]}
      />
      <section className="pb-8">
        <Container>
          <ReviewsSection contentId={id} type="MOVIE" />
        </Container>
      </section>
    </>
  );
}
