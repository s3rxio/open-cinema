"use client";

import { useQuery } from "@apollo/client/react";
import { Card, CardContent, CardHeader, CardTitle, Loader } from "@open-cinema/ui";
import { VideoPlayer } from "@/features/player/ui/VideoPlayer";
import { EpisodeSelector } from "@/features/player/ui/EpisodeSelector";
import { QUERIES } from "@/shared/api/queries";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Navbar } from "@/shared/ui/Navbar";

export default function SeriesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const seasonParam = searchParams.get("season") || "1";
  const episodeParam = searchParams.get("episode") || "1";

  const [selectedStreamId, setSelectedStreamId] = useState<string>("");

  const { data: seriesData, loading: seriesLoading } = useQuery<any>(
    QUERIES.seriesById,
    {
      variables: { id },
      skip: !id,
    }
  );

  const series = seriesData?.series;
  const seasons = series?.seasons || [];

  // Find the selected episode
  const selectedSeason = seasons.find(
    (s: any) => s.season === parseInt(seasonParam)
  );
  const selectedEpisode = selectedSeason?.episodes.find(
    (e: any) => e.episode === parseInt(episodeParam)
  );

  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Сериал не найден</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (seriesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Сериал не найден</p>
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
        {selectedEpisode ? (
          <div>
            <VideoPlayer streamId={selectedEpisode.streamId} />
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Выберите серию для просмотра
              </p>
            </CardContent>
          </Card>
        )}

        {/* Episode Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Выбор серии</CardTitle>
          </CardHeader>
          <CardContent>
            <EpisodeSelector
              seasons={seasons}
              onEpisodeChange={(episodeId) => {
                const episode = seasons
                  .flatMap((s: any) => s.episodes)
                  .find((e: any) => e.id === episodeId);
                if (episode) {
                  setSelectedStreamId(episode.streamId);
                }
              }}
              defaultSeason={parseInt(seasonParam)}
              defaultEpisode={parseInt(episodeParam)}
            />
          </CardContent>
        </Card>

        {/* Series Info */}
        <Card>
          <CardHeader>
            <CardTitle>{series.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{series.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Режиссёр:</span>
                <p className="text-muted-foreground">{series.director}</p>
              </div>
              <div>
                <span className="font-semibold">Жанр:</span>
                <p className="text-muted-foreground">{series.genre}</p>
              </div>
              <div>
                <span className="font-semibold">Дата выпуска:</span>
                <p className="text-muted-foreground">
                  {new Date(series.releaseDate).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div>
                <span className="font-semibold">Рейтинг:</span>
                <p className="text-muted-foreground">⭐ {series.rating}</p>
              </div>
            </div>

            {/* Current Episode Info */}
            {selectedEpisode && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold mb-2">
                  Сезон {selectedEpisode.season}, Серия {selectedEpisode.episode}:{" "}
                  {selectedEpisode.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedEpisode.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

