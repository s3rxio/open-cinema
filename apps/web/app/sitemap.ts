import type { MetadataRoute } from "next";
import { fetchPublishedContentForSitemap } from "@/shared/seo/content";
import { routes } from "@/shared/lib/routes";
import { absoluteUrl, getSiteUrl } from "@/shared/seo/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getSiteUrl(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: absoluteUrl(routes.catalog),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: absoluteUrl("/legal/privacy"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2
    },
    {
      url: absoluteUrl("/legal/cookies"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2
    }
  ];

  try {
    const items = await fetchPublishedContentForSitemap();

    const contentPages: MetadataRoute.Sitemap = items.map(item => ({
      url: absoluteUrl(
        item.type === "MOVIE" ? routes.movie(item.id) : routes.series(item.id)
      ),
      lastModified: new Date(item.releaseDate),
      changeFrequency: "weekly" as const,
      priority: item.type === "MOVIE" ? 0.8 : 0.8
    }));

    return [...staticPages, ...contentPages];
  } catch {
    return staticPages;
  }
}
