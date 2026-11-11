import type { MetadataRoute } from "next"
import { INDEXABLE, SITE_URL } from "@site/lib/seo"

/**
 * Crawlers may fetch everything, on every deployment. A preview is kept out of the index by its noindex tags
 * (app/layout.tsx and the X-Robots-Tag header in next.config.ts), and a crawler only sees those if robots.txt lets it
 * in. Only production lists the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(INDEXABLE && SITE_URL ? { sitemap: `${SITE_URL}/sitemap.xml` } : {}),
  }
}
