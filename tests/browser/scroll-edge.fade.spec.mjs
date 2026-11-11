// Scroll edges: the scroll edge is one ink shadow over any cell — no per-cell fill is
// sampled or written. Exercised on the narrow NavigationMenu list.
import { test } from "./fixtures.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["navigation-menu"] })

test("scroll edges: one shadow over any cell, at both ends", async ({ open, ok }) => {
  const p = await open({ width: 1280, height: 1000, ready: "[data-testid=nm-narrow]" })
  const list = p.getByTestId("nm-narrow").locator(".kl-nmenu-list")
  await list.scrollIntoViewIfNeeded()
  await p.keyboard.press("Escape")
  await p.mouse.move(1, 1)
  // the edges are marked once the list has measured its overflow
  await p.waitForFunction(() => document.querySelector("[data-testid=nm-narrow] .kl-nmenu-list")?.hasAttribute("data-kl-more"), null, { timeout: 3000 }).catch(() => {})
  // at each scroll position, over the cobalt current link or a plain cell, every shown edge is the same shadow
  const at = (pos) =>
    list.evaluate(async (l, pos) => {
      l.scrollLeft = pos === "start" ? 0 : (getComputedStyle(l).direction === "rtl" ? -1 : 1) * l.scrollWidth
      l.dispatchEvent(new Event("scroll"))
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const more = l.getAttribute("data-kl-more") ?? ""
      return [...l.querySelectorAll(".kl-more-fade")].filter((f) => more.includes(f.dataset.klFade)).map((f) => ({ side: f.dataset.klFade, bg: getComputedStyle(f).backgroundImage, inline: f.style.getPropertyValue("--kl-more-bg") }))
    }, pos)
  const all = [...(await at("start")), ...(await at("end"))]
  const shade = (bg) => bg.replace(/to (left|right)/, "")
  ok("scroll edges: one shadow over any cell (no per-cell fill is sampled or written)", all.length >= 2 && all.every((f) => f.inline === "" && shade(f.bg) === shade(all[0].bg)), all)
  ok("no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs])
})
