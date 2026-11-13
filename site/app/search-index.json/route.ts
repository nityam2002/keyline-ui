import { buildSearchIndex } from "@site/lib/search-index";

/** The docs' full-text index, built with the site and fetched by ⌘K the first time it opens (lib/search.ts). */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}
