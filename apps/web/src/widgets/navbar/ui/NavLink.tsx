"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@open-cinema/ui";

const navLinkClass = "text-sm font-medium transition-colors hover:text-primary";

export function NavLink({
  href,
  children,
  exact = false
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : Boolean(pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        navLinkClass,
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}
