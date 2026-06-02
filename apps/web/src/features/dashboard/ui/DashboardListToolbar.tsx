"use client";

import Link from "next/link";
import { buttonVariants, cn, Input } from "@open-cinema/ui";
import { Search } from "lucide-react";

type DashboardListToolbarProps = {
  createHref: string;
  createLabel: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
};

export function DashboardListToolbar({
  createHref,
  createLabel,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Поиск…"
}: DashboardListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchValue}
          onChange={event => onSearchChange?.(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>
      <Link href={createHref} className={cn(buttonVariants(), "shrink-0")}>
        {createLabel}
      </Link>
    </div>
  );
}
