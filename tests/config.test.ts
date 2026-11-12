import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CONFIG,
  PALETTES,
  attributesSnippet,
  changedTokens,
  configAttributes,
  configToCss,
  configToRegistryItem,
  configTokens,
  decodeConfig,
  encodeConfig,
  normalizeConfig,
  paletteWarnings,
  roleColor,
  whiteContrast,
  darkFill,
  weights,
  type KeylineConfig,
} from "../src/registry/keyline/lib/keyline-config.ts";
import { KEYLINE_CONFIG_TOKENS } from "../src/registry/keyline/lib/keyline-scope.ts";

const cfg = (c: Partial<KeylineConfig>): KeylineConfig => ({ ...DEFAULT_CONFIG, ...c });

test("the default configuration exports nothing: the theme already carries it", () => {
  assert.deepEqual(changedTokens(DEFAULT_CONFIG), {});
  assert.match(configToCss(DEFAULT_CONFIG), /nothing to override/);
  // the registry item always carries every token so a re-install overwrites all of them
  assert.deepEqual(
    Object.keys(configToRegistryItem(DEFAULT_CONFIG).css[":root"] as object).sort(),
    [...KEYLINE_CONFIG_TOKENS].sort(),
  );
});

test("every token the configuration sets is one the portal scope carries", () => {
  assert.deepEqual(Object.keys(configTokens(DEFAULT_CONFIG)).sort(), [...KEYLINE_CONFIG_TOKENS].sort());
});

test("a palette change exports only the palette sources", () => {
  const c = cfg({ palette: { ...PALETTES.harbor } });
  const t = changedTokens(c);
  assert.deepEqual(Object.keys(t).sort(), [
    "--kl-attention",
    "--kl-commit",
    "--kl-neutral-c",
    "--kl-neutral-h",
    "--kl-working",
  ]);
  assert.equal(t["--kl-commit"], PALETTES.harbor.commit);
});

test("square is the default; a cut is a token, density and motion are attributes", () => {
  assert.equal(DEFAULT_CONFIG.cut, "off");
  assert.equal(changedTokens(cfg({ cut: "off" }))["--kl-cut"], undefined);
  const c = cfg({ cut: "full", density: "compact", motion: "reduce", theme: "dark" });
  assert.equal(changedTokens(c)["--kl-cut"], "1");
  assert.deepEqual(configAttributes(c), {
    className: "dark",
    "data-kl-density": "compact",
    "data-kl-motion": "reduce",
  });
  assert.equal(attributesSnippet(c), '<html class="dark" data-kl-density="compact" data-kl-motion="reduce">');
  assert.equal(attributesSnippet(DEFAULT_CONFIG.theme === "light" ? cfg({ theme: "system" }) : DEFAULT_CONFIG), null);
});

test("weights clamp to what the font has", () => {
  assert.deepEqual(weights({ font: "atkinson", strong: 800 }), { strong: 800, display: 800 });
  assert.deepEqual(weights({ font: "plex", strong: 800 }), { strong: 700, display: 700 });
  assert.deepEqual(weights({ font: "plex", strong: 600 }), { strong: 600, display: 700 });
});

test("a font that is not bundled brings its packages and imports", () => {
  const item = configToRegistryItem(cfg({ font: "plex" }));
  assert.deepEqual(item.dependencies, ["@fontsource-variable/ibm-plex-sans", "@fontsource/ibm-plex-mono"]);
  assert.ok('@import "@fontsource-variable/ibm-plex-sans"' in item.css);
  assert.match(configToCss(cfg({ font: "plex" })), /@import "@fontsource\/ibm-plex-mono\/400.css";/);
  assert.deepEqual(configToRegistryItem(cfg({ font: "system" })).dependencies, []);
});

test("a scoped export targets the configuration scope, not :root", () => {
  const c = cfg({ cut: "quiet" });
  assert.match(configToCss(c, { scope: "billing" }), /\[data-kl-config="billing"\] \{\n  --kl-cut: 0.5;\n\}/);
  assert.equal(
    (configToRegistryItem(c, { scope: "billing" }).css['[data-kl-config="billing"]'] as Record<string, string>)[
      "--kl-cut"
    ],
    "0.5",
  );
});

test("registry item never points at a development host", () => {
  const s = JSON.stringify(configToRegistryItem(cfg({ font: "plex", cut: "off", palette: { ...PALETTES.ember } })));
  assert.doesNotMatch(s, /localhost|127\.0\.0\.1|https?:\/\/(?!ui\.shadcn\.com\/schema)/);
});

test("shared configurations round-trip, and broken input falls back to defaults", () => {
  const c = cfg({ palette: { ...PALETTES.ledger }, font: "system", strong: 600, density: "comfortable" });
  assert.deepEqual(decodeConfig(encodeConfig(c)), normalizeConfig(c));
  assert.equal(decodeConfig("not base64!"), null);
  const n = normalizeConfig({ cut: "sideways", palette: { commit: "red; background: url(x)" }, strong: 900 });
  assert.equal(n.cut, DEFAULT_CONFIG.cut);
  assert.equal(n.strong, 700);
  assert.equal(n.palette.commit, DEFAULT_CONFIG.palette.commit);
});

test("custom hues keep the role tone where it is safe and darken it where it is not", () => {
  assert.equal(roleColor("commit", 150), "oklch(0.48 0.18 150)");
  assert.equal(roleColor("working", 98.4), "oklch(0.9 0.16 98)");
  // cyan at the attention tone clips lighter on an sRGB display; white text measured 3.8:1 before
  assert.ok(Number(/oklch\(([\d.]+)/.exec(roleColor("attention", 190))![1]) < 0.55);
});

test("every custom hue and every preset keeps white text at 4.5:1 on commit and attention fills, light and dark", () => {
  const parse = (c: string) => c.slice(6, -1).split(" ").map(Number) as [number, number, number];
  const check = (role: "commit" | "attention", c: string, where: string) => {
    const [l, ch, h] = parse(c);
    assert.ok(whiteContrast(l, ch, h) >= 4.5, `${where} light ${c}`);
    const [dl, dc] = darkFill(role, l, ch);
    assert.ok(whiteContrast(dl, dc, h) >= 4.5, `${where} dark ${c}`);
  };
  for (let h = 0; h < 360; h += 5)
    for (const r of ["commit", "attention"] as const) check(r, roleColor(r, h), `hue ${h} ${r}`);
  for (const p of Object.values(PALETTES)) {
    check("commit", p.commit, p.label);
    check("attention", p.attention, p.label);
  }
});

test("palette warnings flag signals that would read as one another", () => {
  for (const p of Object.values(PALETTES)) assert.deepEqual(paletteWarnings(p), [], p.label);
  const clash = { ...PALETTES.signal, commit: roleColor("commit", 40) };
  assert.equal(paletteWarnings(clash).length, 1);
});
