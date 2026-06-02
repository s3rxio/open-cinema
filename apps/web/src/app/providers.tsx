"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/shared/auth/AuthContext";
import { ThemeProvider } from "@/shared/ui/ThemeProvider";
import { ApolloProvider } from "@/shared/api/ApolloProvider";
import { AppShell } from "@/shared/ui/AppShell";

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWatchRoute = pathname?.startsWith("/watch");

  if (isWatchRoute) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
