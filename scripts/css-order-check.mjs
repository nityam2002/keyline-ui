// Install-order independence. Components carry no CSS of their own; what is left is the theme items' CSS (the
// tokens and the foundation, keyline and keyline-shadcn) and the blocks' CSS. The shadcn CLI appends an item's CSS
// where it lands in the order items are added, and a re-add appends any rule that is new, so no Keyline stylesheet
// may depend on coming after another: a block's rules must not win over the foundation by order alone.
//
// This builds the app twice: as written, and with those imports in src/demo/globals.css reversed (in the build only;
// the source file is never touched). It captures the computed styles of every Keyline element on the specimen and
// the playground preview in both, and diffs.
//
// A canary proves the reversal and the capture work, so the check cannot pass by comparing two identical builds: both
// builds import tests/css-order/canary-first.css before the Keyline stylesheets and canary-second.css after them,
// inside the span that is reversed. The two set one property on the same probe element, so it must differ between
// the builds, and nothing else may.
//   pnpm test:css-order            (no dev server needed)
import { chromium } from "playwright";
import { join } from "node:path";
import { buildApp, serveApp } from "./test-app.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, ".artifacts/css-order");
const CANARY = "kl-css-order-canary";
const PROPS = [
  "color",
  "backgroundColor",
  "borderTopColor",
  "borderInlineStartColor",
  "borderTopWidth",
  "borderInlineStartWidth",
  "borderInlineEndWidth",
  "borderBottomWidth",
  "paddingTop",
  "paddingBottom",
  "paddingInlineStart",
  "paddingInlineEnd",
  "marginTop",
  "marginInlineStart",
  "fontFamily",
  "fontWeight",
  "fontSize",
  "lineHeight",
  "display",
  "gap",
  "clipPath",
  "textDecorationLine",
  "opacity",
  "outlineStyle",
];

const KEYLINE_IMPORT = /^@import "\.\.\/registry\/keyline\/(theme|blocks)\/[^"]+\.css";$/;
const canary = (n) => `@import "../../tests/css-order/canary-${n}.css";`;

/** Wraps the Keyline stylesheet imports in the canary pair and, with `reverse`, reverses the whole span. */
export const orderImports = (css, { reverse }) => {
  const lines = css.split("\n");
  const at = lines.map((l, i) => (KEYLINE_IMPORT.test(l) ? i : -1)).filter((i) => i >= 0);
  const first = at[0] ?? -1;
  const last = at.at(-1) ?? -1;
  // contiguous, so moving the span moves nothing else
  if (first < 0 || last - first + 1 !== at.length) return { css, imports: [] };
  const span = [canary("first"), ...lines.slice(first, last + 1), canary("second")];
  const ordered = reverse ? span.toReversed() : span;
  lines.splice(first, at.length, ...ordered);
  return { css: lines.join("\n"), imports: ordered };
};

const order = {};
const transform = (name, reverse) => (id, code) => {
  if (!/\/src\/demo\/globals\.css($|\?)/.test(id)) return null;
  const r = orderImports(code, { reverse });
  order[name] = r.imports;
  return r.css;
};
await Promise.all([
  buildApp(join(OUT, "as-written"), { transformCss: transform("as-written", false) }),
  buildApp(join(OUT, "reversed"), { transformCss: transform("reversed", true) }),
]);
const [s1, s2] = await Promise.all([serveApp(join(OUT, "as-written")), serveApp(join(OUT, "reversed"))]);
const b = await chromium.launch({ channel: "chrome" });
async function capture(base) {
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } });
  const p = await ctx.newPage();
  const all = {};
  for (const [name, route, sel] of [
    ["playground", "playground", "[data-testid=scope-preview]"],
    ["specimen", "specimen", "body"],
  ]) {
    await p.goto(base + "#/" + route);
    await p.waitForSelector(`[data-route="${route}"] ${sel === "body" ? "" : sel}`.trim());
    // fonts loaded and no finite transition still running, so both captures see settled styles
    await p.waitForFunction(
      () =>
        document.fonts.status === "loaded" &&
        !document
          .getAnimations()
          .some(
            (a) =>
              a.playState === "running" &&
              a.timeline === document.timeline &&
              a.effect?.getComputedTiming().iterations !== Infinity,
          ),
    );
    all[name] = await p.evaluate(
      ([sel, PROPS, CANARY]) => {
        const scope = document.querySelector(sel);
        const probe = document.createElement("span");
        probe.className = CANARY;
        probe.textContent = "canary";
        scope.append(probe);
        return [...scope.querySelectorAll("*")]
          .filter((e) => String(e.className).includes("kl-"))
          .map((e) => {
            const s = getComputedStyle(e);
            return [
              e.tagName +
                "." +
                String(e.className)
                  .split(" ")
                  .filter((c) => c.startsWith("kl-"))
                  .join("."),
              PROPS.map((k) => s[k]),
            ];
          });
      },
      [sel, PROPS, CANARY],
    );
  }
  await ctx.close();
  return all;
}
let a, z;
try {
  [a, z] = await Promise.all([capture(s1.url), capture(s2.url)]);
} finally {
  await b.close();
  await s1.close();
  await s2.close();
}
const diffs = [];
for (const k of Object.keys(a))
  a[k].forEach(
    ([sel, va], i) =>
      z[k][i] &&
      va.forEach(
        (v, j) => v !== z[k][i][1][j] && diffs.push({ sel, text: `${k} ${sel} ${PROPS[j]}: ${v} → ${z[k][i][1][j]}` }),
      ),
  );
const isCanary = (d) => d.sel === `SPAN.${CANARY}`;
const canaryDiffs = [...new Set(diffs.filter(isCanary).map((d) => d.text))];
const uniq = [...new Set(diffs.filter((d) => !isCanary(d)).map((d) => d.text))];
const keyline = (order["as-written"] ?? []).filter((l) => !l.includes("/css-order/canary-"));
const expectedCanary = [
  "playground SPAN.kl-css-order-canary textDecorationLine: line-through → overline",
  "specimen SPAN.kl-css-order-canary textDecorationLine: line-through → overline",
];
const n = a.playground.length + a.specimen.length;
const sameShape = a.playground.length === z.playground.length && a.specimen.length === z.specimen.length;
const checks = [
  [
    keyline.length >= 2 &&
      keyline.some((l) => l.includes("/theme/")) &&
      JSON.stringify(order["reversed"]) === JSON.stringify(order["as-written"].toReversed()),
    "css order: the reversed build reverses the theme and block imports",
    JSON.stringify(order),
  ],
  [
    n > 500 && sameShape,
    "css order: both builds render the same Keyline elements",
    JSON.stringify({ n, z: z.playground.length + z.specimen.length }),
  ],
  [
    JSON.stringify(canaryDiffs) === JSON.stringify(expectedCanary),
    "css order: the canary, and only its one property, follows the reversed order",
    JSON.stringify(canaryDiffs),
  ],
  [
    !uniq.length,
    "css order: no computed style depends on the order of the theme and block CSS",
    uniq.slice(0, 20).join("; "),
  ],
];
for (const [ok, name, d] of checks) console.log(`${ok ? "  ✓" : "  ✖"} [chromium] ${name}${ok ? "" : " — " + d}`);
console.log(
  `css order: ${n} elements, ${keyline.length} Keyline stylesheets in the reordered span (${keyline.map((l) => l.split("/").at(-1)?.replace('";', "")).join(", ")}), ` +
    `${canaryDiffs.length} canary differences, ${uniq.length} order-dependent styles`,
);
process.exit(checks.every(([ok]) => ok) ? 0 : 1);
