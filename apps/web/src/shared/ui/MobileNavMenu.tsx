"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, cn } from "@open-cinema/ui";
import { LayoutDashboard, LogOut, Settings, User, X } from "lucide-react";
import { useAuth } from "@/shared/auth/AuthContext";

const navLinkClass =
  "block rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted";

type MobileNavMenuProps = {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
};

function MobileNavLink({
  href,
  children,
  exact = false,
  onNavigate
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        navLinkClass,
        isActive ? "bg-muted text-primary" : "text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export function MobileNavMenu({
  open,
  onClose,
  isAuthenticated
}: MobileNavMenuProps) {
  const router = useRouter();
  const { user, logout, canAccessDashboard } = useAuth();
  const displayName = user?.username || "Пользователь";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Закрыть меню"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">Меню</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
          aria-label="Основная навигация"
        >
          <MobileNavLink href="/" exact onNavigate={onClose}>
            Главная
          </MobileNavLink>
          <MobileNavLink href="/catalog" onNavigate={onClose}>
            Каталог
          </MobileNavLink>
          {isAuthenticated && (
            <MobileNavLink href="/my" onNavigate={onClose}>
              Моё
            </MobileNavLink>
          )}
        </nav>

        <div className="border-t border-border p-4">
          {isAuthenticated ? (
            <div className="space-y-1">
              <p className="flex items-center gap-2 px-3 pb-2 text-sm font-medium text-foreground">
                <User
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="truncate">{displayName}</span>
              </p>
              {canAccessDashboard ? (
                <MobileNavLink href="/dashboard" onNavigate={onClose}>
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
                    Панель управления
                  </span>
                </MobileNavLink>
              ) : null}
              <MobileNavLink href="/settings" onNavigate={onClose}>
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 shrink-0" aria-hidden />
                  Настройки
                </span>
              </MobileNavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                  router.push("/");
                }}
                className={cn(
                  navLinkClass,
                  "flex w-full items-center gap-2 text-destructive hover:bg-destructive/10"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                Выход
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/auth/login" onClick={onClose} className="block">
                <Button variant="outline" className="w-full">
                  Вход
                </Button>
              </Link>
              <Link href="/auth/register" onClick={onClose} className="block">
                <Button className="w-full">Регистрация</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
