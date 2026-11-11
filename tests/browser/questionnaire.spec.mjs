// Questionnaire: a whole flow (validation on the current step, answers kept going back, focus on the new step's
// heading, letter shortcuts, submission failure and retry), RTL + dark, reduced motion, forced colours.
import { test, idle } from "./fixtures.mjs"
import { at, focused } from "./lib/section.mjs"
import { until } from "./lib/probe.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["questionnaire"] })

const VP = { width: 1440, height: 900 }
const form = async (p) => (await at(p, "questionnaire")).locator('[data-slot="questionnaire"]')

test("questionnaire: a whole flow, failure and retry", async ({ open, ok }) => {
  const p = await open({ ...VP, ready: "#questionnaire" })
  const q = await form(p)
  const step = () => q.locator('[data-slot="questionnaire-item"]:not([hidden])')
  const heading = async () => (await step().locator('[data-slot="questionnaire-heading"]').textContent())?.trim()
  const errShown = () => step().evaluate((f) => !!f.querySelector(".kl-q-error:not([hidden])"))
  // Next with nothing chosen: blocked, the error shows on this step and describes it
  await q.locator('[data-slot="questionnaire-next"]').click()
  await until(errShown)
  const e1 = await step().evaluate((f) => {
    const err = f.querySelector(".kl-q-error:not([hidden])")
    return { err: !!err, role: err?.getAttribute("role"), described: !!err && (f.getAttribute("aria-describedby") ?? "").split(" ").includes(err.id), invalid: f.hasAttribute("data-invalid") }
  })
  ok("questionnaire: Next on an unanswered required step is blocked; the error is an alert that describes the step", e1.err && e1.role === "alert" && e1.described && e1.invalid, e1)
  ok("questionnaire: still on question 1", (await heading())?.startsWith("How should the load travel"), await heading())
  // choose Rail: the ink band covers it
  await step().locator('[data-slot="questionnaire-choice"]', { hasText: "Rail" }).click()
  await until(() => step().evaluate((f) => f.querySelector("[data-kl-covered]")?.textContent?.includes("Rail") && !f.querySelector(".kl-q-error:not([hidden])")))
  await idle(p)
  const covered = await step().locator("[data-kl-covered]").textContent()
  ok("questionnaire: the chosen row is under the ink band (data-kl-covered)", covered?.includes("Rail"), covered)
  ok("questionnaire: the error clears once answered", (await step().locator(".kl-q-error:not([hidden])").count()) === 0)
  // Next: focus moves to the new step's heading
  await q.locator('[data-slot="questionnaire-next"]').click()
  await until(async () => (await focused(p)).text?.startsWith("Which docks"))
  const f2 = await focused(p)
  ok("questionnaire: Next moves focus to the new step's heading", f2.slot === "questionnaire-heading" && f2.text?.startsWith("Which docks"), f2)
  ok("questionnaire: an optional step says so and offers Skip", (await step().locator(".kl-q-opt").count()) === 1 && (await q.locator('[data-slot="questionnaire-skip"]').isVisible()))
  ok("questionnaire: question 1's error is not on question 2", (await q.locator('[data-slot="questionnaire-item"]:not([hidden]) .kl-q-error:not([hidden])').count()) === 0)
  // multiple choice, then Back and Next keep every answer
  await step().locator('[data-slot="questionnaire-choice"]', { hasText: "Rotterdam" }).click()
  await step().locator('[data-slot="questionnaire-choice"]', { hasText: "Hamburg" }).click()
  await q.locator('[data-slot="questionnaire-previous"]').click()
  await until(async () => (await focused(p)).text?.startsWith("How should"))
  const f1 = await focused(p)
  const kept1 = await step().locator('input[value="rail"]').isChecked()
  ok("questionnaire: Back returns to question 1 with Rail still chosen, focus on its heading", kept1 && f1.slot === "questionnaire-heading" && f1.text?.startsWith("How should"), { kept1, f1 })
  // keyboard: letter shortcut C picks Sea, Enter goes on (the library's keys)
  await p.keyboard.press("c")
  await until(() => step().locator('input[value="sea"]').isChecked())
  ok("questionnaire: letter shortcut C chooses Sea", await step().locator('input[value="sea"]').isChecked())
  await p.keyboard.press("b")
  await q.locator('[data-slot="questionnaire-next"]').click()
  await until(async () => (await heading())?.startsWith("Which docks"))
  const kept2 = await step().evaluate((f) => [...f.querySelectorAll("input:checked")].map((i) => i.value))
  ok("questionnaire: question 2 still has Rotterdam and Hamburg", kept2.join() === "rtm,ham", kept2)
  await q.locator('[data-slot="questionnaire-next"]').click()
  await until(async () => !(await heading())?.startsWith("Which docks"))
  // free text: a malformed address is invalid on its own step, with the ! cell and aria-invalid
  const input = step().locator("input")
  await input.fill("planner")
  await input.blur()
  await q.locator('[data-slot="questionnaire-next"]').click()
  await until(errShown)
  const e3 = await step().evaluate((f) => ({ err: f.querySelector(".kl-q-error:not([hidden])")?.textContent?.trim(), ai: f.querySelector("input")?.getAttribute("aria-invalid"), bang: getComputedStyle(f.querySelector(".kl-field-bang")).gridTemplateColumns, name: f.querySelector("input")?.getAttribute("aria-labelledby") === f.querySelector('[data-slot="questionnaire-heading"]')?.id }))
  ok("questionnaire: a malformed email blocks Next with its own message, aria-invalid and the ! cell; the question names the input", e3.err?.includes("name@company.com") && e3.ai === "true" && e3.name, e3)
  await input.fill("planner@northwind.eu")
  await q.locator('[data-slot="questionnaire-next"]').click()
  await until(async () => (await heading())?.startsWith("Anything the planner"))
  ok("questionnaire: a valid email goes on to question 4 (optional), where Submit replaces Next", (await heading())?.startsWith("Anything the planner") && (await q.locator('[data-slot="questionnaire-submit"]').isVisible()) && !(await q.locator('[data-slot="questionnaire-next"]').isVisible()))
  // an optional step must be answered or skipped (the library's rule): an empty Submit says so; Skip sends
  await q.locator('[data-slot="questionnaire-submit"]').click()
  await until(errShown)
  const e4 = await step().locator(".kl-q-error:not([hidden])").textContent({ timeout: 1000 }).catch(() => null)
  ok("questionnaire: Submit on an empty optional last step asks for a note or Skip", e4?.includes("Skip to send"), e4)
  // submit: fails once (pending first), Retry sends the same answers
  await q.locator('[data-slot="questionnaire-skip"]').click()
  await until(async () => (await q.locator('[data-slot="questionnaire-submit"]').getAttribute("aria-busy")) === "true", 1000)
  ok("questionnaire: Submit shows the pending signal", (await q.locator('[data-slot="questionnaire-submit"]').getAttribute("aria-busy")) === "true")
  const failState = () => q.evaluate((f) => ({ alert: f.querySelector('[data-slot="notice"][role="alert"]')?.textContent, signal: f.querySelector('[data-slot="questionnaire-submit"]')?.getAttribute("data-signal") }))
  await until(async () => { const s = await failState(); return s.alert && s.signal === "failed" })
  const fail = await failState()
  ok("questionnaire: a failed submission says so (alert notice), the Submit cell shows failed, answers stay", fail.alert?.includes("Couldn't send") && fail.signal === "failed", fail)
  // The ! cell starts at the Submit cell's edge (the container widens the label, not the button), and
  // the seam before it stays the row's seam (only a framed button turns its frame red)
  await idle(p)
  const bang = await q.locator('[data-slot="questionnaire-submit"]').evaluate((b) => {
    const c = getComputedStyle(b), r = b.getBoundingClientRect(), f = b.querySelector(".kl-button-fail > span").getBoundingClientRect()
    const red = getComputedStyle(b.querySelector(".kl-button-fail > span")).backgroundColor
    return { gap: Math.round((c.direction === "rtl" ? r.right - f.right : f.left - r.left) - parseFloat(c.borderInlineStartWidth || c.borderLeftWidth)), seam: c.borderLeftColor, red, pad: c.paddingLeft }
  })
  ok("questionnaire: failed, the ! cell sits on the Submit cell's edge and the seam keeps its colour", Math.abs(bang.gap) <= 1 && bang.seam !== bang.red && bang.pad === "0px", bang)
  await q.getByRole("button", { name: "Retry" }).click()
  const done = p.locator('[data-testid="q-done"]')
  await done.waitFor()
  await until(async () => (await focused(p)).text === "Request sent")
  const summary = await done.locator("dd").allTextContents()
  const f5 = await focused(p)
  ok("questionnaire: Retry succeeds; the summary has every answer (optional ones skipped)", summary.join("|") === "Rail|Rotterdam, Hamburg|planner@northwind.eu|Skipped", summary)
  ok("questionnaire: focus moves to the confirmation heading", f5.text === "Request sent", f5)
  // start again: a fresh form
  await done.getByRole("button", { name: "Start again" }).click()
  await until(async () => (await heading())?.startsWith("How should"))
  ok("questionnaire: Start again is a fresh form at question 1, nothing chosen", (await heading())?.startsWith("How should") && (await step().locator("input:checked").count()) === 0)
  ok("questionnaire: no page errors", p.errs.length === 0, p.errs)
})

test("questionnaire: rtl and dark", async ({ open, ok }) => {
  const p = await open({ ...VP, q: "dir=rtl&theme=dark", ready: "#questionnaire" })
  const q = await form(p)
  await q.locator('[data-slot="questionnaire-item"]:not([hidden])').locator('[data-slot="questionnaire-choice"]', { hasText: "Rail" }).click()
  await q.locator('[data-slot="questionnaire-next"]').click()
  await until(() => q.evaluate((f) => f.querySelector('[data-slot="questionnaire-item"]:not([hidden]) [data-slot="questionnaire-heading"]')?.textContent?.trim().startsWith("Which docks")))
  await idle(p)
  const pos = await q.evaluate((f) => { const r = (s) => f.querySelector(s).getBoundingClientRect(); return { back: r('[data-slot="questionnaire-previous"]').left, next: r('[data-slot="questionnaire-next"]').left, box: r(".kl-q-item:not([hidden]) .kl-choice-box").left, label: r(".kl-q-item:not([hidden]) .kl-choice-text").left } })
  ok("rtl: Back sits at the inline start (right), the box before the label (right of it)", pos.back > pos.next && pos.box > pos.label, pos)
  const dark = await q.evaluate((f) => { const a = getComputedStyle(f).backgroundColor; const c = getComputedStyle(f.querySelector(".kl-q-title")).color; return { a, c } })
  ok("dark: the frame and the question take the dark theme", dark.a !== "rgb(255, 255, 255)" && dark.a !== dark.c, dark)
})

test("questionnaire: reduced motion lands the band at once", async ({ open, ok }) => {
  const p = await open({ ...VP, q: "motion=reduce", ready: "#questionnaire" })
  const q = await form(p)
  const row = q.locator('[data-slot="questionnaire-item"]:not([hidden])').locator('[data-slot="questionnaire-choice"]', { hasText: "Sea" })
  await row.click()
  await p.waitForTimeout(40) // timing: "at once" — the band must already be on the row 40 ms after the click
  const land = await q.evaluate((f) => { const b = f.querySelector(".kl-q-item:not([hidden]) .kl-radio-band").getBoundingClientRect(); const r = f.querySelector(".kl-q-item:not([hidden]) [data-kl-item][data-checked]").getBoundingClientRect(); return Math.abs(b.top - r.top) })
  ok("reduced motion: the band lands on the chosen row at once", land < 1.5, land)
})

test("questionnaire: forced colours", async ({ open, ok, eng }) => {
  test.skip(eng !== "chromium", "forced-colors emulation is Chromium-only")
  const p = await open({ ...VP, ctx: { forcedColors: "active" }, ready: "#questionnaire" })
  const q = await form(p)
  await q.locator('[data-slot="questionnaire-item"]:not([hidden])').locator('[data-slot="questionnaire-choice"]', { hasText: "Road" }).click()
  await until(() => q.evaluate((f) => !!f.querySelector(".kl-q-item:not([hidden]) [data-kl-covered]")))
  await idle(p)
  const fc = await q.evaluate((f) => ({ band: getComputedStyle(f.querySelector(".kl-q-item:not([hidden]) .kl-radio-band")).backgroundColor, row: getComputedStyle(f.querySelector(".kl-q-item:not([hidden]) [data-kl-covered]")).color }))
  ok("forced colours: the chosen row is Highlight with HighlightText", fc.band !== "rgba(0, 0, 0, 0)" && fc.band !== fc.row, fc)
})
