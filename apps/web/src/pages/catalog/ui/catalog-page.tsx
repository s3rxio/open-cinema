import { Suspense } from "react";
import { CatalogPageContent } from "@/features/catalog";
import { Container } from "@/shared/ui/Container";
import { Loader } from "@open-cinema/ui";

import { buildPageMetadata } from "@/shared/seo/metadata";
import { routes } from "@/shared/lib/routes";

export const metadata = buildPageMetadata({
  title: "Каталог",
  description:
    "Каталог фильмов и сериалов с поиском, фильтрами по жанру и сортировкой по рейтингу и дате выхода.",
  path: routes.catalog
});

export function CatalogPage() {
  return (
    <main className="py-8 max-md:py-4">
      <section>
        <Container>
          <h1 className="mb-6 text-4xl font-bold max-md:mb-4 max-md:text-2xl">
            Каталог
          </h1>
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            }
          >
            <CatalogPageContent />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}
