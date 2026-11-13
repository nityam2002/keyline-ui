import { DOC_PAGES, pageBody } from "./docs-markdown";
import type { SearchRecord } from "./search";

/** Markdown to plain text: no fences, links as their text, no emphasis or code marks. */
function plain(md: string): string {
  return md
    .replace(/(```+)[\s\S]*?\1/g, " ")
    .replace(/^\|[\s|:-]+\|$/gm, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*|>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The site's search index: every docs page split at its headings, from the same Markdown as its `.md` twin. */
export function buildSearchIndex(): SearchRecord[] {
  return DOC_PAGES.flatMap((p) => {
    const records: SearchRecord[] = [];
    let heading = p.name;
    let anchor = "";
    let buf: string[] = [];
    const flush = () => {
      const text = plain(buf.join("\n"));
      if (text || anchor)
        records.push({ href: `${p.href}${anchor ? `#${anchor}` : ""}`, page: p.name, group: p.group, heading, text });
      buf = [];
    };
    let inFence = false;
    for (const line of pageBody(p.href).split("\n")) {
      if (/^(```|````)/.test(line)) inFence = !inFence;
      const h = !inFence && /^#{1,6} (.*?)(?: \{#([^}]+)\})?$/.exec(line);
      if (h && line.startsWith("# ")) continue; // the page title: the record is named after the page already
      if (h) {
        flush();
        heading = h[1]!;
        anchor = h[2] ?? "";
      } else buf.push(line);
    }
    flush();
    return records;
  });
}
