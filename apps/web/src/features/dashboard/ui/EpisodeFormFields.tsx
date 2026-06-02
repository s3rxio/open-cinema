import { Input, Label, Textarea } from "@open-cinema/ui";
import type { EpisodeFormValues } from "../lib/episodeForm";

type EpisodeFormFieldsProps = {
  form: EpisodeFormValues;
  onChange: (field: keyof EpisodeFormValues, value: string) => void;
  idPrefix: string;
};

export function EpisodeFormFields({
  form,
  onChange,
  idPrefix
}: EpisodeFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-season`}>Сезон</Label>
          <Input
            id={`${idPrefix}-season`}
            type="number"
            min={1}
            required
            value={form.season}
            onChange={e => onChange("season", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-episode`}>Эпизод</Label>
          <Input
            id={`${idPrefix}-episode`}
            type="number"
            min={1}
            required
            value={form.episode}
            onChange={e => onChange("episode", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-title`}>Название</Label>
        <Input
          id={`${idPrefix}-title`}
          required
          value={form.title}
          onChange={e => onChange("title", e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-description`}>Описание</Label>
        <Textarea
          id={`${idPrefix}-description`}
          rows={3}
          value={form.description}
          onChange={e => onChange("description", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-date`}>Дата выхода</Label>
          <Input
            id={`${idPrefix}-date`}
            type="date"
            required
            value={form.releaseDate}
            onChange={e => onChange("releaseDate", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-rating`}>Рейтинг</Label>
          <Input
            id={`${idPrefix}-rating`}
            type="number"
            min={0}
            max={10}
            step={0.1}
            required
            value={form.rating}
            onChange={e => onChange("rating", e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
