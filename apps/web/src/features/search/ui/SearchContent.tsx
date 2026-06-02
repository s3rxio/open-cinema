"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@apollo/client/react";
import { Input, Loader } from "@open-cinema/ui";
import { ContentCard } from "@/features/catalog/ui/ContentCard";
import { SEARCH_CONTENT_QUERY } from "@/shared/api/operations/search";
import { searchSchema, type SearchFormValues } from "../lib/schemas";

export function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: initialQuery }
  });

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    reset({ query: q });
    setSubmittedQuery(q);
  }, [searchParams, reset]);

  const searchQuery = useQuery(SEARCH_CONTENT_QUERY, {
    variables: {
      input: { query: submittedQuery, skip: 0, take: 24 }
    },
    skip: !submittedQuery.trim()
  });

  const onSubmit = ({ query }: SearchFormValues) => {
    setSubmittedQuery(query);
  };

  const items = searchQuery.data?.searchContent.items ?? [];

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 max-w-xl"
      >
        <div className="flex gap-3">
          <Input
            type="search"
            placeholder="Название фильма или сериала..."
            className="flex-1"
            aria-invalid={errors.query ? true : undefined}
            {...register("query")}
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Найти
          </button>
        </div>
        {errors.query && (
          <p className="text-sm text-destructive">{errors.query.message}</p>
        )}
      </form>

      {!submittedQuery && (
        <p className="text-muted-foreground">
          Введите запрос и нажмите «Найти»
        </p>
      )}

      {submittedQuery && searchQuery.loading && (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      )}

      {submittedQuery && !searchQuery.loading && items.length === 0 && (
        <p className="text-muted-foreground">Ничего не найдено</p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <ContentCard
              key={item.id}
              {...item}
              posterUrl={item.posterUrl ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
