// NumberField: naming, keyboard and stepper steps, clamping, hatched ends, focus edge, commit on blur, locale
// formatting, invalid/disabled, a paired slider, cell layout; compact steppers; number cells in a narrow row.
import { test } from "./fixtures.mjs"
import { near, box, css, until } from "./lib/probe.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["number","wayfinding","participants"] })

const READY = "#number .kl-number"

test("number: keyboard and stepper steps, clamping, formatting, invalid, paired slider", async ({ open, ok }) => {
  const p = await open({ ready: READY })
  const n = p.locator("#number .kl-number")
  const pallets = n.nth(0)
  await pallets.scrollIntoViewIfNeeded()
  const input = pallets.getByLabel("Pallets", { exact: true })
  ok("number: the label names the input; the description is attached", (await input.getAttribute("aria-describedby")) !== null && (await input.getAttribute("aria-roledescription")) === "Number field", null)
  await input.focus()
  await p.keyboard.press("ArrowUp")
  ok("number: ArrowUp steps (24 → 25)", (await input.inputValue()) === "25", await input.inputValue())
  await p.keyboard.press("Shift+ArrowUp")
  ok("number: Shift+ArrowUp takes the large step and clamps at max (33)", (await input.inputValue()) === "33", await input.inputValue())
  const inc = pallets.locator(".kl-number-step").nth(1)
  ok("number: at max the + cell is out of service (hatched)", (await inc.evaluate((e) => e.hasAttribute("disabled") || e.getAttribute("aria-disabled") === "true" || e.hasAttribute("data-disabled"))) && (await css(inc, "background-image")) !== "none", await css(inc, "background-image"))
  const frame = pallets.locator(".kl-number-frame")
  ok("number: keyboard focus is the frame's own edge (commit colour), no outline", (await css(frame, "border-top-color")) === (await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--kl-focus").trim() && getComputedStyle(document.querySelector("#number .kl-number-frame")).borderTopColor)) && (await css(frame, "outline-style")) === "none", null)
  await p.keyboard.press("Home")
  ok("number: Home jumps to min (1)", (await input.inputValue()) === "1", await input.inputValue())
  await input.fill("30")
  await p.keyboard.press("Tab")
  ok("number: typed value commits on blur (30)", (await input.inputValue()) === "30", await input.inputValue())
  ok("number: steppers are not Tab stops", (await pallets.locator(".kl-number-step").first().getAttribute("tabindex")) === "-1", null)
  await pallets.locator(".kl-number-step").first().click()
  ok("number: pressing − steps down (30 → 29)", (await input.inputValue()) === "29", await input.inputValue())
  const atMin = n.nth(1).locator(".kl-number-step").first()
  ok("number: at min the − cell is hatched, + stays live", (await css(atMin, "background-image")) !== "none" && (await css(n.nth(1).locator(".kl-number-step").nth(1), "background-image")) === "none", null)
  ok("number: locale currency formatting (de-DE, EUR)", (await n.nth(2).locator(".kl-number-input").inputValue()).replace(/\s/g, " ") === "12.500,00 €", await n.nth(2).locator(".kl-number-input").inputValue())
  const bad = n.nth(3)
  const bang = await box(bad.locator(".kl-field-bang"))
  ok("number: invalid inserts the ! cell before the − and shows its message", bang.width > 20 && (await bad.locator(".kl-field-error").isVisible()) && (await bad.locator(".kl-field-bang").evaluate((e) => e.nextElementSibling.classList.contains("kl-number-step"))), bang)
  ok("number: disabled disables the input", await n.nth(4).locator(".kl-number-input").isDisabled(), null)
  // paired with a slider: one value
  const reefer = n.nth(5).locator(".kl-number-input")
  const slider = p.locator("#number .kl-slider input[type=range]")
  await reefer.focus()
  await p.keyboard.press("ArrowUp")
  await until(async () => (await slider.getAttribute("aria-valuenow")) === "4.5")
  const sliderVal = await slider.getAttribute("aria-valuenow")
  ok("number: the paired slider follows the field (4.0 → 4.5)", (await reefer.inputValue()) === "4.5" && sliderVal === "4.5", [await reefer.inputValue(), sliderVal])
  const cellIn = p.locator("#number .kl-number-frame[data-kl-layout=cell] .kl-number-input").first()
  ok("number: a cell-layout field shows its whole value (no clipping)", await cellIn.evaluate((e) => e.scrollWidth <= e.clientWidth + 1), await cellIn.evaluate((e) => [e.scrollWidth, e.clientWidth]))
  ok("no page errors (default page)", p.errs.length === 0, p.errs)
})

test("number: compact steppers stay square (rtl, cut off, compact)", async ({ open, ok }) => {
  const q = await open({ q: "dir=rtl&cut=off&density=compact", ready: READY })
  await q.locator("#wayfinding").scrollIntoViewIfNeeded()
  const step = q.locator("#number .kl-number .kl-number-step").first()
  const frame = q.locator("#number .kl-number .kl-number-frame").first()
  ok("compact: steppers stay square to the (shorter) frame", near((await box(step)).width, (await box(frame)).height - 4, 1.5), [await box(step), await box(frame)])
  ok("no page errors (rtl, cut off, compact)", q.errs.length === 0, q.errs)
})

test("number cells: in a narrow row the steppers stack; with room they are flat", async ({ open, ok }) => {
  // regression: two number cells in a 279px panel were squeezed and the + of one ran into the − of the next
  const n = await open({ width: 1440, ready: "#participants form" })
  const panel = n.locator("#number .kl-frame", { hasText: "Load (cells)" }).first()
  await panel.scrollIntoViewIfNeeded()
  const geo = () => panel.evaluate((pn) => {
    const steps = [...pn.querySelectorAll(".kl-number-step")].map((x) => x.getBoundingClientRect())
    const frames = [...pn.querySelectorAll(".kl-number-frame")].map((x) => x.getBoundingClientRect())
    const inputs = [...pn.querySelectorAll(".kl-number-input")].map((x) => x.scrollWidth <= x.clientWidth + 1 && x.getBoundingClientRect().width > 30)
    return {
      inside: steps.every((st) => frames.some((f) => st.left >= f.left - 0.5 && st.right <= f.right + 0.5)),
      overlap: steps.some((a, i) => steps.some((c, j) => i < j && a.left < c.right - 0.5 && c.left < a.right - 0.5 && a.top < c.bottom - 0.5 && c.top < a.bottom - 0.5)),
      stacked: steps.length === 4 && Math.round(steps[0].left) === Math.round(steps[1].left),
      valuesFit: inputs.every(Boolean),
    }
  })
  let g = await geo()
  ok("number cells: in a narrow row the steppers fold into one stacked cell; nothing overlaps; values fit", g.inside && !g.overlap && g.stacked && g.valuesFit, g)
  const inc = panel.getByRole("button", { name: "Increase" }).first()
  await inc.click()
  ok("number cells: the stacked + still steps", (await panel.locator(".kl-number-input").first().inputValue()) === "121", await panel.locator(".kl-number-input").first().inputValue())
  await panel.evaluate((pn) => (pn.style.width = "640px"))
  await until(async () => !(await geo()).stacked)
  g = await geo()
  ok("number cells: with room, the steppers are flat again (− value unit +)", g.inside && !g.overlap && !g.stacked, g)
})
