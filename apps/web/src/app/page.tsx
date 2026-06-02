"use client";

import { CatalogList } from "@/features/catalog/ui/CatalogList";
import { Navbar } from "@/shared/ui/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
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
    </div>
  );
}


