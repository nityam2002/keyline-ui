// Every Keyline variable a registry item reads is defined, and every kl- Tailwind utility it uses exists.
// A variable is defined by the theme (theme/keyline.css) or, for a component's private variable, by the item's
// own files (its CSS, a style prop / setProperty in its source, or an arbitrary-property utility such as
// [--kl-cut-line:…]). A read is var(--kl-x) or a utility's variable form, (--kl-x) or (length:--kl-x); one with a
// fallback (var(--kl-x, 6), px-(--kl-x,14px)) is allowed to be undefined. A utility such as bg-kl-cell or px-kl-inset needs a Tailwind theme entry ending in its
// name (tokens.ts THEME_ENTRIES).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadMetas, ROOT } from "../../scripts/registry/build.ts";
import { THEME_ENTRIES } from "../../src/registry/keyline/theme/tokens.ts";

const read = (f: string) => readFileSync(ROOT + f, "utf8");
const metas = await loadMetas();
const theme = metas.filter((m) => m.theme);
const declared = (text: string) =>
  new Set([...text.matchAll(/["'\s{;([]--(kl-[a-z0-9-]+)["']?\s*[:,]/g)].map((m) => m[1] ?? ""));
const themeVars = new Set(theme.flatMap((m) => [...declared(read(m.cssFile ?? ""))]));

test("the theme defines its tokens (sanity)", () => {
  for (const v of ["kl-cell", "kl-ctl", "kl-working", "kl-text-label", "kl-dark"]) assert.ok(themeVars.has(v), v);
});

const filesOf = (m: (typeof metas)[number]) => [
  ...(m.files ?? []).map((f) => f.path),
  ...(m.cssFile ? [m.cssFile] : []),
];
const byName = new Map(metas.map((m) => [m.name, m]));
/** The item and everything it installs with it (its registry dependencies, transitively). */
const closure = (name: string, seen = new Set<string>()) => {
  if (seen.has(name)) return seen;
  seen.add(name);
  for (const d of byName.get(name)?.registryDependencies ?? [])
    if (d.startsWith("@keyline-ui/")) closure(d.slice("@keyline-ui/".length), seen);
  return seen;
};

test("every var(--kl-…) a registry item reads is defined by the theme, the item or an item it depends on", () => {
  const missing: string[] = [];
  for (const m of metas) {
    const files = filesOf(m);
    const texts = files.map(read);
    const own = new Set(
      [...closure(m.name)].flatMap((n) => {
        const it = byName.get(n);
        return it ? filesOf(it).flatMap((f) => [...declared(read(f))]) : [];
      }),
    );
    for (const [i, t] of texts.entries())
      for (const [, name, fallback] of t.matchAll(/(?:var)?\((?:[a-z-]+:)?\s*--(kl-[a-z0-9-]+)\s*(,)?/g))
        if (name && !fallback && !themeVars.has(name) && !own.has(name)) missing.push(`${files[i]}: --${name}`);
  }
  assert.deepEqual([...new Set(missing)], []);
});

// Tailwind utility prefixes that take a theme value (colour, spacing, font, text, ease)
const PREFIX =
  /(?:^|[\s"'`:!-])(?:-)?(bg|text|border(?:-[xytblrse])?|fill|stroke|outline|ring|divide|decoration|accent|caret|placeholder|from|via|to|shadow|font|p[xytblrse]?|m[xytblrse]?|gap(?:-[xy])?|space-[xy]|w|h|size|min-[wh]|max-[wh]|inset(?:-[xy])?|top|left|right|bottom|start|end|translate-[xy]|scroll-[mp][xytblrse]?|ease|leading|tracking)-(kl-[a-z0-9-]+?)(?:\/\d+)?(?=$|[\s"'`])/g;
const themeNames = new Set(THEME_ENTRIES.map(([entry]) => entry.slice(entry.indexOf("kl"))));

test("every kl- utility a registry item uses has a Tailwind theme entry", () => {
  const missing: string[] = [];
  for (const m of metas)
    for (const f of m.files ?? []) {
      if (!/\.tsx?$/.test(f.path)) continue;
      for (const [, prefix, name] of read(f.path).matchAll(PREFIX))
        if (name && !themeNames.has(name)) missing.push(`${f.path}: ${prefix}-${name}`);
    }
  assert.deepEqual([...new Set(missing)], []);
});
