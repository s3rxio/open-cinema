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
import { useAuth } from "@/entities/user";
import { cn } from "@open-cinema/ui";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X
} from "lucide-react";
import { NavbarSearch } from "@/features/search";
import { Container } from "@/shared/ui/Container";
import { MobileNavMenu } from "./MobileNavMenu";

const navLinkClass = "text-sm font-medium transition-colors hover:text-primary";

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

function AuthNavButton({
  href,
  children,
  className,
  onNavigate
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={className} onClick={onNavigate}>
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        className="w-full sm:w-auto"
      >
        {children}
      </Button>
    </Link>
  );
}

function UserMenu() {
  const router = useRouter();
  const { user, logout, canAccessDashboard } = useAuth();
  const [menuKey, setMenuKey] = useState(0);

  const displayName = user?.username || "Пользователь";

  const handleAction = (action: string) => {
    if (action === "dashboard") {
      router.push("/dashboard");
    }
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
        {canAccessDashboard ? (
          <SelectItem
            value="dashboard"
            className="[&>span:first-child]:hidden pl-2"
          >
            <span className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
              Панель управления
            </span>
          </SelectItem>
        ) : null}
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
          className="[&>span:first-child]:hidden pl-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <Container className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex min-w-0 items-center justify-between gap-2 lg:shrink-0 lg:justify-start lg:gap-6">
          <div className="flex min-w-0 items-center gap-4 lg:gap-6">
            <Link
              href="/"
              className="truncate text-lg font-bold transition-colors hover:text-primary sm:text-xl shrink-0"
            >
              Open Cinema
            </Link>
            <nav className="hidden items-center gap-6 lg:flex">
              <NavLink href="/" exact>
                Главная
              </NavLink>
              <NavLink href="/catalog">Каталог</NavLink>
              {isAuthenticated && <NavLink href="/my">Моё</NavLink>}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1 lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              aria-label={searchOpen ? "Скрыть поиск" : "Показать поиск"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(open => !open)}
            >
              {searchOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Search className="h-5 w-5" aria-hidden />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "w-full min-w-0 lg:flex lg:flex-1 lg:justify-center lg:px-6",
            searchOpen ? "block" : "hidden lg:block"
          )}
        >
          <NavbarSearch />
        </div>

        <div className="hidden shrink-0 items-center justify-end gap-2 lg:flex">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <AuthNavButton href="/auth/login">Вход</AuthNavButton>
              <AuthNavButton href="/auth/register">Регистрация</AuthNavButton>
            </>
          )}
        </div>
      </Container>

      <MobileNavMenu
        open={menuOpen}
        onClose={closeMenu}
        isAuthenticated={isAuthenticated}
      />
    </header>
  );
}
