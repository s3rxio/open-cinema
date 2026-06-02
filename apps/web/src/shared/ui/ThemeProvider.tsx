"use client";

import * as React from "react";

// Fallback ThemeProvider.
// @radix-ui/themes isn't installed in this repo yet.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
