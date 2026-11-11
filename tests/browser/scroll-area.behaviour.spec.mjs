// Scroll Area on the playground's Preview: bar and padding, tab order,
// keyboard, wheel, thumb drag, track press, overflow following the container size, and the booking dialog's single
// scroller in a short viewport.
import { test, idle, settle } from "./fixtures.mjs"
import { until } from "./lib/flow.mjs"

async function setup(open) {
  const p = await open({ route: "playground", width: 1400, height: 1000, ready: "[data-slot=preview]" })
  const scope = p.getByTestId("scope-preview")
  const act = scope.locator("[data-slot=scroll-area]").filter({ hasText: "Departed Hamburg hub" })
  await act.scrollIntoViewIfNeeded()
  const sa = () => act.evaluate((e) => { const vp = e.querySelector(".kl-scroll-vp"), c = e.querySelector(".kl-scroll-content"), bar = e.querySelector(".kl-scrollbar"), th = bar?.querySelector(".kl-scroll-thumb"); return { oy: e.hasAttribute("data-has-overflow-y"), tab: vp.tabIndex, top: vp.scrollTop, max: vp.scrollHeight - vp.clientHeight, pad: getComputedStyle(vp).paddingInlineEnd, bar: bar && bar.getBoundingClientRect().toJSON(), thumb: th && th.getBoundingClientRect().toJSON(), cRight: c.getBoundingClientRect().right, items: [...c.querySelectorAll("[data-slot=item], .kl-item")].map((i) => i.getBoundingClientRect().right) } })
  await until(async () => (await sa()).bar)
  return { p, scope, act, sa }
}

test("scroll area: bar, padding, tab order, PageDown, focus ring", async ({ open, ok }) => {
  const { p, act, sa } = await setup(open)
  let s = await sa()
  ok("scroll area: overflowing content gets a bar, a shorter thumb, and is padded clear of the bar", s.oy && s.bar && s.thumb.height < s.bar.height && s.pad === "12px" && Math.max(...s.items) <= s.bar.left + 0.5, s)
  ok("scroll area: the overflowing viewport is in the tab order", s.tab === 0, s.tab)
  await act.locator(".kl-scroll-vp").focus()
  await p.keyboard.press("PageDown")
  await until(async () => (await sa()).top > 0)
  s = await sa()
  ok("scroll area: keyboard scrolls the viewport natively (PageDown)", s.top > 0, s.top)
  await act.locator(".kl-scroll-vp").evaluate((e) => e.blur())
  await act.locator(".kl-scroll-vp").focus()
  const ringOk = await act.evaluate((e) => { const a = getComputedStyle(e, "::after"); return { style: a.outlineStyle, z: a.zIndex, off: a.outlineOffset } })
  ok("scroll area: the focus ring is drawn by the root above the bar, inside the region", ringOk.style === "solid" && +ringOk.z > 0 && ringOk.off === "-2px", ringOk)
  ok("no page errors", p.errs.length === 0, p.errs)
})

test("scroll area: wheel, thumb drag, track press", async ({ open, ok }) => {
  const { p, act, sa } = await setup(open)
  await act.locator(".kl-scroll-vp").evaluate((e) => (e.scrollTop = 0))
  const bb = await act.boundingBox()
  await p.mouse.move(bb.x + 40, bb.y + 60)
  await p.mouse.wheel(0, 160)
  await until(async () => (await sa()).top > 0)
  let s = await sa()
  ok("scroll area: the wheel scrolls the viewport", s.top > 0, s.top)
  await act.locator(".kl-scroll-vp").evaluate((e) => (e.scrollTop = 0))
  await until(async () => { const v = await sa(); return v.top === 0 && v.thumb && v.thumb.y - v.bar.y < 1 })
  await settle(p)
  s = await sa()
  await p.mouse.move(s.thumb.x + s.thumb.width / 2, s.thumb.y + 4)
  await p.mouse.down()
  await p.mouse.move(s.thumb.x + s.thumb.width / 2, s.thumb.y + 60, { steps: 6 })
  await p.mouse.up()
  await until(async () => (await sa()).top > 20)
  await settle(p)
  const dragged = await sa()
  ok("scroll area: dragging the thumb scrolls", dragged.top > 20, dragged.top)
  await p.mouse.move(dragged.bar.x + dragged.bar.width / 2, dragged.bar.y + dragged.bar.height - 6)
  await p.mouse.down()
  await p.mouse.up()
  await until(async () => (await sa()).top > dragged.top)
  await idle(p)
  const paged = await sa()
  ok("scroll area: pressing the track pages toward the pointer", paged.top > dragged.top, { before: dragged.top, after: paged.top })
  ok("no page errors", p.errs.length === 0, p.errs)
})

test("scroll area: overflow follows the container size", async ({ open, ok }) => {
  const { p, act, sa } = await setup(open)
  // no overflow: no bar, not focusable, no reserved space
  await act.evaluate((e) => (e.style.height = "2000px"))
  await until(async () => { const v = await sa(); return !v.oy && !v.bar && v.pad === "0px" && v.tab === -1 })
  let s = await sa()
  ok("scroll area: without overflow there is no bar, no padding, and no tab stop", !s.oy && !s.bar && s.pad === "0px" && s.tab === -1, s)
  // dynamic content: shrink the container again → bar returns
  await act.evaluate((e) => (e.style.height = "120px"))
  await until(async () => { const v = await sa(); return v.oy && !!v.bar })
  s = await sa()
  ok("scroll area: resizing the container brings the bar back", s.oy && !!s.bar, s)
  ok("no page errors", p.errs.length === 0, p.errs)
})

test("scroll area: dialog in a short viewport scrolls only its body", async ({ open, ok }) => {
  const { p, scope } = await setup(open)
  // dialog body: one scroller, the dialog frame itself never scrolls
  await scope.getByRole("button", { name: "Book pickup…" }).click()
  const dlg = p.getByRole("dialog").filter({ hasText: "Book a pickup" })
  await dlg.waitFor()
  await p.setViewportSize({ width: 900, height: 520 })
  const measure = () => dlg.evaluate((d) => { const vp = d.querySelector(".kl-dialog-scroll .kl-scroll-vp"); return { frame: d.scrollHeight - d.clientHeight, body: vp.scrollHeight - vp.clientHeight, bar: !!d.querySelector(".kl-dialog-scroll .kl-scrollbar") } })
  await idle(p)
  await until(async () => (await measure()).bar)
  const dscroll = await measure()
  ok("dialog in a short viewport: only the body scrolls (no double scroll), with a Keyline bar", dscroll.frame <= 1 && dscroll.body > 0 && dscroll.bar, dscroll)
  ok("no page errors", p.errs.length === 0, p.errs)
})
