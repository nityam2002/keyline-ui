// Geometry rules measured on whole views: no errors, no horizontal page scroll, cells never
// cut, nothing cut where --kl-cut is 0, no rounded corners. Chrome runs every view; WebKit runs light-on, light-off and
// narrow-on.
import { test, idle } from "./fixtures.mjs"
import { trackHttp, same } from "./lib/flow.mjs"

const q = (o) => new URLSearchParams({ theme: "light", cut: "on", density: "default", motion: "normal", dir: "ltr", ...o }).toString()

const GEOMETRY = () => {
  const name = (el) => el.className.toString().slice(0, 60)
  const cutOf = (el) => {
    const cs = getComputedStyle(el)
    const shape = cs.getPropertyValue("corner-start-start-shape") || cs.getPropertyValue("corner-top-left-shape")
    return (/bevel|superellipse\(0\)/.test(shape) && parseFloat(cs.borderStartStartRadius || cs.borderTopLeftRadius) > 0) || /polygon/.test(cs.clipPath)
  }
  const out = { overflowX: document.documentElement.scrollWidth - innerWidth, cutOnCells: [], cutWhenOff: [], rounded: [] }
  for (const el of document.querySelectorAll(".kl-cell, .kl-attached, .kl-ms-chip, .kl-check, .kl-toast, .kl-skel")) if (cutOf(el)) out.cutOnCells.push(name(el))
  for (const el of document.querySelectorAll(".kl-frame, .kl-ctl")) {
    const off = getComputedStyle(el).getPropertyValue("--kl-cut").trim() === "0"
    if (off && cutOf(el)) out.cutWhenOff.push(name(el))
    if (off && (parseFloat(getComputedStyle(el).getPropertyValue("--kl-c-room")) || 0) > 0) out.cutWhenOff.push("reserved room: " + name(el))
  }
  // round corners are never part of the language: any corner with a radius must be a bevel (the cut)
  const corners = ["top-left", "top-right", "bottom-right", "bottom-left"]
  for (const el of document.querySelectorAll(".kl-frame, .kl-ctl, .kl-cell")) {
    const cs = getComputedStyle(el)
    const camel = (c) => "border" + c.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("") + "Radius"
    // Chrome exposes the cut only as the logical corner-*-shape; map each physical corner for the direction
    const rtl = cs.direction === "rtl"
    const logical = { "top-left": rtl ? "start-end" : "start-start", "top-right": rtl ? "start-start" : "start-end", "bottom-right": rtl ? "end-start" : "end-end", "bottom-left": rtl ? "end-end" : "end-start" }
    const shape = (c) => cs.getPropertyValue(`corner-${c}-shape`) + cs.getPropertyValue(`corner-${logical[c]}-shape`)
    const bad = corners.filter((c) => parseFloat(cs[camel(c)]) > 0 && !/bevel|superellipse\(0\)/.test(shape(c)) && !/polygon/.test(cs.clipPath))
    if (bad.length) out.rounded.push(name(el) + " @" + bad.join(","))
  }
  return out
}

const VIEWS = [
  ["specimen-light-on", "specimen", q({}), 1440, 900],
  ["specimen-light-off", "specimen", q({ cut: "off" }), 1440, 900],
  ["specimen-dark-quiet", "specimen", q({ theme: "dark", cut: "quiet" }), 1440, 900],
  ["app-light-on", "app", q({}), 1440, 900],
  ["app-light-off", "app", q({ cut: "off" }), 1440, 900],
  ["app-dark-on", "app", q({ theme: "dark" }), 1440, 900],
  ["app-dark-off", "app", q({ theme: "dark", cut: "off" }), 1440, 900],
  ["app-compact-on", "app", q({ density: "compact" }), 1440, 900],
  ["app-rtl-on", "app", q({ dir: "rtl" }), 1440, 900],
  ["app-1024-on", "app", q({}), 1024, 768],
  ["app-narrow-on", "app", q({}), 390, 844],
  ["app-narrow-off", "app", q({ cut: "off" }), 390, 844],
  ["specimen-narrow-on", "specimen", q({}), 390, 844],
]

for (const [id, route, search, width, height] of VIEWS) {
  test(`view ${id}: geometry rules`, async ({ open, ok, eng }) => {
    test.skip(eng !== "chromium" && !/light-(on|off)$|narrow-on$/.test(id), "WebKit covers the light-on, light-off and narrow-on views; Chrome covers every view")
    const p = await open({ route, q: search, width, height, ready: ".kl-frame" })
    const http = await trackHttp(p, ".kl-frame:visible")
    await idle(p).catch(() => {})
    const g = await p.evaluate(GEOMETRY)
    const errors = [...p.errs, ...p.consoleErrs, ...http]
    ok("no console or page errors", same(errors, []), { actual: errors, expected: [] })
    ok("no horizontal page scroll", g.overflowX <= 0, { overflowX: g.overflowX })
    ok("cells and attached surfaces are never cut", same(g.cutOnCells, []), { actual: g.cutOnCells, expected: [] })
    ok("no cut and no reserved room where --kl-cut is 0", same(g.cutWhenOff, []), { actual: g.cutWhenOff, expected: [] })
    ok("no rounded corners", same(g.rounded, []), { actual: g.rounded, expected: [] })
  })
}
