import type { MetadataRoute } from "next"
import { WRITTEN } from "@site/lib/catalog"
import { SITE_URL } from "@site/lib/seo"

/**
 * Every written page: the homepage, then the docs index (guides, components, blocks) from the one catalogue, so a
 * new page is listed as soon as it is in the index. No lastModified: the site has no reliable per-page date, and a
 * build date on every URL would tell crawlers nothing true. Google ignores priority and changeFrequency.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [] // no public origin (lib/seo.ts): nothing to list
  return ["/", ...WRITTEN.map((e) => e.href!)].map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }))
}
