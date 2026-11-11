// Switch position, fill and bar; keyboard, rapid toggling, disabled, RTL and reduced motion.
import { test, idle } from "./fixtures.mjs"
import { until } from "./lib/flow.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["select","choices"] })

const state = (loc) => loc.evaluate((e) => { const t = e.querySelector(".kl-switch-thumb"), r = e.getBoundingClientRect(), tr = t.getBoundingClientRect(), cs = getComputedStyle(t); return { checked: e.getAttribute("aria-checked"), half: tr.left + tr.width / 2 < r.left + r.width / 2 ? "start" : "end", solid: cs.backgroundColor !== "rgba(0, 0, 0, 0)", bar: getComputedStyle(e, "::after").opacity, inset: +(tr.top - r.top).toFixed(1), w: Math.round(tr.width) } })

test("switch: states, keyboard, rapid toggling, disabled", async ({ open, ok }) => {
  const p = await open({ route: "specimen", width: 1400, height: 1000, ready: "[data-slot=select]" })
  const sw = p.getByRole("switch", { name: "Standalone switch" }).first()
  await sw.scrollIntoViewIfNeeded()
  await idle(p)
  const off = await state(sw)
  await sw.focus()
  await p.keyboard.press("Space")
  // the thumb's motion settles on the end state
  await until(async () => { const v = await state(sw); return v.checked === "true" && v.half === "end" && v.solid && v.bar === "1" && v.w === off.w })
  await idle(p)
  const on = await state(sw)
  ok("switch: off = hollow thumb in the start half, no bar; on = solid thumb in the end half, bar shown", off.checked === "false" && off.half === "start" && !off.solid && off.bar === "0" && on.checked === "true" && on.half === "end" && on.solid && on.bar === "1", { off, on })
  ok("switch: the thumb is inset from the frame and keeps its size in both states", off.inset >= 3.5 && off.w === on.w, { off, on })
  for (let i = 0; i < 7; i++) await p.keyboard.press("Space")
  await until(async () => { const v = await state(sw); return v.checked === "false" && v.half === "start" && !v.solid && v.bar === "0" })
  await idle(p)
  const rapid = await state(sw)
  ok("switch: rapid toggling (7 presses) settles on the matching end state", rapid.checked === "false" && rapid.half === "start" && !rapid.solid && rapid.bar === "0", rapid)
  const dOn = await state(p.getByRole("switch", { name: "Disabled on" }).first())
  const dOff = await state(p.getByRole("switch", { name: "Disabled off" }).first())
  ok("switch: a disabled switch still shows its value (solid + bar vs hollow)", dOn.solid && dOn.bar === "1" && dOn.half === "end" && !dOff.solid && dOff.half === "start", { dOn, dOff })
  ok("no page errors", p.errs.length === 0, p.errs)
})

test("switch: RTL and reduced motion", async ({ open, ok }) => {
  const p = await open({ route: "specimen", q: "dir=rtl&motion=reduce", width: 1400, height: 1000, ready: "[data-slot=select]" })
  const swr = p.getByRole("switch", { name: "Standalone switch" }).first()
  await swr.click()
  const rtl = await swr.evaluate((e) => { const t = e.querySelector(".kl-switch-thumb"), r = e.getBoundingClientRect(), tr = t.getBoundingClientRect(); return { leftHalf: tr.left + tr.width / 2 < r.left + r.width / 2, dur: getComputedStyle(t).transitionDuration } })
  ok("switch RTL: on is the left (end) half; reduced motion: no stretch duration", rtl.leftHalf && rtl.dur.split(",").every((d) => parseFloat(d) === 0), rtl)
  ok("no page errors", p.errs.length === 0, p.errs)
})
