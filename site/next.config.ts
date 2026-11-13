import path from "node:path";
import type { NextConfig } from "next";

// The site imports the real Keyline source from ../src/registry and shares keyline/node_modules
// (one React), so the workspace root is the keyline package, not this folder.
const root = path.join(__dirname, "..");

// The same test as INDEXABLE in lib/seo.ts: only the production deployment may be indexed
const indexable = (process.env["KEYLINE_SITE_ENV"] ?? process.env["VERCEL_ENV"]) === "production";
const NOINDEX = [{ key: "X-Robots-Tag", value: "noindex" }];

const config: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
  devIndicators: false,
  // lib/docs-markdown.ts reads page sources with the TypeScript compiler at build; it stays a Node package
  serverExternalPackages: ["typescript"],
  async rewrites() {
    // Markdown twins (app/md): `/docs/<page>.md`, or the page itself asked for as Markdown. Before the pages, so a
    // Markdown request never gets the HTML (Next.js's content negotiation guide).
    const markdown = [{ type: "header" as const, key: "accept", value: "(.*)text/markdown(.*)" }];
    return {
      beforeFiles: [
        { source: "/docs/:path(.+)\\.md", destination: "/md/docs/:path" },
        { source: "/docs/:path+", has: markdown, destination: "/md/docs/:path+" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      // a docs page names its Markdown twin (gridcn proxy.ts); the twin itself sends Vary: Accept (app/md)
      {
        source: "/docs/:path((?!.*\\.md$).+)",
        headers: [
          {
            key: "Link",
            value: '</docs/:path.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"',
          },
        ],
      },
      { source: "/llms-full.txt", headers: NOINDEX },
      { source: "/md/:path*", headers: NOINDEX },
      { source: "/search-index.json", headers: NOINDEX },
      // the registry's JSON is for the shadcn CLI, not for search results; the header doesn't change what the CLI gets
      { source: "/r/:path*", headers: NOINDEX },
      // /llms.txt is an index for language-model tools, not a page to rank; fetching it is unaffected
      { source: "/llms.txt", headers: NOINDEX },
      // a preview or local build: every response, including files and images that carry no meta tag
      ...(indexable ? [] : [{ source: "/:path*", headers: NOINDEX }]),
    ];
  },
};

export default config;
