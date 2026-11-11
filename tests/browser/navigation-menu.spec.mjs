// NavigationMenu: a named nav landmark, triggers open by keyboard and hover, the panel docked on the frame's
// keyline, Escape returns focus, current page cobalt, sections swap without the panel moving, narrow, RTL,
// reduced motion.
import { test, idle, stable } from "./fixtures.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["navigation-menu"] })

const until = (p, fn, arg, timeout = 4000) => p.waitForFunction(fn, arg, { timeout }).catch(() => {})

for (const q of ["theme=light", "theme=dark&density=compact&cut=off"]) {
  test(`navigation menu: keyboard, docking, hover swap, RTL (${q})`, async ({ open, ok, eng }) => {
    const tab = eng === "webkit" ? "Alt+Tab" : "Tab"
    const p = await open({ route: "specimen", q, ready: "#navigation-menu" })
    const nm = p.getByTestId("nm-main")
    await nm.scrollIntoViewIfNeeded()
    ok(`${q}: navigation menu is a nav landmark named Main`, (await p.getByTestId("specimen-nm").getByRole("navigation", { name: "Main", exact: true }).count()) === 1, null)
    const svc = nm.getByRole("button", { name: "Services" })
    const svcEl = await svc.elementHandle()
    ok(`${q}: section triggers are collapsed buttons`, (await svc.getAttribute("aria-expanded")) === "false", null)
    const pricing = nm.getByRole("link", { name: "Pricing" })
    ok(`${q}: the current page's link is aria-current and cobalt`, (await pricing.getAttribute("aria-current")) === "page" && (await pricing.evaluate((e) => getComputedStyle(e).backgroundColor === getComputedStyle(e).getPropertyValue("--kl-cobalt") || getComputedStyle(e).backgroundColor.includes("oklch"))), null)
    await svc.focus(); await p.keyboard.press("Enter")
    const popup = p.locator("[data-slot=navigation-menu-popup]")
    await popup.waitFor({ state: "visible", timeout: 3000 }).catch(() => {})
    await idle(p)
    await stable(popup).catch(() => {})
    ok(`${q}: Enter opens the section: expanded, inverse trigger, panel visible`, (await svc.getAttribute("aria-expanded")) === "true" && (await popup.isVisible()) && (await svc.evaluate((e) => {
      // The inverse cell is the list's Stretch band, laid exactly under the open trigger
      const band = e.closest("[data-kl-stretch]").querySelector(":scope > [data-kl-band]")
      const a = e.getBoundingClientRect(), b = band.getBoundingClientRect()
      // the band runs 1px under the next item's seam, so its trailing edge may be up to 2px past the trigger
      return !band.hidden && Math.abs(a.left - b.left) < 1 && Math.abs(a.right - b.right) < 2 && e.hasAttribute("data-kl-covered") && getComputedStyle(band).backgroundColor !== "rgba(0, 0, 0, 0)"
    })), null)
    const dock = await p.evaluate(() => { const l = document.querySelector("[data-testid=nm-main] .kl-nmenu-list").getBoundingClientRect(), t = document.querySelector("[data-testid=nm-main] .kl-nmenu-trigger").getBoundingClientRect(), pp = document.querySelector("[data-slot=navigation-menu-popup]").getBoundingClientRect(), bw = parseFloat(getComputedStyle(document.querySelector("[data-slot=navigation-menu-popup]")).borderTopWidth); return { top: pp.top, frameBottom: l.bottom, bw, left: pp.left, tl: t.left, l: l.left } })
    ok(`${q}: the panel's top keyline lies on the frame's bottom keyline (2px), its start edge on the frame's start edge`, Math.abs(dock.top - (dock.frameBottom - 2)) <= 0.5 && dock.bw === 2 && Math.abs(dock.left - dock.l) <= 0.5, dock)
    const cards = popup.getByRole("link")
    ok(`${q}: the panel holds four link cells with codes; Customs is the current page`, (await cards.count()) === 4 && (await popup.getByRole("link", { name: /Customs/ }).getAttribute("aria-current")) === "page", null)
    const seams = await popup.locator(".kl-nmenu-gi").evaluateAll((xs) => { const r = xs.map((x) => x.getBoundingClientRect()); return { cols: new Set(r.map((x) => Math.round(x.left))).size, gap: Math.round(r[1].left - r[0].right) } })
    ok(`${q}: link cells share seams in two columns (no gap)`, seams.cols === 2 && seams.gap === 0, seams)
    await p.keyboard.press(tab)
    await until(p, () => document.activeElement?.textContent?.startsWith("Ocean freight"), null, 2000)
    ok(`${q}: Tab moves into the panel's first link`, await p.evaluate(() => document.activeElement?.textContent?.startsWith("Ocean freight")), await p.evaluate(() => document.activeElement?.textContent))
    await p.keyboard.press("Escape")
    await until(p, (e) => e.getAttribute("aria-expanded") === "false" && e === document.activeElement, svcEl, 3000)
    ok(`${q}: Escape closes and returns focus to Services`, (await svc.getAttribute("aria-expanded")) === "false" && (await svc.evaluate((e) => e === document.activeElement)), null)
    // hover: open, then move to the next section; the panel stays where it is (no slide, no size tween)
    const term = nm.getByRole("button", { name: "Terminals" })
    await popup.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {})
    await svc.hover()
    await until(p, (e) => e.getAttribute("aria-expanded") === "true", svcEl, 3000)
    await popup.waitFor({ state: "visible", timeout: 3000 }).catch(() => {})
    await idle(p)
    await stable(popup).catch(() => {})
    const t0 = await popup.boundingBox()
    // a real pointer move (Base UI's safe polygon blocks the list's pointer events while a section is open)
    { const r = await term.boundingBox(); await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2, { steps: 4 }) }
    await until(p, (e) => e.getAttribute("aria-expanded") === "true", await term.elementHandle(), 3000)
    await popup.getByRole("link", { name: /Rotterdam/ }).waitFor({ state: "visible", timeout: 3000 }).catch(() => {})
    await idle(p)
    await stable(popup).catch(() => {})
    const t1 = await popup.boundingBox()
    ok(`${q}: hover opens a section; moving to Terminals swaps the panel's content in place (docked to the frame)`, (await term.getAttribute("aria-expanded")) === "true" && (await popup.getByRole("link", { name: /Rotterdam/ }).isVisible()) && Math.abs(t1.x - t0.x) <= 0.5 && Math.abs(t1.y - t0.y) <= 0.5, [t0, t1])
    ok(`${q}: the panel has no size transition`, await popup.evaluate((e) => !/width|height|all/.test(getComputedStyle(e).transitionProperty) || getComputedStyle(e).transitionDuration.split(",").every((d) => parseFloat(d) === 0)), await popup.evaluate((e) => [getComputedStyle(e).transitionProperty, getComputedStyle(e).transitionDuration]))
    if (q.includes("dark")) ok(`${q}: the panel carries the dark scope`, await popup.evaluate((e) => !!e.closest(".dark")), null)
    await p.mouse.move(5, 5)
    await popup.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {})
    await idle(p)
    // RTL
    const rtl = p.getByTestId("nm-rtl")
    await rtl.scrollIntoViewIfNeeded()
    const rs = rtl.getByRole("button", { name: "الخدمات" })
    await rs.focus(); await p.keyboard.press("Enter")
    await popup.waitFor({ state: "visible", timeout: 3000 }).catch(() => {})
    await idle(p)
    await stable(popup).catch(() => {})
    const rg = await p.evaluate(() => { const t = document.querySelector("[data-testid=nm-rtl] .kl-nmenu-list").getBoundingClientRect(), pp = document.querySelector("[data-slot=navigation-menu-popup]").getBoundingClientRect(); return { tr: t.right, pr: pp.right } })
    ok(`${q}: RTL: the panel's right (start) edge lies on the frame's`, Math.abs(rg.tr - rg.pr) <= 0.5, rg)
    await p.keyboard.press("Escape")
    await popup.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {})
    await idle(p)
    // Base UI Navigation Menu's section swap reports a benign ResizeObserver loop in WebKit (it also
    // does with every Keyline style stripped). Only that exact message is excused; anything else fails.
    const benign = (e) => eng === "webkit" && /^ResizeObserver loop completed with undelivered notifications\.?$/.test(e.replace(/^Error: /, ""))
    if (p.errs.some(benign)) console.log(`  · [${eng}] note: WebKit ResizeObserver loop on the section swap (upstream, benign)`)
    ok(`${q}: navigation menu: no page errors (a benign WebKit ResizeObserver loop excused)`, p.errs.filter((e) => !benign(e)).length === 0, p.errs)
  })
}

test("navigation menu: narrow (390px)", async ({ open, ok }) => {
  const p = await open({ route: "specimen", q: "theme=light", width: 390, height: 844, ready: "#navigation-menu" })
  const n = p.getByTestId("nm-narrow")
  await n.scrollIntoViewIfNeeded()
  await stable(n.locator(".kl-nmenu-list"))
  const sc = await n.locator(".kl-nmenu-list").evaluate((e) => ({ sw: e.scrollWidth, cw: e.clientWidth, more: e.getAttribute("data-kl-more"), pw: e.parentElement.getBoundingClientRect().width, w: e.getBoundingClientRect().width }))
  ok("narrow: the frame stays in its column and scrolls, marking the hidden end", sc.w <= sc.pw + 0.5 && sc.sw > sc.cw && /end/.test(sc.more ?? ""), sc)
  await n.getByRole("button", { name: "Services" }).focus(); await p.keyboard.press("Enter")
  const popup = p.locator("[data-slot=navigation-menu-popup]")
  await popup.waitFor({ state: "visible", timeout: 3000 }).catch(() => {})
  await idle(p)
  await stable(popup).catch(() => {})
  const pg = await p.evaluate(() => { const pp = document.querySelector("[data-slot=navigation-menu-popup]").getBoundingClientRect(), xs = [...document.querySelectorAll("[data-slot=navigation-menu-popup] .kl-nmenu-gi")].map((x) => Math.round(x.getBoundingClientRect().left)); return { l: pp.left, r: pp.right, vw: innerWidth, cols: new Set(xs).size } })
  ok("narrow: the panel fits the viewport, one column", pg.l >= 0 && pg.r <= pg.vw && pg.cols === 1, pg)
})

test("navigation menu: reduced motion opens the panel at once", async ({ open, ok }) => {
  const p = await open({ route: "specimen", q: "theme=light", ctx: { reducedMotion: "reduce" }, ready: "#navigation-menu" })
  const nm = p.getByTestId("nm-main")
  await nm.scrollIntoViewIfNeeded()
  await nm.getByRole("button", { name: "Services" }).focus(); await p.keyboard.press("Enter")
  await p.waitForTimeout(60) // timing: "at once" — the panel must be fully open 60ms after Enter
  const cp = await p.locator("[data-slot=navigation-menu-popup]").evaluate((e) => getComputedStyle(e).clipPath)
  ok("reduced motion: the panel is fully open at once", cp === "none" || /inset\(-8px/.test(cp), cp)
})
