"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@open-cinema/ui";
import { useAuth } from "@/entities/user";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  User
} from "lucide-react";

export function UserMenu() {
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
