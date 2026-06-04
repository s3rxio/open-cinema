"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@open-cinema/ui";
import { Shield, User } from "lucide-react";

const tabs = [
  { href: "/settings", label: "Профиль", icon: User, exact: true },
  {
    href: "/settings/security",
    label: "Безопасность",
    icon: Shield,
    exact: false
  }
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/40 p-1 lg:flex-col lg:overflow-visible"
      aria-label="Разделы настроек"
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

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
