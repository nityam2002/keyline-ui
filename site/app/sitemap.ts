import type { MetadataRoute } from "next";
import { DOC_PAGES } from "@site/lib/docs-markdown";
import { pageModified } from "@site/lib/dates";
import { SITE_URL } from "@site/lib/seo";

/**
 * Every written page: the homepage, then the docs index (guides, components, blocks) from the one catalogue, so a
 * new page is listed as soon as it is in the index. A docs page's lastModified is its item's `updated`, else git's
 * last change to its meta or page (lib/dates.ts); none is better than a build date on every URL, which tells
 * crawlers nothing true. The homepage carries the newest of them. Google ignores priority and changeFrequency.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return []; // no public origin (lib/seo.ts): nothing to list
  const docs = DOC_PAGES.map((p) => ({ url: `${SITE_URL}${p.href}`, lastModified: pageModified(p) }));
  const newest = docs.reduce<Date | undefined>(
    (d, p) => (p.lastModified && (!d || p.lastModified > d) ? p.lastModified : d),
    undefined,
  );
  return [{ url: SITE_URL, lastModified: newest }, ...docs].map((e) => (e.lastModified ? e : { url: e.url }));
}
