"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/entities/user";
import { ThemeProvider } from "@/shared/ui/ThemeProvider";
import { ApolloProvider } from "@/shared/api";
import { AppShell } from "@/shared/ui/AppShell";
import { CookieConsent } from "@/shared/ui/CookieConsent";

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
          <CookieConsent />
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
