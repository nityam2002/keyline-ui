// Shooting for the visual-parity harness (scripts/visual.mjs). A shot is one fixture — a specimen entry's section,
// or a whole route — in one configuration, at rest or in one state from tests/visual/states.mjs, in one engine.
// Everything that could differ between two runs of the same code is pinned here: the viewport, time, timezone,
// locale, Math.random, the pointer, the caret, fonts, and motion (finite motion is waited out; infinite animations
// are stopped by Playwright's animations: "disabled").
import { chromium, webkit } from "playwright";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { settle, idle, stable } from "../browser/fixtures.mjs";
import { STATES } from "./states.mjs";

/** Specimen entries are shot in a tall viewport so the tallest entry (chat) is never cut by the catalogue's scroll
 * area; a shot whose entry outgrows it fails and names the entry. Routes are shot at the specs' viewport. */
export const ENTRY_VIEWPORT = { width: 1280, height: 2400 };
export const ROUTE_VIEWPORT = { width: 1280, height: 900 };
/** Routes shot whole (fixture name = route). */
export const ROUTES = ["app", "playground"];
/** The demo's display modes (src/demo/App.tsx readCfg), set by query parameter as the specs do. */
export const CONFIGS = ["light", "dark"].flatMap((theme) =>
  ["default", "compact"].flatMap((density) => ["ltr", "rtl"].map((dir) => ({ theme, density, dir }))),
);
export const cfgName = (c) => `${c.theme}-${c.density}-${c.dir}`;
/** "Now" for every page: the demo's dates are fixed, but the calendars' `today` defaults to new Date(). */
const NOW = new Date("2026-11-12T12:00:00Z");

// Chrome rasterizes in software, and whole tiles at a time. With GPU raster the same page came out with 1-unit
// colour differences on some tiles from run to run (1 shot in 16 of the toolbar entry; software raster: 48 of 48
// identical). With partial raster (re-rastering only the invalidated part of a tile) an SVG icon's anti-aliasing
// differed by a step or two at the seam (input-group, number: 1 shot in 3–4; without it, 40 of 40 identical).
const LAUNCH = {
  chromium: () =>
    chromium.launch({ channel: "chrome", args: ["--disable-gpu-rasterization", "--disable-partial-raster"] }),
  webkit: () => webkit.launch(),
};
export const ENGINES = Object.keys(LAUNCH);

/** Installed in every page before its scripts. Math.random is seeded (mulberry32), so simulated latency and any
 * random demo data repeat exactly. Date starts at a fixed instant and then runs at the real rate: the calendars'
 * `today` and any clock text are the same every run, and code that waits on Date.now() (a hold of 700ms) still
 * sees time pass. (Playwright's clock is not used: it also fakes performance.now() and requestAnimationFrame,
 * which then disagree with document.timeline, the clock of the motion's Web Animations.) */
const PIN = (now) => {
  let s = 0x6b6c;
  Math.random = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const Real = Date;
  const at = () => now + Math.floor(performance.now());
  function Fixed(...a) {
    if (!new.target) return new Real(at()).toString();
    return Reflect.construct(Real, a.length ? a : [at()], new.target);
  }
  Fixed.prototype = Real.prototype;
  Fixed.now = at;
  Fixed.parse = Real.parse;
  Fixed.UTC = Real.UTC;
  globalThis.Date = Fixed;
};

/** Every shot for these fixtures, configurations and engines: at rest, then each declared state. */
export function plan({ entries, engines, configs = CONFIGS }) {
  const shots = [];
  for (const engine of engines)
    for (const cfg of configs)
      for (const fixture of entries) {
        const states = [{ name: null }, ...(STATES[fixture] ?? [])];
        for (const state of states) {
          const name = `${engine}/${cfgName(cfg)}/${fixture}${state.name ? `@${state.name}` : ""}`;
          // what the shot depends on besides the code under test: a changed state definition is shot again
          const def = createHash("sha1")
            .update(JSON.stringify([fixture, cfg, state]))
            .digest("hex")
            .slice(0, 12);
          shots.push({ name, engine, cfg, fixture, state, def });
        }
      }
  return shots;
}

/** The specimen's entry ids, in page order, read from the app at `url`. */
export async function listEntries(url) {
  const b = await chromium.launch({ channel: "chrome" });
  try {
    const p = await b.newPage({ viewport: ENTRY_VIEWPORT });
    await p.goto(new URL("#/specimen", url).href);
    await p.locator("[data-testid=specimen] section[data-testid=entry]").first().waitFor();
    return await p.evaluate(() =>
      [...document.querySelectorAll("[data-testid=specimen] section[data-testid=entry]")].map((s) => s.id),
    );
  } finally {
    await b.close();
  }
}

/** Launches the engines; resolves to { browsers, versions, close }. */
export async function launch(engines) {
  const browsers = {};
  try {
    for (const e of engines) browsers[e] = await LAUNCH[e]();
  } catch (err) {
    await Promise.all(Object.values(browsers).map((b) => b.close()));
    throw err;
  }
  return {
    browsers,
    versions: Object.fromEntries(engines.map((e) => [e, browsers[e].version()])),
    close: () => Promise.all(Object.values(browsers).map((b) => b.close().catch(() => {}))),
  };
}

const STEP = {
  // keyboard focus: the element is focused from script with no pointer input before it, so it matches
  // :focus-visible as after Tab; the step fails if it does not
  focus: async (p, sel) => {
    const l = p.locator(sel).first();
    await l.focus();
    const ok = await l.evaluate((el) => {
      const a = el.ownerDocument.activeElement;
      return !!a && a.matches(":focus-visible");
    });
    if (!ok) throw new Error(`focus ${sel}: the focused element does not match :focus-visible`);
  },
  hover: async (p, sel) => {
    const l = p.locator(sel).first();
    await l.hover();
    POINTER.set(p, await l.boundingBox());
  },
  click: async (p, sel) => {
    const l = p.locator(sel).first();
    await l.scrollIntoViewIfNeeded();
    const box = await l.boundingBox();
    await l.click();
    POINTER.set(p, box);
  },
  press: (p, key) => p.keyboard.press(key),
  wait: (p, sel) => p.locator(sel).first().waitFor({ state: "visible" }),
  // a scroll by the reader: ["wheel", selector, dy] — the pointer over the element, then the wheel (dy < 0 scrolls
  // up). A scroll set from script would skip what a reader's scroll sets off (a log's "Latest" cell). It goes in
  // two parts: one notch, waited for until the page has had its wheel event, then the rest. WebKit can scroll
  // before it dispatches the wheel event, and a page that tells a reader's scroll from its own by the wheel then
  // sees the whole scroll as its own (seen: the message scroller's "Latest" stayed hidden, 3 loads in 192); the
  // second part's scroll always comes after the first part's wheel event.
  wheel: async (p, sel, dy) => {
    await STEP.hover(p, sel);
    const notch = Math.sign(dy) * Math.min(Math.abs(dy), 40);
    await p.evaluate(() => {
      window.__klWheel = false;
      addEventListener("wheel", () => (window.__klWheel = true), { capture: true, passive: true, once: true });
    });
    await p.mouse.wheel(0, notch);
    await p.waitForFunction(() => window.__klWheel);
    if (dy !== notch) await p.mouse.wheel(0, dy - notch);
  },
};
/** Where a step left the pointer (the centre of the box it hovered or clicked), per page. */
const POINTER = new WeakMap();
/** Popups the page portals out of the entry; a visible one is part of the shot. */
const POPUPS = "[role=tooltip], [role=menu], [role=listbox], [role=dialog], [role=alertdialog]";

/**
 * Rewrites a built app's index.html so the app starts only once every font face in its stylesheets has loaded.
 * Started earlier, code that measures text (Recharts' axis ticks, the toolbar's overflow) could measure the fallback
 * font and keep the result — Recharts caches text sizes — so a shot depended on whether the fonts won the race
 * (seen in WebKit: a chart axis with every other week label, a toolbar cell 10px narrower). The page's module
 * script is wrapped to wait. (Done to the file, not by intercepting the request: routing turns the HTTP cache off.)
 */
export function fontsFirst(dir) {
  const file = join(dir, "index.html");
  const html = readFileSync(file, "utf8");
  const tag = /<script type="module"([^>]*) src="([^"]+)"><\/script>/;
  const m = html.match(tag);
  if (!m) throw new Error(`${file} has no module script to start after its fonts`);
  const gate = `<script type="module">
await Promise.all([...document.querySelectorAll("link[rel=stylesheet]")].map((l) => l.sheet || new Promise((r) => l.addEventListener("load", r))));
await Promise.all([...document.fonts].map((f) => f.load()));
await import(${JSON.stringify(m[2])});
</script>`;
  writeFileSync(file, html.replace(tag, gate));
}

const union = (rects) => {
  const l = Math.min(...rects.map((r) => r.x)),
    t = Math.min(...rects.map((r) => r.y));
  const r = Math.max(...rects.map((q) => q.x + q.width)),
    b = Math.max(...rects.map((q) => q.y + q.height));
  return { x: l, y: t, width: r - l, height: b - t };
};

/**
 * Screenshots until two in a row are identical, and writes that one. Motion driven from script without Web
 * Animations (Recharts drawing its series in, Embla's scroll to a slide) is invisible to idle(); this waits it out.
 * A page that never holds still for two shots fails, rather than giving whichever frame came first.
 */
async function still(p, opts, file) {
  const t0 = Date.now();
  let prev = await p.screenshot(opts);
  for (;;) {
    const next = await p.screenshot(opts);
    if (next.equals(prev)) break;
    if (Date.now() - t0 > 10_000) throw new Error("the shot never held still for two screenshots in 10s");
    prev = next;
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, prev);
}

/** A worker's browser context. Its pages share the HTTP cache (the app and its fonts load once), never state:
 * each shot gets a new page, and storage is cleared as each page starts. */
async function context(browser) {
  const ctx = await browser.newContext({
    viewport: ENTRY_VIEWPORT,
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  await ctx.addInitScript(PIN, NOW.getTime());
  await ctx.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  return ctx;
}

/** Takes one shot into `file`. Throws with the reason when the fixture cannot be shot. */
async function take(p, base, shot, file) {
  const route = ROUTES.includes(shot.fixture) ? shot.fixture : null;
  const viewport = route ? ROUTE_VIEWPORT : ENTRY_VIEWPORT;
  // the pointer starts over nothing (the page's top-left corner is the shell's padding), before the page loads
  await p.mouse.move(0, 0);
  if (viewport !== ENTRY_VIEWPORT) await p.setViewportSize(viewport);
  if (shot.state.reducedMotion) await p.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  const onError = (e) => errors.push(String(e));
  p.on("pageerror", onError);
  try {
    const q = new URLSearchParams({ ...shot.cfg });
    if (!route) q.set("only", shot.fixture);
    await p.goto(new URL(`?${q}#/${route ?? "specimen"}`, base).href);
    await p.waitForFunction((r) => document.querySelector(`[data-route="${r}"]`), route ?? "specimen");
    const target = route ? null : p.locator(`section#${shot.fixture}`);
    if (target) {
      if (!(await target.count())) throw new Error(`no specimen entry "${shot.fixture}" in this tree`);
      // the catalogue renders off-screen entries lazily until the browser is idle (data-cv); wait that out
      await p.locator("[data-testid=specimen]:not([data-cv])").waitFor({ state: "attached" });
    }
    await settle(p);
    await p.waitForFunction(() => [...document.images].every((i) => i.complete));
    for (const [kind, ...args] of shot.state.do ?? []) {
      if (!STEP[kind]) throw new Error(`unknown step "${kind}" in state ${shot.state.name}`);
      await STEP[kind](p, ...args);
    }
    if (shot.state.do?.length) {
      const at = POINTER.get(p);
      // timing: a tooltip trigger the pointer rests on, or that has focus, opens its tooltip after a delay
      // (Keyline's 500ms, Base UI's 600ms). Wait out that delay, so whether the tooltip is in the shot does not
      // depend on how fast the steps ran. (Only for a trigger: anything else would wait the whole second for nothing.)
      const trigger = await p.evaluate((at) => {
        const under = at && document.elementFromPoint(at.x + at.width / 2, at.y + at.height / 2);
        return [under, document.activeElement].some((e) => e?.closest("[data-base-ui-tooltip-trigger]"));
      }, at ?? null);
      if (trigger)
        await p
          .locator("[role=tooltip]")
          .first()
          .waitFor({ state: "visible", timeout: 1000 })
          .catch(() => {});
      // WebKit updates :hover after a layout change only on the next pointer move: send one where the pointer is
      if (at) await p.mouse.move(at.x + at.width / 2, at.y + at.height / 2);
    }
    // a scroll area keeps its thumb revealed for 500ms after the last scroll (Base UI's data-scrolling), then fades
    // it; a step that scrolled (a hover scrolls its element into view) waits for the fade, not for a time
    await p.waitForFunction(() => !document.querySelector("[data-scrolling]"), null, { timeout: 10_000 });
    // finite motion runs to its end; JS-driven motion (springs, positioning) has stopped moving the shot's parts
    await idle(p, 10_000);
    const parts = [target, p.locator(POPUPS), ...(shot.state.show ? [p.locator(shot.state.show)] : [])].filter(Boolean);
    for (const l of parts) if (await l.count()) await stable(l.first(), 3, 10_000);
    await settle(p);
    if (errors.length) throw new Error(`page error: ${errors[0]}`);
    // scroll-driven animations (the scroll-edge shadows) are fixed where the scroll puts them: animations:
    // "disabled" would finish them, drawing each at the end of its scroll range whatever the scroll. Each one's
    // current value is written to the element and the animation removed: one held at playbackRate 0 stays a
    // compositor animation, and its layer rastered in either of two ways from load to load (seen: an RTL row's
    // shadow, 544 px, about 1 load in 3, with the same styles, scroll offset and animation time in both).
    await p.evaluate(() => {
      for (const a of document.getAnimations())
        if (a.timeline !== document.timeline) {
          a.commitStyles();
          a.cancel();
        }
    });
    const opts = { animations: "disabled", caret: "hide", scale: "css" };
    if (!target) {
      // a route taller than the viewport: the viewport grows to the whole page first. (fullPage: true resizes it
      // during the capture, and a row that overflows for that moment starts its scroll-edge shadow mid-shot.)
      const h = await p.evaluate(() => document.documentElement.scrollHeight);
      if (h > viewport.height) {
        await p.setViewportSize({ width: viewport.width, height: h });
        await idle(p, 10_000);
        await settle(p);
      }
      return await still(p, opts, file);
    }
    // the entry, and any popup the state shows outside it (portaled), clipped to the viewport
    const rects = [];
    for (const l of parts) for (const el of await l.all()) if (await el.isVisible()) rects.push(await el.boundingBox());
    const region = await p.locator('[role=region][aria-label="Specimen"]').boundingBox();
    const sec = rects[0];
    if (region && sec.y + sec.height > region.y + region.height + 0.5)
      throw new Error(
        `entry is ${Math.round(sec.height)}px tall and does not fit the shot viewport (${viewport.height}px); ` +
          `raise ENTRY_VIEWPORT in tests/visual/shoot.mjs`,
      );
    const u = union(rects);
    const x = Math.max(0, Math.floor(u.x)),
      y = Math.max(0, Math.floor(u.y));
    const clip = {
      x,
      y,
      width: Math.min(viewport.width, Math.ceil(u.x + u.width)) - x,
      height: Math.min(viewport.height, Math.ceil(u.y + u.height)) - y,
    };
    await still(p, { ...opts, clip }, file);
  } finally {
    p.off("pageerror", onError);
  }
}

/**
 * Takes `jobs` ({ shot, base: app URL, file }) with `workers` pages per engine at once. Resolves to the failures,
 * [{ job, error }]; `onShot(job)` is called after each one.
 */
export async function shoot(browsers, jobs, { workers = 4, onShot = () => {} } = {}) {
  const failures = [];
  const byEngine = Object.groupBy(jobs, (j) => j.shot.engine);
  await Promise.all(
    Object.entries(byEngine).flatMap(([engine, queue]) =>
      Array.from({ length: Math.min(workers, queue.length) }, async () => {
        const ctx = await context(browsers[engine]);
        // a fresh page for every shot (a page reused from shot to shot carried state between documents: the same
        // focus step gave different shots depending on the shot before it), opened while the previous shot runs
        const page = async () => {
          const p = await ctx.newPage();
          // a step whose element never comes fails the shot in seconds, not the 30s default
          p.setDefaultTimeout(5000);
          return p;
        };
        let next = page();
        try {
          for (let job = queue.shift(); job; job = queue.shift()) {
            const p = await next;
            next = page();
            try {
              await take(p, job.base, job.shot, job.file);
            } catch (error) {
              failures.push({ job, error: String(error?.message ?? error).split("\n")[0] });
            } finally {
              await p.close();
            }
            onShot(job);
          }
          await (await next).close();
        } finally {
          await ctx.close();
        }
      }),
    ),
  );
  return failures;
}

export const shotFile = (dir, shot) => join(dir, `${shot.name}.png`);
