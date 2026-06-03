"use client";

import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Pagination } from "@open-cinema/ui";
import { DASHBOARD_USERS_QUERY } from "@/shared/api/operations/dashboard";
import { getApolloErrorMessage } from "@/shared/api/getApolloErrorMessage";
import {
  DASHBOARD_PAGE_SIZE,
  useCursorPagination
} from "../lib/useCursorPagination";
import { useDebouncedValue } from "../lib/useDebouncedValue";
import { formatDate } from "../lib/formatDate";
import { DataTable, type DataTableColumn } from "./DataTable";
import { DashboardListToolbar } from "./DashboardListToolbar";
type UserRow = {
  id: string;
  username: string;
  email: string;
  birthdate?: string | null;
  createdAt: string;
};

const columns: DataTableColumn<UserRow>[] = [
  { key: "username", header: "Пользователь", cell: row => row.username },
  { key: "email", header: "Email", cell: row => row.email },
  {
    key: "birthdate",
    header: "Дата рождения",
    cell: row => formatDate(row.birthdate),
    className: "w-36"
  },
  {
    key: "createdAt",
    header: "Создан",
    cell: row => formatDate(row.createdAt),
    className: "w-36"
  }
];

export function UsersListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const { page, pageSize, cursor, goToPage, reset } = useCursorPagination();

  useEffect(() => {
    reset();
  }, [debouncedSearch, reset]);

  const listQuery = useQuery(DASHBOARD_USERS_QUERY, {
    variables: {
      first: pageSize,
      cursor: cursor ?? undefined,
      search: debouncedSearch || undefined
    }
  });

  const connection = listQuery.data?.users;
  const rows = connection?.data ?? [];
  const total = connection?.total ?? 0;

  return (
    <div className="space-y-4">
          <DashboardListToolbar
            createHref="/dashboard/users/new"
            createLabel="Создать пользователя"
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Поиск по имени или email…"
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
            onRowClick={row => router.push(`/dashboard/users/${row.id}`)}
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
  );
}
