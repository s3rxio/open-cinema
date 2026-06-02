"use client";

import { WatchPartyShell } from "@/features/watch-party/ui/WatchPartyShell";
import { MOVIE_BY_ID_QUERY } from "@/shared/api/operations/content";
import { routes } from "@/shared/lib/routes";
import { useQuery } from "@apollo/client/react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader } from "@open-cinema/ui";

function WatchPartyMovieContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const roomCode = searchParams.get("room");

  const movieQuery = useQuery(MOVIE_BY_ID_QUERY, {
    variables: { id },
    skip: !id
  });

  const movie = movieQuery.data?.movie;

  if (!id) {
    return (
      <WatchPartyShell
        backHref={routes.home}
        title=""
        contentId=""
        contentType="movie"
        roomCode={roomCode}
      />
    );
  }

  if (movieQuery.loading && !movie) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-white">
        <p>Фильм не найден</p>
      </div>
    );
  }

  return (
    <WatchPartyShell
      backHref={routes.watchMovie(id)}
      backLabel="К просмотру"
      title={movie.title}
      contentId={id}
      contentType="movie"
      roomCode={roomCode}
    />
  );
}

export default function WatchPartyMoviePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader size="lg" />
        </div>
      }
    >
      <WatchPartyMovieContent />
    </Suspense>
  );
}
