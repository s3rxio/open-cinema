"use client";

import { useQuery } from "@apollo/client/react";
import { Input, Loader } from "@open-cinema/ui";
import { cn } from "@open-cinema/ui";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SEARCH_CONTENT_QUERY } from "@/shared/api/operations/search";
import type { ContentItem } from "@/shared/api/operation-types";
import { routes } from "@/shared/lib/routes";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

function getContentHref(item: Pick<ContentItem, "id" | "type">) {
  return item.type === "MOVIE" ? routes.movie(item.id) : routes.series(item.id);
}

function SearchResultItem({
  item,
  onSelect
}: {
  item: ContentItem;
  onSelect: () => void;
}) {
  return (
    <Link
      href={getContentHref(item)}
      onClick={onSelect}
      className="flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors"
    >
      <div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-muted">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">
          {item.type === "MOVIE" ? "Фильм" : "Сериал"}
          {item.rating != null && ` · ⭐ ${item.rating.toFixed(1)}`}
        </p>
      </div>
    </Link>
  );
}

export function NavbarSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const canSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const searchQuery = useQuery(SEARCH_CONTENT_QUERY, {
    variables: {
      input: { query: debouncedQuery, skip: 0, take: 8 }
    },
    skip: !canSearch
  });

  const items = searchQuery.data?.searchContent.items ?? [];
  const showDropdown = open && query.trim().length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeDropdown = () => setOpen(false);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-w-[14rem] max-w-xl"
    >
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Поиск фильмов и сериалов..."
        className="h-11 w-full pl-11 text-base"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        autoComplete="off"
      />

      {showDropdown && (
        <div
          role="listbox"
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
            "max-h-80 overflow-y-auto"
          )}
        >
          {query.trim().length < MIN_QUERY_LENGTH && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Введите минимум {MIN_QUERY_LENGTH} символа
            </p>
          )}

          {canSearch && searchQuery.loading && (
            <div className="flex justify-center py-4">
              <Loader size="sm" />
            </div>
          )}

          {canSearch && !searchQuery.loading && items.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Ничего не найдено
            </p>
          )}

          {canSearch &&
            !searchQuery.loading &&
            items.map(item => (
              <SearchResultItem
                key={item.id}
                item={item}
                onSelect={closeDropdown}
              />
            ))}

          {canSearch && !searchQuery.loading && items.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
              onClick={closeDropdown}
              className="block border-t border-border px-3 py-2 text-center text-sm text-primary hover:bg-accent"
            >
              Все результаты
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
