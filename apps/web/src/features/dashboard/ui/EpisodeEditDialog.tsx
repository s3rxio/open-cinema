"use client";

import { useMutation } from "@apollo/client/react";
import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@open-cinema/ui";
import type { SeriesEpisode } from "@/shared/api/operation-types";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import { UPDATE_EPISODE_MUTATION } from "@/shared/api/operations/dashboard";
import {
  episodeToFormValues,
  toReleaseDateIso,
  type EpisodeFormValues
} from "../lib/episodeForm";
import { EpisodeFormFields } from "./EpisodeFormFields";

type EpisodeEditDialogProps = {
  open: boolean;
  episode: SeriesEpisode | null;
  seriesId: string;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<unknown>;
};

export function EpisodeEditDialog({
  open,
  episode,
  seriesId,
  onOpenChange,
  onSaved
}: EpisodeEditDialogProps) {
  const [updateEpisode, updateState] = useMutation(UPDATE_EPISODE_MUTATION);
  const [form, setForm] = useState<EpisodeFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && episode) {
      setForm(episodeToFormValues(episode));
      setError(null);
    }
  }, [open, episode]);

  const updateForm = (field: keyof EpisodeFormValues, value: string) => {
    setForm(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!episode || !form) {
      return;
    }

    setError(null);
    try {
      await updateEpisode({
        variables: {
          updateEpisodeInput: {
            id: episode.id,
            seriesId,
            title: form.title.trim(),
            description: form.description.trim(),
            releaseDate: toReleaseDateIso(form.releaseDate),
            rating: Number(form.rating),
            season: Number(form.season),
            episode: Number(form.episode)
          }
        }
      });
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(getApolloErrorMessage(err));
    }
  };

  const title =
    episode != null
      ? `S${episode.season}E${episode.episode} — ${episode.title}`
      : "Редактирование эпизода";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактировать эпизод</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        {form ? (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <EpisodeFormFields
              form={form}
              onChange={updateForm}
              idPrefix="edit-ep"
            />
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={updateState.loading}
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={updateState.loading}>
                {updateState.loading ? "Сохранение…" : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
