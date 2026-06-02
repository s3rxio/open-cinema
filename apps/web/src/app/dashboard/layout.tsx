"use client";

import { DashboardAuthGate, DashboardNav } from "@/features/dashboard";
import { Container } from "@/shared/ui/Container";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGate>
      <main className="py-8 space-y-8">
        <section>
          <Container size="dashboard">
            <header className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
              <DashboardNav />
            </header>
          </Container>
        </section>
        {children}
      </main>
    </DashboardAuthGate>
  );
}
