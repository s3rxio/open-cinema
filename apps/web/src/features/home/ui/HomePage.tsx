"use client";

import { useQuery } from "@apollo/client/react";
import { Clapperboard, Flame, Laugh, Sparkles } from "lucide-react";
import { Loader } from "@open-cinema/ui";
import {
  GET_RECENT_CONTENT_QUERY,
  GET_TRENDING_CONTENT_QUERY
} from "@/shared/api/operations/catalog";
import { GET_CONTENT_BY_GENRE_QUERY } from "@/shared/api/operations/genres";
import { GENRE_LABELS, type Genre } from "@/shared/lib/genres";
import { Container } from "@/shared/ui/Container";
import { ContentRow } from "./ContentRow";
import { HeroCarousel } from "./HeroCarousel";
import styles from "./HomePage.module.css";

const ROW_SIZE = 12;

const GENRE_SECTIONS: Array<{
  genre: Genre;
  title: string;
  icon: React.ReactNode;
}> = [
  {
    genre: "ANIME",
    title: GENRE_LABELS.ANIME,
    icon: <Sparkles size={22} aria-hidden />
  },
  {
    genre: "DRAMA",
    title: GENRE_LABELS.DRAMA,
    icon: <Clapperboard size={22} aria-hidden />
  },
  {
    genre: "COMEDY",
    title: GENRE_LABELS.COMEDY,
    icon: <Laugh size={22} aria-hidden />
  }
];

function GenreSection({ genre, title, icon }: (typeof GENRE_SECTIONS)[number]) {
  const query = useQuery(GET_CONTENT_BY_GENRE_QUERY, {
    variables: { genre, skip: 0, take: ROW_SIZE }
  });

  const items = query.data?.getContentByGenre.items ?? [];

  if (query.loading || items.length === 0) {
    return null;
  }

  return (
    <section className={styles.feedSection}>
      <Container>
        <ContentRow
          title={title}
          titleIcon={icon}
          viewAllHref={`/search?genre=${genre}`}
          items={items}
          showCatalogLink
          catalogHref="/search"
        />
      </Container>
    </section>
  );
}

export function HomePage() {
  const trendingQuery = useQuery(GET_TRENDING_CONTENT_QUERY, {
    variables: { skip: 0, take: ROW_SIZE }
  });

  const recentQuery = useQuery(GET_RECENT_CONTENT_QUERY, {
    variables: { skip: 0, take: ROW_SIZE }
  });

  const trending = trendingQuery.data?.getTrendingContent.items ?? [];
  const recent = recentQuery.data?.getRecentContent.items ?? [];
  const loading = trendingQuery.loading || recentQuery.loading;
  const error = trendingQuery.error ?? recentQuery.error;

  if (loading) {
    return (
      <main className={styles.page}>
        <section>
          <Container>
            <div className={styles.loaderBlock}>
              <Loader size="lg" />
            </div>
          </Container>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <section>
          <Container>
            <div className={styles.statusBlock}>
              <p className="text-destructive">Не удалось загрузить каталог</p>
            </div>
          </Container>
        </section>
      </main>
    );
  }

  if (trending.length === 0 && recent.length === 0) {
    return (
      <main className={styles.page}>
        <section>
          <Container>
            <div className={styles.statusBlock}>
              <p className="text-muted-foreground">Пока нет контента для отображения</p>
            </div>
          </Container>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section>
        <Container>
          <HeroCarousel items={trending.length > 0 ? trending : recent} />
        </Container>
      </section>

      <div className={styles.sectionsWrapper}>
        {trending.length > 0 ? (
          <section className={styles.feedSection}>
            <Container>
              <ContentRow
                title="Популярное"
                titleIcon={<Flame size={22} aria-hidden />}
                viewAllHref="/search?q=popular"
                items={trending}
                showCatalogLink
                catalogHref="/search"
              />
            </Container>
          </section>
        ) : null}

        {recent.length > 0 ? (
          <section className={styles.feedSection}>
            <Container>
              <ContentRow
                title="Новинки"
                titleIcon={<Sparkles size={22} aria-hidden />}
                viewAllHref="/search"
                items={recent}
                showCatalogLink
                catalogHref="/search"
              />
            </Container>
          </section>
        ) : null}

        {GENRE_SECTIONS.map(section => (
          <GenreSection key={section.genre} {...section} />
        ))}
      </div>
    </main>
  );
}
