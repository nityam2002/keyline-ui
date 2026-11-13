import { DOC_PAGES, pageMarkdown } from "@site/lib/docs-markdown";
import { SITE_ORIGIN } from "@site/lib/registry";

/**
 * The `.md` twin of every docs page. Readers do not link here: next.config.ts rewrites `/docs/<page>.md`, and
 * `/docs/<page>` requested with `Accept: text/markdown`, to this route (Next.js's documented content negotiation).
 * Every twin is rendered at build; a page the converter cannot read fails the build (lib/docs-markdown.ts).
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return DOC_PAGES.map((p) => ({ slug: p.href.slice(1).split("/") }));
}

export async function GET(_: Request, ctx: RouteContext<"/md/[...slug]">) {
  const href = `/${(await ctx.params).slug.join("/")}`;
  return new Response(pageMarkdown(href), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      // the HTML page is the one to rank; this is the same content for tools
      Link: `<${SITE_ORIGIN ?? ""}${href}>; rel="canonical"`,
      "X-Robots-Tag": "noindex",
    },
  });
}
