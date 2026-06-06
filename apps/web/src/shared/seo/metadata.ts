import type { Metadata } from "next";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "./site";

export function truncateDescription(
  text: string,
  maxLength = 160
): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

type BuildPageMetadataOptions = {
  title: string;
  description?: string;
  path: string;
  imageUrl?: string | null;
  noIndex?: boolean;
  absoluteTitle?: boolean;
};

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  imageUrl,
  noIndex = false,
  absoluteTitle = false
}: BuildPageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const pageDescription = truncateDescription(description);
  const resolvedTitle = absoluteTitle
    ? { absolute: title }
    : title;

  const images = imageUrl
    ? [{ url: imageUrl, alt: title }]
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }];

  return {
    title: resolvedTitle,
    description: pageDescription,
    alternates: {
      canonical
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: canonical,
      siteName: SITE_NAME,
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description: pageDescription,
      images
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description: pageDescription,
      images: images.map(image => image.url)
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true }
  };
}

export const privatePageMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  }
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrlFromEnv()),
  title: {
    default: `${SITE_NAME} — онлайн-кинотеатр`,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "онлайн кинотеатр",
    "фильмы онлайн",
    "сериалы онлайн",
    "смотреть фильмы",
    "каталог фильмов",
    "Open Cinema"
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — онлайн-кинотеатр`,
    description: SITE_DESCRIPTION,
    url: getSiteUrlFromEnv(),
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_NAME
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — онлайн-кинотеатр`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: "/favicon.ico"
  }
};

function getSiteUrlFromEnv(): string {
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
