"use client";

import { useQuery } from "@apollo/client/react";
import { FullscreenPlayer } from "@/features/player";
import { MOVIE_BY_ID_QUERY } from "@/entities/content";
import { routes } from "@/shared/lib/routes";
import { useParams } from "next/navigation";

export function WatchMoviePage() {
  const params = useParams();
  const id = params?.id as string;

  const movieQuery = useQuery(MOVIE_BY_ID_QUERY, {
    variables: { id },
    skip: !id
  });

  const movie = movieQuery.data?.movie;

  if (!id) {
    return (
      <FullscreenPlayer
        backHref={routes.home}
        title=""
        notFoundMessage="Фильм не найден"
      />
    );
  }

  return (
    <FullscreenPlayer
      backHref={routes.movie(id)}
      backLabel="К фильму"
      title={movie?.title ?? "Загрузка…"}
      contentId={id}
      movieId={id}
      watchPartyHref={routes.watchPartyMovie(id)}
      notFoundMessage={
        !movieQuery.loading && !movie ? "Фильм не найден" : undefined
      }
    />
  );
}
