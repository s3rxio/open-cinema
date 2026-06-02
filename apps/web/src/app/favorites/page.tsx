import { FavoritesList } from "@/features/favorites/ui/FavoritesList";
import { Navbar } from "@/shared/ui/Navbar";

export const metadata = {
  title: "Избранное | Open Cinema",
  description: "Мои избранные фильмы и сериалы",
};

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <section>
            <h1 className="text-4xl font-bold mb-4">Мои избранные</h1>
            <FavoritesList />
          </section>
        </div>
      </main>
    </div>
  );
}

