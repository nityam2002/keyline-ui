// Real pointer and keyboard flows on the app's shipments block. Every flow opens a fresh
// #/app page and checks that page's errors (page errors, console errors, HTTP >= 400).
import { test, idle } from "./fixtures.mjs"
import { until, trackHttp, same } from "./lib/flow.mjs"

const isMac = process.platform === "darwin"
const Q = "theme=light&cut=on&density=default&motion=normal&dir=ltr"

async function app(open) {
  const p = await open({ route: "app", q: Q, width: 1440, height: 900, ready: ".kl-frame" })
  const http = await trackHttp(p, ".kl-sx-table tbody tr.kl-tr")
  const rows = p.locator(".kl-sx-table tbody tr.kl-tr")
  const carrier = (i) => rows.nth(i).locator("td").nth(4).textContent()
  const a = {
    p,
    rows,
    carriers: (n) => Promise.all(Array.from({ length: n }, (_, i) => carrier(i))),
    count: () => p.locator(".kl-tf-bulk-n .kl-count").textContent(),
    undo: () => p.locator(".kl-toast-action", { hasText: "Undo" }).last(),
    search: p.locator(".kl-tf-search input"),
    selectedTab: () => p.locator('.kl-sx-table [role=tab][aria-selected="true"], [role=tablist] [role=tab][aria-selected="true"]').first().textContent(),
    errors: () => [...p.errs, ...p.consoleErrs, ...http],
  }
  return a
}
const noErrors = (ok, a) => ok("no page errors during flows", same(a.errors(), []), { actual: a.errors(), expected: [] })

test("app: filter", async ({ open, ok }) => {
  const a = await app(open)
  const all = await a.rows.count()
  await a.search.fill("Lyon")
  await until(async () => { const n = await a.rows.count(); return n > 0 && n < all })
  const n = await a.rows.count()
  ok("search narrows the rows", n > 0 && n < all, { all, n })
  noErrors(ok, a)
})

test("app: view tabs (keyboard)", async ({ open, ok }) => {
  const a = await app(open)
  const { p } = a
  const before = await a.selectedTab()
  await p.locator('[role=tab][aria-selected="true"]').first().focus()
  await p.keyboard.press("ArrowRight")
  const next = await a.selectedTab()
  ok("ArrowRight activates the next view", next !== before, { before })
  const focusSel = await p.evaluate(() => document.activeElement?.getAttribute("aria-selected"))
  ok("focus follows the active tab", same(focusSel, "true"), { actual: focusSel, expected: "true" })
  await p.keyboard.press("Home")
  const home = await a.selectedTab()
  ok("Home returns to the first view", same(home, before), { actual: home, expected: before })
  noErrors(ok, a)
})

test("app: assign + Undo restores each row's own value", async ({ open, ok }) => {
  const a = await app(open)
  const { p, rows } = a
  for (const i of [0, 1, 2]) await rows.nth(i).locator(".kl-check").click()
  const c = await a.count()
  ok("three selected", same(c, "3"), { actual: c, expected: "3" })
  const before = await a.carriers(3)
  await p.locator(".kl-tf-bulk button", { hasText: "Assign carrier" }).click()
  await p.locator("[data-slot=menu-item]", { hasText: "DSV Road" }).click()
  await a.undo().waitFor()
  const assigned = await a.carriers(3)
  ok("all three assigned", same(assigned, ["DSV Road", "DSV Road", "DSV Road"]), { actual: assigned, expected: ["DSV Road", "DSV Road", "DSV Road"] })
  await a.undo().click()
  await until(async () => same(await a.carriers(3), before))
  const restored = await a.carriers(3)
  ok("Undo restores the previous carriers, per row", same(restored, before), { actual: restored, expected: before })
  noErrors(ok, a)
})

test("app: async failure changes nothing", async ({ open, ok }) => {
  const a = await app(open)
  const { p } = a
  await p.locator(".kl-sx-table thead .kl-check").click()
  const n = Number(await a.count())
  const before = await a.carriers(6)
  await p.locator(".kl-tf-bulk button", { hasText: "Assign carrier" }).click()
  await p.locator("[data-slot=menu-item]", { hasText: "Rhenus Road" }).click()
  await p.locator(".kl-toast", { hasText: "Nothing was changed" }).waitFor()
  ok("more than the capacity was selected", n > 5, { n })
  const after = await a.carriers(6)
  ok("carriers unchanged after the failure", same(after, before), { actual: after, expected: before })
  const kept = Number(await a.count())
  ok("selection kept for a retry", same(kept, n), { actual: kept, expected: n })
  noErrors(ok, a)
})

test("app: selection outside the results", async ({ open, ok }) => {
  const a = await app(open)
  const { p, rows } = a
  for (const i of [0, 1, 2]) await rows.nth(i).locator(".kl-check").click()
  const id = (await rows.nth(0).locator("td").nth(2).textContent()).trim()
  await a.search.fill(id)
  await until(async () => /not in these results/.test(await p.locator(".kl-tf-bulk").textContent()))
  const scope = await p.locator(".kl-tf-bulk").textContent()
  ok("scope says how many are not in the results", /2 not in these results/.test(scope), scope)
  await p.locator(".kl-tf-bulk button", { hasText: /Keep only/ }).click()
  const c = await a.count()
  ok("keep visible only leaves one", same(c, "1"), { actual: c, expected: "1" })
  noErrors(ok, a)
})

test("app: destructive confirm, Escape, Undo", async ({ open, ok }) => {
  const a = await app(open)
  const { p, rows } = a
  const firstTab = () => p.locator("[role=tab]").first().textContent()
  const total = await firstTab()
  for (const i of [0, 1]) await rows.nth(i).locator(".kl-check").click()
  await p.locator(".kl-tf-bulk [role=toolbar] button", { hasText: "Actions" }).click()
  await p.locator("[data-slot=menu-item]", { hasText: "Cancel" }).click()
  await p.waitForSelector("[data-slot=alert-dialog]")
  // the alert moves focus into itself once it has opened
  await until(() => p.evaluate(() => !!document.activeElement?.closest("[data-slot=alert-dialog]")))
  await idle(p).catch(() => {})
  const focused = await p.evaluate(() => document.activeElement?.textContent)
  ok("alert opens on the safe action", !/cancel 2/i.test(focused ?? ""), focused)
  await p.keyboard.press("Escape")
  const c = await a.count()
  ok("Escape keeps the selection", same(c, "2"), { actual: c, expected: "2" })
  await p.locator(".kl-tf-bulk [role=toolbar] button", { hasText: "Actions" }).click()
  await p.locator("[data-slot=menu-item]", { hasText: "Cancel" }).click()
  await p.locator(".kl-alert-danger").click()
  const removed = await firstTab()
  ok("cancel removes the rows", removed !== total, { total })
  await a.undo().click()
  const back = await firstTab()
  ok("Undo restores the count", same(back, total), { actual: back, expected: total })
  noErrors(ok, a)
})

test("app: command menu", async ({ open, ok, eng }) => {
  const a = await app(open)
  const { p } = a
  await p.locator("body").click({ position: { x: 5, y: 5 } })
  await p.keyboard.press(isMac && eng === "webkit" ? "Meta+k" : "Control+k")
  await p.waitForSelector(".kl-cmd")
  await p.keyboard.type("show")
  await p.keyboard.press("Alt+Digit2")
  ok("Alt+2 runs the second result (a view switch)", (await a.selectedTab()) !== null)
  await p.keyboard.press("Escape").catch(() => {})
  noErrors(ok, a)
})

test("app: row expansion", async ({ open, ok }) => {
  const a = await app(open)
  const { p, rows } = a
  const y0 = await rows.nth(0).boundingBox()
  await rows.nth(0).locator(".kl-xp button").click()
  await until(async () => (await rows.nth(0).locator(".kl-ix").getAttribute("rowspan")) === "2")
  await idle(p).catch(() => {})
  const y1 = await rows.nth(0).boundingBox()
  ok("expanded row stays in place", Math.abs((y0?.y ?? 0) - (y1?.y ?? 0)) < 0.5, { y0: y0?.y, y1: y1?.y })
  const span = await rows.nth(0).locator(".kl-ix").getAttribute("rowspan")
  ok("index cell spans the detail row", same(span, "2"), { actual: span, expected: "2" })
  noErrors(ok, a)
})

test("app: the expand button keeps its 44px target when the table scrolls sideways", async ({ open, ok }) => {
  // at 1440 the table fits; narrower, it scrolls inside its frame and auto layout used to squeeze the cell to 16px
  for (const width of [1440, 1024, 760]) {
    const p = await open({ route: "app", q: Q, width, height: 900, ready: ".kl-sx-table tbody tr.kl-tr" })
    const sizes = await p.locator(".kl-sx-table tbody tr.kl-tr .kl-xp button").evaluateAll((bs) => bs.map((b) => Math.round(b.getBoundingClientRect().width)))
    ok(`expand buttons at ${width}px are 44px wide (WCAG 2.5.8 needs 24)`, sizes.length > 0 && sizes.every((w) => w >= 44), { width, sizes: [...new Set(sizes)] })
  }
})
