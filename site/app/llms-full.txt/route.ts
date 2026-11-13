import { DOC_PAGES, PREAMBLE, pageBody, shiftHeadings } from "@site/lib/docs-markdown";
import { SITE_ORIGIN } from "@site/lib/registry";
import { SITE_DESCRIPTION, SITE_NAME } from "@site/lib/seo";

/**
 * /llms-full.txt: every docs page as Markdown in one file, in the docs index's order, from the same converter as the
 * `.md` twins. /llms.txt is the index; this is the whole text, for tools that read once.
 */
export const dynamic = "force-static";

export function GET() {
  const pages = DOC_PAGES.map((p) => {
    // each page's own h1 becomes an h2 under the file's title, and its headings shift down one level with it
    const body = shiftHeadings(pageBody(p.href));
    return `${body}\n\nSource: ${SITE_ORIGIN ?? ""}${p.href}`;
  });
  const text = [`# ${SITE_NAME}`, "", `> ${SITE_DESCRIPTION}`, "", PREAMBLE, "", ...pages.flatMap((p) => [p, ""])];
  return new Response(text.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
