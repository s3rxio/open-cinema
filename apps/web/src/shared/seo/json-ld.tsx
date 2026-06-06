import { formatGenres, type Genre } from "@/shared/lib/genres";
import { routes } from "@/shared/lib/routes";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "./site";

type ContentJsonLdProps = {
  content: {
    id: string;
    title: string;
    description: string;
    posterUrl?: string | null;
    releaseDate: string;
    rating: number;
    director: string;
    genres: Genre[];
  };
  kind: "Movie" | "TVSeries";
};

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: absoluteUrl("/"),
        inLanguage: "ru-RU",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${absoluteUrl(routes.catalog)}?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }}
    />
  );
}

export function ContentJsonLd({ content, kind }: ContentJsonLdProps) {
  const path =
    kind === "Movie" ? routes.movie(content.id) : routes.series(content.id);

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": kind,
        name: content.title,
        description: content.description,
        image: content.posterUrl ?? undefined,
        datePublished: content.releaseDate,
        genre: formatGenres(content.genres),
        director: {
          "@type": "Person",
          name: content.director
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: content.rating,
          bestRating: 10,
          worstRating: 0
        },
        url: absoluteUrl(path),
        inLanguage: "ru-RU",
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: absoluteUrl("/")
        }
      }}
    />
  );
}
