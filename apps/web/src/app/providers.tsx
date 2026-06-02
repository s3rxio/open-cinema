"use client";

import * as React from "react";
import { AuthProvider } from "@/shared/auth/AuthContext";
import { ThemeProvider } from "@/shared/ui/ThemeProvider";
import { ApolloProvider } from "@/shared/api/ApolloProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider>
      <AuthProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
