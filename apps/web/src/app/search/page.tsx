import { Suspense } from "react";
import { SearchContent } from "@/features/search/ui/SearchContent";
import { Loader } from "@open-cinema/ui";

export const metadata = {
  title: "Поиск | Open Cinema",
  description: "Поиск фильмов и сериалов"
};

export default function SearchPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
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
    </main>
  );
}
