"use client";

import { DashboardAuthGate, DashboardNav } from "@/features/dashboard";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGate>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
          <DashboardNav />
        </header>
        {children}
      </div>
    </DashboardAuthGate>
  );
}
