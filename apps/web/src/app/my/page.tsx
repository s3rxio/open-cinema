import { FavoritesList } from "@/features/favorites/ui/FavoritesList";
import { Container } from "@/shared/ui/Container";
import { Card, CardContent } from "@open-cinema/ui";

export const metadata = {
  title: "Моё | Open Cinema",
  description: "Закладки и недавно просмотренное"
};

export default function MyPage() {
  return (
    <main className="py-8 space-y-12">
      <section>
        <Container>
          <h1 className="text-4xl font-bold">Моё</h1>
        </Container>
      </section>

      <section id="bookmarks">
        <Container>
          <h2 className="text-2xl font-semibold mb-4">Закладки</h2>
          <FavoritesList />
        </Container>
      </section>

      <section id="recent">
        <Container>
          <h2 className="text-2xl font-semibold mb-4">Смотрел недавно</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Пока здесь пусто — история просмотров появится позже
              </p>
            </CardContent>
          </Card>
        </Container>
      </section>
    </main>
  );
}
