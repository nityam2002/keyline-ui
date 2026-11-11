// Drawer: a fling leaves at the speed of the hand (no stall after release).
import { test, idle, stable } from "./fixtures.mjs"
import { until } from "./lib/probe.mjs"

test("drawer: a fling keeps travelling after release", { tag: "@timing" }, async ({ open, ok }) => {
  const p = await open({ width: 1440, height: 900, route: "motion", ready: "[data-testid=lab-drawer]" })
  const trig = p.locator("[data-testid=lab-drawer]")
  await trig.scrollIntoViewIfNeeded()
  await trig.click()
  const pop = p.locator("[data-testid=lab-drawer-pop]")
  await pop.waitFor()
  await idle(p)
  await stable(pop)
  // timing: 500 ms after opening (the drawer's drag wiring is not observable). Note: the fling's
  // velocity comes from the real time between Playwright's mouse moves, so on a loaded machine it can fall under
  // the dismiss threshold and the drawer springs back.
  await p.waitForTimeout(500)
  const g = await pop.boundingBox()
  const y0 = await pop.evaluate((d) => new DOMMatrix(getComputedStyle(d).transform).m42)
  await p.mouse.move(g.x + g.width / 2, g.y + 12)
  await p.mouse.down()
  await p.mouse.move(g.x + g.width / 2, g.y + 50, { steps: 2 })
  await p.mouse.move(g.x + g.width / 2, g.y + 120, { steps: 2 })
  const at = await pop.evaluate((d) => new DOMMatrix(getComputedStyle(d).transform).m42)
  await p.mouse.up()
  const after = await pop.evaluate((d) => new Promise((res) => {
    const out = []
    const tick = () => {
      out.push(d.isConnected ? new DOMMatrix(getComputedStyle(d).transform).m42 : NaN)
      out.length < 4 ? requestAnimationFrame(tick) : res(out)
    }
    requestAnimationFrame(tick)
  }))
  const step = after[3] - at
  ok("drawer: a fling keeps travelling after release (≥40px within 4 frames)", isNaN(after[3]) || step >= 40, { y0, at, after })
  await until(async () => (await pop.count()) === 0)
  ok("drawer: the flung drawer is dismissed", (await pop.count()) === 0)
})
