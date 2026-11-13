/*
 * The docs' full-text search. The index (one record per page section) is built at build time from the same
 * Markdown as the `.md` twins (lib/search-index.ts, served at /search-index.json); this module ranks it, on the
 * client in the site's ⌘K and in the node tests. No search service: the index is small enough to fetch once.
 */

export type SearchRecord = {
  /** the page and, for a section, its anchor: /docs/theming#tokens */
  href: string;
  /** the page's name, as the docs index lists it */
  page: string;
  /** the index group: Get started, Inputs, … */
  group: string;
  /** the section's heading; the page's name for the text above the first section */
  heading: string;
  /** the section's prose, Markdown stripped, code fences left out */
  text: string;
};

export type SearchHit = SearchRecord & { score: number; snippet: string };

const words = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_-]*/gu) ?? [];

/** Records that contain every word of the query (as a word prefix), best first: a match in the page name outranks one
 *  in a heading, which outranks one in the text. One hit per page section, at most `limit`. */
export function search(index: SearchRecord[], query: string, limit = 12): SearchHit[] {
  const terms = words(query);
  if (!terms.length) return [];
  const hits: SearchHit[] = [];
  for (const r of index) {
    const page = words(r.page);
    const heading = words(r.heading);
    const text = words(r.text);
    let score = 0;
    let all = true;
    for (const t of terms) {
      const has = (ws: string[]) => ws.some((w) => w.startsWith(t));
      const s = (has(page) ? 8 : 0) + (has(heading) ? 4 : 0) + (has(text) ? 1 : 0);
      if (!s) {
        all = false;
        break;
      }
      score += s;
    }
    if (all) hits.push({ ...r, score, snippet: snippet(r.text, terms) });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** The sentence around the first matched word, cut to about 90 characters. */
function snippet(text: string, terms: string[]): string {
  const lower = text.toLowerCase();
  const at = Math.max(0, Math.min(...terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0)));
  const start = Math.max(0, at - 30);
  const s = text.slice(start, start + 90).trim();
  return `${start > 0 ? "…" : ""}${s}${start + 90 < text.length ? "…" : ""}`;
}
