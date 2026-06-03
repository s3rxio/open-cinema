"use client";

import { useQuery } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Loader } from "@open-cinema/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ContentCard, contentCardStyles } from "@/shared/ui/ContentCard";
import { CatalogFiltersPanel } from "./CatalogFilters";
import {
  catalogFiltersToQueryString,
  catalogFiltersToSearchInput,
  DEFAULT_CATALOG_FILTERS,
  parseCatalogFilters,
  type CatalogFilters
} from "../lib/catalog-filters";
import { SEARCH_CONTENT_QUERY } from "@/shared/api/operations/search";
import { routes } from "@/shared/lib/routes";

const catalogSearchSchema = z.object({
  query: z.string().trim()
});

type CatalogSearchFormValues = z.infer<typeof catalogSearchSchema>;

const PAGE_SIZE = 24;

export function CatalogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseCatalogFilters(searchParams),
    [searchParams]
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CatalogSearchFormValues>({
    resolver: zodResolver(catalogSearchSchema),
    defaultValues: { query: filters.q }
  });

  useEffect(() => {
    reset({ query: filters.q });
  }, [filters, reset]);

  const replaceFilters = useCallback(
    (next: CatalogFilters) => {
      const queryString = catalogFiltersToQueryString(next);
      router.replace(
        queryString ? `${routes.catalog}?${queryString}` : routes.catalog
      );
    },
    [router]
  );

  const updateFilters = useCallback(
    (patch: Partial<CatalogFilters>) => {
      replaceFilters({ ...filters, ...patch });
    },
    [filters, replaceFilters]
  );

  const catalogQuery = useQuery(SEARCH_CONTENT_QUERY, {
    variables: {
      input: catalogFiltersToSearchInput(filters, 0, PAGE_SIZE)
    }
  });

  const content = catalogQuery.data?.searchContent;
  const items = content?.items ?? [];

  const onSearchSubmit = ({ query }: CatalogSearchFormValues) => {
    replaceFilters({ ...filters, q: query });
  };

  const loadMore = async () => {
    const currentLength = content?.items.length ?? 0;
    await catalogQuery.fetchMore({
      variables: {
        input: catalogFiltersToSearchInput(filters, currentLength, PAGE_SIZE)
      },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult?.searchContent) {
          return previous;
        }

        return {
          searchContent: {
            ...fetchMoreResult.searchContent,
            items: [
              ...previous.searchContent.items,
              ...fetchMoreResult.searchContent.items
            ]
          }
        };
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-6">
        <form
          onSubmit={handleSubmit(onSearchSubmit)}
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

        {catalogQuery.loading && !catalogQuery.data && (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        )}

        {!catalogQuery.loading && items.length === 0 && (
          <p className="text-muted-foreground">Ничего не найдено</p>
        )}

        {items.length > 0 && (
          <>
            {content && (
              <p className="text-sm text-muted-foreground">
                Найдено: {content.total}
              </p>
            )}
            <div className={contentCardStyles.grid}>
              {items.map(item => (
                <ContentCard key={item.id} {...item} fluid />
              ))}
            </div>
          </>
        )}

        {content?.hasMore && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={catalogQuery.loading}
              className="px-8 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              {catalogQuery.loading ? "Загрузка…" : "Загрузить ещё"}
            </button>
          </div>
        )}
      </div>

      <CatalogFiltersPanel
        filters={filters}
        onChange={updateFilters}
        onReset={() => replaceFilters(DEFAULT_CATALOG_FILTERS)}
      />
    </div>
  );
}
