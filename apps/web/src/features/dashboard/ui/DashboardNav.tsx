"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@open-cinema/ui";

const tabs = [
  { href: "/dashboard/movies", label: "Фильмы" },
  { href: "/dashboard/series", label: "Сериалы" },
  { href: "/dashboard/users", label: "Пользователи" }
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
      aria-label="Разделы панели управления"
    >
      {tabs.map(tab => {
        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
