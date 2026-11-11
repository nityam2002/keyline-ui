// Review captures: screenshots of one demo element (by data-testid) or a whole route, across a matrix of
// configurations and both engines, for looking at a change by eye. This is not a test and not a baseline: the
// browser specs never compare pixels. Output goes to .artifacts/captures/ (ignored), replaced on each run.
//
//   npm run capture -- <testid | #/route> [--q=<query> ...] [--engines=chromium,webkit] [--base=<url>]
//
//   npm run capture -- sa-v-frame                         the default matrix (below), both engines
//   npm run capture -- toolbar --q="theme=dark&dir=rtl"   one configuration
//   npm run capture -- "#/playground" --engines=chromium  a whole route
//
// A query sets the demo's modes (theme, cut, density, motion, dir) and may add w=<px> for the viewport width.
// Without --base the app is built and served from the working tree (scripts/test-app.mjs).
import { chromium, webkit } from "playwright"
import { mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import { buildApp, serveApp } from "./test-app.mjs"

const MATRIX = ["theme=light", "theme=dark", "theme=dark&density=compact&dir=rtl", "dir=rtl&w=390", "motion=reduce&cut=on"]

const args = process.argv.slice(2)
const target = args.find((a) => !a.startsWith("--"))
const opt = (k) => args.filter((a) => a.startsWith(`--${k}=`)).map((a) => a.slice(k.length + 3))
if (!target) {
  console.error("usage: npm run capture -- <testid | #/route> [--q=<query> ...] [--engines=chromium,webkit] [--base=<url>]")
  process.exit(2)
}
const queries = opt("q").length ? opt("q") : MATRIX
const engines = (opt("engines")[0] ?? "chromium,webkit").split(",")
const route = target.startsWith("#") ? target : "#/specimen"
const testid = target.startsWith("#") ? null : target

const ROOT = new URL("..", import.meta.url).pathname
const OUT = join(ROOT, ".artifacts/captures")
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

let server
let base = opt("base")[0]
if (!base) {
  await buildApp(join(ROOT, ".artifacts/test-app"))
  server = await serveApp(join(ROOT, ".artifacts/test-app"))
  base = server.url
}

const launchers = { chromium: () => chromium.launch({ channel: "chrome" }), webkit: () => webkit.launch() }
const errors = []
try {
  for (const eng of engines) {
    const browser = await launchers[eng]()
    for (const q of queries) {
      const params = new URLSearchParams(q)
      const width = Number(params.get("w") ?? 1280)
      params.delete("w")
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 })
      const page = await ctx.newPage()
      page.on("pageerror", (e) => errors.push(`${eng} ${q}: ${e}`))
      await page.goto(`${base}?${params}${route}`)
      await page.evaluate(() => document.fonts.ready)
      const file = join(OUT, `${(testid ?? route.replace(/\W+/g, "")) || "page"}-${eng}-${q.replace(/[=&]/g, "-")}.png`)
      if (testid) {
        const el = page.getByTestId(testid)
        await el.scrollIntoViewIfNeeded()
        await page.waitForTimeout(500) // let entry motion settle
        await el.screenshot({ path: file })
      } else {
        await page.waitForTimeout(500)
        await page.screenshot({ path: file, fullPage: true })
      }
      console.log("  " + file.slice(ROOT.length))
      await ctx.close()
    }
    await browser.close()
  }
} finally {
  await server?.close()
}
if (errors.length) console.error("page errors:\n  " + errors.join("\n  "))
process.exit(errors.length ? 1 : 0)
