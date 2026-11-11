// The Nav's band in motion: a link that renders a page holds its lean through release and the band leaves within
// two frames of the nav's commit; the ink key column travels with the band.
import { test } from "./fixtures.mjs"
import { until } from "./lib/probe.mjs"

const VP = { width: 1440, height: 900 }

test("nav link: lean held through release, band leaves at the commit", { tag: "@timing" }, async ({ open, ok }) => {
  const p = await open({ ...VP, route: "motion", ready: "[data-kl-stretch]" })
  const host = p.locator("[data-kl-stretch]").first()
  const r = await host.locator("[data-kl-item]").nth(3).boundingBox()
  await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2)
  await p.mouse.down()
  await p.waitForTimeout(200) // timing: a held press, so the band leans before release
  await host.evaluate((h) => {
    const band = h.querySelector(":scope > [data-kl-band]")
    const T = (window.__nav = [])
    const t0 = performance.now()
    const at = (window.__navAt = {})
    new MutationObserver(() => (at.commit ??= performance.now() - t0)).observe(h, { attributes: true, subtree: true, attributeFilter: ["aria-current"] })
    new MutationObserver(() => (at.page ??= performance.now() - t0)).observe(document.querySelector("[data-route]"), { attributes: true, attributeFilter: ["data-route"] })
    let n = 0
    const tick = () => {
      T.push([performance.now() - t0, parseFloat(band.style.left) + parseFloat(band.style.width), getComputedStyle(h.querySelectorAll("[data-kl-item]")[3]).backgroundColor])
      if (n++ < 40) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  const rest = await host.evaluate((h) => { const b = h.querySelector(":scope > [data-kl-band]"); return parseFloat(b.style.left) + parseFloat(b.style.width) })
  await p.mouse.up()
  // the 41-frame sample has finished and the route has changed
  await until(() => p.evaluate(() => window.__nav.length >= 41 && document.querySelector("[data-route]")?.getAttribute("data-route") === "playground"))
  const T = await p.evaluate(() => window.__nav)
  const at = await p.evaluate(() => window.__navAt)
  const back = T.some(([, r]) => r < rest - 0.5)
  const moved = T.find(([, r]) => r > rest + 8)
  ok("nav link: the lean is held through release (no pull back, no hover tint)", !back && T.every(([, , bg]) => bg === "rgba(0, 0, 0, 0)"), { rest, first: T.slice(0, 6) })
  // measured from the nav's own commit (a loaded dev server delays that commit, not the band)
  const frames = moved ? T.filter(([t]) => t > at.commit && t < moved[0]).length : 99
  ok("nav link: the band leaves within two frames of the nav's commit", moved && frames <= 2, { at, rest, moved, frames, first: T.slice(0, 6) })
  ok("nav link: the page swaps in behind the moving band, not before it", moved && at.page > moved[0], { at, moved })
  ok("nav link: the page follows", (await p.getAttribute("[data-route]", "data-route")) === "playground")
})

for (const q of ["?motion=slow", "?motion=slow&dir=rtl"]) {
  test(`nav ${q}: the ink key column moves with the band`, { tag: "@timing" }, async ({ open, ok }) => {
    const p = await open({ ...VP, route: "app", q, ready: ".kl-nav[data-kl-icons] [data-kl-stretch]" })
    const list = p.locator(".kl-nav[data-kl-icons] [data-kl-stretch]").first()
    await list.locator("[data-kl-item]", { hasText: "Carriers" }).first().click()
    await p.waitForTimeout(300) // timing: samples the band mid-travel under motion=slow
    const mid = await list.evaluate((h) => {
      const b = h.querySelector(":scope > [data-kl-band]")
      const cs = getComputedStyle(b)
      return { ink: parseFloat(cs.backgroundSize), pos: cs.backgroundPositionX, cells: [...h.querySelectorAll(".kl-nav-ic")].map((c) => getComputedStyle(c).backgroundColor).filter((x) => x !== "rgba(0, 0, 0, 0)") }
    })
    ok(`nav ${q}: the ink key column is the band's own (44px of it), no cell fills on its own`, mid.ink === 44 && mid.cells.length === 0 && (q.includes("rtl") ? mid.pos === "100%" : mid.pos === "0%"), mid)
  })
}
