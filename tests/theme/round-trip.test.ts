// The theme items survive `shadcn add`. Each built item's cssVars and css go through the CLI's own updaters
// (@shadcn/registry, the version the pinned shadcn uses), into an app stylesheet that has only Tailwind. Every
// selector, at its full path, and every declaration must come out unchanged. The CLI flattens a selector nested
// under another selector and keeps the first value of a repeated property, so either would fail here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import postcss from "postcss";
import { transformCss } from "@shadcn/registry/internal/updaters/update-css";
import { transformCssVars } from "@shadcn/registry/internal/updaters/update-css-vars";

type CssObject = { [key: string]: string | CssObject };
type Item = { name: string; css?: CssObject; cssVars?: Record<string, Record<string, string>> };

const item = (name: string) =>
  JSON.parse(readFileSync(new URL(`../../site/public/r/${name}.json`, import.meta.url), "utf8")) as Item;
const norm = (s: string) => s.replace(/\s+/g, " ").trim();

async function install(it: Item) {
  let out = '@import "tailwindcss";\n';
  // the order updateCss uses: cssVars first, then css
  // @ts-expect-error -- the config is only read for Tailwind v3 projects
  if (it.cssVars) out = await transformCssVars(out, it.cssVars, {}, { tailwindVersion: "v4", overwriteCssVars: true });
  if (it.css) out = await transformCss(out, it.css);
  return postcss.parse(out);
}

const keyOf = (n: postcss.ChildNode) =>
  n.type === "rule" ? norm(n.selector) : n.type === "atrule" ? norm(`@${n.name} ${n.params}`) : null;

/** The nodes under `parents` whose key is `key` (several when a block repeats, e.g. two `@layer base`). */
const children = (parents: postcss.Container[], key: string) =>
  parents.flatMap((p) => (p.nodes ?? []).filter((n) => keyOf(n) === norm(key))) as postcss.Container[];

function check(obj: CssObject, parents: postcss.Container[], path: string[], missing: string[]) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      const [, v = value, imp] = value.match(/^(.*?)( !important)?$/) ?? [];
      const found = parents.some((p) =>
        (p.nodes ?? []).some(
          (n) => n.type === "decl" && n.prop === key && norm(n.value) === norm(v) && !!n.important === !!imp,
        ),
      );
      if (!found) missing.push(`${[...path].join(" > ")} { ${key}: ${value} }`);
      continue;
    }
    let next = children(parents, key);
    // the CLI writes @keyframes into @theme inline: the one relocation it is known to make
    if (!next.length && key.startsWith("@keyframes"))
      next = children(children(parents, "@theme inline"), key).length
        ? children(children(parents, "@theme inline"), key)
        : children(
            children(
              parents.map((p) => p.root()),
              "@theme inline",
            ),
            key,
          );
    if (!next.length) {
      missing.push(`${[...path, key].join(" > ")} (rule lost or moved)`);
      continue;
    }
    check(value, next, [...path, key], missing);
  }
}

for (const name of ["keyline", "keyline-shadcn"]) {
  test(`${name}: every rule and declaration of the built item survives shadcn add unchanged`, async () => {
    const it = item(name);
    const root = await install(it);
    const missing: string[] = [];
    check(it.css ?? {}, [root], [], missing);
    assert.deepEqual(missing, [], `lost or changed by the CLI:\n${missing.slice(0, 20).join("\n")}`);
  });

  test(`${name}: cssVars land in :root, .dark and @theme inline`, async () => {
    const it = item(name);
    const root = await install(it);
    const where = { light: ":root", dark: ".dark", theme: "@theme inline" } as const;
    const missing: string[] = [];
    for (const [group, vars] of Object.entries(it.cssVars ?? {})) {
      const sel = where[group as keyof typeof where];
      assert.ok(sel, `${name}: unexpected cssVars group ${group}`);
      const obj = Object.fromEntries(Object.entries(vars).map(([k, v]) => [`--${k}`, v]));
      check({ [sel]: obj }, [root], [], missing);
    }
    assert.deepEqual(missing, [], missing.slice(0, 20).join("\n"));
  });
}

test("the keyline theme's foundation holds no selector nested under another selector", () => {
  const nested: string[] = [];
  const walk = (obj: CssObject, inRule: string | null) => {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v !== "object") continue;
      if (!k.startsWith("@") && inRule && !k.startsWith("&")) nested.push(`${inRule} > ${k}`);
      walk(v, k.startsWith("@") ? inRule : k);
    }
  };
  walk(item("keyline").css ?? {}, null);
  assert.deepEqual(nested, []);
});
