"use client";

import { useQuery } from "@apollo/client/react";
import { Loader } from "@open-cinema/ui";
import { ContentDetail } from "@/features/content/ui/ContentDetail";
import { MOVIE_BY_ID_QUERY } from "@/shared/api/operations/content";
import { routes } from "@/shared/lib/routes";
import { useParams } from "next/navigation";

export default function MoviePage() {
  const params = useParams();
  const id = params.id as string;

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

  return (
    <ContentDetail
      title={movie.title}
      description={movie.description}
      posterUrl={movie.posterUrl}
      releaseDate={releaseDate}
      watchHref={routes.watchMovie(id)}
      meta={[
        { label: "Режиссёр", value: movie.director },
        { label: "Жанр", value: movie.genre },
        { label: "Рейтинг", value: `⭐ ${movie.rating}` }
      ]}
    />
  );
}
