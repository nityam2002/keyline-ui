// Shared fixtures for the browser suites (Playwright Test). Every test gets:
//   eng      "chromium" | "webkit" (the project's engine)
//   ok       ok(name, cond, detail): a soft assertion. Every check in a test runs and is reported, as the old
//            scripts did; any failing check fails the test. The line is also printed for the per-attempt log.
//   only     test.use({ only: ["otp", …] }): specimen entries this file needs. open() on the specimen then loads
//            just those entries (?only=…) instead of all ~60, which is most of a test's time otherwise. Page-level
//            specs (every entry, layout, traversal) leave it unset. open({ only: null }) forces the full page.
//   open     open({ route, q, width, height, ctx, init, ready, setup, waitUntil, settled, only }) → page (p.errs, p.consoleErrs, p.httpErrs) in a fresh browser context, owned by the
//            test and closed after it, so no state crosses tests. The browser process itself is reused by the
//            worker (one per engine per worker).
//   settle   settle(page): fonts loaded and two animation frames painted. Use it instead of a fixed sleep when
//            the wait is "let the page render"; keep explicit waits only where a duration is what is measured.
import { test as base, expect } from "playwright/test"

export { expect }

const show = (d) => {
  try {
    return JSON.stringify(d)?.slice(0, 600)
  } catch {
    return String(d)
  }
}

export const settle = (p) =>
  p.evaluate(async () => {
    await document.fonts.ready
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  })

/** Waits until no finite CSS transition/animation or WAAPI animation is running on the document timeline (infinite ones and scroll-driven ones are ignored), then
 * one more frame. For "wait for the motion to finish" — not for measuring a duration. */
export const idle = (p, timeout = 5000) =>
  p.waitForFunction(
    () =>
      new Promise((r) =>
        requestAnimationFrame(() =>
          r(!document.getAnimations().some((a) => a.playState === "running" && a.timeline === document.timeline && a.effect?.getComputedTiming().iterations !== Infinity)),
        ),
      ),
    null,
    { timeout },
  )

/** Waits until the locator's box has not changed for `frames` consecutive animation frames (JS-driven motion,
 * layout after fonts or a resize). */
export const stable = (loc, frames = 3, timeout = 5000) =>
  loc.evaluate(
    (el, [frames, timeout]) =>
      new Promise((res, rej) => {
        let last = "", same = 0
        const t0 = performance.now()
        const tick = () => {
          const r = el.getBoundingClientRect()
          const k = [r.x, r.y, r.width, r.height].map((v) => v.toFixed(2)).join()
          same = k === last ? same + 1 : 0
          last = k
          if (same >= frames) return res(true)
          if (performance.now() - t0 > timeout) return rej(new Error("stable: box still moving after " + timeout + "ms"))
          requestAnimationFrame(tick)
        }
        tick()
      }),
    [frames, timeout],
  )

/** Installed in every page: window.__klBand(band) is the box of a stretch band as drawn. At rest that is the band's
 * own box; during a move (data-kl-flight) the band is a static window over the whole travel and the visible part
 * is where it, its moving clip and the fill inside the clip overlap (keyline-motion.ts, the compositor flight). */
const BAND = () => {
  window.__klBand = (b) => {
    const r = b.getBoundingClientRect()
    let { left, top, right, bottom } = r
    if (b.hasAttribute("data-kl-flight"))
      for (const sel of ["[data-kl-band-clip]", "[data-kl-band-fill]"]) {
        const e = b.querySelector(sel)
        if (!e) continue
        const q = e.getBoundingClientRect()
        left = Math.max(left, q.left)
        top = Math.max(top, q.top)
        right = Math.min(right, q.right)
        bottom = Math.min(bottom, q.bottom)
      }
    right = Math.max(left, right)
    bottom = Math.max(top, bottom)
    return { left, top, right, bottom, x: left, y: top, width: right - left, height: bottom - top }
  }
}

/** Waits until a stretch band has landed (no flight in progress) and its drawn box holds for `frames` frames. */
export const landed = (loc, frames = 3, timeout = 5000) =>
  loc.evaluate(
    (b, [frames, timeout]) =>
      new Promise((res, rej) => {
        let last = "", same = 0
        const t0 = performance.now()
        const tick = () => {
          const r = window.__klBand(b)
          const k = b.hasAttribute("data-kl-flight") ? "flight" : [r.x, r.y, r.width, r.height].map((v) => v.toFixed(2)).join()
          same = k !== "flight" && k === last ? same + 1 : 0
          last = k
          if (same >= frames) return res(true)
          if (performance.now() - t0 > timeout) return rej(new Error("landed: band still moving after " + timeout + "ms"))
          requestAnimationFrame(tick)
        }
        tick()
      }),
    [frames, timeout],
  )

export const test = base.extend({
  eng: async ({ browserName }, use) => use(browserName),

  ok: async ({ browserName }, use) => {
    await use((name, cond, detail) => {
      const line = `${cond ? "  ✓" : "  ✖"} [${browserName}] ${name}${cond ? "" : " — " + show(detail)}`
      console.log(line)
      expect.soft(!!cond, line.trim()).toBe(true)
    })
  },

  only: [null, { option: true }],

  open: async ({ browser, baseURL, only: fileOnly }, use) => {
    const contexts = []
    await use(async ({ route = "specimen", q = "", width = 1280, height = 900, ctx = {}, init, ready, setup, waitUntil = "load", settled = true, only = fileOnly } = {}) => {
      const t0 = Date.now()
      const c = await browser.newContext({ viewport: { width, height }, ...ctx })
      contexts.push(c)
      await c.addInitScript(BAND)
      if (init) await c.addInitScript(init)
      const p = await c.newPage()
      // setup(page): network routes and the like, installed before the first navigation
      if (setup) await setup(p)
      // errs: uncaught page errors; consoleErrs: console.error output other than failed resource loads
      p.errs = []
      p.consoleErrs = []
      p.errors = p.errs
      p.on("pageerror", (e) => p.errs.push(String(e)))
      p.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && p.consoleErrs.push(m.text()))
      // httpErrs: responses with status >= 400, from the first request of the first navigation on
      p.httpErrs = []
      p.on("response", (r) => r.status() >= 400 && p.httpErrs.push(`HTTP ${r.status()} ${r.url()}`))
      const raw = q.replace(/^\?/, "")
      const filter = only?.length && route.replace(/^#?\/?/, "").startsWith("specimen") ? `only=${only.join(",")}` : ""
      const query = raw || filter ? `?${[raw, filter].filter(Boolean).join("&")}` : ""
      const hash = route.startsWith("#") ? route : `#/${route}`
      // waitUntil: "load" by default; a test about the page before its resources arrive passes "domcontentloaded"
      await p.goto(new URL(`${query}${hash}`, baseURL).href, { waitUntil })
      // readiness: the routed page has rendered (data-route matches), then the selector the test needs, then fonts
      await p.waitForFunction((r) => document.querySelector(`[data-route="${r}"]`) || !document.querySelector("[data-route]"), hash.replace(/^#\/?/, "").split(/[/?]/)[0])
      // a filtered specimen must hold every entry asked for, and only those (a renamed entry fails here, loudly)
      if (filter) {
        const got = await p.evaluate(() => [...document.querySelectorAll("[data-testid=specimen] [aria-labelledby]")].filter((s) => s.getAttribute("aria-labelledby") === s.id + "-h").map((s) => s.id))
        expect(got.slice().sort(), `specimen entries for only=${only.join(",")}`).toEqual([...new Set(only)].sort())
      }
      if (ready) await p.locator(ready).first().waitFor({ state: "attached" })
      // settled: false skips the fonts/frames wait (in WebKit fonts.ready also waits for pending images)
      if (settled) await settle(p)
      console.log(`  · open ${route}${query} ${width}x${height}: ${Date.now() - t0}ms`)
      return p
    })
    for (const c of contexts) await c.close().catch(() => {})
  },
})
