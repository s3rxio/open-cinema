"use client";

import { useState } from "react";
import { Button, Input, Label, Textarea } from "@open-cinema/ui";

export type ContentFormValues = {
  title: string;
  description: string;
  director: string;
  genre: string;
  releaseDate: string;
  rating: string;
};

type ContentEditFormProps = {
  initial: ContentFormValues;
  saving?: boolean;
  submitLabel?: string;
  onSubmit: (values: ContentFormValues) => Promise<void>;
};

export function ContentEditForm({
  initial,
  saving,
  submitLabel = "Сохранить",
  onSubmit
}: ContentEditFormProps) {
  const [values, setValues] = useState(initial);

  const update = (field: keyof ContentFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form
      className="grid max-w-2xl gap-4"
      onSubmit={async event => {
        event.preventDefault();
        await onSubmit(values);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="title">Название</Label>
        <Input
          id="title"
          value={values.title}
          onChange={event => update("title", event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={event => update("description", event.target.value)}
          rows={5}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="director">Режиссёр</Label>
          <Input
            id="director"
            value={values.director}
            onChange={event => update("director", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genre">Жанр</Label>
          <Input
            id="genre"
            value={values.genre}
            onChange={event => update("genre", event.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="releaseDate">Дата выхода</Label>
          <Input
            id="releaseDate"
            type="date"
            value={values.releaseDate.slice(0, 10)}
            onChange={event => update("releaseDate", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Рейтинг (0–10)</Label>
          <Input
            id="rating"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={values.rating}
            onChange={event => update("rating", event.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Сохранение…" : submitLabel}
      </Button>
    </form>
  );
}
