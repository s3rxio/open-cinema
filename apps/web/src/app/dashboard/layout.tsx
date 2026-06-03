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
          <Container>
            <h1 className="text-4xl font-bold tracking-tight">
              Панель управления
            </h1>
          </Container>
        </section>

        <section>
          <Container>
            <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16rem_minmax(0,1fr)]">
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <DashboardNav />
              </aside>
              <div className="min-w-0">{children}</div>
            </div>
          </Container>
        </section>
      </main>
    </DashboardAuthGate>
  );
}
