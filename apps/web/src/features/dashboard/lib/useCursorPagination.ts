"use client";

import { useCallback, useState } from "react";

export const DASHBOARD_PAGE_SIZE = 10;

export function useCursorPagination(pageSize = DASHBOARD_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);

  const cursor = cursors[page - 1];

  const goToPage = useCallback(
    (nextPage: number, nextCursor?: string | null) => {
      if (nextPage > page && nextCursor) {
        setCursors(prev => {
          const updated = [...prev];
          updated[page] = nextCursor;
          return updated;
        });
      }
      setPage(nextPage);
    },
    [page]
  );

  const reset = useCallback(() => {
    setPage(1);
    setCursors([undefined]);
  }, []);

  return {
    page,
    pageSize,
    cursor,
    goToPage,
    reset
  };
}
