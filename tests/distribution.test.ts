// What a consumer reads and downloads: the install commands in the docs and the built registry the site serves.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { defined } from "./defined.ts";

const root = new URL("..", import.meta.url).pathname;
const read = (p: string) => readFileSync(join(root, p), "utf8");
const pkg = JSON.parse(read("package.json"));
const catalog = JSON.parse(read("site/public/r/registry.json"));
const names = new Set<string>(catalog.items.map((i: { name: string }) => i.name));

// The registry's public origin: package.json "homepage" once the site is live, the documented placeholder until then.
const ORIGIN: string = pkg.homepage?.replace(/\/+$/, "") ?? "https://<keyline-site>";
const REGISTRY_ADD = `npx shadcn@latest registry add @keyline-ui=${ORIGIN}/r/{name}.json`;

const walk = (dir: string): string[] =>
  readdirSync(join(root, dir)).flatMap((n) => {
    const p = join(dir, n);
    return statSync(join(root, p)).isDirectory() ? walk(p) : [p];
  });
const DOCS = ["README.md", "docs/releasing.md"];
const SITE = [...walk("site/app"), ...walk("site/components"), ...walk("site/lib")].filter((f) =>
  /\.(tsx?|css)$/.test(f),
);
const APP = walk("src/demo").filter((f) => /\.tsx?$/.test(f));

/** Every `npx shadcn…` command written out in a file, up to the end of its line or string. */
const commands = (src: string) =>
  [...src.matchAll(/npx shadcn(?:@[\w.]+)?\s[^`"'\n]*?(?=<\/|[`"'\n]|$)/g)].map((m) =>
    m[0].replace(/\s+#.*$|\.\s.*$|\.$|\s\(.*$/, "").trim(),
  ); // drop a comment or the prose after it

test("install commands use @latest and one of the documented forms", () => {
  const forms = [
    /^npx shadcn@latest init( -t (next|vite))?$/,
    /^npx shadcn@latest registry add @keyline-ui=\S+$/,
    /^npx shadcn@latest add( @keyline-ui\/[a-z-]+)+( --overwrite)?$/,
    /^npx shadcn@latest add \.\/keyline-config\.json$/, // the playground's export
  ];
  // the homepage's install strip shows the generic step after the mapping; only there may the item be a placeholder
  const PLACEHOLDER = { file: "site/app/page.tsx", command: "npx shadcn@latest add @keyline-ui/<name>" };
  for (const f of [...DOCS, ...SITE, ...APP]) {
    for (const c of commands(read(f))) {
      if (c.includes("${")) continue; // built by site/lib/registry.ts, checked below
      if (f === PLACEHOLDER.file && c === PLACEHOLDER.command) continue;
      assert.ok(
        forms.some((r) => r.test(c)),
        `${f}: unexpected command "${c}"`,
      );
      for (const m of c.matchAll(/@keyline-ui\/([a-z-]+)/g))
        assert.ok(names.has(defined(m[1], "item name")), `${f}: "${c}" names no registry item "${m[1]}"`);
    }
  }
});

test("every registry add command points at the registry's public origin", () => {
  for (const f of DOCS) {
    for (const c of commands(read(f)).filter((c) => c.includes("registry add"))) assert.equal(c, REGISTRY_ADD, `${f}`);
    for (const m of read(f).matchAll(/"@keyline-ui":\s*"([^"]+)"/g))
      assert.equal(m[1], `${ORIGIN}/r/{name}.json`, `${f}: components.json mapping`);
  }
  assert.ok(
    read("site/lib/registry.ts").includes(`export const ORIGIN_SLOT = "https://<keyline-site>"`),
    "site placeholder matches the docs",
  );
});

test("no local or placeholder hosts in what consumers read or download", () => {
  const files = [...DOCS, ...SITE, ...walk("site/public/r")];
  for (const f of files) assert.doesNotMatch(read(f), /localhost|127\.0\.0\.1|example\.invalid/, f);
});

test("the catalog: homepage, namespaced dependencies, packages the repository ships", () => {
  assert.equal(catalog.homepage, pkg.homepage ?? "/");
  for (const item of catalog.items) {
    for (const d of item.registryDependencies ?? []) {
      assert.ok(
        d === "utils" || (d.startsWith("@keyline-ui/") && names.has(d.slice("@keyline-ui/".length))),
        `${item.name}: registry dependency ${d}`,
      );
    }
    for (const d of item.dependencies ?? []) {
      const name = d.replace(/(?<=.)@[^@]+$/, "");
      assert.ok(
        name in pkg.dependencies,
        `${item.name}: ${name} is not a runtime dependency of the repository (dev or site-only?)`,
      );
    }
  }
});

test("every item file the catalog lists is built, and none reaches outside the installed tree", () => {
  for (const { name } of catalog.items) {
    const built = JSON.parse(read(`site/public/r/${name}.json`));
    for (const file of built.files ?? []) {
      assert.ok(file.content, `${name}: ${file.path} has no content`);
      assert.match(file.target, /^components\/keyline\//, `${name}: ${file.path} installs outside components/keyline`);
      assert.doesNotMatch(
        file.content,
        /from ["'](@site\/|\.\.\/\.\.\/\.\.\/|registry\/)/,
        `${name}: ${file.path} imports from the repository`,
      );
    }
  }
});
