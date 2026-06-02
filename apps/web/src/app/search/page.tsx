import { Suspense } from "react";
import { SearchContent } from "@/features/search/ui/SearchContent";
import { Container } from "@/shared/ui/Container";
import { Loader } from "@open-cinema/ui";

export const metadata = {
  title: "Поиск | Open Cinema",
  description: "Поиск фильмов и сериалов"
};

export default function SearchPage() {
  return (
    <main className="py-8">
      <section>
        <Container>
          <h1 className="text-4xl font-bold mb-6">Поиск</h1>
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            }
          >
            <SearchContent />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}
