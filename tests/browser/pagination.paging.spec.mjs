// Pagination: current page, a frame that keeps its width while paging, Next/Previous, out-of-service ends,
// four-digit cells, unknown count, links, the narrow fold, Tab order; RTL placement of Previous.
import { test } from "./fixtures.mjs"
import { near, box } from "./lib/probe.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["number","wayfinding"] })

const READY = "#number .kl-number"

test("pagination: paging, fixed width, ends, many pages, loading, links, narrow, Tab", async ({ open, ok, eng }) => {
  const p = await open({ ready: READY })
  const w = p.locator("#wayfinding")
  await w.scrollIntoViewIfNeeded()
  const pg = w.getByRole("navigation", { name: "Pagination", exact: true })
  ok("pagination: page 5 of 20 is current (aria-current)", (await pg.locator("[aria-current=page]").innerText()) === "5", null)
  const width0 = (await box(pg.locator(".kl-pg-frame"))).width
  const widths = []
  for (const target of ["Page 1", "Page 4", "Page 20", "Page 17", "Next page", "Previous page"]) {
    await pg.getByRole("button", { name: target, exact: true }).click()
    widths.push((await box(pg.locator(".kl-pg-frame"))).width)
  }
  ok("pagination: the frame keeps its width while paging", widths.every((x) => near(x, width0, 0.5)), [width0, ...widths])
  ok("pagination: Next/Previous moved the page (17 → 18 → 17)", (await pg.locator("[aria-current=page]").innerText()) === "17", null)
  await pg.getByRole("button", { name: "Page 20", exact: true }).click()
  ok("pagination: Next is out of service on the last page", await pg.getByRole("button", { name: "Next page" }).isDisabled(), null)
  const many = w.getByRole("navigation", { name: "Pagination, many pages" })
  const cells = await many.locator(".kl-pg-n").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)))
  ok("pagination: four-digit page cells all share one width", new Set(cells).size === 1, cells)
  const loading = w.getByRole("navigation", { name: "Pagination, loading" })
  ok("pagination: unknown count shows – and both steps are out of service", (await loading.locator(".kl-pg-of").innerText()) === "–" && (await loading.getByRole("button", { name: "Previous page" }).isDisabled()) && (await loading.getByRole("button", { name: "Next page" }).isDisabled()), null)
  const links = w.getByRole("navigation", { name: "Pagination, links" })
  ok("pagination: getHref renders links with hrefs", (await links.getByRole("link").count()) === 5 && (await links.getByRole("link", { name: "Page 3" }).getAttribute("href")) === "#/specimen?page=3", await links.getByRole("link").count())
  const narrow = w.getByRole("navigation", { name: "Pagination, narrow" })
  ok("pagination: under 360px the numbers fold to one “20 / 20” cell", !(await narrow.locator(".kl-pg-n").first().isVisible()) && (await narrow.locator(".kl-pg-of").innerText()).replace(/\s/g, "") === "20/20", await narrow.locator(".kl-pg-of").innerText())
  // keyboard: Tab reaches the numbers in order (WebKit on macOS skips plain buttons on Tab by default;
  // Alt+Tab is the platform's all-controls key)
  await pg.getByRole("button", { name: "Page 1", exact: true }).focus()
  await p.keyboard.press(eng === "webkit" ? "Alt+Tab" : "Tab")
  const label = () => p.evaluate(() => document.activeElement?.getAttribute("aria-label"))
  ok("pagination: Tab moves through the page cells in order", (await label()) === "Page 16" || (await label()) === "Page 17", await label())
  ok("no page errors (default page)", p.errs.length === 0, p.errs)
})

test("pagination: rtl puts Previous at the inline start", async ({ open, ok }) => {
  const q = await open({ q: "dir=rtl&cut=off&density=compact", ready: READY })
  const w = q.locator("#wayfinding")
  await w.scrollIntoViewIfNeeded()
  const pg = w.getByRole("navigation", { name: "Pagination", exact: true })
  const prev = await box(pg.getByRole("button", { name: "Previous page" }))
  const next = await box(pg.getByRole("button", { name: "Next page" }))
  ok("rtl: Previous is at the inline start (right)", prev.x > next.x, { prev, next })
  ok("no page errors (rtl, cut off, compact)", q.errs.length === 0, q.errs)
})
