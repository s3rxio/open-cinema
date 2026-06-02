"use client";

import { useMutation } from "@apollo/client/react";
import { useMemo, useState } from "react";
import { Button, Input, Label } from "@open-cinema/ui";
import type { SeriesEpisode } from "@/shared/api/operation-types";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import {
  CREATE_EPISODE_MUTATION,
  CREATE_EPISODES_BULK_MUTATION,
  REMOVE_EPISODE_MUTATION
} from "@/shared/api/operations/dashboard";
import { toReleaseDateIso, type EpisodeFormValues } from "../lib/episodeForm";
import { EpisodeEditDialog } from "./EpisodeEditDialog";
import { EpisodeFormFields } from "./EpisodeFormFields";

type SeriesEpisodesPanelProps = {
  seriesId: string;
  seriesTitle: string;
  episodes: SeriesEpisode[];
  onChanged: () => void | Promise<unknown>;
};

function getNextSeason(episodes: SeriesEpisode[]) {
  if (episodes.length === 0) return 1;
  return Math.max(...episodes.map(ep => ep.season)) + 1;
}

function getNextEpisodeInSeason(episodes: SeriesEpisode[], season: number) {
  const inSeason = episodes.filter(ep => ep.season === season);
  if (inSeason.length === 0) return 1;
  return Math.max(...inSeason.map(ep => ep.episode)) + 1;
}

function buildDefaultFormValues(
  episodes: SeriesEpisode[],
  season?: number
): EpisodeFormValues {
  const targetSeason = season ?? getNextSeason(episodes);
  const episodeNumber = getNextEpisodeInSeason(episodes, targetSeason);

  return {
    season: String(targetSeason),
    episode: String(episodeNumber),
    title: `Сезон ${targetSeason}, эпизод ${episodeNumber}`,
    description: "",
    releaseDate: new Date().toISOString().slice(0, 10),
    rating: "0"
  };
}

export function SeriesEpisodesPanel({
  seriesId,
  seriesTitle,
  episodes,
  onChanged
}: SeriesEpisodesPanelProps) {
  const [createEpisode, createState] = useMutation(CREATE_EPISODE_MUTATION);
  const [createEpisodesBulk, bulkCreateState] = useMutation(
    CREATE_EPISODES_BULK_MUTATION
  );
  const [removeEpisode, removeState] = useMutation(REMOVE_EPISODE_MUTATION);
  const [form, setForm] = useState<EpisodeFormValues>(() =>
    buildDefaultFormValues(episodes)
  );
  const [bulkSeason, setBulkSeason] = useState(() =>
    String(getNextSeason(episodes))
  );
  const [bulkCount, setBulkCount] = useState("10");
  const [status, setStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<SeriesEpisode | null>(
    null
  );

  const seasons = useMemo(() => {
    const map = new Map<number, SeriesEpisode[]>();

    for (const ep of episodes) {
      const list = map.get(ep.season) ?? [];
      list.push(ep);
      map.set(ep.season, list);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([season, items]) => ({
        season,
        items: items.sort((a, b) => a.episode - b.episode)
      }));
  }, [episodes]);

  const updateForm = (field: keyof EpisodeFormValues, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const submitEpisode = async (values: EpisodeFormValues) => {
    const season = Number(values.season);
    const episodeNumber = Number(values.episode);

    await createEpisode({
      variables: {
        createEpisodeInput: {
          seriesId,
          title: values.title.trim(),
          description: values.description.trim(),
          releaseDate: toReleaseDateIso(values.releaseDate),
          rating: Number(values.rating),
          season,
          episode: episodeNumber
        }
      }
    });
    await onChanged();

    const nextEpisode = episodeNumber + 1;
    setForm({
      season: String(season),
      episode: String(nextEpisode),
      title: `Сезон ${season}, эпизод ${nextEpisode}`,
      description: values.description,
      releaseDate: values.releaseDate,
      rating: values.rating
    });
  };

  const handleCreateEpisode = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    try {
      await submitEpisode(form);
      setStatus("Эпизод создан");
    } catch (error) {
      setStatus(getApolloErrorMessage(error));
    }
  };

  const handleCreateSeason = async () => {
    setStatus(null);
    const season = Number(bulkSeason);
    const count = Number(bulkCount);

    if (!Number.isInteger(season) || season < 1) {
      setStatus("Укажите корректный номер сезона");
      return;
    }

    if (!Number.isInteger(count) || count < 1 || count > 50) {
      setStatus("Количество эпизодов: от 1 до 50");
      return;
    }

    try {
      await createEpisodesBulk({
        variables: {
          createEpisodesBulkInput: {
            seriesId,
            season,
            count,
            description: "",
            releaseDate: new Date().toISOString(),
            rating: 0,
            titlePrefix: seriesTitle
          }
        }
      });
      await onChanged();
      setForm(buildDefaultFormValues(episodes, season + 1));
      setBulkSeason(String(season + 1));
      setStatus(`Сезон ${season}: создано ${count} эпизодов`);
    } catch (error) {
      setStatus(getApolloErrorMessage(error));
    }
  };

  const handleDeleteEpisode = async (episode: SeriesEpisode) => {
    if (
      !window.confirm(
        `Удалить S${episode.season}E${episode.episode} «${episode.title}»?`
      )
    ) {
      return;
    }

    setDeletingId(episode.id);
    setStatus(null);
    try {
      await removeEpisode({ variables: { id: episode.id } });
      await onChanged();
      setStatus("Эпизод удалён");
    } catch (error) {
      setStatus(getApolloErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const busy = createState.loading || bulkCreateState.loading || removeState.loading;

  return (
    <div className="space-y-8">
      <EpisodeEditDialog
        open={editingEpisode !== null}
        episode={editingEpisode}
        seriesId={seriesId}
        onOpenChange={open => {
          if (!open) {
            setEditingEpisode(null);
          }
        }}
        onSaved={async () => {
          await onChanged();
          setStatus("Эпизод сохранён");
        }}
      />

      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="font-medium">Создать сезон (пакетно)</h3>
        <p className="text-sm text-muted-foreground">
          Создаёт несколько эпизодов с номерами 1…N для выбранного сезона.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="bulk-season">Сезон</Label>
            <Input
              id="bulk-season"
              type="number"
              min={1}
              className="w-24"
              value={bulkSeason}
              onChange={e => setBulkSeason(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bulk-count">Эпизодов</Label>
            <Input
              id="bulk-count"
              type="number"
              min={1}
              max={50}
              className="w-24"
              value={bulkCount}
              onChange={e => setBulkCount(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={handleCreateSeason}
          >
            {bulkCreateState.loading ? "Создание…" : "Создать сезон"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => {
              const next = getNextSeason(episodes);
              setBulkSeason(String(next));
              setForm(buildDefaultFormValues(episodes, next));
            }}
          >
            Следующий сезон
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="font-medium">Добавить эпизод</h3>
        <form className="grid max-w-2xl gap-4" onSubmit={handleCreateEpisode}>
          <EpisodeFormFields
            form={form}
            onChange={updateForm}
            idPrefix="create-ep"
          />
          <Button type="submit" disabled={busy}>
            {createState.loading ? "Создание…" : "Добавить эпизод"}
          </Button>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="font-medium">Эпизоды по сезонам</h3>
        {seasons.length === 0 ? (
          <p className="text-sm text-muted-foreground">Эпизодов пока нет</p>
        ) : (
          seasons.map(({ season, items }) => (
            <div key={season} className="rounded-lg border">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2">
                <span className="font-medium">Сезон {season}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setForm(buildDefaultFormValues(episodes, season))}
                >
                  + Эпизод в сезон {season}
                </Button>
              </div>
              <ul className="divide-y">
                {items.map(item => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">
                        E{item.episode} — {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Рейтинг {item.rating.toFixed(1)}
                        {item.streamId ? " · есть стрим" : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => setEditingEpisode(item)}
                      >
                        Изменить
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={deletingId === item.id}
                        onClick={() => handleDeleteEpisode(item)}
                      >
                        {deletingId === item.id ? "…" : "Удалить"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
