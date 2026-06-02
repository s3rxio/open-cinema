"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@open-cinema/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@open-cinema/ui";
import { useAuth } from "@/shared/auth/AuthContext";
import { cn } from "@open-cinema/ui";
import { LogOut, Settings, User } from "lucide-react";
import { NavbarSearch } from "./NavbarSearch";

const navLinkClass =
  "text-sm font-medium transition-colors hover:text-primary";

function NavLink({
  href,
  children,
  exact = false
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

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

function AuthNavButton({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(isActive && "bg-card")}
      >
        {children}
      </Button>
    </Link>
  );
}

function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuKey, setMenuKey] = useState(0);

  const displayName = user?.username || "Пользователь";

  const handleAction = (action: string) => {
    if (action === "settings") {
      router.push("/settings");
    }
    if (action === "logout") {
      logout();
      router.push("/");
    }
    setMenuKey(k => k + 1);
  };

  return (
    <Select key={menuKey} onValueChange={handleAction}>
      <SelectTrigger className="h-10 w-fit max-w-[14rem] shrink-0 border-none bg-transparent px-2 shadow-none focus:ring-0">
        <span className="flex min-w-0 items-center gap-2">
          <User className="h-4 w-4 shrink-0 text-foreground" aria-hidden />
          <span className="truncate text-sm font-medium">{displayName}</span>
        </span>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem
          value="settings"
          className="[&>span:first-child]:hidden pl-2"
        >
          <span className="flex items-center gap-2">
            <Settings className="h-4 w-4 shrink-0" aria-hidden />
            Настройки
          </span>
        </SelectItem>
        <SelectItem
          value="logout"
          className="[&>span:first-child]:hidden pl-2 text-destructive focus:text-destructive"
        >
          <span className="flex items-center gap-2">
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Выход
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-3">
        <div className="flex shrink-0 items-center gap-6">
          <Link
            href="/"
            className="text-xl font-bold hover:text-primary transition-colors shrink-0"
          >
            Open Cinema
          </Link>
          <nav className="flex items-center gap-6">
            <NavLink href="/" exact>
              Главная
            </NavLink>
            {isAuthenticated && <NavLink href="/my">Моё</NavLink>}
          </nav>
        </div>

        <div className="flex min-w-0 flex-1 justify-center px-2 sm:px-6">
          <NavbarSearch />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <AuthNavButton href="/auth/login">Вход</AuthNavButton>
              <AuthNavButton href="/auth/register">Регистрация</AuthNavButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
