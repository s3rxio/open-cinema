export const SITE_NAME = "Open Cinema";

export const SITE_DESCRIPTION =
  "Онлайн-кинотеатр с каталогом фильмов и сериалов, HLS-плеером, избранным и совместным просмотром.";

export const SITE_LOCALE = "ru_RU";

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim();
  if (graphqlUrl) {
    try {
      return new URL(graphqlUrl).origin;
    } catch {
      // ignore invalid URL
    }
  }

  return "https://open-cinema.s3rxio.lol";
}

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
