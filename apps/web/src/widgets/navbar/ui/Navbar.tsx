"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, cn } from "@open-cinema/ui";
import { useAuth } from "@/entities/user";
import { Menu, Search, X } from "lucide-react";
import { NavbarSearch } from "@/features/search";
import { Container } from "@/shared/ui/Container";
import { AuthNavButton } from "./AuthNavButton";
import { MobileNavMenu } from "./MobileNavMenu";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";

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
