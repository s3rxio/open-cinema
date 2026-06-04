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
      <main className="space-y-8 py-8 max-md:space-y-6 max-md:py-4">
        <section>
          <Container>
            <h1 className="text-4xl font-bold tracking-tight max-md:text-2xl">
              Панель управления
            </h1>
          </Container>
        </section>

        <section>
          <Container>
            <div className="grid gap-6 max-md:gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16rem_minmax(0,1fr)]">
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
