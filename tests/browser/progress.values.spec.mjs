// Progress: roles and values, indeterminate, failed and recovery, the fill width, the done glyph, hideLabel.
import { test } from "./fixtures.mjs"
import { near, box, until } from "./lib/probe.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["slider","progress"] })

test("progress: values, states, fill width, advance and recovery", async ({ open, ok }) => {
  const q = await open({ ready: "#slider .kl-slider" })
  const bars = q.locator("#progress [role=progressbar]")
  await bars.first().scrollIntoViewIfNeeded()
  ok("progress: six bars with role progressbar", (await bars.count()) === 6, await bars.count())
  ok("progress: determinate value is exposed (64)", (await bars.nth(1).getAttribute("aria-valuenow")) === "64", null)
  ok("progress: indeterminate exposes no value", (await bars.nth(2).getAttribute("aria-valuenow")) === null && (await bars.nth(2).getAttribute("data-indeterminate")) !== null, null)
  ok("progress: failed says so in the value text and in the readout", /Failed at 38/.test((await bars.nth(3).getAttribute("aria-valuetext")) || "") && /Failed/.test(await bars.nth(3).locator(".kl-progress-v").innerText()), await bars.nth(3).getAttribute("aria-valuetext"))
  ok("progress: the detail line describes the bar", (await bars.nth(3).getAttribute("aria-describedby")) !== null, null)
  const rail = await box(bars.nth(1).locator(".kl-progress-rail"))
  const fill = await box(bars.nth(1).locator(".kl-progress-fill"))
  ok("progress: the fill is 64% of the rail's inner width", near(fill.width, (rail.width - 2) * 0.64, 1.5), { rail, fill })
  ok("progress: complete shows the done glyph", (await bars.nth(0).locator(".kl-glyph[data-kind=done]").count()) === 1, null)
  await q.locator("#progress").getByRole("button", { name: "Advance", exact: true }).click()
  await until(async () => (await bars.nth(1).getAttribute("aria-valuenow")) === "76")
  ok("progress: a new value moves the fill (64 → 76)", (await bars.nth(1).getAttribute("aria-valuenow")) === "76", null)
  await q.locator("#progress").getByRole("button", { name: "Retry", exact: true }).click()
  await until(async () => (await bars.nth(3).getAttribute("data-failed")) === null)
  ok("progress: recovery clears the failed state", (await bars.nth(3).getAttribute("data-failed")) === null, null)
  ok("progress: hideLabel keeps an accessible name", (await bars.nth(4).getAttribute("aria-label")) === "Label hidden (in a table cell)", null)
  ok("no page errors", q.errs.length === 0, q.errs)
})
