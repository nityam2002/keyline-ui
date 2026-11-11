// The held press on the motion lab's segmented control (tug): lean toward the pressed item, Escape and leave
// cancel, slide-commit, the 0 variant off, the keyboard's leading edge; across display settings; touch.
import { test, idle } from "./fixtures.mjs"
import { band, centre, bandRests } from "./lib/segmented-band.mjs"

const VP = { width: 1440, height: 900 }
const lab = async (p, id) => {
  const el = p.locator(`[data-testid=${id}]`)
  await el.scrollIntoViewIfNeeded()
  return el
}

for (const q of ["", "?dir=rtl", "?theme=dark&cut=on", "?cut=quiet&density=compact"]) {
  test(`tug ${q || "default"}: lean and Escape${q ? "" : ", leave, slide-commit, off, keyboard"}`, async ({ open, ok }) => {
    const p = await open({ ...VP, route: "motion", q, ready: "[data-testid=lab-tug]" })
    const tug = await lab(p, "lab-tug")
    const seg = tug.locator("[data-tug='12'] [data-slot=segmented]")
    const items = seg.locator("[data-kl-item]")
    await bandRests(seg)
    const rest = await band(seg)
    // press Month (adjacent to Week) and hold
    await p.mouse.move(...(await centre(items.nth(2))))
    await p.mouse.down()
    await p.waitForTimeout(250) // timing: a held press — the lean is what a 250 ms hold shows
    const held = await band(seg)
    const grew = q.includes("rtl") ? rest.l - held.l : held.r - rest.r
    ok(`tug ${q || "default"}: a held press leans the band 3–12px toward the pressed item, nothing commits`, held.tug && grew >= 3 && grew <= 12.5 && held.chk === rest.chk, { rest, held })
    // label never covered: the pressed label is not under the band
    const covered = await items.nth(2).evaluate((e) => e.hasAttribute("data-kl-covered"))
    ok(`tug ${q || "default"}: the leaning band stays off the pressed label`, !covered)
    await p.keyboard.press("Escape")
    await bandRests(seg)
    await p.mouse.up()
    await bandRests(seg)
    const esc = await band(seg)
    ok(`tug ${q || "default"}: Escape lets go, the release does not commit`, !esc.tug && esc.chk === rest.chk && Math.abs(esc.r - rest.r) < 1, esc)
    if (q) return
    // leave cancel: press, slide off the control, release
    const [lx, ly] = await centre(items.nth(2))
    await p.mouse.move(lx, ly)
    await p.mouse.down()
    await p.waitForTimeout(120) // timing: a held press before the slide
    await p.mouse.move(lx, ly + 140, { steps: 4 })
    await p.mouse.up()
    await bandRests(seg)
    const left = await band(seg)
    ok("tug: sliding off and releasing commits nothing and the band returns", !left.tug && left.chk === rest.chk && Math.abs(left.r - rest.r) < 1, left)
    // slide-commit: press Day, slide to Fiscal quarter, release there
    await p.mouse.move(...(await centre(items.nth(0))))
    await p.mouse.down()
    await p.waitForTimeout(120) // timing: a held press before the slide
    await p.mouse.move(...(await centre(items.nth(3))), { steps: 6 })
    await p.waitForTimeout(120) // timing: held over the new choice, so the lean there develops
    const mid = await band(seg)
    await p.mouse.up()
    await bandRests(seg)
    const slid = await band(seg)
    ok("tug: sliding to another choice leans there instead", mid.tug && mid.r > rest.r + 2, mid)
    ok("tug: releasing over another choice commits the one released on", slid.chk === "0001" && !slid.tug, slid)
    // off: the 0 variant never leans
    const off = tug.locator("[data-tug='0'] [data-slot=segmented]")
    await p.mouse.move(...(await centre(off.locator("[data-kl-item]").nth(2))))
    await p.mouse.down()
    await p.waitForTimeout(200) // timing: a held press — long enough that the 12 variant would lean
    const o = await band(off)
    await p.mouse.up()
    ok("tug: --kl-stretch-tug: 0 turns it off", !o.tug, o)
    // keyboard: the leading edge lands on the first frame, the trailing edge follows
    await items.nth(3).focus()
    await bandRests(seg)
    await bandRests(off)
    await idle(p)
    const k = await seg.evaluate(async (s) => {
      const it = [...s.querySelectorAll("[data-kl-item]")]
      const band = s.querySelector("[data-kl-band]")
      s.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }))
      document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }))
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const sr = s.getBoundingClientRect()
      const target = it[2].getBoundingClientRect().left - sr.left
      return { lead: parseFloat(band.style.left), target, chk: it.map((e) => (e.hasAttribute("data-checked") ? 1 : 0)).join("") }
    })
    ok("keyboard: an arrow move lands the leading edge at once", k.chk === "0010" && Math.abs(k.lead - k.target) < 2.5, k)
    ok("tug: no page errors", !p.errs.length, p.errs)
  })
}

test("tug: touch tap", async ({ open, ok, eng }) => {
  const p = await open({ ...VP, route: "motion", ctx: { hasTouch: true, isMobile: eng === "chromium" }, ready: "[data-testid=lab-tug]" })
  const seg = (await lab(p, "lab-tug")).locator("[data-tug='12'] [data-slot=segmented]")
  await bandRests(seg)
  await p.touchscreen.tap(...(await centre(seg.locator("[data-kl-item]").nth(0))))
  await bandRests(seg)
  const t = await band(seg)
  ok("touch: a tap commits and no lean is left behind", t.chk === "1000" && !t.tug, t)
})
