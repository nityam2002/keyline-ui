// Kbd: prose rhythm, chords on seams, named symbols, sequences, LTR chords in RTL.
import { test } from "./fixtures.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["toggle","kbd"] })

test("kbd: prose, chords, symbols, sequence, RTL", async ({ open, ok }) => {
  const p = await open({ route: "specimen", q: "theme=light", ready: "#toggle" })
  const prose = p.getByTestId("kbd-prose")
  await prose.scrollIntoViewIfNeeded()
  const keys = await prose.evaluate((el) => {
    const lh = parseFloat(getComputedStyle(el).lineHeight)
    const h = el.getBoundingClientRect().height, n = Math.round(h / lh)
    return { lh, h, n, tall: [...el.querySelectorAll(":scope > .kl-kbd, :scope > .kl-kbd-group")].map((k) => Math.round(k.getBoundingClientRect().height)), nested: el.querySelectorAll(".kl-kbd-group > kbd.kl-kbd").length, hiddenGlyphs: el.querySelectorAll(".kl-kbd > [aria-hidden]").length, named: [...el.querySelectorAll(".kl-kbd > .kl-sr")].map((x) => x.textContent) }
  })
  ok("kbd: keys are 22px and fit the prose line's rhythm", keys.tall.every((h) => h === 22) && keys.n >= 2 && Math.abs(keys.h - keys.n * keys.lh) <= 0.5, keys)
  ok("kbd: chords are nested kbd; symbols are shown and named (Command, Shift)", keys.nested === 6 && keys.hiddenGlyphs === 2 && keys.named.join() === "Command,Shift", keys)
  const seq = await p.getByTestId("kbd-seq").evaluate((g) => [...g.querySelectorAll(":scope > .kl-sr")].map((s) => s.textContent.trim()))
  ok("kbd: a sequence reads its separator (G then I); the seam is the join", seq.join() === "then", seq)
  const seams = await prose.evaluate((el) => [...el.querySelectorAll(".kl-kbd-group > .kl-kbd:not(:first-child)")].every((k) => getComputedStyle(k).borderInlineStartWidth === "1px"))
  ok("kbd: keys of a chord are cells on seams", seams, null)
  const rtl = await p.getByTestId("kbd-rtl").evaluate((el) => { const k = [...el.querySelectorAll(".kl-kbd-group > .kl-kbd")]; return [k[0].textContent, k[0].getBoundingClientRect().left < k[1].getBoundingClientRect().left] })
  ok("kbd: in RTL a chord stays left to right (Ctrl then K)", rtl[0] === "Ctrl" && rtl[1], rtl)
  ok("kbd and toggle: no page errors", p.errs.length === 0, p.errs)
})
