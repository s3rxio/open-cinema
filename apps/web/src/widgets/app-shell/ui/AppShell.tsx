"use client";

import { Navbar } from "@/widgets/navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {children}
    </div>
  );
}
