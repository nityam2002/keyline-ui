// Rendered contrast:
// the playground preview in every palette × theme (and Signal compact), the overlays (a dialog and a select opened
// in it) for Signal light and dark, and the application page light and dark. Live text must meet 4.5:1 (3:1 when
// large), live control/frame edges 3:1; disabled controls are exempt. Chrome only.
import { test, idle, settle } from "./fixtures.mjs"
import { measure, summary } from "./lib/colour-measure.mjs"

const VP = { width: 1440, height: 1000 }
const CHROME_ONLY = "colour-audit.mjs measured rendered contrast in Chrome only (its sRGB canvas sampling of a Chrome screenshot)"

const check = (ok, r) => {
  ok(`colour ${r.label.trim()}: live text meets its contrast minimum (4.5:1, large 3:1)`, r.textFail.length === 0, { count: r.textCount, min: r.textMin, fail: r.textFail.slice(0, 6) })
  ok(`colour ${r.label.trim()}: live control edges reach 3:1`, r.edgeFail.length === 0, { count: r.edgeCount, min: r.edgeMin, fail: r.edgeFail.slice(0, 6) })
}

const configs = []
for (const pal of ["Signal", "Harbor", "Ember", "Ledger"])
  for (const th of ["Light", "Dark"])
    for (const den of ["Default", "Compact"]) if (!(den === "Compact" && pal !== "Signal")) configs.push([pal, th, den])

for (const [pal, th, den] of configs) {
  test(`colour: playground ${pal} ${th} ${den}${pal === "Signal" && den === "Default" ? " + overlays" : ""}`, async ({ open, ok, eng }) => {
    test.skip(eng !== "chromium", CHROME_ONLY)
    const p = await open({ ...VP, route: "playground", q: "theme=light&motion=reduce", ready: "[data-slot=preview]" })
    const ctl = p.getByRole("complementary", { name: "Configuration" })
    const pick = (g, n) => ctl.getByRole("radiogroup", { name: g }).getByRole("radio", { name: n, exact: true }).click()
    await pick("Palette", pal)
    await pick("Theme", th)
    await pick("Density", den)
    await pick("Motion", "Reduced")
    await idle(p)
    await settle(p)
    check(ok, summary(`playground ${pal} ${th} ${den}`, await measure(p, "[data-testid=scope-preview]")))
    if (pal === "Signal" && den === "Default") {
      // overlays: the dialog, and a select opened inside it
      await p.getByTestId("scope-preview").getByRole("button", { name: "Book pickup…" }).click()
      await p.getByRole("dialog").waitFor()
      await p.getByRole("dialog").locator("[data-slot=select] [role=combobox]").click()
      await p.locator("[role=listbox]:visible").waitFor()
      await p.keyboard.press("ArrowDown")
      await idle(p)
      check(ok, summary(`overlays (dialog + select) ${th}`, await measure(p, "portals")))
    }
  })
}

for (const th of ["light", "dark"]) {
  test(`colour: application page ${th}`, async ({ open, ok, eng }) => {
    test.skip(eng !== "chromium", CHROME_ONLY)
    const p = await open({ ...VP, route: "app", q: `theme=${th}&motion=reduce`, ready: "main" })
    await idle(p)
    check(ok, summary(`application page ${th}`, await measure(p, "main")))
  })
}
