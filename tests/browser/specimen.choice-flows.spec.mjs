// Choice controls on the specimen with real input: select, date range picker,
// async multiselect, radio, switch, tabs. Every flow opens a fresh page and checks its errors (page errors, console
// errors, HTTP >= 400).
import { test, idle, stable } from "./fixtures.mjs"
import { until, trackHttp, same, specimen } from "./lib/flow.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["select","choices","location","async","async-race"] })

const Q = "theme=light&cut=on&density=default&motion=normal&dir=ltr"
async function page(open) {
  const p = await open({ route: "specimen", q: Q, width: 1440, height: 900, ready: ".kl-frame" })
  const http = await trackHttp(p, "[data-testid=entry]")
  return { p, ...specimen(p), errors: () => [...p.errs, ...p.consoleErrs, ...http] }
}
const noErrors = (ok, s) => ok("no page errors", same(s.errors(), []), { actual: s.errors(), expected: [] })

test("select: choose an option", async ({ open, ok }) => {
  const s = await page(open)
  const { p, col } = s
  const trigger = col("Select").locator("[data-slot=select] [role=combobox]").first()
  await trigger.click()
  await p.locator("[role=listbox]:visible [role=option]", { hasText: "DSV Road" }).click()
  ok("trigger shows the chosen option", /DSV Road/.test(await trigger.textContent()), await trigger.textContent())
  noErrors(ok, s)
})

test("date range: picker focuses its grid, inherits the cut, focus returns", async ({ open, ok }) => {
  const s = await page(open)
  const { p, col, cutOff } = s
  for (const i of [0, 1]) {
    await cutOff("Async multiselect", i === 1)
    const field = col("Async multiselect").locator("[data-slot=date-range]")
    await field.locator("button").first().click()
    await until(() => p.evaluate(() => !!document.activeElement?.closest("[role=gridcell]")))
    const where = await p.evaluate(() => {
      const a = document.activeElement
      return { role: a?.closest("[role=gridcell]") ? "gridcell" : a?.getAttribute("role"), inPopup: !!a?.closest("[role=dialog]") && !a?.closest("[data-testid=stage]"), cut: a ? getComputedStyle(a).getPropertyValue("--kl-cut").trim() : null }
    })
    ok(`picker ${i}: focus lands on a day in its own popup`, where.role === "gridcell" && where.inPopup, where)
    ok(`picker ${i}: popup inherits the section's cut`, i === 1 ? where.cut === "0" : where.cut !== "0", where)
    await p.keyboard.press("Escape")
    await until(() => field.evaluate((f) => f.contains(document.activeElement)))
    ok(`picker ${i}: Escape returns focus to its trigger`, await field.evaluate((f) => f.contains(document.activeElement)))
    await idle(p).catch(() => {})
  }
  noErrors(ok, s)
})

test("async multiselect: superseded request cannot win", async ({ open, ok }) => {
  const s = await page(open)
  const { p, col } = s
  const input = col("Async multiselect").locator(".kl-ms-input").first()
  await input.click()
  await input.fill("err")
  await p.waitForTimeout(40) // timing: the second query must supersede the first while it is in flight
  await input.fill("DHL")
  await p.waitForTimeout(1100) // timing: kept, the aborted "err" request's response window must elapse before checking it never surfaced
  const retry = await p.locator(".kl-ms-retry:visible").count()
  ok("no failure from the aborted 'err' request", same(retry, 0), { actual: retry, expected: 0 })
  const opts = await p.locator("[role=listbox]:visible [role=option]").allTextContents()
  ok("options match the last query only", opts.length > 0 && opts.every((o) => /DHL/i.test(o)), opts)
  await p.keyboard.press("Escape")
  noErrors(ok, s)
})

test("radio: arrows move, disabled is skipped", async ({ open, ok }) => {
  const s = await page(open)
  const { p, col } = s
  const g = col("Choices").locator("[role=radiogroup]")
  const checked = () => g.locator('[role=radio][aria-checked="true"]').evaluate((el) => el.closest(".kl-radio-item, label, [data-slot]")?.textContent ?? el.textContent)
  await g.locator('[role=radio][aria-checked="true"]').focus()
  const seq = []
  for (let k = 0; k < 3; k++) {
    await p.keyboard.press("ArrowDown")
    seq.push(((await checked()) ?? "").match(/Road|Rail|Air|Sea/)?.[0])
  }
  ok("Road → Rail → Air → (Sea disabled) Road", same(seq, ["Rail", "Air", "Road"]), { actual: seq, expected: ["Rail", "Air", "Road"] })
  noErrors(ok, s)
})

test("switch: pointer and Space", async ({ open, ok }) => {
  const s = await page(open)
  const { p, col } = s
  const sw = col("Choices").locator("[role=switch]").nth(1)
  const before = await sw.getAttribute("aria-checked")
  await sw.click()
  ok("click toggles", (await sw.getAttribute("aria-checked")) !== before)
  await p.keyboard.press("Space")
  const back = await sw.getAttribute("aria-checked")
  ok("Space toggles back", same(back, before), { actual: back, expected: before })
  noErrors(ok, s)
})

test("tabs: arrows activate, band follows", async ({ open, ok }) => {
  const s = await page(open)
  const { p, col } = s
  const list = col("Tabs, nav").locator("[role=tablist]").first()
  const sel = () => list.locator('[role=tab][aria-selected="true"]').textContent()
  const before = await sel()
  await list.locator('[role=tab][aria-selected="true"]').focus()
  await p.keyboard.press("ArrowRight")
  await idle(p).catch(() => {})
  await stable(list.locator("[data-kl-band]")).catch(() => {})
  const tab = await list.locator('[role=tab][aria-selected="true"]').boundingBox()
  const b = await list.locator("[data-kl-band]").boundingBox()
  ok("ArrowRight activates the next tab", (await sel()) !== before, { before })
  ok("band settles on the active tab", !!b && !!tab && Math.abs(b.x - tab.x) < 1.5 && Math.abs(b.width - tab.width) < 1.5, { band: b, tab })
  noErrors(ok, s)
})
