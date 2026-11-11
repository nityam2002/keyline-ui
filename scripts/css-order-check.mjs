// Install-order independence. The shadcn CLI appends each item's CSS in the order items were added, so no
// component may depend on its file coming after another's. This builds the app twice — as written, and with the
// component imports in src/demo/globals.css reversed (in the build only; the source file is never touched) — captures
// the computed styles of every Keyline element on the specimen and the playground preview in both, and diffs.
//   npm run test:css-order            (no dev server needed)
import { chromium } from "playwright"
import { join } from "node:path"
import { buildApp, serveApp } from "./test-app.mjs"

const ROOT = new URL("..", import.meta.url).pathname
const OUT = join(ROOT, ".artifacts/css-order")
const PROPS = ["color", "backgroundColor", "borderTopColor", "borderInlineStartColor", "borderTopWidth", "borderInlineStartWidth", "borderInlineEndWidth", "borderBottomWidth", "paddingTop", "paddingBottom", "paddingInlineStart", "paddingInlineEnd", "marginTop", "marginInlineStart", "fontFamily", "fontWeight", "fontSize", "lineHeight", "display", "gap", "clipPath", "textDecorationLine", "opacity", "outlineStyle"]

export const reverseUiImports = (css) => {
  const lines = css.split("\n")
  const ui = lines.map((l, i) => (/@import "\.\.\/registry\/keyline\/ui\//.test(l) ? i : -1)).filter((i) => i >= 0)
  const reversed = ui.map((i) => lines[i]).reverse()
  ui.forEach((i, k) => (lines[i] = reversed[k]))
  return { css: lines.join("\n"), count: ui.length }
}

let reversedCount = 0
await Promise.all([
  buildApp(join(OUT, "as-written")),
  buildApp(join(OUT, "reversed"), {
    transformCss: (id, code) => {
      if (!/\/src\/demo\/globals\.css($|\?)/.test(id)) return null
      const r = reverseUiImports(code)
      reversedCount = r.count
      return r.css
    },
  }),
])
const [s1, s2] = await Promise.all([serveApp(join(OUT, "as-written")), serveApp(join(OUT, "reversed"))])
const b = await chromium.launch({ channel: "chrome" })
async function capture(base) {
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } })
  const p = await ctx.newPage()
  const all = {}
  for (const [name, route, sel] of [["playground", "playground", "[data-testid=scope-preview]"], ["specimen", "specimen", "body"]]) {
    await p.goto(base + "#/" + route)
    await p.waitForSelector(`[data-route="${route}"] ${sel === "body" ? "" : sel}`.trim())
    // fonts loaded and no finite transition still running, so both captures see settled styles
    await p.waitForFunction(() => document.fonts.status === "loaded" && !document.getAnimations().some((a) => a.playState === "running" && a.timeline === document.timeline && a.effect?.getComputedTiming().iterations !== Infinity))
    all[name] = await p.evaluate(([sel, PROPS]) => [...document.querySelector(sel).querySelectorAll("*")].filter((e) => String(e.className).includes("kl-")).map((e) => { const s = getComputedStyle(e); return [e.tagName + "." + String(e.className).split(" ").filter((c) => c.startsWith("kl-")).join("."), PROPS.map((k) => s[k])] }), [sel, PROPS])
  }
  await ctx.close()
  return all
}
let a, z
try {
  ;[a, z] = await Promise.all([capture(s1.url), capture(s2.url)])
} finally {
  await b.close()
  await s1.close()
  await s2.close()
}
const diffs = []
for (const k of Object.keys(a)) a[k].forEach(([sel, va], i) => z[k][i] && va.forEach((v, j) => v !== z[k][i][1][j] && diffs.push(`${k} ${sel} ${PROPS[j]}: ${v} → ${z[k][i][1][j]}`)))
const uniq = [...new Set(diffs)]
const n = a.playground.length + a.specimen.length
const sameShape = a.playground.length === z.playground.length && a.specimen.length === z.specimen.length
const line = (ok, name, d) => console.log(`${ok ? "  ✓" : "  ✖"} [chromium] ${name}${ok ? "" : " — " + d}`)
line(reversedCount > 1, "css order: the reversed build reverses the component imports", `reversed ${reversedCount}`)
line(n > 500 && sameShape, "css order: both builds render the same Keyline elements", JSON.stringify({ n, z: z.playground.length + z.specimen.length }))
line(!uniq.length, "css order: no computed style depends on the component CSS order", uniq.slice(0, 20).join("; "))
console.log(`css order: ${n} elements, ${reversedCount} imports reversed, ${uniq.length} order-dependent styles`)
process.exit(uniq.length || reversedCount <= 1 || n <= 500 || !sameShape ? 1 : 0)
