// Performance checks that are machine-independent:
//   - idle: once a page has settled, nothing lays out or paints for 2 s (Chrome trace; CDP is Chromium-only);
//   - every infinite animation animates transform / opacity only (Chrome only);
//   - scroll-edge rows: an unchanged scroll writes nothing (both engines).
import { test, idle } from "./fixtures.mjs"

async function trace(p, ms) {
  const s = await p.context().newCDPSession(p)
  const ev = []
  s.on("Tracing.dataCollected", (d) => ev.push(...d.value))
  await s.send("Tracing.start", { categories: "devtools.timeline", transferMode: "ReportEvents" })
  await p.waitForTimeout(ms) // timing: the idle window itself — nothing may lay out or paint during it
  const fin = new Promise((x) => s.once("Tracing.tracingComplete", x))
  await s.send("Tracing.end")
  await fin
  await s.detach()
  return ev
}

for (const r of ["specimen", "app", "motion", "playground"]) {
  test(`perf ${r}: idle page, compositor-only infinite animations`, async ({ open, ok, eng }) => {
    test.skip(eng !== "chromium", "perf-audit.mjs traced idle pages with CDP in Chrome only")
    const p = await open({ route: r, width: 1440, height: 900 })
    // timing: recharts' entrance (1.5 s by default, JS-driven so not in getAnimations) runs to about 3 s after
    // load; wait past it
    await p.waitForTimeout(4500)
    const ev = await trace(p, 2000)
    const n = (k) => ev.filter((e) => e.name === k).length
    ok(`${r}: idle page does no layout or paint (2s)`, n("Layout") === 0 && n("Paint") === 0, { layout: n("Layout"), paint: n("Paint") })
    const anims = await p.evaluate(() =>
      document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity).map((a) => ({
        name: a.animationName || a.constructor.name,
        props: [...new Set((a.effect.getKeyframes?.() || []).flatMap((k) => Object.keys(k)))].filter((x) => !["offset", "easing", "composite", "computedOffset"].includes(x)),
      })),
    )
    const bad = anims.filter((a) => a.props.some((x) => !["transform", "opacity", "translate", "scale", "rotate"].includes(x)))
    ok(`${r}: infinite animations are compositor-only (${anims.length} running)`, bad.length === 0, bad)
  })
}

test("perf: scroll-edge rows write nothing on an unchanged scroll", async ({ open, ok }) => {
  const p = await open({ route: "specimen", width: 700, height: 900, ready: "[data-kl-more]" })
  await idle(p)
  const rows = await p.evaluate(async () => {
    const out = []
    for (const el of [...document.querySelectorAll("[data-kl-more]")].filter((e) => e.scrollWidth > e.clientWidth + 4).slice(0, 6)) {
      el.scrollIntoView({ block: "center" })
      await new Promise((x) => requestAnimationFrame(() => requestAnimationFrame(x)))
      const max = el.scrollWidth - el.clientWidth
      const s = getComputedStyle(el).direction === "rtl" ? -1 : 1
      // count the handler's own writes that a later read would have to flush: the fade attributes and vars
      const writes = []
      const fades = [...el.querySelectorAll(":scope > .kl-more-fade")]
      const mo = new MutationObserver((rec) => writes.push(...rec.map((x) => x.attributeName)))
      mo.observe(el, { attributes: true })
      fades.forEach((f) => mo.observe(f, { attributes: true }))
      let t = 0
      for (let i = 0; i < 20; i++) {
        el.scrollLeft = s * (i % 2 ? 0.3 : 0.6) * max
        el.getBoundingClientRect() // settle the scroll itself, so only the handler is timed
        const t0 = performance.now()
        el.dispatchEvent(new Event("scroll"))
        t += performance.now() - t0
      }
      // the same position again: nothing may be written
      await new Promise((x) => setTimeout(x))
      writes.length = 0
      el.dispatchEvent(new Event("scroll"))
      await new Promise((x) => setTimeout(x))
      mo.disconnect()
      out.push({ row: el.className.split(" ").find((c) => /tabs-list|segmented|toggle-group|nav-list|mbar|nmenu/.test(c)) || el.className.split(" ")[0], ms: +(t / 20).toFixed(3), idleWrites: writes.length })
    }
    return out
  })
  ok(`scroll edges: an unchanged scroll writes nothing (${rows.length} rows)`, rows.length > 0 && rows.every((r) => r.idleWrites === 0), rows)
})
