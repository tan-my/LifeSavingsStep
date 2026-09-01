import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Served at /robots.txt. Everything here is public and safe to crawl — the
 * user's own figures never leave their browser, so there is nothing to hide
 * from a crawler. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
