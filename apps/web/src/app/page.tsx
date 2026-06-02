"use client";

import { CatalogList } from "@/features/catalog/ui/CatalogList";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <section>
          <h1 className="text-4xl font-bold mb-4">Каталог контента</h1>
          <p className="text-muted-foreground mb-8">
            Откройте для себя лучшие фильмы и сериалы
          </p>
          <CatalogList />
        </section>
      </div>
    </main>
  );
}
