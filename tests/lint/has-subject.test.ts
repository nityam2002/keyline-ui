// Guards the cause of the docs site's slow page changes: a :has() outside a selector's subject makes Chrome restyle
// the whole document on every DOM change. The registry, the theme and the site must hold none; the fixtures prove
// the scanner finds each shape that was replaced and passes the subject-position forms that replaced them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cssHits, sourceHits } from "./has-subject.ts";

const root = fileURLToPath(new URL("../..", import.meta.url));
const read = (f: string) => readFileSync(new URL(f, `file://${root}/`), "utf8");

test("the registry and the site put no :has() outside a selector's subject", () => {
  const hits: string[] = [];
  for (const f of ["src/registry/keyline/theme/foundation.css", ...globSync("site/app/**/*.css", { cwd: root })])
    hits.push(...cssHits(read(f)).map((s) => `${f} :: ${s}`));
  const sources = globSync("{src/registry/keyline,site}/**/*.{ts,tsx}", {
    cwd: root,
    exclude: (p) => p.includes("node_modules") || p.includes(".next"),
  });
  assert.ok(sources.length > 50, "the scan reads the registry and site source");
  for (const f of sources) hits.push(...sourceHits(read(f)).map((c) => `${f} :: ${c}`));
  assert.deepEqual(hits, []);
});

test("every replaced shape is found", () => {
  assert.equal(sourceHits(read("tests/lint/fixtures/has/outside.tsx")).length, 8);
  assert.equal(cssHits(read("tests/lint/fixtures/has/styles.css")).length, 2);
});

test("the subject-position forms pass", () => {
  assert.deepEqual(sourceHits(read("tests/lint/fixtures/has/subject.tsx")), []);
});
