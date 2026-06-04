"use client";

import { useState } from "react";
import { Button, Label, cn } from "@open-cinema/ui";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@open-cinema/ui";
import { GENRE_LABELS, GENRE_VALUES } from "@/shared/lib/genres";
import {
  DEFAULT_CATALOG_FILTERS,
  type CatalogFilters
} from "../lib/catalog-filters";

type CatalogFiltersProps = {
  filters: CatalogFilters;
  onChange: (patch: Partial<CatalogFilters>) => void;
  onReset: () => void;
};

export function CatalogFiltersPanel({
  filters,
  onChange,
  onReset
}: CatalogFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <Button
        type="button"
        variant="outline"
        className="mb-3 w-full justify-between lg:hidden"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(open => !open)}
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Фильтры
        </span>
        <span className="text-xs text-muted-foreground">
          {mobileOpen ? "Скрыть" : "Показать"}
        </span>
      </Button>

      <div
        className={cn(
          "sticky top-20 space-y-6 rounded-lg border border-border bg-card p-4 max-md:top-[4.5rem] lg:top-24",
          mobileOpen ? "block" : "hidden lg:block"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Фильтры</h2>
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            Сбросить
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="catalog-type">Тип</Label>
          <Select
            value={filters.contentType || "all"}
            onValueChange={value =>
              onChange({
                contentType:
                  value === "all"
                    ? ""
                    : (value as CatalogFilters["contentType"])
              })
            }
          >
            <SelectTrigger id="catalog-type" className="w-full">
              <SelectValue placeholder="Все" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="MOVIE">Фильмы</SelectItem>
              <SelectItem value="SERIES">Сериалы</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="catalog-genre">Жанр</Label>
          <Select
            value={filters.genre || "all"}
            onValueChange={value =>
              onChange({
                genre: value === "all" ? "" : (value as CatalogFilters["genre"])
              })
            }
          >
            <SelectTrigger id="catalog-genre" className="w-full">
              <SelectValue placeholder="Все жанры" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все жанры</SelectItem>
              {GENRE_VALUES.map(genre => (
                <SelectItem key={genre} value={genre}>
                  {GENRE_LABELS[genre]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Рейтинг</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">От</span>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={filters.minRating}
                onChange={e =>
                  onChange({
                    minRating: Math.min(
                      10,
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">До</span>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={filters.maxRating}
                onChange={e =>
                  onChange({
                    maxRating: Math.min(
                      10,
                      Math.max(0, Number(e.target.value) || 10)
                    )
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="catalog-sort">Сортировка</Label>
          <Select
            value={filters.sortBy}
            onValueChange={value =>
              onChange({ sortBy: value as CatalogFilters["sortBy"] })
            }
          >
            <SelectTrigger id="catalog-sort" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">По названию</SelectItem>
              <SelectItem value="releaseDate">По дате выхода</SelectItem>
              <SelectItem value="rating">По рейтингу</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="catalog-sort-order">Порядок</Label>
          <Select
            value={filters.sortOrder}
            onValueChange={value =>
              onChange({ sortOrder: value as CatalogFilters["sortOrder"] })
            }
          >
            <SelectTrigger id="catalog-sort-order" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASC">По возрастанию</SelectItem>
              <SelectItem value="DESC">По убыванию</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  );
}
