import { FavoritesList } from "@/features/favorites";
import { WatchHistoryList } from "@/features/watch-history";
import { Container } from "@/shared/ui/Container";

export const metadata = {
  title: "Моё | Open Cinema",
  description: "Закладки и недавно просмотренное"
};

export function MyPage() {
  return (
    <main className="space-y-12 py-8 max-md:space-y-8 max-md:py-4">
      <section>
        <Container>
          <h1 className="text-4xl font-bold max-md:text-2xl">Моё</h1>
        </Container>
      </section>

      <section id="bookmarks">
        <Container>
          <h2 className="mb-4 text-2xl font-semibold max-md:text-xl">
            Закладки
          </h2>
          <FavoritesList />
        </Container>
      </section>

      <section id="recent">
        <Container>
          <h2 className="mb-4 text-2xl font-semibold max-md:text-xl">
            Смотрел недавно
          </h2>
          <WatchHistoryList />
        </Container>
      </section>
    </main>
  );
}
