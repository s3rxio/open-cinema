"use client";

import { useQuery } from "@apollo/client/react";
import { Card, CardContent, CardHeader, CardTitle, Loader } from "@open-cinema/ui";
import { VideoPlayer } from "@/features/player/ui/VideoPlayer";
import { QUERIES } from "@/shared/api/queries";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/shared/ui/Navbar";

export default function MoviePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: movieData, loading: movieLoading } = useQuery<any>(
    QUERIES.movieById,
    {
      variables: { id },
      skip: !id,
    }
  );

  const movie = movieData?.movie;

  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Фильм не найден</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (movieLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Фильм не найден</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar showLogo={true} showNav={true} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Link href="/" className="text-primary hover:underline inline-block">
          ← Назад в каталог
        </Link>

        {/* Video Player */}
        <div>
          <VideoPlayer streamId={movie.streamId} />
        </div>

        {/* Movie Info */}
        <Card>
          <CardHeader>
            <CardTitle>{movie.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{movie.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Режиссёр:</span>
                <p className="text-muted-foreground">{movie.director}</p>
              </div>
              <div>
                <span className="font-semibold">Жанр:</span>
                <p className="text-muted-foreground">{movie.genre}</p>
              </div>
              <div>
                <span className="font-semibold">Дата выпуска:</span>
                <p className="text-muted-foreground">
                  {new Date(movie.releaseDate).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div>
                <span className="font-semibold">Рейтинг:</span>
                <p className="text-muted-foreground">⭐ {movie.rating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


