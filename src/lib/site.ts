/**
 * The site's canonical public origin, used for the sitemap, robots.txt and
 * metadataBase.
 *
 * Set NEXT_PUBLIC_SITE_URL in the Vercel project settings when a custom domain
 * is connected — Google treats the .vercel.app and custom-domain versions as
 * separate sites, so the sitemap and canonical URLs have to name whichever one
 * the Search Console property is registered against.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://life-savings-step.vercel.app"
).replace(/\/$/, "");
