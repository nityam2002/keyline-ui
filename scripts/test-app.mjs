// The app under test: a development-mode bundle of src/demo/ (React's development build, so its warnings still reach
// the console checks), built once and served from memory. A test run therefore sees one snapshot of the sources;
// edits made while it runs cannot reach it. Playwright starts this as its web server (playwright.config.mjs), and
// scripts/css-order-check.mjs imports buildApp/serveApp.
//
//   node scripts/test-app.mjs [--port=5391]     build and serve; then KL_BASE=http://127.0.0.1:5391/ npx playwright test
import { build, loadConfigFromFile } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { createServer } from "node:http";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
};

/** Builds the app into `outDir`. `transformCss(path, code)` may rewrite a stylesheet (the CSS-order check). */
export async function buildApp(outDir, { transformCss } = {}) {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  try {
    // the project's own config, with one change: Tailwind's build-time optimiser (Lightning CSS) is off. It rewrites
    // values the dev server serves as written (160ms → .16s inside custom properties), so with it on the specs would
    // test something other than what the dev server — and the suites written against it — see.
    const { config } = await loadConfigFromFile(
      { command: "build", mode: "development" },
      join(ROOT, "vite.config.ts"),
      ROOT,
    );
    const plugins = (config.plugins ?? []).flat(Infinity).filter((p) => p && !p.name?.startsWith("@tailwindcss/vite"));
    // the CSS-order check rewrites a stylesheet when it is loaded, before Tailwind reads it
    const rewrite = transformCss
      ? [
          {
            name: "kl-css-transform",
            enforce: "pre",
            load: (id) => {
              const f = id.split("?")[0];
              return f.endsWith(".css") ? transformCss(f, readFileSync(f, "utf8")) : null;
            },
          },
        ]
      : [];
    await build({
      ...config,
      configFile: false,
      mode: "development",
      logLevel: "error",
      plugins: [...rewrite, ...plugins, tailwindcss({ optimize: false })],
      build: {
        ...config.build,
        outDir,
        emptyOutDir: true,
        minify: false,
        cssMinify: false,
        sourcemap: false,
        reportCompressedSize: false,
        chunkSizeWarningLimit: 1e6,
      },
    });
  } finally {
    if (prev === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prev;
  }
}

/** Serves `dir` from memory on `port` (0 = any free port). Resolves to { url, close }. */
export function serveApp(dir, port = 0) {
  const files = new Map();
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else files.set("/" + p.slice(dir.length).replace(/^\/+/, ""), readFileSync(p));
    }
  };
  walk(dir);
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    // like the Vite dev server the suites were written against: an unknown path asked for by a request that accepts
    // HTML or anything (*/*, which image requests send) gets the app's index.html with 200
    const accept = req.headers.accept || "";
    const fallback = /text\/html|\*\/\*/.test(accept) && !path.startsWith("/assets/") ? "/index.html" : null;
    const key = files.has(path)
      ? path
      : files.has(path + "/index.html")
        ? path + "/index.html"
        : path === "/"
          ? "/index.html"
          : fallback;
    if (!key) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "content-type": TYPES[extname(key)] || "application/octet-stream",
      "cache-control": key.startsWith("/assets/") ? "max-age=3600" : "no-cache",
    });
    res.end(files.get(key));
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.keepAliveTimeout = 5000;
      resolve({
        url: `http://127.0.0.1:${server.address().port}/`,
        close: () =>
          new Promise((r) => {
            server.closeAllConnections();
            server.close(r);
          }),
      });
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.argv.find((a) => a.startsWith("--port="))?.slice(7) ?? 5391);
  const out = join(ROOT, ".artifacts/test-app");
  const t0 = Date.now();
  await buildApp(out);
  const s = await serveApp(out, port);
  console.log(`built in ${Date.now() - t0}ms; serving ${s.url} (Ctrl+C to stop)`);
}
