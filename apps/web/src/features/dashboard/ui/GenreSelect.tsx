"use client";

import { cn } from "@open-cinema/ui";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  formatGenres,
  GENRE_LABELS,
  GENRE_VALUES,
  type Genre
} from "@/shared/lib/genres";

type GenreSelectProps = {
  value: Genre[];
  onChange: (genres: Genre[]) => void;
  id?: string;
};

export function GenreSelect({ value, onChange, id }: GenreSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleGenre = (genre: Genre) => {
    onChange(
      value.includes(genre)
        ? value.filter(item => item !== genre)
        : [...value, genre]
    );
  };

  const label = value.length > 0 ? formatGenres(value) : "Выберите жанры";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          value.length === 0 && "text-muted-foreground"
        )}
      >
        <span className="line-clamp-1 text-left">{label}</span>
        <ChevronDown className="size-4 shrink-0 opacity-70" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {GENRE_VALUES.map(genre => (
            <label
              key={genre}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <input
                type="checkbox"
                checked={value.includes(genre)}
                onChange={() => toggleGenre(genre)}
                className="size-4"
              />
              <span>{GENRE_LABELS[genre]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
