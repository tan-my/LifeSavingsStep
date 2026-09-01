import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Served at /sitemap.xml. Every route is a static page in a four-page app, so
 * the list is hand-maintained — add a line here when a route is added.
 *
 * lastModified is the build time rather than a hardcoded date, so a redeploy
 * tells crawlers the pages actually changed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/income`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
