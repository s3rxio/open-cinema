"use client";

import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pagination } from "@open-cinema/ui";
import { DASHBOARD_MOVIES_QUERY } from "@/shared/api/operations/dashboard";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import {
  DASHBOARD_PAGE_SIZE,
  useCursorPagination
} from "../lib/useCursorPagination";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import { formatDate } from "../lib/formatDate";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashboardListToolbar } from "./DashboardListToolbar";
import { Container } from "@/shared/ui/Container";

type MovieRow = {
  id: string;
  title: string;
  genre: string;
  director: string;
  rating: number;
  releaseDate: string;
};

const columns: DataTableColumn<MovieRow>[] = [
  { key: "title", header: "Название", cell: row => row.title },
  { key: "genre", header: "Жанр", cell: row => row.genre },
  { key: "director", header: "Режиссёр", cell: row => row.director },
  {
    key: "rating",
    header: "Рейтинг",
    cell: row => row.rating.toFixed(1),
    className: "w-24"
  },
  {
    key: "releaseDate",
    header: "Дата выхода",
    cell: row => formatDate(row.releaseDate),
    className: "w-36"
  }
];

export function MoviesListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const { page, pageSize, cursor, goToPage, reset } = useCursorPagination();

  useEffect(() => {
    reset();
  }, [debouncedSearch, reset]);

  const listQuery = useQuery(DASHBOARD_MOVIES_QUERY, {
    variables: {
      first: pageSize,
      cursor: cursor ?? undefined,
      search: debouncedSearch || undefined
    }
  });

  const connection = listQuery.data?.movies;
  const rows = connection?.data ?? [];
  const total = connection?.total ?? 0;

  return (
    <section>
      <Container size="dashboard">
        <div className="space-y-4">
          <DashboardListToolbar
            createHref="/dashboard/movies/new"
            createLabel="Создать фильм"
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Поиск по названию, жанру, режиссёру…"
          />

          {listQuery.error ? (
            <p className="text-sm text-destructive">
              {getApolloErrorMessage(listQuery.error)}
            </p>
          ) : null}

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={row => row.id}
            loading={listQuery.loading}
            onRowClick={row => router.push(`/dashboard/movies/${row.id}`)}
          />

          <Pagination
            page={page}
            pageSize={DASHBOARD_PAGE_SIZE}
            total={total}
            onPageChange={nextPage =>
              goToPage(nextPage, connection?.nextCursor ?? null)
            }
          />
        </div>
      </Container>
    </section>
  );
}
