// Drawer (Base UI Drawer): a modal docked dialog, swipe to dismiss, Escape, the end and snap drawers, RTL and
// reduced motion.
import { test, stable } from "./fixtures.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["drawer"] })

const VIEW = { width: 1280, height: 1000 }
const vh = 1000
const noErrors = (ok, p) => ok("no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs])

const drag = async (p, from, dx, dy) => {
  await p.mouse.move(from.x, from.y)
  await p.mouse.down()
  for (let i = 1; i <= 12; i++) {
    await p.mouse.move(from.x + (dx * i) / 12, from.y + (dy * i) / 12)
    await p.waitForTimeout(16) // timing: the swipe's speed decides dismiss vs spring back (one move per frame)
  }
  await p.mouse.up()
}
/** Opens a drawer by its trigger and waits until its popup has landed. */
async function openDrawer(p, id) {
  const trig = p.getByTestId(id)
  await trig.scrollIntoViewIfNeeded()
  await trig.click()
  const pop = p.getByTestId(`${id}-pop`)
  await pop.waitFor()
  await stable(pop, 4).catch(() => {})
  return { trig, pop }
}
const gone = (loc) => loc.waitFor({ state: "detached", timeout: 5000 }).catch(() => {})

test("drawer: bottom drawer — dialog, focus, spring back, swipe and Escape dismiss", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=dr-bottom]" })
  const log = () => p.getByTestId("dr-log").innerText()
  const { trig, pop } = await openDrawer(p, "dr-bottom")
  const box = await pop.boundingBox()
  ok("drawer: a modal dialog named by its title, docked to the bottom with a 3px page-facing edge", (await pop.getAttribute("role")) === "dialog" && (await pop.evaluate((d) => document.getElementById(d.getAttribute("aria-labelledby"))?.textContent)) === "Report a damaged pallet" && Math.abs(box.y + box.height - vh) < 1 && (await pop.evaluate((d) => getComputedStyle(d).borderTopWidth)) === "3px" && (await pop.getAttribute("data-swipe-direction")) === "down", box)
  await p.waitForFunction(() => document.querySelector("[data-testid=dr-bottom-pop]")?.contains(document.activeElement), null, { timeout: 3000 }).catch(() => {})
  ok("drawer: focus moves inside", await pop.evaluate((d) => d.contains(document.activeElement)))
  // a short drag springs back
  const grip = await pop.locator(".kl-drawer-grip").boundingBox()
  await drag(p, { x: grip.x + grip.width / 2, y: grip.y + 8 }, 0, 30)
  await stable(pop, 6).catch(() => {})
  ok("drawer: a short drag springs back", (await pop.isVisible()) && Math.abs((await pop.boundingBox()).y - box.y) < 2, (await pop.boundingBox()).y)
  await drag(p, { x: grip.x + grip.width / 2, y: grip.y + 8 }, 0, 260)
  await gone(pop)
  ok("drawer: swiping down dismisses it", (await pop.count()) === 0 && /swipe/.test(await log()), await log())
  await p.waitForFunction(() => document.activeElement === document.querySelector("[data-testid=dr-bottom]"), null, { timeout: 3000 }).catch(() => {})
  ok("drawer: focus returns to the trigger", await trig.evaluate((t) => t === document.activeElement))
  await openDrawer(p, "dr-bottom")
  await p.keyboard.press("Escape")
  await gone(pop)
  ok("drawer: Escape dismisses it", (await pop.count()) === 0 && /escape/.test(await log()), await log())
  noErrors(ok, p)
})

test("drawer: end drawer — full height at the right, swipes right", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=dr-end]" })
  const log = () => p.getByTestId("dr-log").innerText()
  const { pop: end } = await openDrawer(p, "dr-end")
  const eb = await end.boundingBox()
  ok("drawer end: full height at the right edge (LTR), the left edge at region weight, no cut", Math.abs(eb.x + eb.width - 1280) < 1 && eb.height === vh && (await end.evaluate((d) => getComputedStyle(d).borderLeftWidth)) === "3px" && (await end.getAttribute("data-swipe-direction")) === "right", eb)
  // with a mouse the swipe starts on the drawer's chrome (the grip, header, footer); the body keeps text selection
  await drag(p, { x: eb.x + 9, y: eb.y + 300 }, 300, 0)
  await gone(end)
  ok("drawer end: swiping right dismisses it", (await end.count()) === 0 && /swipe/.test(await log()), await log())
  noErrors(ok, p)
})

test("drawer: snap drawer opens at the first snap point", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=dr-snap]" })
  const { pop: snap } = await openDrawer(p, "dr-snap")
  // the scrim fades in with the drawer: wait for its opacity to stop changing
  await p.waitForFunction(
    () =>
      new Promise((r) => {
        const s = [...document.querySelectorAll(".kl-drawer-scrim")].at(-1)
        const a = s && getComputedStyle(s).opacity
        requestAnimationFrame(() => requestAnimationFrame(() => r(!!s && getComputedStyle(s).opacity === a && !s.getAnimations().some((x) => x.playState === "running"))))
      }),
    null,
    { timeout: 3000 },
  ).catch(() => {})
  const visible = vh - (await snap.boundingBox()).y
  const scrim = await p.locator(".kl-drawer-scrim").last().evaluate((s) => Number(getComputedStyle(s).opacity))
  ok("drawer snap: opens at the first snap point (45%), the scrim at least half", Math.abs(visible - 0.45 * vh) < 20 && scrim >= 0.5, { visible, scrim })
  noErrors(ok, p)
})

test("drawer: RTL end drawer sits on the left and swipes left", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=dr-rtl]" })
  const { pop: r } = await openDrawer(p, "dr-rtl")
  const rb = await r.boundingBox()
  ok("drawer RTL: an end drawer sits on the left and swipes left", Math.abs(rb.x) < 1 && (await r.getAttribute("data-swipe-direction")) === "left" && (await r.getAttribute("dir")) === null, rb)
  await drag(p, { x: rb.x + rb.width - 9, y: rb.y + 300 }, -300, 0)
  await gone(r)
  ok("drawer RTL: swiping left dismisses it", (await r.count()) === 0)
  noErrors(ok, p)
})

test("drawer: reduced motion lands at once", async ({ open, ok }) => {
  const q = await open({ ...VIEW, q: "motion=reduce" })
  await q.getByTestId("dr-bottom").scrollIntoViewIfNeeded()
  await q.getByTestId("dr-bottom").click()
  await q.waitForTimeout(80) // timing: "at once" — sampled 80ms after the click…
  const y = (await q.getByTestId("dr-bottom-pop").boundingBox())?.y
  await q.waitForTimeout(600) // timing: …and again after the normal open would have finished
  const y2 = (await q.getByTestId("dr-bottom-pop").boundingBox())?.y
  ok("drawer: reduced motion: it lands at once", y != null && Math.abs(y - y2) < 1, [y, y2])
})
