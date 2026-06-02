"use client";

import { CatalogList } from "@/features/catalog/ui/CatalogList";
import { Container } from "@/shared/ui/Container";

export default function Home() {
  return (
    <main className="py-8">
      <section>
        <Container>
          <h1 className="text-4xl font-bold mb-4">Каталог контента</h1>
          <p className="text-muted-foreground mb-8">
            Откройте для себя лучшие фильмы и сериалы
          </p>
          <CatalogList />
        </Container>
      </section>
    </main>
  );
}
