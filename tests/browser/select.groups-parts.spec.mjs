// Select groups (headings, rules, keyboard across groups) and the parts API (items labels, separator, docking,
// choosing).
import { test, idle } from "./fixtures.mjs"
import { near, box, until } from "./lib/probe.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["slider","select"] })

const READY = "#slider .kl-slider"

test("select groups: headings, rules, keyboard across groups", async ({ open, ok }) => {
  const p = await open({ ready: READY })
  const sels = p.locator("#select .kl-select")
  const grouped = sels.filter({ hasText: "Service level" })
  await grouped.scrollIntoViewIfNeeded()
  await grouped.locator("[role=combobox]").focus()
  await p.keyboard.press("Enter")
  const panel = p.locator(".kl-select-panel").last()
  const groups = panel.locator("[role=group]")
  await groups.nth(2).waitFor()
  await idle(p)
  ok("select groups: three groups, each labelled by its heading", (await groups.count()) === 3 && (await groups.nth(1).getAttribute("aria-labelledby")) !== null, await groups.count())
  const firstInGroup2 = groups.nth(1).locator("[role=option]").first()
  ok("select groups: the row after a heading draws no second rule", (await firstInGroup2.evaluate((el) => getComputedStyle(el).borderTopWidth)) === "0px", null)
  const label = () => grouped.locator("[role=combobox]").innerText()
  const before = await label()
  await p.keyboard.press("End")
  await p.keyboard.press("ArrowUp")
  await p.keyboard.press("Enter")
  await until(async () => (await label()) !== before && !(await panel.isVisible()))
  ok("select groups: keyboard crosses groups (End skips the disabled last option's choice; ↑ Enter picks FCL)", (await label()).includes("Less than container load") || (await label()).includes("Full container load"), await label())
  ok("no page errors", p.errs.length === 0, p.errs)
})

test("select parts: items labels, separator, docking, choosing", async ({ open, ok }) => {
  const p = await open({ ready: READY })
  const sels = p.locator("#select .kl-select")
  const parts = sels.filter({ hasText: "Escalate to (parts)" })
  await parts.scrollIntoViewIfNeeded()
  const value = () => parts.locator("[role=combobox] .kl-select-value").innerText()
  ok("select parts: the trigger prints the label from `items`, not the raw value", (await value()).trim() === "Shift lead", await value())
  await parts.locator("[role=combobox]").focus()
  await p.keyboard.press("Enter")
  const pp = p.locator(".kl-select-panel").last()
  await pp.locator(".kl-select-sep").waitFor()
  await idle(p)
  ok("select parts: a separator and two group headings render", (await pp.locator(".kl-select-sep").count()) === 1 && (await pp.locator(".kl-select-group-label").count()) === 2, null)
  const tb = await box(parts.locator("[role=combobox]"))
  const pb = await box(pp)
  ok("select parts: docks like the options form (shared 2px edge, same start)", near(pb.y, tb.y + tb.height - 2) && near(pb.x, tb.x), { tb, pb })
  await pp.getByRole("option", { name: /Regional director/ }).click()
  await until(async () => (await value()).trim() === "Regional director")
  ok("select parts: choosing updates the trigger label", (await value()).trim() === "Regional director", await value())
  ok("no page errors", p.errs.length === 0, p.errs)
})
