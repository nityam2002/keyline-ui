// Slider (from r15): the ! cell in the control and cell layouts, and units / negative numbers in RTL.
import { test } from "./fixtures.mjs"
import { poll } from "./lib/probes-c.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["date-time","slider-attention"] })

test("slider: ! cell in both layouts; °C and negatives in RTL", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: "[data-testid=specimen-dtp]" })
  const sec = p.getByTestId("specimen-slider")
  await sec.scrollIntoViewIfNeeded()
  const slOf = () => sec.locator(".kl-slider").evaluateAll((xs) => xs.map((s) => ({ inv: s.hasAttribute("data-invalid"), cell: s.getAttribute("data-kl-layout") === "cell", bang: s.querySelector(".kl-field-bang").getBoundingClientRect().width })))
  // the ! cells open with a width transition: read once every invalid one is open
  const sl = await poll(slOf, (a) => a.filter((s) => s.inv).every((s) => s.bang >= 28) && a.filter((s) => !s.inv).every((s) => s.bang === 0), 2000)
  ok("slider: invalid opens the ! cell in the control layout", sl.some((s) => s.inv && !s.cell && s.bang >= 28), sl)
  ok("slider: invalid opens the ! cell in the cell layout (the only visible mark there)", sl.some((s) => s.inv && s.cell && s.bang >= 28), sl)
  ok("slider: a valid slider has no ! cell", sl.filter((s) => !s.inv).every((s) => s.bang === 0), sl)
  ok("slider: the cell layout's message is still in the document (announced)", /Above 95 %/.test(await sec.getByTestId("slider-cell-row").textContent()), null)
  const units = await sec.getByTestId("slider-rtl").evaluate((root) => {
    const order = (el) => {
      const t = el.firstChild
      if (!t || t.nodeType !== 3 || t.textContent !== "°C") return null
      const at = (i) => { const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + 1); return r.getBoundingClientRect().left }
      return at(0) < at(1)
    }
    const els = [...root.querySelectorAll(".kl-slider-out:not(.kl-slider-sizer) > bdi.kl-code, .kl-number-unit bdi")]
    return els.map(order).filter((x) => x !== null)
  })
  ok("RTL: °C reads ° then C in the slider readout and the number field unit", units.length === 2 && units.every(Boolean), units)
  const neg = await sec.getByTestId("slider-rtl").locator(".kl-number-input").evaluate((x) => [getComputedStyle(x).unicodeBidi, x.value])
  ok("RTL: a negative number is laid out as its own paragraph (−18 keeps its sign first)", neg[0] === "plaintext" && neg[1].startsWith("-"), neg)
  ok("no page errors (slider)", p.errs.length === 0, p.errs)
})
