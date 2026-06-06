import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/shared/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/catalog", "/movie/", "/series/", "/legal/"],
        disallow: [
          "/api/",
          "/auth/",
          "/dashboard/",
          "/settings/",
          "/watch/",
          "/watch-party/",
          "/my",
          "/favorites",
          "/search"
        ]
      }
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`
  };
}
