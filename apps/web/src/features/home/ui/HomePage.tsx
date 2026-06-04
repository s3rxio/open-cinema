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
import { routes } from "@/shared/lib/routes";
import { cn } from "@open-cinema/ui";
import { Container } from "@/shared/ui/Container";
import { ContentRow } from "./ContentRow";
import { HeroCarousel } from "./HeroCarousel";

const ROW_SIZE = 12;

const FEED_SECTION_CLASS = cn(
  "animate-home-fade-in motion-reduce:animate-none",
  "[&:nth-child(1)]:[animation-delay:0.1s]",
  "[&:nth-child(2)]:[animation-delay:0.2s]",
  "[&:nth-child(3)]:[animation-delay:0.3s]"
);

const STATUS_BLOCK_CLASS =
  "flex min-h-[200px] items-center justify-center rounded-[var(--home-radius)] border border-[var(--glass-border)] bg-[var(--home-content)] p-10 text-center [backdrop-filter:var(--home-blur)]";

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
    <section className={FEED_SECTION_CLASS}>
      <Container>
        <ContentRow
          title={title}
          titleIcon={icon}
          viewAllHref={`${routes.catalog}?genre=${genre}`}
          items={items}
          showCatalogLink
          catalogHref={routes.catalog}
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

  const pageClass = "py-6 pb-12 max-md:py-3 max-md:pb-8";

  if (loading) {
    return (
      <main className={pageClass}>
        <section>
          <Container>
            <div className={STATUS_BLOCK_CLASS}>
              <Loader size="lg" />
            </div>
          </Container>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={pageClass}>
        <section>
          <Container>
            <div className={STATUS_BLOCK_CLASS}>
              <p className="text-destructive">Не удалось загрузить каталог</p>
            </div>
          </Container>
        </section>
      </main>
    );
  }

  if (trending.length === 0 && recent.length === 0) {
    return (
      <main className={pageClass}>
        <section>
          <Container>
            <div className={STATUS_BLOCK_CLASS}>
              <p className="text-muted-foreground">
                Пока нет контента для отображения
              </p>
            </div>
          </Container>
        </section>
      </main>
    );
  }

  return (
    <main className={pageClass}>
      <section>
        <Container>
          <HeroCarousel items={trending.length > 0 ? trending : recent} />
        </Container>
      </section>

      <div className="mt-12 flex flex-col gap-16 max-md:mt-6 max-md:gap-7">
        {trending.length > 0 ? (
          <section className={FEED_SECTION_CLASS}>
            <Container>
              <ContentRow
                title="Популярное"
                titleIcon={<Flame size={22} aria-hidden />}
                viewAllHref={`${routes.catalog}?sortBy=rating&sortOrder=DESC`}
                items={trending}
                showCatalogLink
                catalogHref={routes.catalog}
              />
            </Container>
          </section>
        ) : null}

        {recent.length > 0 ? (
          <section className={FEED_SECTION_CLASS}>
            <Container>
              <ContentRow
                title="Новинки"
                titleIcon={<Sparkles size={22} aria-hidden />}
                viewAllHref={`${routes.catalog}?sortBy=releaseDate&sortOrder=DESC`}
                items={recent}
                showCatalogLink
                catalogHref={routes.catalog}
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
