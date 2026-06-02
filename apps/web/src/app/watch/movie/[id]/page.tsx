"use client";

import { useQuery } from "@apollo/client/react";
import { FullscreenPlayer } from "@/features/player/ui/FullscreenPlayer";
import { MOVIE_BY_ID_QUERY } from "@/shared/api/operations/content";
import { routes } from "@/shared/lib/routes";
import { useParams } from "next/navigation";

export default function WatchMoviePage() {
  const params = useParams();
  const id = params.id as string;

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
      notFoundMessage={!movieQuery.loading && !movie ? "Фильм не найден" : undefined}
    />
  );
}
