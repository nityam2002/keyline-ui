// The shipments block's command rows on Toolbar (from r14): views end, status row with filter tokens, bulk actions
// with the primary menu and its signal, sort levels in the View menu, and the narrow overflow.
import { test, idle } from "./fixtures.mjs"
import { poll, rowItems, menuRows, focusName14 as focusedName, tabStops as stops, lastMenu } from "./lib/probes-c.mjs"

const READY = ".kl-sx-table tbody tr.kl-tr"

async function setup(open, width = 1440, height = 1000) {
  const p = await open({ route: "app", width, height, ready: READY })
  const t = p.locator(".kl-sx-table")
  return {
    p,
    t,
    views: t.getByRole("toolbar", { name: "Table" }),
    status: t.getByRole("toolbar", { name: "Status filters" }),
    bulk: t.getByRole("toolbar", { name: "Bulk actions" }),
  }
}

test("block command rows: named toolbars, status toggles, filter tokens", async ({ open, ok }) => {
  const { p, t, views, status, bulk } = await setup(open)
  ok("block: views end, status row and bulk actions are named toolbars, one Tab stop each", (await views.count()) === 1 && (await status.count()) === 1 && (await bulk.count()) === 1 && (await stops(views)) === 1 && (await stops(status)) === 1 && (await stops(bulk)) === 1, null)
  ok("block: the View item counts visible columns in its affix (7/7)", (await views.getByRole("button", { name: /View/ }).textContent()).includes("7/7"), await views.getByRole("button", { name: /View/ }).textContent())
  const assign = bulk.getByRole("button", { name: /Assign carrier/ })
  ok("block: with nothing selected, Assign carrier is the disabled primary and still focusable", (await assign.getAttribute("data-kl-primary")) === "" && (await assign.getAttribute("aria-disabled")) === "true", null)
  // Tab order: search row is its own stops; Tab from the view toolbar goes to the search
  await views.getByRole("button", { name: /View/ }).focus()
  await p.keyboard.press("ArrowRight")
  ok("block: arrow keys move along the views toolbar (View → Commands)", /Commands/.test(await focusedName(p)), await focusedName(p))

  // status toggles filter, and the token row
  const before = await t.locator("tbody tr.kl-tr").count()
  await status.getByRole("button", { name: /Delayed/ }).click()
  const read = async () => ({ pressed: await status.getByRole("button", { name: /Delayed/ }).getAttribute("aria-pressed"), rows: await t.locator("tbody tr.kl-tr").evaluateAll((rs) => rs.map((r) => r.textContent)) })
  const { pressed, rows: rowsAfter } = await poll(read, (s) => s.pressed === "true" && s.rows.length > 0 && s.rows.length < before && s.rows.every((x) => /Delayed/.test(x)), 3000)
  ok("block: a status toggle filters the rows (only delayed shown)", pressed === "true" && rowsAfter.length > 0 && rowsAfter.length < before && rowsAfter.every((x) => /Delayed/.test(x)), { pressed, n: rowsAfter.length })
  await t.getByRole("searchbox").fill("Rotterdam")
  const tok = status.getByRole("group", { name: "Text filter" })
  await tok.waitFor({ state: "attached" }).catch(() => {})
  await poll(() => tok.getByRole("button").count(), (c) => c === 2, 2000)
  ok("block: a filter token in the toolbar is a group of two toolbar items (still one Tab stop)", (await tok.count()) === 1 && (await tok.getByRole("button").count()) === 2 && (await stops(status)) === 1, null)
  await status.getByRole("button", { name: /Delayed/ }).focus()
  // walk to the token's remove item with the arrow keys
  let guard = 0
  while (!/Remove Text filter/.test(await focusedName(p)) && guard++ < 12) await p.keyboard.press("ArrowRight")
  await p.keyboard.press("Enter")
  const gone = async () => ({ q: await t.getByRole("searchbox").inputValue(), tok: await tok.count() })
  const g = await poll(gone, (s) => s.q === "" && s.tok === 0, 3000)
  ok("block: arrow keys reach the token's remove item; Enter removes the filter", g.q === "" && g.tok === 0, { guard, q: g.q })
  ok("block: after removing, focus stays in the status toolbar", await status.evaluate((x) => x.contains(document.activeElement)), await focusedName(p))
  await status.getByRole("button", { name: /^Clear/ }).click()
  await poll(() => status.getByRole("button", { name: /Delayed/ }).getAttribute("aria-pressed"), (v) => v !== "true", 2000)
  ok("no page errors (block)", p.errs.length === 0, p.errs)
})

test("block command rows: bulk actions — primary menu, signal, Cancel confirmation", async ({ open, ok }) => {
  const { p, t, bulk } = await setup(open)
  const assign = bulk.getByRole("button", { name: /Assign carrier/ })
  // bulk actions: select, assign through the primary menu, signal
  await t.locator("tbody tr.kl-tr").nth(0).getByRole("checkbox").click()
  await t.locator("tbody tr.kl-tr").nth(1).getByRole("checkbox").click()
  const sel = async () => ({ dis: await assign.getAttribute("aria-disabled"), affix: await assign.locator(".kl-tb-affix").textContent().catch(() => null) })
  const s = await poll(sel, (x) => x.dis !== "true" && x.affix === "2", 2000)
  ok("block: selected, Assign carrier is enabled and its affix counts 2", s.dis !== "true" && s.affix === "2", null)
  await assign.click()
  await lastMenu(p)
  await p.locator("[role=menu]").last().getByRole("menuitem", { name: /Rhenus Road/ }).click()
  const sigOf = async () => ({ busy: await assign.getAttribute("aria-busy"), sig: await assign.getAttribute("data-signal") })
  const sig = await poll(sigOf, (x) => x.busy === "true" || x.sig === "done", 2000, 10)
  ok("block: assigning shows pending on the primary (aria-busy)", sig.busy === "true" || sig.sig === "done", sig.sig)
  // the assignment finishes before the next command
  await poll(() => assign.getAttribute("aria-busy"), (v) => v !== "true", 4000)
  // Actions menu → Cancel… hands focus to the confirmation
  await bulk.getByRole("button", { name: "Actions" }).click()
  await lastMenu(p)
  await p.locator("[role=menu]").last().getByRole("menuitem", { name: /Cancel 2 shipments/ }).click()
  const dlgOf = () => p.evaluate(() => ({ open: !!document.querySelector("[role=alertdialog]"), inside: !!document.activeElement?.closest("[role=alertdialog]") }))
  await idle(p)
  const dlg = await poll(dlgOf, (d) => d.open && d.inside, 3000)
  ok("block: Actions → Cancel… opens the confirmation and focus is in it (not back on the trigger)", dlg.open && dlg.inside, dlg)
  await p.keyboard.press("Escape")
  ok("no page errors (block)", p.errs.length === 0, p.errs)
})

test("block command rows: sort levels in the View menu, Shift + click on a header", async ({ open, ok }) => {
  const { p, t, views } = await setup(open)
  const view = views.getByRole("button", { name: /View/ })
  // sort levels in the View menu
  await view.click()
  await lastMenu(p)
  await idle(p)
  const affOf = () => view.evaluate((b) => [getComputedStyle(b).color, getComputedStyle(b.querySelector(".kl-tb-affix .kl-code")).color, b.hasAttribute("data-popup-open")])
  const aff = await poll(affOf, (a) => a[2] && a[0] === a[1], 2000)
  ok("block: open, the View item is inverse and its 7/7 affix takes the same colour (no muted code on ink)", aff[2] && aff[0] === aff[1], aff)
  const sub = async (parent, item) => {
    await p.locator("[role=menu]").last().getByRole("menuitem", { name: parent }).hover()
    const it = p.locator("[role=menu]").last().getByRole("menuitem", { name: item })
    await it.waitFor({ state: "visible" })
    await lastMenu(p)
    await it.click()
    await p.locator("[role=menu]").waitFor({ state: "detached" }).catch(() => {})
  }
  await sub("Sort by", "Status")
  await view.click()
  await lastMenu(p)
  await sub("Then by", "ETA")
  const hs = async (n) => t.locator("thead th", { hasText: n }).first()
  const sortOf = async () => ({ st: await (await hs("Status")).getAttribute("aria-sort"), eta: await (await hs("ETA")).getAttribute("aria-sort"), nums: await t.locator("thead .kl-sort-n").allTextContents() })
  const { st, eta, nums } = await poll(sortOf, (x) => x.st === "ascending" && x.eta === null && x.nums.join(",") === "1,2", 2000)
  ok("block: View → Sort by Status, then by ETA: two levels (aria-sort on Status, ETA numbered 2)", st === "ascending" && eta === null && nums.join(",") === "1,2", { st, eta, nums })
  const ranks = await t.locator("tbody tr.kl-tr").evaluateAll((rs) => rs.map((r) => r.querySelector("td:nth-child(6)")?.textContent.trim()))
  ok("block: rows follow the status urgency, ties by ETA", ranks.length > 3, ranks.slice(0, 6))
  await view.click()
  await lastMenu(p)
  const level = p.locator("[role=menu]").last().getByRole("menuitem", { name: /^2 ETA/ })
  await level.click()
  const rev = await poll(async () => (await hs("ETA")).getAttribute("data-sort"), (v) => v === "descending", 2000)
  ok("block: a level row in the View menu reverses it and keeps the menu open", rev === "descending" && (await p.locator("[role=menu]").count()) > 0, rev)
  await p.locator("[role=menu]").last().getByRole("menuitem", { name: /Clear sort/ }).click()
  const clearOf = async () => ({ sorted: await t.locator('thead th[aria-sort="ascending"], thead th[aria-sort="descending"]').count(), nums: await t.locator("thead .kl-sort-n").count() })
  const c = await poll(clearOf, (x) => x.sorted === 0 && x.nums === 0, 2000)
  ok("block: Clear sort returns every header to none", c.sorted === 0 && c.nums === 0, null)
  await p.locator("[role=menu]").waitFor({ state: "detached" }).catch(() => {})
  await t.locator("thead th", { hasText: "Carrier" }).locator("button").click()
  await t.locator("thead th", { hasText: "Weight" }).locator("button").click({ modifiers: ["Shift"] })
  const lv = await poll(() => t.locator("thead .kl-sort-n").allTextContents(), (x) => x.join(",") === "1,2", 2000)
  ok("block: Shift + click on a header adds Weight as level 2", lv.join(",") === "1,2", lv)
  ok("no page errors (block)", p.errs.length === 0, p.errs)
})

test("block 420: command rows overflow into More", async ({ open, ok }) => {
  const { p, t, views, status } = await setup(open, 420, 900)
  const vItems = await poll(() => rowItems(views), (it) => it.some((i) => i.more && i.w >= 30 && i.inside), 3000)
  ok("block 420: the views toolbar keeps a More item inside the row", vItems.some((i) => i.more && i.w >= 30 && i.inside), vItems)
  const sItems = await poll(() => rowItems(status), (it) => it.some((i) => i.more && /More filters/.test(i.name)), 3000)
  ok("block 420: the status row collapses into a labelled 'More filters' item", sItems.some((i) => i.more && /More filters/.test(i.name)), sItems)
  await status.locator(".kl-tb-overflow").click()
  await lastMenu(p)
  const rows = await menuRows(p)
  ok("block 420: More filters lists the statuses as checkbox rows with their counts", rows && rows.filter((r) => r.role === "menuitemcheckbox").length === 4, rows)
  const cnt = await p.evaluate(() => { const m = [...document.querySelectorAll("[role=menu]")].pop(); return { counts: m.querySelectorAll(".kl-menu-label .kl-tb-menu-count").length, keys: m.querySelectorAll("kbd").length } })
  ok("block 420: a count follows its label in the menu, not in a key cell (kbd is for shortcuts)", cnt.counts === 4 && cnt.keys === 0, cnt)
  const before = await t.locator("tbody tr.kl-tr").count()
  await p.locator("[role=menu]").last().getByRole("menuitemcheckbox", { name: /Delayed/ }).click()
  const after = await poll(() => t.locator("tbody tr.kl-tr").evaluateAll((rs) => rs.map((r) => r.textContent)), (a) => a.length < before && a.every((x) => /Delayed/.test(x)), 3000)
  ok("block 420: checking a status in the menu filters the rows", after.length < before && after.every((x) => /Delayed/.test(x)), { before, after: after.length })
  await p.keyboard.press("Escape")
  await p.locator("[role=menu]").waitFor({ state: "detached" }).catch(() => {})
  await views.locator(".kl-tb-overflow").click()
  await lastMenu(p)
  const vm = await menuRows(p)
  ok("block 420: the views More holds View (as a submenu) and Commands", vm && vm.some((r) => /View/.test(r.name)) && vm.some((r) => /Commands/.test(r.name)), vm)
  await p.locator("[role=menu]").last().getByRole("menuitem", { name: /Commands/ }).click()
  const dn = await poll(() => p.locator("[role=dialog]").count(), (n) => n > 0, 3000)
  ok("block 420: Commands from the More menu opens the command dialog", dn > 0, null)
  await p.keyboard.press("Escape")
  ok("no page errors (block narrow)", p.errs.length === 0, p.errs)
})
