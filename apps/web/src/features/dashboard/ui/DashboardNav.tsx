"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@open-cinema/ui";
import { useAuth } from "@/shared/auth/AuthContext";
import { Clapperboard, Tv, Users, type LucideIcon } from "lucide-react";

type DashboardTab = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const tabs: DashboardTab[] = [
  { href: "/dashboard/movies", label: "Фильмы", icon: Clapperboard },
  { href: "/dashboard/series", label: "Сериалы", icon: Tv },
  {
    href: "/dashboard/users",
    label: "Пользователи",
    icon: Users,
    adminOnly: true
  }
];

export function DashboardNav() {
  const pathname = usePathname();
  const { canManageUsers } = useAuth();

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || canManageUsers);

  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/40 p-1 lg:flex-col lg:overflow-visible"
      aria-label="Разделы панели управления"
    >
      {visibleTabs.map(tab => {
        const Icon = tab.icon;
        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
