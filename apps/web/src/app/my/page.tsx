import { FavoritesList } from "@/features/favorites/ui/FavoritesList";
import { Card, CardContent } from "@open-cinema/ui";

export const metadata = {
  title: "Моё | Open Cinema",
  description: "Закладки и недавно просмотренное"
};

export default function MyPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Моё</h1>

      <div className="space-y-12">
        <section id="bookmarks">
          <h2 className="text-2xl font-semibold mb-4">Закладки</h2>
          <FavoritesList />
        </section>

        <section id="recent">
          <h2 className="text-2xl font-semibold mb-4">Смотрел недавно</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Пока здесь пусто — история просмотров появится позже
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
