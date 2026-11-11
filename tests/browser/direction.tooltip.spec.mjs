// Direction: inside a DirectionProvider rtl region a tooltip's inline-end side is the left.
import { test, stable } from "./fixtures.mjs"
import { at } from "./lib/section.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["direction"] })

test("direction: tooltip side in an rtl region", async ({ open, ok }) => {
  const p = await open({ width: 1440, height: 900, ready: "#direction" })
  const dsec = await at(p, "direction")
  const rtlBtn = dsec.locator('[dir="rtl"]').getByRole("button", { name: "تصدير" })
  await rtlBtn.hover()
  // the tooltip's hover delay passes; then wait for it to be placed
  const tipLoc = p.locator('[data-slot="tooltip"]').first()
  await tipLoc.waitFor({ timeout: 5000 }).catch(() => {})
  if (await tipLoc.count()) await stable(tipLoc).catch(() => {})
  const tip = await p.evaluate(() => { const t = document.querySelector('[data-slot="tooltip"]'); return t ? t.getBoundingClientRect().right : null })
  const box = await rtlBtn.boundingBox()
  ok("direction: in a DirectionProvider rtl region, a tooltip's inline-end side is the left", tip != null && tip <= box.x + 1, { tip, x: box.x })
})
