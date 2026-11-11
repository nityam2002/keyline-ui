// Toolbar overflow inside groups and in a vertical palette (from r22): a ToolbarGroup gives up its items one at a
// time under its label in More; keepTogether leaves whole; state survives the move; a palette in a column of limited
// height puts More at its foot and opens it to the side; RTL.
import { test, idle } from "./fixtures.mjs"
import { poll, lastMenu } from "./lib/probes-c.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["toolbar-group-overflow","toolbar-vertical-overflow"] })

const READY = "[data-testid=specimen-groups]"
const shown = (tb) => tb.evaluate((t) => [...t.querySelectorAll("button")].filter((x) => x.getBoundingClientRect().width > 0).map((x) => x.getAttribute("aria-label") || x.textContent.trim()))
const inside = (tb) =>
  tb.evaluate((t) => {
    const r = t.getBoundingClientRect()
    return [...t.querySelectorAll("button")].every((b) => {
      const q = b.getBoundingClientRect()
      return q.left >= r.left - 0.5 && q.right <= r.right + 0.5 && q.top >= r.top - 0.5 && q.bottom <= r.bottom + 0.5
    })
  })
const menuRows = (p) =>
  p.locator("[role=menu]").last().evaluate((m) =>
    [...m.querySelectorAll("[role^=menuitem], [role=separator], [role=group]")].map((e) => {
      const role = e.getAttribute("role")
      if (role === "group") return `[${e.getAttribute("aria-label") ?? e.querySelector("[id]")?.textContent?.trim() ?? ""}]`
      if (role === "separator") return "—"
      return `${e.textContent.trim()}${e.hasAttribute("aria-checked") ? (e.getAttribute("aria-checked") === "true" ? "✓" : "○") : ""}`
    }),
  )
const focused = (p) => p.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim())
const menuGone = (p) => p.locator("[role=menu]").waitFor({ state: "detached" }).catch(() => {})

test("toolbar groups: items leave one at a time, keepTogether, state through More, keys", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: READY })
  const g = p.getByTestId("specimen-groups")
  const tb = p.getByTestId("gs-tb")
  const more = tb.locator(".kl-tb-overflow")
  // the width change re-measures through a ResizeObserver: read the row until it has the expected shape
  const setW = async (w, expect) => {
    await g.getByRole("radio", { name: w }).click()
    return poll(() => shown(tb), (s) => (typeof expect === "function" ? expect(s) : s.join("|") === expect), 3000)
  }
  await g.scrollIntoViewIfNeeded()
  ok("groups: wide, every item in the row and no More", (await shown(tb)).join("|") === "Align start|Centre|Align end|Bold|Italic|Underline|Clear|Save", await shown(tb))
  let s = await setW("270px", "Align start|Centre|Align end|Bold|Italic|More|Save")
  ok("groups 270px: Format gives up its last items one at a time; More follows what is left of it", s.join("|") === "Align start|Centre|Align end|Bold|Italic|More|Save" && (await inside(tb)), s)
  ok("groups 270px: the part left in the row is still the named group, meeting Align and More on 2px keylines", (await tb.locator("[data-slot=toolbar-group][aria-label=Format] button").count()) === 2 && (await tb.locator("[data-slot=toolbar-group][aria-label=Format]").evaluate((e) => [getComputedStyle(e).borderInlineStartWidth, getComputedStyle(e.nextElementSibling).borderInlineStartWidth].join())) === "2px,2px", null)
  await more.click()
  await lastMenu(p)
  ok("groups 270px: More holds the hidden items under the group's label, with state", (await menuRows(p)).join("|") === "[Format]|Underline○|Clear", await menuRows(p))
  ok("groups: More says how many items it holds", (await p.locator("[role=menu]").last().getAttribute("aria-label")) === "More: 2 items", await p.locator("[role=menu]").last().getAttribute("aria-label"))
  await p.locator("[role=menu]").last().getByRole("menuitemcheckbox", { name: "Underline" }).click()
  await poll(() => menuRows(p), (r) => r.includes("Underline✓"), 2000)
  await p.keyboard.press("Escape")
  await menuGone(p)
  s = await setW("220px", "Align start|Centre|Align end|More|Save")
  ok("groups 220px: Format has left whole; Align (keepTogether) stays whole", s.join("|") === "Align start|Centre|Align end|More|Save", s)
  await more.click()
  await lastMenu(p)
  ok("groups 220px: More holds all of Format, Bold and Underline still on", (await menuRows(p)).join("|") === "[Format]|Bold✓|Italic○|Underline✓|Clear", await menuRows(p))
  await p.keyboard.press("Escape")
  await menuGone(p)
  s = await setW("150px", "More|Save")
  ok("groups 150px: keepTogether leaves as one unit, never split", s.join("|") === "More|Save" && (await inside(tb)), s)
  await more.click()
  await lastMenu(p)
  const rows150 = await menuRows(p)
  ok("groups 150px: More holds Align then Format, each under its label, divided", rows150.join("|") === "[Align]|Align start|Centre|Align end|—|[Format]|Bold✓|Italic○|Underline✓|Clear", rows150)
  await p.locator("[role=menu]").last().getByRole("menuitem", { name: "Centre" }).click()
  const log = await poll(() => p.getByTestId("gs-log").innerText(), (t) => /Centre/.test(t), 2000)
  ok("groups: a row in More runs the item's command", /Centre/.test(log), log)
  await menuGone(p)
  s = await setW("Fits", (x) => x.length === 8)
  ok("groups: widening brings every item back, Underline still pressed (state kept through the menu)", s.length === 8 && (await tb.getByRole("button", { name: "Underline" }).getAttribute("aria-pressed")) === "true", s)
  await setW("270px", "Align start|Centre|Align end|Bold|Italic|More|Save")
  await tb.getByRole("button", { name: "Italic" }).focus()
  await p.keyboard.press("ArrowRight")
  ok("groups: arrows move from the group's last row item to More, then the primary", (await focused(p)) === "More", await focused(p))
  await p.keyboard.press("ArrowRight")
  ok("groups: …then the primary", (await focused(p)) === "Save", await focused(p))
  ok("groups: still one Tab stop", (await tb.evaluate((t) => [...t.querySelectorAll("button")].filter((e) => e.tabIndex === 0).length)) === 1, null)
  ok("no page errors", p.errs.length === 0, p.errs)
})

test("toolbar vertical overflow: palette heights, More at the foot opens to the side, RTL", async ({ open, ok }) => {
  const p = await open({ height: 1000, ready: READY })
  const v = p.getByTestId("specimen-vertical")
  const vt = p.getByTestId("vp-tb")
  const setH = async (h, expect) => {
    await v.getByRole("radio", { name: h }).click()
    return poll(() => shown(vt), (s) => (typeof expect === "function" ? expect(s) : s.join("|") === expect), 3000)
  }
  await v.scrollIntoViewIfNeeded()
  ok("vertical: tall enough, every tool shown and no More", (await shown(vt)).join("|") === "Select|Pan|Measure|Zoom in|Zoom out|Find", await shown(vt))
  let s = await setH("160px", "Select|Pan|Measure|More")
  const box = await poll(() => vt.evaluate((t) => t.getBoundingClientRect().height), (h) => h <= 160.5, 2000)
  ok("vertical 160px: the palette fits its column; the last tools move into More at its foot", s.join("|") === "Select|Pan|Measure|More" && box <= 160.5 && (await inside(vt)), [s, box])
  s = await setH("110px", "Select|Pan|More")
  ok("vertical 110px: fewer tools; the group stays whole while it fits", s.join("|") === "Select|Pan|More" && (await inside(vt)), s)
  await setH("160px", "Select|Pan|Measure|More")
  await vt.getByRole("button", { name: "Measure" }).focus()
  await p.keyboard.press("ArrowDown")
  ok("vertical: ArrowDown moves from the last tool to More", (await focused(p)) === "More", await focused(p))
  await p.keyboard.press("Enter")
  await lastMenu(p)
  await idle(p)
  ok("vertical: More's menu holds the hidden tools", (await menuRows(p)).join("|") === "Zoom in|Zoom out|Find", await menuRows(p))
  const side = await p.evaluate(() => {
    const m = [...document.querySelectorAll("[role=menu]")].at(-1).getBoundingClientRect()
    const t = document.querySelector("[data-testid=vp-tb]").getBoundingClientRect()
    return [Math.round(m.left - t.right), Math.round(m.top), Math.round(t.bottom)]
  })
  ok("vertical: the menu opens to the side, docked on the palette's edge", Math.abs(side[0]) <= 3, side)
  await p.locator("[role=menu]").last().getByRole("menuitem", { name: "Find" }).click()
  const log = await poll(() => p.getByTestId("vp-log").innerText(), (t) => /Find/.test(t), 2000)
  ok("vertical: a row runs the tool", /Find/.test(log), log)
  await menuGone(p)
  s = await setH("400px", (x) => x.length === 6)
  ok("vertical: a taller column brings every tool back", s.length === 6, s)
  const rtl = p.getByTestId("vp-rtl")
  // the filler below the last item seams its top edge, never a side (a side seam doubled the frame's edge)
  const filler = (sel) => p.evaluate((s) => { const c = getComputedStyle(document.querySelector(s), "::after"); return [c.borderInlineStartWidth, c.borderBlockStartWidth].join() }, sel)
  ok("vertical RTL: the filler under More closes it on its top edge; no side seam doubles the frame", (await filler("[data-testid=vp-rtl] [data-slot=toolbar]")) === "0px,1px", await filler("[data-testid=vp-rtl] [data-slot=toolbar]"))
  // holding every tool, the palette is sized by them: the filler is the fit's headroom and draws no seam just
  // inside the frame (it read as a doubled bottom edge); with More (RTL, 160px) it is a real cell and keeps it
  const f2 = await poll(() => filler("[data-testid=vp-tb]"), (x) => x === "0px,0px", 2000)
  ok("vertical: a palette holding every tool puts no seam just inside its bottom edge", f2 === "0px,0px", f2)
  await rtl.scrollIntoViewIfNeeded()
  await rtl.locator(".kl-tb-overflow").click()
  await lastMenu(p)
  await idle(p)
  const rside = await p.evaluate(() => {
    const m = [...document.querySelectorAll("[role=menu]")].at(-1).getBoundingClientRect()
    const t = document.querySelector("[data-testid=vp-rtl] [data-slot=toolbar]").getBoundingClientRect()
    return Math.round(t.left - m.right)
  })
  ok("vertical RTL: More's menu opens to the left, docked", Math.abs(rside) <= 3, rside)
  await p.keyboard.press("Escape")
  ok("no page errors", p.errs.length === 0, p.errs)
})
