// The public surface of every item, read from the built registry (site/public/r/*.json) a consumer installs, against
// tests/registry/surface.snapshot.json. Code that already copied an item depends on these names, so removing or
// renaming one breaks it (after shadcn's check-exports.mjs and gridcn's registry-surface.test.ts):
//   - exports         the names its files export;
//   - slots           its data-slot values;
//   - dataAttributes  the data-* attributes its files and CSS name;
//   - cssProperties   the CSS custom properties its files, css and cssVars name.
// A removal or rename fails unless the item's version went up since the snapshot and one of the new changelog
// entries is breaking (with its migration). Additions only need the snapshot rewritten:
//
//   pnpm surface:update    (refuses while a removal is not covered by a breaking entry)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const DIR = new URL("../../site/public/r/", import.meta.url).pathname;
const SNAPSHOT = new URL("./surface.snapshot.json", import.meta.url).pathname;

type Built = {
  name: string;
  files?: { content?: string }[];
  css?: unknown;
  cssVars?: Record<string, Record<string, string>>;
};
type Release = { version: string; changelog: { version: string; breaking?: boolean }[] };
const KINDS = ["exports", "slots", "dataAttributes", "cssProperties"] as const;
type Surface = { version: string } & Record<(typeof KINDS)[number], string[]>;

const all = (text: string, re: RegExp) => [...text.matchAll(re)].map((m) => m[1] ?? "");
const sorted = (xs: Iterable<string>) => [...new Set(xs)].toSorted();
// comments are not surface: a reworded comment must not read as a removal
const code = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

function exportsOf(text: string): string[] {
  const out = [
    ...all(
      text,
      /^export\s+(?:declare\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|enum|type|interface)\s+(\w+)/gm,
    ),
    ...[...text.matchAll(/^export\s+default\b/gm)].map(() => "default"),
    ...all(text, /^export\s+\*\s+from\s+["']([^"']+)["']/gm).map((s) => `* from ${s}`),
    ...all(text, /^export\s+\*\s+as\s+(\w+)\s+from/gm),
  ];
  for (const list of all(text, /^export\s+(?:type\s+)?\{([^}]*)\}/gm))
    for (const spec of list.split(",")) {
      const name = spec
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)
        .at(-1);
      if (name) out.push(name);
    }
  return out;
}

function surfaceOf(item: Built, version: string): Surface {
  const texts = (item.files ?? []).map((f) => code(f.content ?? ""));
  const css = JSON.stringify(item.css ?? {});
  const vars = Object.values(item.cssVars ?? {}).flatMap((group) => Object.keys(group).map((k) => `--${k}`));
  const shipped = [...texts, css].join("\n");
  return {
    version,
    exports: sorted(texts.flatMap(exportsOf)),
    slots: sorted([
      ...all(shipped, /(?<!\[)data-slot["']?\s*[:=]\s*\{?\s*["'`]([a-z0-9-]+)["'`]/g),
      ...all(shipped, /(?<![\w-])slot\s*[:=]\s*\{?\s*["'`]([a-z0-9-]+)["'`]/g),
    ]),
    dataAttributes: sorted(
      all(shipped, /(?:(?<![\w-])|(?<=\b(?:group|peer|in)-))data-\[?((?!slot\b)[a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g),
    ),
    cssProperties: sorted([...all(shipped, /(?<![\w-])(--[a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g), ...vars]),
  };
}

const releases = JSON.parse(readFileSync(DIR + "versions.json", "utf8")) as Record<string, Release>;
const current: Record<string, Surface> = Object.fromEntries(
  readdirSync(DIR)
    .filter((f) => f.endsWith(".json") && f !== "registry.json" && f !== "versions.json")
    .toSorted()
    .map((f) => {
      const item = JSON.parse(readFileSync(DIR + f, "utf8")) as Built;
      const release = releases[item.name];
      if (!release) throw new Error(`${item.name} has no entry in versions.json: run pnpm registry:build`);
      return [item.name, surfaceOf(item, release.version)];
    }),
);
const snapshot = JSON.parse(readFileSync(SNAPSHOT, "utf8")) as Record<string, Surface>;

const semver = (v: string) => v.split(".").map(Number);
const newer = (a: string, b: string) => {
  const [x, y] = [semver(a), semver(b)];
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0);
  return false;
};

/** Every removal from the snapshot that no breaking changelog entry since the snapshot's version announces. */
function unannounced(): string[] {
  const out: string[] = [];
  for (const [name, was] of Object.entries(snapshot)) {
    const now = current[name];
    if (!now) {
      out.push(`${name}: the item is gone; keep a tombstone (deprecated: "<replacement>") for one release`);
      continue;
    }
    const release = releases[name];
    const announced =
      newer(now.version, was.version) &&
      (release?.changelog ?? []).some((e) => newer(e.version, was.version) && e.breaking === true);
    if (announced) continue;
    for (const kind of KINDS) {
      const gone = was[kind].filter((x) => !now[kind].includes(x));
      if (gone.length)
        out.push(
          `${name}: ${kind} ${gone.join(", ")} removed or renamed without a breaking changelog entry ` +
            `(bump the major and write it, see .github/CONTRIBUTING.md)`,
        );
    }
  }
  return out;
}

const problems = unannounced();
if (process.env["UPDATE_SURFACE"] === "1" && !problems.length)
  writeFileSync(SNAPSHOT, JSON.stringify(current, null, 2) + "\n");

test("no export, slot, data attribute or CSS custom property is removed without a breaking entry", () => {
  assert.deepEqual(problems, []);
});

test("surface.snapshot.json records the current surface (run pnpm surface:update)", () => {
  const latest = JSON.parse(readFileSync(SNAPSHOT, "utf8")) as Record<string, Surface>;
  assert.deepEqual(latest, current);
});
