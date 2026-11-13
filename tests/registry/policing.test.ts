// What every shipped item must and must not contain, read from the built registry a consumer installs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const DIR = new URL("../../site/public/r/", import.meta.url).pathname;
type Item = {
  name: string;
  type: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: { path: string; content?: string }[];
  css?: unknown;
  cssVars?: unknown;
};
const items: Item[] = readdirSync(DIR)
  .filter((f) => f.endsWith(".json") && f !== "registry.json" && f !== "versions.json")
  .map((f) => JSON.parse(readFileSync(DIR + f, "utf8")) as Item);

test("no shipped file or CSS carries Radix idioms (radix-ui, --radix-, data-state)", () => {
  for (const it of items) {
    const shipped = [
      ...(it.files ?? []).map((f) => f.content ?? ""),
      JSON.stringify(it.css ?? {}),
      JSON.stringify(it.cssVars ?? {}),
    ];
    for (const text of shipped)
      for (const banned of ["radix-ui", "--radix-", "data-state"])
        assert.ok(!text.includes(banned), `${it.name} ships "${banned}"`);
  }
});

test("every ui item depends on the keyline theme", () => {
  const ui = items.filter((it) => it.type === "registry:ui");
  assert.ok(ui.length > 60, `only ${ui.length} ui items`);
  for (const it of ui)
    assert.ok(
      it.registryDependencies?.includes("@keyline-ui/keyline"),
      `${it.name} does not depend on @keyline-ui/keyline`,
    );
});

test("the theme item declares the fonts its stacks name", () => {
  const theme = items.find((it) => it.name === "keyline");
  assert.ok(theme, "no keyline item");
  const deps = theme.dependencies ?? [];
  const css = JSON.stringify([theme.css, theme.cssVars]);
  for (const family of ["Atkinson Hyperlegible Next Variable", "Atkinson Hyperlegible Mono Variable"])
    assert.ok(css.includes(family), `the theme no longer names ${family}`);
  for (const pkg of [
    "@fontsource-variable/atkinson-hyperlegible-next",
    "@fontsource-variable/atkinson-hyperlegible-mono",
  ])
    assert.ok(
      deps.some((d) => d === pkg || d.startsWith(`${pkg}@`)),
      `keyline does not depend on ${pkg}`,
    );
});
