// The site's share image (Open Graph and X/Twitter): site/public/og.png, 1200×630. Its alt text is SHARE_IMAGE in
// site/lib/seo.ts; keep the two in step. It is drawn from the site's own parts (the homepage land from site/lib/contours.ts, the
// Trap mark, Atkinson Hyperlegible Next and Mono from node_modules) and screenshotted in Chrome, so it uses the
// real fonts. Run it again when the headline, the mark or the land changes:
//
//   node scripts/og-image.mjs
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { land, isIndex, VIEW, TENTHS } from "../site/lib/contours.ts";

const ROOT = new URL("..", import.meta.url);
// inlined: a page set with setContent is about:blank, which may not load file: URLs
const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(new URL(`node_modules/@fontsource-variable/${pkg}/files/${file}`, ROOT)).toString("base64")}`;
const OUT = new URL("site/public/og.png", ROOT);

const HEADLINE = "Built like an instrument panel.";
const LINE = "React components for dense interfaces, on Base UI, installed from a shadcn registry.";

// the light theme's resolved colours (site/app/icon.svg and --kl-paper / --kl-line-soft in keyline.css)
const C = { paper: "#f0f0f3", ink: "#14151a", ink2: "#4a4c55", soft: "#c4c5cc", cobalt: "#1d4ed8" };

const { rings, keyline } = land();
const svg = `<svg viewBox="${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}" preserveAspectRatio="xMidYMid slice">
  <g transform="scale(${1 / TENTHS})" fill="none">
    ${rings.map((r) => `<path d="${r.d}" stroke="${isIndex(r.level) ? "rgba(29,78,216,.3)" : C.soft}" stroke-width="${isIndex(r.level) ? 1.25 : 1}" vector-effect="non-scaling-stroke"/>`).join("")}
    <path d="${keyline}" stroke="rgba(29,78,216,.55)" stroke-width="3" vector-effect="non-scaling-stroke"/>
  </g>
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Atkinson; src: url(${font("atkinson-hyperlegible-next", "atkinson-hyperlegible-next-latin-wght-normal.woff2")}); font-weight: 200 800; }
@font-face { font-family: AtkinsonMono; src: url(${font("atkinson-hyperlegible-mono", "atkinson-hyperlegible-mono-latin-wght-normal.woff2")}); font-weight: 200 800; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: ${C.paper}; color: ${C.ink}; font-family: Atkinson; padding: 28px; }
.frame { position: relative; width: 100%; height: 100%; border: 3px solid ${C.ink}; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 44px 52px; }
.land { position: absolute; inset: 0; }
.land svg { width: 100%; height: 100%; }
.top, .foot { position: relative; display: flex; align-items: center; gap: 14px; }
.mark { font-family: AtkinsonMono; font-size: 26px; font-weight: 700; letter-spacing: -0.01em; }
h1 { position: relative; font-size: 92px; line-height: 1; font-weight: 800; letter-spacing: -0.035em; max-width: 900px; }
.line { position: relative; font-size: 28px; line-height: 1.35; color: ${C.ink2}; max-width: 820px; background: ${C.paper}; padding: 6px 0; }
.foot { font-family: AtkinsonMono; font-size: 20px; color: ${C.ink2}; justify-content: space-between; }
.foot span { background: ${C.paper}; padding: 4px 8px; border: 1px solid ${C.ink}; }
</style></head><body><div class="frame">
<div class="land">${svg}</div>
<div class="top"><svg width="44" height="44" viewBox="0 0 22 22" shape-rendering="crispEdges"><rect x="0" y="0" width="14" height="14" fill="${C.cobalt}"/><path d="M3 3h19v19H3zM6 6v13h13V6z" fill-rule="evenodd" fill="${C.ink}"/></svg><span class="mark">Keyline UI</span></div>
<div><h1>${HEADLINE}</h1><p class="line">${LINE}</p></div>
<div class="foot"><span>React 19 · TypeScript · Tailwind CSS 4</span><span>MIT licence · pre-release</span></div>
</div></body></html>`;

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
writeFileSync(OUT, await page.screenshot({ type: "png" }));
await browser.close();
console.log(`wrote ${OUT.pathname}`);
