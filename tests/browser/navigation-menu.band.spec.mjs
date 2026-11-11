// NavigationMenu's open cell is the shared Stretch band: hidden and an <li> when closed, it lands on the newly
// open trigger and travels through intermediate geometry, or snaps under reduced motion. The band's geometry is
// sampled every frame during the move: that sampling is the measurement.
import { test, idle } from "./fixtures.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["navigation-menu"] })

for (const motion of ["normal", "reduce"]) {
  test(`navigation menu band: travels between sections (${motion})`, { tag: "@timing" }, async ({ open, ok }) => {
    const p = await open({ route: "specimen", q: `motion=${motion}`, width: 1440, height: 900, ready: "[data-testid=specimen-nm] .kl-nmenu-list" })
    const list = p.getByTestId("specimen-nm").locator(".kl-nmenu-list").first()
    await list.scrollIntoViewIfNeeded()
    const trig = list.locator(".kl-nmenu-trigger")
    const geo = () =>
      list.evaluate((l) => {
        const band = l.querySelector(":scope > [data-kl-band]")
        const open = l.querySelector("[data-popup-open]")
        const a = band.getBoundingClientRect()
        const o = open?.getBoundingClientRect()
        // the band runs 1px under the next seam (no anti-aliased hairline between them), so one edge may be 2px off
        return { hidden: band.hidden, tag: band.tagName, on: o ? Math.max(Math.abs(a.left - o.left), Math.abs(a.right - o.right)) : null, covered: open?.hasAttribute("data-kl-covered") ?? null }
      })
    const closed = await geo()
    ok(`nav menu (${motion}): closed, the band is hidden and is a list item`, closed.hidden && closed.tag === "LI", closed)
    await trig.nth(0).hover()
    // the first section is open and its band has landed before the sampling starts
    await p.waitForFunction((l) => { const b = l.querySelector(":scope > [data-kl-band]"); return !b.hidden && !!l.querySelector("[data-popup-open][data-kl-covered]") }, await list.elementHandle(), { timeout: 4000 }).catch(() => {})
    await idle(p)
    await list.evaluate((l) => {
      const band = l.querySelector(":scope > [data-kl-band]")
      window.__n = new Set()
      const t0 = performance.now()
      const loop = () => {
        const r = band.getBoundingClientRect()
        window.__n.add(`${Math.round(r.left)}:${Math.round(r.right)}`)
        if (performance.now() - t0 < 500) requestAnimationFrame(loop)
      }
      requestAnimationFrame(loop)
    })
    // a real pointer move: while a section is open Base UI's safe polygon sets pointer-events: none on the list,
    // which Playwright's hover() reads as "covered" and retries until it times out
    { const r = await trig.nth(1).boundingBox(); await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2, { steps: 4 }) }
    await p.waitForTimeout(700) // timing: the 500ms per-frame sampling window of the band's move
    const moved = await geo()
    const frames = await p.evaluate(() => window.__n.size)
    ok(`nav menu (${motion}): the band lands on the newly open trigger, label flipped`, !moved.hidden && moved.on !== null && moved.on <= 2 && moved.covered, moved)
    ok(`nav menu (${motion}): ${motion === "reduce" ? "the band snaps (no intermediate geometry)" : "the band travels through intermediate geometry"}`, motion === "reduce" ? frames <= 3 : frames > 4, frames)
    await p.keyboard.press("Escape")
  })
}
