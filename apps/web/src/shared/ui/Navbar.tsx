"use client";

import Link from "next/link";
import { Button } from "@open-cinema/ui";
import { useAuth } from "@/shared/auth/AuthContext";

interface NavbarProps {
  showLogo?: boolean;
  showNav?: boolean;
}

export function Navbar({ showLogo = true, showNav = true }: NavbarProps) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {showLogo && (
          <Link href="/" className="text-2xl font-bold hover:text-primary transition-colors">
            🎬 Open Cinema
          </Link>
        )}

        {showNav && (
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/favorites">
                  <Button variant="ghost">Избранное</Button>
                </Link>
                <div className="text-sm text-muted-foreground max-w-xs truncate">
                  {user?.email || "User"}
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                >
                  Выход
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Вход</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Регистрация</Button>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
