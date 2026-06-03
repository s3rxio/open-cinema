import { Suspense } from "react";
import { CatalogPageContent } from "@/features/catalog/ui/CatalogPageContent";
import { Container } from "@/shared/ui/Container";
import { Loader } from "@open-cinema/ui";

export const metadata = {
  title: "Каталог | Open Cinema",
  description: "Каталог фильмов и сериалов с фильтрами"
};

export default function CatalogPage() {
  return (
    <main className="py-8">
      <section>
        <Container>
          <h1 className="text-4xl font-bold mb-6">Каталог</h1>
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
