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
  async headers() {
    return [
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
