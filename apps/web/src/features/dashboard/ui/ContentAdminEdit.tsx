"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";
import { Loader, Tabs, TabsContent, TabsList, TabsTrigger } from "@open-cinema/ui";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import {
  DASHBOARD_MOVIES_QUERY,
  DASHBOARD_SERIES_LIST_QUERY,
  REMOVE_MOVIE_MUTATION,
  REMOVE_SERIES_MUTATION,
  UPDATE_MOVIE_MUTATION,
  UPDATE_SERIES_MUTATION
} from "@/shared/api/operations/dashboard";
import { AdminDeleteButton } from "./AdminDeleteButton";
import { SeriesEpisodesPanel } from "./SeriesEpisodesPanel";
import { MOVIE_BY_ID_QUERY, SERIES_BY_ID_QUERY } from "@/shared/api/operations/content";
import {
  ContentEditForm,
  type ContentFormValues
} from "./ContentEditForm";
import { StreamPlayerPanel } from "./StreamPlayerPanel";
import { ContentImageUpload } from "./ContentImageUpload";
type ContentAdminEditProps = {
  kind: "movie" | "series";
  id: string;
  backHref: string;
};

export function ContentAdminEdit({ kind, id, backHref }: ContentAdminEditProps) {
  if (kind === "movie") {
    return <MovieAdminEdit id={id} backHref={backHref} />;
  }

  return <SeriesAdminEdit id={id} backHref={backHref} />;
}

function MovieAdminEdit({ id, backHref }: { id: string; backHref: string }) {
  const detailQuery = useQuery(MOVIE_BY_ID_QUERY, { variables: { id } });
  const [updateMovie, updateMovieState] = useMutation(UPDATE_MOVIE_MUTATION);
  const [removeMovie] = useMutation(REMOVE_MOVIE_MUTATION);
  const [status, setStatus] = useState<string | null>(null);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  const movie = detailQuery.data?.movie;
  const effectiveStreamId = streamId ?? movie?.streamId ?? null;

  if (detailQuery.loading) {
    return <LoadingState />;
  }

  if (!movie) {
    return <ErrorState error={detailQuery.error} fallback="Фильм не найден" />;
  }

  return (
    <ContentAdminShell
      title={movie.title}
      backHref={backHref}
      deleteAction={
        <AdminDeleteButton
          label="Удалить фильм"
          confirmMessage={`Удалить фильм «${movie.title}»?`}
          redirectTo="/dashboard/movies"
          refetchQueries={[DASHBOARD_MOVIES_QUERY]}
          onDelete={() => removeMovie({ variables: { id } })}
        />
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="player">Плеер</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <ContentEditForm
            key={movie.id}
            initial={toFormValues(movie)}
            saving={updateMovieState.loading}
            onSubmit={async values => {
              setStatus(null);
              try {
                await updateMovie({
                  variables: {
                    updateMovieInput: buildUpdateInput(id, values)
                  }
                });
                setStatus("Сохранено");
                await detailQuery.refetch();
              } catch (error) {
                setStatus(getApolloErrorMessage(error));
              }
            }}
          />
          {status ? <StatusMessage message={status} /> : null}
          <ContentImageUpload
            contentId={id}
            posterUrl={movie.posterUrl}
            bannerUrl={movie.bannerUrl}
            onUploaded={() => detailQuery.refetch()}
          />
        </TabsContent>

        <TabsContent value="player" className="mt-6">
          <StreamPlayerPanel
            contentId={id}
            streamId={effectiveStreamId}
            pollingEnabled={activeTab === "player"}
            onStreamCreated={newStreamId => {
              setStreamId(newStreamId);
              void detailQuery.refetch();
            }}
          />
        </TabsContent>
      </Tabs>
    </ContentAdminShell>
  );
}

function SeriesAdminEdit({ id, backHref }: { id: string; backHref: string }) {
  const detailQuery = useQuery(SERIES_BY_ID_QUERY, { variables: { id } });
  const [updateSeries, updateSeriesState] = useMutation(UPDATE_SERIES_MUTATION);
  const [removeSeries] = useMutation(REMOVE_SERIES_MUTATION);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    null
  );
  const [selectedEpisodeStreamId, setSelectedEpisodeStreamId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState("info");

  const series = detailQuery.data?.series;
  const episodes = series?.episodes ?? [];

  if (detailQuery.loading) {
    return <LoadingState />;
  }

  if (!series) {
    return <ErrorState error={detailQuery.error} fallback="Сериал не найден" />;
  }

  return (
    <ContentAdminShell
      title={series.title}
      backHref={backHref}
      deleteAction={
        <AdminDeleteButton
          label="Удалить сериал"
          confirmMessage={`Удалить сериал «${series.title}»?`}
          redirectTo="/dashboard/series"
          refetchQueries={[DASHBOARD_SERIES_LIST_QUERY]}
          onDelete={() => removeSeries({ variables: { id } })}
        />
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="episodes">Эпизоды</TabsTrigger>
          <TabsTrigger value="player">Плеер</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <ContentEditForm
            key={series.id}
            initial={toFormValues(series)}
            saving={updateSeriesState.loading}
            onSubmit={async values => {
              setStatus(null);
              try {
                await updateSeries({
                  variables: {
                    updateSeriesInput: buildUpdateInput(id, values)
                  }
                });
                setStatus("Сохранено");
                await detailQuery.refetch();
              } catch (error) {
                setStatus(getApolloErrorMessage(error));
              }
            }}
          />
          {status ? <StatusMessage message={status} /> : null}
          <ContentImageUpload
            contentId={id}
            posterUrl={series.posterUrl}
            bannerUrl={series.bannerUrl}
            onUploaded={() => detailQuery.refetch()}
          />
        </TabsContent>

        <TabsContent value="episodes" className="mt-6">
          <SeriesEpisodesPanel
            seriesId={id}
            seriesTitle={series.title}
            episodes={episodes}
            onChanged={() => detailQuery.refetch()}
          />
        </TabsContent>

        <TabsContent value="player" className="mt-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="episode" className="text-sm font-medium">
              Эпизод для управления стримом
            </label>
            <select
              id="episode"
              className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedEpisodeId ?? ""}
              onChange={event => {
                const episodeId = event.target.value;
                setSelectedEpisodeId(episodeId || null);
                const episode = episodes.find(ep => ep.id === episodeId);
                setSelectedEpisodeStreamId(episode?.streamId ?? null);
              }}
            >
              <option value="">Выберите эпизод</option>
              {episodes.map(episode => (
                <option key={episode.id} value={episode.id}>
                  S{episode.season}E{episode.episode} — {episode.title}
                </option>
              ))}
            </select>
            {episodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                У сериала нет эпизодов
              </p>
            ) : null}
          </div>

          {!selectedEpisodeId ? (
            <p className="text-sm text-muted-foreground">
              Выберите эпизод, чтобы загружать медиа и управлять дорожками
            </p>
          ) : (
            <StreamPlayerPanel
              contentId={selectedEpisodeId}
              streamId={selectedEpisodeStreamId}
              pollingEnabled={activeTab === "player"}
              onStreamCreated={newStreamId => {
                setSelectedEpisodeStreamId(newStreamId);
                void detailQuery.refetch();
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </ContentAdminShell>
  );
}

function ContentAdminShell({
  title,
  backHref,
  deleteAction,
  children
}: {
  title: string;
  backHref: string;
  deleteAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={backHref}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Назад к списку
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
        {deleteAction}
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-16">
      <Loader />
    </div>
  );
}

function ErrorState({
  error,
  fallback
}: {
  error: unknown;
  fallback: string;
}) {
  return (
    <p className="text-destructive">
      {error ? getApolloErrorMessage(error) : fallback}
    </p>
  );
}

function StatusMessage({ message }: { message: string }) {
  return <p className="mt-4 text-sm text-muted-foreground">{message}</p>;
}

function toFormValues(item: {
  title: string;
  description: string;
  director: string;
  genres: string[];
  releaseDate: string;
  rating: number;
}): ContentFormValues {
  return {
    title: item.title,
    description: item.description,
    director: item.director,
    genres: item.genres as ContentFormValues["genres"],
    releaseDate: item.releaseDate,
    rating: String(item.rating)
  };
}

function buildUpdateInput(id: string, values: ContentFormValues) {
  return {
    id,
    title: values.title,
    description: values.description,
    director: values.director,
    genres: values.genres,
    releaseDate: new Date(values.releaseDate).toISOString(),
    rating: Number(values.rating)
  };
}
