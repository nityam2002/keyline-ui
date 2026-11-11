// Public-site prototype assertions (Chrome): homepage plates, the guides, Toolbar docs, the Actions, Inputs, Data and Navigation pages and the catalogue.
//   npm run site:build && npm run site:start   then   npm run test:site [-- <base, default http://localhost:5293>]
// Keyboard-only paths, the filter keeping its state in More, Escape returning focus, the home plates turning
// without moving the pager or the legend, reduced motion, the docs component index, server
// HTML before the preview, copy = example source, no lab links, and no horizontal scroll at 390px.
import { chromium } from "playwright"
import fs from "node:fs"

const BASE = process.argv[2] ?? "http://localhost:5293"
// The registry origin the site prints: package.json "homepage" when set (the site is built with it), else the page's own origin
const ORIGIN = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")).homepage?.replace(/\/+$/, "") ?? BASE
// SITE_CHECK_ONLY=data,inputs runs only those browser sections (home, shell, install, docs, guides, actions, inputs, inputs2, data, navigation, overlays, layout, conversation; "none" runs none); server HTML, llms.txt and the catalogue always run
const ONLY = process.env.SITE_CHECK_ONLY?.split(",")
const run = (section) => !ONLY || ONLY.includes(section)
let fails = 0
const ok = (cond, msg) => {
  console.log(`${cond ? "  ok  " : "  FAIL"} ${msg}`)
  if (!cond) fails++
}

/* ---------- server HTML (no JavaScript) ---------- */
{
  console.log("server HTML")
  const home = await (await fetch(`${BASE}/`)).text()
  ok(home.includes("Controls that fit together."), "home: headline in HTML")
  ok(/href="\/docs\/installation"[^>]*>(?:<[^>]+>[^<]*)*?Get started/.test(home), "home: the primary action, Get started, opens the installation guide")
  ok(!/Toolbar docs|@keyline-ui\/toolbar/.test(home), "home: no single component is picked out")
  ok(home.includes("Frame.") && home.includes("Seam.") && home.includes("Cell."), "home: legend in HTML")
  ok(!/Shipment|KL-4102|Dunder|Scranton/.test(home), "home: no shipments or Office names in the hero")
  const docs = await (await fetch(`${BASE}/docs/components/toolbar`)).text()
  ok(/<h1[^>]*>Toolbar<\/h1>/.test(docs), "docs: heading in HTML")
  ok(docs.includes("npx shadcn@latest add @keyline-ui/toolbar"), "docs: install command in HTML")
  ok(!/keyboard/i.test(docs.match(/<main[\s\S]*<\/main>/)?.[0] ?? ""), "docs: no keyboard section")
  ok(docs.includes("Loading the live example"), "docs: preview is not in the HTML (loads after)")
  ok(docs.includes("setComments") && docs.includes("MemoEditor"), "docs: example source in HTML")
  const install = await (await fetch(`${BASE}/docs/installation`)).text()
  ok(/<h1[^>]*>Installation<\/h1>/.test(install), "installation: heading in HTML")
  ok(install.includes("npx shadcn@latest registry add @keyline-ui=") && install.includes("/r/{name}.json"), "installation: registry command in HTML")
  ok(install.includes("npx shadcn@latest add @keyline-ui/button"), "installation: install command in HTML")
  ok(!/localhost|127\.0\.0\.1|example\.invalid/.test(install), "installation: no local or placeholder hosts")
  ok(home.includes('href="/docs/installation"'), "home: Install links to the installation guide")
  {
    // @keyline-ui is not a name the CLI knows alone (it is not in shadcn's directory): the home strip
    // shows the mapping, then the add, in that order
    const strip = home.match(/data-testid="home-install"[\s\S]*?<\/ol>/)?.[0] ?? ""
    const map = strip.indexOf(`npx shadcn@latest registry add @keyline-ui=${ORIGIN}/r/{name}.json`)
    const add = strip.indexOf("npx shadcn@latest add @keyline-ui/&lt;name&gt;")
    ok(map >= 0 && add > map, `home: the install strip maps the registry, then adds an item by name (${map}, ${add})`)
  }
  const item = await fetch(`${BASE}/r/button.json`)
  ok(item.ok && (await item.json()).name === "button", "registry: the site serves /r/button.json")
  for (const [n, html] of [["home", home], ["docs", docs]]) {
    ok(!/Playground|Motion lab|Shipments demo|Specimen<|localhost:5291|#\/(app|specimen|motion|playground)/.test(html), `${n}: no links to the labs`)
  }
}


/* ---------- the guides and blocks: in the HTML, written for someone installing Keyline ---------- */
const GUIDE_PAGES = [
  ["/docs/theming", "Theming", ["--kl-commit", "bg-kl-cell", "keyline-shadcn"]],
  ["/docs/modes", "Modes", ["data-kl-density", "data-kl-motion", "DirectionProvider"]],
  ["/docs/configuration", "Configuration", ["KeylineConfigScope", "configToCss", "useKeylineScope"]],
  ["/docs/composition", "Composition", ["layout=&quot;cell&quot;", "useSelection", "Known limitations"]],
  ["/docs/blocks/shipments", "Shipments", ["npx shadcn@latest add @keyline-ui/shipments-demo", "makeShipments"]],
]
{
  console.log("guides: server HTML")
  for (const [href, h1, needs] of GUIDE_PAGES) {
    const res = await fetch(`${BASE}${href}`)
    const html = await res.text()
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? html
    ok(res.ok && new RegExp(`<h1[^>]*>${h1}</h1>`).test(html), `${href}: heading in HTML`)
    // the install command is highlighted token by token; its text is whole in the copy button's source
    const text = main.replace(/<[^>]+>/g, "")
    const missing = needs.filter((n) => !main.includes(n) && !text.includes(n))
    ok(missing.length === 0, `${href}: covers ${needs.join(", ")}${missing.length ? " (missing " + missing.join(", ") + ")" : ""}`)
    ok(html.includes("Loading the live example"), `${href}: the example loads after the HTML`)
    ok(/rel="prev"/.test(main), `${href}: links to the previous page`)
    // contributor workflows belong in the repository's docs, not on the site
    ok(!/playground|localhost|npm run|npm ci|#\/(app|specimen|motion)/i.test(main), `${href}: no repository or demo-app workflow`)
  }
  const install = await (await fetch(`${BASE}/docs/installation`)).text()
  ok(["not-found", "already-configured", "no-project", "utils"].every((id) => install.includes(`id="${id}"`)) && install.includes("Unknown registry"), "installation: troubleshooting covers the reproduced failures")
}

/* ---------- /llms.txt: the same pages as the sitemap, every link retrievable, the mapping before the add ---------- */
{
  console.log("llms.txt")
  const res = await fetch(`${BASE}/llms.txt`)
  const txt = await res.text()
  ok(res.ok && /^text\/plain/.test(res.headers.get("content-type") ?? ""), "llms.txt: served as text")
  ok(res.headers.get("x-robots-tag") === "noindex", "llms.txt: kept out of search results (X-Robots-Tag), fetchable")
  ok(txt.startsWith("# Keyline UI\n\n> "), "llms.txt: H1 then the summary blockquote")
  const map = txt.indexOf(`npx shadcn@latest registry add @keyline-ui=${ORIGIN}/r/{name}.json`)
  ok(map >= 0 && txt.indexOf("npx shadcn@latest add @keyline-ui/button") > map, "llms.txt: maps the registry, then adds an item")
  const links = [...txt.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1])
  const local = (u) => (u.startsWith(ORIGIN) ? u.slice(ORIGIN.length) : u)
  const pages = links.map(local).filter((p) => p.startsWith("/docs/"))
  const sitemap = [...(await (await fetch(`${BASE}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => local(m[1])).filter((p) => p.startsWith("/docs/"))
  ok(pages.length > 0 && pages.join() === sitemap.join(), `llms.txt: lists the sitemap's ${sitemap.length} docs pages, in order (${pages.length})`)
  const reg = JSON.parse(fs.readFileSync(new URL("../site/public/r/registry.json", import.meta.url), "utf8")).items
  const named = new Set(txt.match(/@keyline-ui\/[a-z-]+/g)?.map((n) => n.slice("@keyline-ui/".length)))
  const absent = reg.filter((i) => !named.has(i.name)).map((i) => i.name)
  ok(absent.length === 0, `llms.txt: names every registry item${absent.length ? " (missing " + absent.join(", ") + ")" : ""}`)
  const broken = []
  for (const p of links.map(local)) if (!(await fetch(`${BASE}${p}`)).ok) broken.push(p)
  ok(broken.length === 0, `llms.txt: all ${links.length} links answer 200${broken.length ? " (" + broken.join(", ") + ")" : ""}`)
}

/* ---------- the catalogue against the registry ---------- */
{
  console.log("catalogue")
  const reg = JSON.parse(fs.readFileSync(new URL("../site/public/r/registry.json", import.meta.url), "utf8")).items
  const cat = fs.readFileSync(new URL("../site/lib/catalog.ts", import.meta.url), "utf8")
  const named = [...cat.matchAll(/item: "([a-z-]+)"/g)].map((m) => m[1])
  const missing = named.filter((n) => !reg.some((i) => i.name === n))
  ok(missing.length === 0, `every catalogue entry is a registry item${missing.length ? ": " + missing.join(", ") : ""}`)
  const unlisted = reg.filter((i) => i.type === "registry:ui" && !named.includes(i.name)).map((i) => i.name)
  ok(unlisted.length === 0, `every registry:ui item is in the catalogue${unlisted.length ? ": " + unlisted.join(", ") : ""}`)
  ok(new Set(named).size === named.length, "no item listed twice")
  for (const [href, item] of [...cat.matchAll(/item: "([a-z-]+)", href: page\("([a-z-]+)"\)/g)].map((m) => [m[2], m[1]])) {
    const html = await (await fetch(`${BASE}/docs/components/${href}`)).text()
    ok(new RegExp(`npx shadcn@latest add @keyline-ui/${item}(?![a-z-])`).test(html), `${href}: page installs @keyline-ui/${item}`)
    ok(/<h1[^>]*>[^<]+<\/h1>/.test(html) && html.includes("Loading the live example"), `${href}: heading in HTML, preview loads after`)
  }
}

const browser = await chromium.launch({ channel: "chrome" })

async function page(width, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: opts.reduce ? "reduce" : "no-preference" })
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE })
  const p = await ctx.newPage()
  p.errors = []
  p.on("pageerror", (e) => p.errors.push(String(e)))
  p.on("console", (m) => m.type() === "error" && p.errors.push(m.text()))
  return p
}
const active = (p) => p.evaluate(() => {
  const a = document.activeElement
  return { text: a?.textContent?.trim() ?? "", label: a?.getAttribute("aria-label") ?? "", cls: a?.className ?? "", tag: a?.tagName }
})
const tabTo = async (p, test, max = 40) => {
  for (let i = 0; i < max; i++) {
    await p.keyboard.press("Tab")
    if (test(await active(p))) return true
  }
  return false
}

for (const width of run("home") ? [1440, 390] : []) {
  for (const reduce of [false, true]) {
    const tag = `home ${width}${reduce ? " reduced-motion" : ""}`
    console.log(tag)
    const p = await page(width, { reduce })
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" })
    const sx = await p.evaluate(() => document.documentElement.scrollWidth)
    ok(sx <= width, `${tag}: no horizontal page scroll (${sx}px)`)

    const legendY = async () => p.locator(".s-legend").evaluate((e) => e.getBoundingClientRect().top + scrollY)
    const y0 = await legendY()
    const restKey = await p.evaluate(() => document.querySelector(".s-keyline").getAttribute("d")) // the server's drawing

    // the plates: one at a time, left on the heading's line; a quiet pager under them turns to the next without
    // moving itself, the plate's top edge, or the title block; every plate is live and error-free
    {
      const left = () => p.evaluate(() => { const r = document.createRange(); r.selectNodeContents(document.querySelector(".s-title")); return [r.getBoundingClientRect().left, document.querySelector(".s-pager").getBoundingClientRect().left, document.querySelector(".s-plate").getBoundingClientRect().left].map(Math.round) })
      const [tl, pl, sl] = await left()
      ok(Math.abs(pl - sl) <= 1 && sl - tl >= 0 && sl - tl <= (width > 720 ? 81 : 1), `${tag}: pager and plate share a left edge, set in from the heading's on desktop (${tl}, ${pl}, ${sl})`)
      const fixed = () => p.evaluate(() => [".s-pager-next", ".s-plate", ".s-block"].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(s === ".s-plate" ? r.bottom : r.top)}` }).join("|"))
      const f0 = await fixed()
      const names = []
      for (let i = 0; i < 4; i++) {
        names.push(await p.getByTestId("plate").getAttribute("data-plate"))
        ok((await fixed()) === f0, `${tag}: plate ${names.at(-1)}: Next (x and y), the plate's foot and the title block stay put`)
        await p.getByTestId("plate-next").click()
        await p.waitForTimeout(reduce ? 20 : 320)
      }
      ok(new Set(names).size === 4 && (await p.getByTestId("plate").getAttribute("data-plate")) === names[0], `${tag}: Next turns through four plates and wraps (${names.join(", ")})`)
      // a tick goes straight to its plate and says which is current
      await p.getByRole("button", { name: /Plate 3:/ }).click()
      ok((await p.getByRole("button", { name: /Plate 3:/ }).getAttribute("aria-current")) === "true" && (await p.getByTestId("plate").getAttribute("data-plate")) === names[2], `${tag}: a tick opens its plate and is marked current`)
      // the press-run plate is live: its toolbar filter narrows the table
      const tb = p.getByRole("toolbar", { name: "Run actions" })
      if ((await tb.getByRole("button", { name: /Late only/ }).count()) > 0) {
        await tb.getByRole("button", { name: /Late only/ }).click()
        ok((await p.locator(".s-plate tbody tr").count()) === 1, `${tag}: Late only filters the press runs`)
      }
      // the turn prints in register (cobalt plate steps back, ink sharpens); reduced motion turns at once
      await p.getByTestId("plate-next").click()
      const anim = await p.evaluate(() => [getComputedStyle(document.querySelector(".s-plate"), "::after").animationName, getComputedStyle(document.querySelector(".s-plate > *")).animationName].join())
      ok(reduce ? anim === "none,none" : anim === "s-plate-reg,s-plate-ink", `${tag}: ${reduce ? "reduced motion: no turn animation" : "the turn prints in register"} (${anim})`)
      // the pager is reachable by keyboard and its parts link to the docs
      ok((await p.locator(".s-pager-cap a").first().getAttribute("href"))?.startsWith("/docs/components/"), `${tag}: the plate's parts link to their docs`)
      ok((await p.getByRole("button", { name: /Reveal|Narrow/ }).count()) === 0 && (await p.getByRole("radio", { name: "Narrow" }).count()) === 0, `${tag}: no Reveal or Standard/Narrow controls`)
      ok((await legendY()) === y0, `${tag}: the legend never moved`)
      await p.getByTestId("plate-next").focus()
      await p.keyboard.press("Enter")
      ok((await active(p)).text.includes("Next"), `${tag}: Enter on Next keeps focus on Next`)
    }
    ok((await p.locator(".s-land").getAttribute("aria-hidden")) === "true", `${tag}: land drawing is aria-hidden`)
    ok((await p.locator(".s-land .s-keypoint").count()) === 0, `${tag}: no keypoint drawn in the land`)
    // the land is one layer under the heading and the specimen: frame's inside top edge to the title block's rule
    const bd = await p.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect()
      const f = document.querySelector(".s-frame"), b = r(".s-backdrop"), t = r(".s-title"), blk = r(".s-block")
      return { top: b.top - (f.getBoundingClientRect().top + f.clientTop), bottom: b.bottom - blk.top, covers: b.top <= t.top && b.bottom >= r(".s-plate-stage").bottom, lands: document.querySelectorAll(".s-land").length, pe: getComputedStyle(document.querySelector(".s-backdrop")).pointerEvents, mask: getComputedStyle(document.querySelector(".s-backdrop")).maskImage }
    })
    ok(bd.lands === 1 && Math.abs(bd.top) < 1 && Math.abs(bd.bottom) < 1 && bd.covers, `${tag}: one land spans heading and specimen, frame top to title block (${JSON.stringify(bd)})`)
    ok(bd.pe === "none" && bd.mask.includes("gradient"), `${tag}: land layer is pointer-transparent and fades behind the heading`)
    // the living land: it moves (on the canvas) while the heading and the table stay put; a keyboard toggle pauses
    // it and hands the moved shape back to the SVG; it resumes without a jump; offscreen it rests; reduced motion is
    // the static drawing, with no toggle
    {
      const mt = p.getByTestId("motion-toggle"), bdEl = p.locator(".s-backdrop")
      const keyD = () => p.evaluate(() => document.querySelector(".s-keyline").getAttribute("d"))
      const nums = (d) => d.match(/-?\d+/g).map(Number)
      const shift = (a, b) => { const x = nums(a), y = nums(b); return x.length === y.length ? Math.max(...x.map((v, i) => Math.abs(v - y[i]))) / 10 : Infinity }
      const pic = () => p.evaluate(() => document.querySelector(".s-land-live").toDataURL().length + ":" + document.querySelector(".s-land-live").toDataURL().slice(-200))
      const steady = () => p.evaluate(() => [".s-title", ".s-plate", ".s-pager"].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round).join() }).join("|"))
      if (reduce) {
        await p.waitForTimeout(600)
        ok((await bdEl.getAttribute("data-live")) === "false" && shift(await keyD(), restKey) === 0, `${tag}: reduced motion shows the resting land, still`)
        ok(!(await mt.isVisible()), `${tag}: no motion control when nothing moves`)
      } else {
        ok((await bdEl.getAttribute("data-live")) === "true", `${tag}: the land is alive (canvas drawing)`)
        ok((await mt.getAttribute("aria-label")) === "Pause background motion" && (await mt.getAttribute("aria-pressed")) === "false", `${tag}: pause control is a labelled toggle`)
        const [a0, s0] = [await pic(), await steady()]
        await p.waitForTimeout(800)
        ok((await pic()) !== a0, `${tag}: the contours change shape over time`)
        ok((await steady()) === s0, `${tag}: heading, plate and pager stay put while the land moves`)
        ok((await p.evaluate(() => getComputedStyle(document.querySelector(".s-keyline")).strokeDasharray)) === "none", `${tag}: the keyline is solid`)
        // the pointer: over the demo nothing rises; over open land it raises a hill at once, with new rings round it;
        // the hills stand a while after it leaves, then wear away, while the land keeps moving on its own
        const open = await p.evaluate(() => {
          // the hill's spot comes from the fixed stage (not the plate, whose height varies), so it lands on the same land every run
          const t = document.querySelector(".s-plate").getBoundingClientRect(), g = document.querySelector(".s-plate-stage").getBoundingClientRect(), b = document.querySelector(".s-backdrop").getBoundingClientRect()
          return b.right - t.right > 200 ? { x: (t.right + b.right) / 2, y: g.top + 30, tx: (t.left + t.right) / 2, ty: (t.top + t.bottom) / 2, out: b.bottom + 40 } : null
        })
        if (open) {
          const flag = (n) => bdEl.getAttribute(`data-${n}`)
          const rings = () => p.evaluate(() => [...document.querySelectorAll(".s-land path")].map((e) => e.getAttribute("d")).join("").split("Z").length)
          const paused = async (f) => {
            await mt.focus()
            await p.keyboard.press("Space")
            await p.waitForTimeout(80)
            const v = await f()
            await p.keyboard.press("Space")
            return v
          }
          const atRest = await paused(rings)
          await p.mouse.move(open.tx, open.ty)
          await p.waitForTimeout(500)
          ok((await flag("bend")) !== "true", `${tag}: over the demo nothing rises`)
          await p.mouse.move(open.x, open.y)
          await p.waitForTimeout(300)
          ok((await flag("bend")) === "true", `${tag}: over open land the pointer raises a hill at once`)
          ok((await steady()) === s0, `${tag}: the hill changes the land, not the heading, plate or pager`)
          await p.waitForTimeout(900)
          const withHill = await paused(rings)
          ok(withHill > atRest, `${tag}: the hill opens new rings in the land (${atRest} closed paths → ${withHill}), and the paused SVG keeps them`)
          await p.mouse.move(open.x, open.out)
          await p.waitForTimeout(1500)
          ok((await flag("bend")) === "true", `${tag}: the hill stands after the pointer leaves`)
          await p.waitForFunction(() => document.querySelector(".s-backdrop").dataset.bend === "false", null, { timeout: 20000 }).catch(() => {})
          const a1 = await pic()
          ok((await flag("bend")) === "false", `${tag}: then wears away`)
          await p.waitForTimeout(400)
          ok((await bdEl.getAttribute("data-live")) === "true" && (await pic()) !== a1, `${tag}: while the land keeps moving on its own`)
        }
        await mt.focus()
        await p.keyboard.press("Space")
        await p.waitForTimeout(50)
        const held = await keyD()
        ok((await mt.getAttribute("aria-pressed")) === "true" && (await bdEl.getAttribute("data-live")) === "false", `${tag}: Space pauses the land`)
        // (at a phone's width the SVG takes the visible cut, so compare the moved path with the cut at rest only by change)
        ok(held !== restKey && (shift(held, restKey) === Infinity || shift(held, restKey) > 0.5), `${tag}: paused, the SVG holds the moved shape`)
        await p.waitForTimeout(500)
        ok(shift(await keyD(), held) === 0, `${tag}: paused land stays still`)
        await p.keyboard.press("Space")
        await p.waitForTimeout(120)
        ok((await bdEl.getAttribute("data-live")) === "true", `${tag}: Space resumes`)
        await p.keyboard.press("Space")
        await p.waitForTimeout(50)
        const jump = shift(await keyD(), held)
        // ~150 ms of ordinary motion is a few units at most; starting over would move the land tens of units
        ok(jump < 8, `${tag}: resumes where it stopped, no jump (${jump} units in ~150ms)`)
        await p.keyboard.press("Space")
        // offscreen it rests, and comes back to life when scrolled back
        {
          // room to scroll the hero right out of view (the page itself may be too short)
          await p.evaluate(() => { document.body.style.paddingBottom = "200vh" })
          await p.evaluate(() => scrollTo(0, document.querySelector(".s-backdrop").getBoundingClientRect().bottom + scrollY + 20))
          await p.waitForTimeout(250)
          ok((await bdEl.getAttribute("data-live")) === "false", `${tag}: offscreen, the land rests`)
          await p.evaluate(() => scrollTo(0, 0))
          await p.waitForTimeout(250)
          ok((await bdEl.getAttribute("data-live")) === "true", `${tag}: back in view, it moves again`)
          await p.evaluate(() => { document.body.style.paddingBottom = "" })
        }
      }
    }
    // keyboard path to the primary action
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" })
    ok(await tabTo(p, (a) => a.text.includes("Get started")), `${tag}: Tab reaches Get started`)
    await p.keyboard.press("Enter")
    await p.waitForURL("**/docs/installation")
    ok(true, `${tag}: Enter opens the installation guide`)
    ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
    await p.context().close()
  }
}

/* ---------- docs ---------- */
/* ---------- the docs shell: laid out for its width in the server HTML, so nothing moves when it hydrates ---------- */
// AppShell used to render the wide layout until a layout effect measured it, so on a phone the first paint had a
// 248px sidebar beside a sliver of page and everything moved once JavaScript ran (lab CLS 0.57–1.06).
if (run("shell")) {
  console.log("shell")
  const ROUTES = ["/docs/installation", "/docs/components/table", "/docs/blocks/shipments"]
  for (const [width, cols] of [[390, "page only"], [1024, "index and page"], [1440, "index, page and aside"]]) {
    // without JavaScript: only the server HTML and the CSS decide the layout
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, javaScriptEnabled: false })
    const p = await ctx.newPage()
    await p.goto(`${BASE}/docs/components/table`)
    const g = await p.evaluate(() => {
      const shown = (s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().width > 0 }
      const main = document.querySelector(".kl-shell-main").getBoundingClientRect()
      const head = document.querySelector(".kl-shell-h").getBoundingClientRect()
      return { nav: shown(".kl-shell-nav"), aside: shown(".kl-shell-aside"), mainW: Math.round(main.width), headW: Math.round(head.width), overflow: document.documentElement.scrollWidth - innerWidth }
    })
    const want = { 390: [false, false], 1024: [true, false], 1440: [true, true] }[width]
    ok(g.nav === want[0] && g.aside === want[1] && g.overflow <= 0, `shell ${width}, no JavaScript: ${cols} (${JSON.stringify(g)})`)
    if (width === 390) ok(g.mainW === g.headW, `shell 390, no JavaScript: the page is as wide as the header (${g.mainW}, ${g.headW})`)
    await ctx.close()
  }
  // with JavaScript, on a slow phone and on a desktop: hydration moves nothing ("good" CLS is 0.1 or less)
  for (const width of [390, 1440]) {
    for (const route of ROUTES) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, isMobile: width < 600, hasTouch: width < 600 })
      const p = await ctx.newPage()
      const cdp = await ctx.newCDPSession(p)
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 })
      await p.addInitScript(() => {
        window.__cls = 0
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: "layout-shift", buffered: true })
      })
      await p.goto(`${BASE}${route}`, { waitUntil: "load" })
      await p.locator("[data-testid=demo] [role=tabpanel] > :not(p)").first().waitFor({ timeout: 20_000 }).catch(() => {})
      await p.waitForTimeout(800) // timing: late layout shifts after the examples load are part of what is measured
      const cls = await p.evaluate(() => window.__cls)
      ok(cls <= 0.1, `shell ${width} ${route}: layout shift while loading ${cls.toFixed(3)} (at most 0.1)`)
      await ctx.close()
    }
  }
}

/* ---------- the installation guide names this site's registry ---------- */
if (run("install")) {
  console.log("install")
  const p = await page(1440)
  await p.goto(`${BASE}/docs/installation`, { waitUntil: "networkidle" })
  const blocks = await p.locator(".s-cb").allTextContents()
  const add = blocks.filter((t) => t.includes("registry add"))
  ok(add.length === 2 && add.every((t) => t.includes(`@keyline-ui=${ORIGIN}/r/{name}.json`)), `install: the shown registry command names this site (${add.map((t) => t.slice(0, 90)).join(" | ")})`)
  ok(!blocks.some((t) => t.includes("keyline-site") || t.includes("KEYLINESITE")), "install: no placeholder left once the page is in the browser")
  await p.getByRole("button", { name: /Copy registry command/i }).first().click()
  const copied = await p.evaluate(() => navigator.clipboard.readText())
  ok(copied === `npx shadcn@latest registry add @keyline-ui=${ORIGIN}/r/{name}.json`, `install: Copy gives the same command (${copied})`)
  ok(p.errors.length === 0, `install: no console errors${p.errors.length ? ": " + p.errors.join("; ") : ""}`)
  await p.context().close()
}

for (const width of run("docs") ? [1440, 390] : []) {
  const tag = `docs ${width}`
  console.log(tag)
  const p = await page(width)
  await p.goto(`${BASE}/docs/components/toolbar`, { waitUntil: "networkidle" })
  const sx = await p.evaluate(() => document.documentElement.scrollWidth)
  ok(sx <= width, `${tag}: no horizontal page scroll (${sx}px)`)
  const d0 = p.locator("[data-testid=demo]").first()
  // only the examples about overflow offer Standard / Narrow
  ok((await p.getByRole("radiogroup", { name: "Preview width" }).count()) === 2 && (await p.locator(".s-ruler-x").count()) === 2, `${tag}: Standard / Narrow only on the 2 overflow examples`)
  ok((await d0.locator(".s-demo-stage").evaluate((e) => getComputedStyle(e).backgroundImage)) === "none", `${tag}: preview stage has no background pattern`)
  // the editor: Comments starts on; turned off, it moves into More at Narrow and stays off there
  const tb = d0.getByTestId("preview-box").getByRole("toolbar", { name: "Memo formatting" })
  await tb.waitFor()
  const cm = () => tb.getByRole("button", { name: /Comments/ })
  const inRow = await cm().count()
  if (width >= 1080) ok(inRow === 1, `${tag}: at Standard, Comments fits in the row`)
  if (inRow) await cm().click()
  else { await tb.locator(".kl-tb-overflow").click(); await p.getByRole("menuitemcheckbox", { name: /Comments/ }).click(); await p.keyboard.press("Escape") }
  await d0.getByRole("radio", { name: /Narrow/ }).click()
  await p.waitForTimeout(150)
  ok((await cm().count()) === 0, `${tag}: Comments moves into More at Narrow`)
  ok((await tb.getByRole("button", { name: "Send memo" }).count()) === 1, `${tag}: the primary action stays in the row`)
  await tb.locator(".kl-tb-overflow").click()
  const item = p.getByRole("menuitemcheckbox", { name: /Comments/ })
  await item.waitFor()
  ok((await item.getAttribute("aria-checked")) === "false", `${tag}: Comments keeps its state (off) in More`)
  await p.keyboard.press("Escape")
  await p.waitForTimeout(100)
  ok((await active(p)).cls.includes("kl-tb-overflow"), `${tag}: Escape returns focus to More`)
  // back to Standard: the room returns, so the items return to the row
  await d0.getByRole("radio", { name: /Standard/ }).click()
  await p.waitForTimeout(250)
  ok((await cm().count()) === inRow, `${tag}: back at Standard the row is as it started (${inRow ? "Comments in the row" : "phone: Comments in More"})`)
  ok((await d0.getByRole("status").textContent()).includes("comments off"), `${tag}: status reads comments off`)
  const band = await d0.locator(".s-ruler-band").evaluate((e) => e.getBoundingClientRect().width)
  const boxW = await d0.getByTestId("preview-box").evaluate((e) => e.getBoundingClientRect().width)
  ok(Math.abs(band - boxW) < 1, `${tag}: ruler band matches the container width (${band} / ${boxW})`)

  // the component index: Keyline Nav in the AppShell sidebar on desktop, the shell's sheet on a phone
  if (width >= 960) {
    const nav = p.getByRole("navigation", { name: "Components" })
    ok(await nav.isVisible(), `${tag}: component index is visible`)
    ok((await nav.getByRole("link", { name: "Toolbar" }).getAttribute("aria-current")) === "page", `${tag}: Toolbar marked current`)
    ok((await nav.locator("li").count()) > 50, `${tag}: index lists the catalogue (${await nav.locator("li").count()})`)
    ok((await p.locator(".s-dnav[data-slot='scroll-area']").count()) === 1, `${tag}: index scrolls in Keyline's ScrollArea`)
    // the identity stays above the scrolling list: the list's bar starts below it
    const idB = await p.locator(".s-dnav-home").evaluate((e) => e.getBoundingClientRect().bottom)
    const listT = await p.locator(".s-dnav").evaluate((e) => e.getBoundingClientRect().top)
    ok(listT >= idB - 0.5 && (await p.locator(".s-dnav .s-dnav-home").count()) === 0, `${tag}: identity sits above the scroll area (${Math.round(idB)} / ${Math.round(listT)})`)
    // the frame holds still: header, index and page index at the same place at every section and at the end
    const where = () => p.evaluate(() => [".kl-shell-h", ".kl-shell-nav", ".kl-shell-aside"].map((q) => { const r = document.querySelector(q).getBoundingClientRect(); return `${Math.round(r.top)}:${Math.round(r.height)}` }).join(" "))
    const at0 = await where()
    let still = true
    for (const n of ["Usage", "Vertical", "Props"]) { await p.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: n }).click(); await p.waitForTimeout(300); if ((await where()) !== at0) still = false }
    await p.evaluate(() => scrollTo(0, 1e6)); await p.waitForTimeout(300); if ((await where()) !== at0) still = false
    ok(still, `${tag}: header, index and page index never move while the page scrolls (${at0})`)
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300)
    // the page's own index: Keyline Nav in the aside; the band follows the section being read
    const toc = p.getByRole("navigation", { name: "On this page" })
    ok(await toc.isVisible(), `${tag}: page index is visible`)
    ok((await toc.getByRole("link").count()) === 6, `${tag}: page index lists 6 sections`)
    await toc.getByRole("link", { name: "In a panel" }).click()
    await p.waitForTimeout(400)
    ok((await toc.getByRole("link", { name: "In a panel" }).getAttribute("aria-current")) === "page", `${tag}: page index follows the jump to "In a panel"`)
    // after scrolling down, choosing the first section lands on it and the band stays on it (it used to settle on Usage)
    await p.mouse.move(600, 500)
    await p.mouse.wheel(0, 2400)
    await p.waitForTimeout(400)
    await toc.getByRole("link", { name: "Installation" }).click()
    await p.waitForTimeout(500)
    ok((await toc.getByRole("link", { name: "Installation" }).getAttribute("aria-current")) === "page", `${tag}: after scrolling, choosing Installation keeps the band on it`)
    const ih = await p.locator("#installation").evaluate((e) => e.getBoundingClientRect().top)
    const hb = await p.locator(".kl-shell-h").evaluate((e) => e.getBoundingClientRect().bottom)
    ok(ih >= hb && ih < hb + 60, `${tag}: Installation lands just below the sticky header, not under it (${Math.round(ih)} / header ends ${Math.round(hb)})`)
    // the skip link: focusable first, lands the page frame below the header
    await p.goto(`${BASE}/docs/components/toolbar`, { waitUntil: "networkidle" })
    await p.keyboard.press("Tab")
    ok((await active(p)).text === "Skip to content", `${tag}: first Tab stop is the skip link`)
    await p.keyboard.press("Enter"); await p.waitForTimeout(300)
    const mt = await p.locator("#main h1").evaluate((e) => e.getBoundingClientRect().top)
    ok(mt >= hb, `${tag}: skip link leaves the title below the header (${Math.round(mt)})`)
    await p.keyboard.press("Tab")
    ok((await active(p)).text === "Preview", `${tag}: after the skip, Tab reaches the first demo`)
    await p.mouse.wheel(0, 1600)
    await p.waitForTimeout(500)
    ok((await toc.getByRole("link", { name: "Installation" }).getAttribute("aria-current")) !== "page", `${tag}: scrolling on releases the chosen section`)
    ok(await toc.getByText("On this page").isVisible() && (await toc.locator("li").filter({ hasText: /^On this page$/ }).count()) === 0, `${tag}: "On this page" is the index's title, not a group`)
    await p.evaluate(() => scrollTo(0, 0))
    await p.waitForTimeout(300)
    // the index's band never freezes mid-stretch. The next page's render is one long task (its JS, style and
    // layout); a band driven from the main thread stood still several rows tall for as long as that took (130-200ms on
    // a 6x slower CPU). The band follows the URL, so the render mostly comes first, and its move is transform
    // animations the compositor runs (keyline-motion.ts), so a lazy example mounting mid-move cannot freeze it either.
    // Measured: every frame that shows the band stretched is owned by a running transform-only animation on it, the
    // kind the compositor plays through a long task. (Whether the compositor drew through the stall is only visible in
    // pixels; a stretched frame with no such animation behind it is exactly the old freeze.)
    {
      const q = await page(width)
      await q.goto(`${BASE}/docs/components/button-group`, { waitUntil: "networkidle" })
      await q.waitForTimeout(500)
      const cdp = await q.context().newCDPSession(q)
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 })
      await q.evaluate(() => {
        const band = document.querySelector('nav[aria-label="Components"] [data-kl-band]')
        const row = document.querySelector('nav[aria-label="Components"] [aria-current="page"]').getBoundingClientRect().height
        // the band as drawn: in flight it is a still window, and what shows is where its clip and fill overlap it
        const drawn = () => {
          let { top, bottom } = band.getBoundingClientRect()
          if (band.hasAttribute("data-kl-flight"))
            for (const s of ["[data-kl-band-clip]", "[data-kl-band-fill]"]) {
              const e = band.querySelector(s)
              if (e) { const r = e.getBoundingClientRect(); top = Math.max(top, r.top); bottom = Math.min(bottom, r.bottom) }
            }
          return Math.max(0, bottom - top)
        }
        const f = (window.__band = { row, frames: [] })
        const t0 = performance.now()
        const tick = () => {
          const a = document.getAnimations().filter((x) => band.contains(x.effect?.target) && x.playState === "running")
          const comp = a.length > 0 && a.every((x) => x.effect.getKeyframes().every((k) => Object.keys(k).every((p) => ["offset", "easing", "composite", "computedOffset", "transform"].includes(p))))
          f.frames.push([performance.now(), drawn(), comp])
          if (performance.now() - t0 < 4000) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
      await q.getByRole("navigation", { name: "Components" }).getByRole("link", { name: "Theming", exact: true }).click()
      await q.waitForURL("**/docs/theming")
      await q.waitForTimeout(1500)
      const { row, frames } = await q.evaluate(() => window.__band)
      // a stretched frame (over 1.5 rows tall) that no compositor animation is playing: the band standing still
      const stretched = frames.filter(([, h]) => h > row * 1.5)
      const owned = stretched.filter(([, , c]) => c).length
      ok(stretched.length > 0 && owned === stretched.length, `${tag}: the index band's stretch is played by the compositor, so a long task cannot freeze it (${owned}/${stretched.length} stretched frames on transform animations, 6x CPU)`)
      await q.context().close()
    }
  } else {
    const trig = p.getByRole("button", { name: "Show component index" })
    await trig.focus()
    await p.keyboard.press("Enter")
    const nav = p.getByRole("navigation", { name: "Components" })
    await nav.waitFor()
    ok((await nav.locator("li").count()) > 50, `${tag}: index sheet lists the catalogue`)
    await p.keyboard.press("Escape")
    await p.waitForTimeout(300)
    ok((await active(p)).label === "Show component index", `${tag}: Escape returns focus to the index button`)
    ok(!(await p.getByRole("navigation", { name: "On this page" }).isVisible().catch(() => false)), `${tag}: no page index sheet opens by itself`)
  }

  // code: Keyline's ScrollArea, no native overflow; a one-line block centres Copy on its line
  ok((await p.locator(".s-cb [data-slot='scroll-area']").count()) === (await p.locator(".s-cb").count()), `${tag}: every code block scrolls in Keyline's ScrollArea`)
  ok((await p.locator(".s-cb pre[tabindex]").count()) === 0, `${tag}: code has one Tab stop (the scroll region)`)
  const inst = p.locator("#installation + .s-cb")
  const cy = await inst.locator(".line").first().evaluate((e) => { const r = e.getBoundingClientRect(); return r.top + r.height / 2 })
  const by = await inst.getByRole("button", { name: "Copy install command", exact: true }).evaluate((e) => { const r = e.getBoundingClientRect(); return r.top + r.height / 2 })
  ok(Math.abs(cy - by) <= 1.5, `${tag}: Copy is level with the one line (${cy.toFixed(1)} / ${by.toFixed(1)})`)

  const src = fs.readFileSync(new URL("../site/examples/toolbar-editor.tsx", import.meta.url), "utf8")
  await d0.getByRole("tab", { name: "Code" }).click()
  ok((await d0.getByText("Install them together").count()) === 0, `${tag}: the code panel shows only the example's source`)
  await p.getByRole("button", { name: "Copy example code" }).click()
  ok((await p.evaluate(() => navigator.clipboard.readText())) === src, `${tag}: copied example code equals the rendered example's source`)
  await p.getByRole("button", { name: "Copy install command", exact: true }).click()
  ok((await p.evaluate(() => navigator.clipboard.readText())) === "npx shadcn@latest add @keyline-ui/toolbar", `${tag}: copied install command`)
  ok((await p.getByTestId("copy-after").textContent()).includes("components.json"), `${tag}: after copying, the next step shows`)
  // the hint sits under the whole install block, from its start edge, on one line where there is room
  {
    const blk = await p.locator("#installation + .s-cb").boundingBox()
    const hint = await p.getByTestId("copy-after").boundingBox()
    ok(Math.abs(hint.x - blk.x) < 1 && hint.y >= blk.y + blk.height && (width < 720 || hint.height < 30), `${tag}: copy hint sits under the block's start edge (x ${Math.round(hint.x)} / ${Math.round(blk.x)}, h ${Math.round(hint.height)})`)
  }
  // every example: the code panel copies the module the preview renders
  for (const [i, file, label] of [[1, "toolbar-panel.tsx", "panel example code"], [2, "toolbar-vertical.tsx", "vertical example code"], [3, "toolbar-scroll.tsx", "scroll example code"]]) {
    const d = p.locator("[data-testid=demo]").nth(i)
    await d.scrollIntoViewIfNeeded()
    await d.getByRole("toolbar").first().waitFor()
    ok((await d.getByRole("toolbar").count()) === 1, `${tag}: ${file} renders its toolbar`)
    await d.getByRole("tab", { name: "Code" }).click()
    await p.getByRole("button", { name: `Copy ${label}` }).click()
    const want = fs.readFileSync(new URL(`../site/examples/${file}`, import.meta.url), "utf8")
    ok((await p.evaluate(() => navigator.clipboard.readText())) === want, `${tag}: ${file} copy equals its source`)
  }
  ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
  await p.context().close()
}

/* ---------- the guides' examples: each shows what its page says ---------- */
for (const width of run("guides") ? [1440, 390] : []) {
  const tag = `guides ${width}`
  console.log(tag)
  const p = await page(width)
  const open = async (href) => {
    await p.goto(`${BASE}${href}`, { waitUntil: "networkidle" })
    const sx = await p.evaluate(() => document.documentElement.scrollWidth)
    ok(sx <= width, `${tag} ${href}: no horizontal page scroll (${sx}px)`)
    const gap = await p.evaluate(() => { const f = document.querySelector("#main > footer"); return Math.round(f.getBoundingClientRect().top - f.previousElementSibling.getBoundingClientRect().bottom) })
    ok(gap >= 48, `${tag} ${href}: the page's last block stands clear of the footer (${gap}px)`)
    const stage = p.locator("[data-testid=demo]").first().getByTestId("preview-box")
    await stage.waitFor()
    return stage
  }
  const bg = (l) => l.evaluate((e) => getComputedStyle(e).backgroundColor)

  // Theming: the same role utilities resolve differently in the light and the dark region
  let box = await open("/docs/theming")
  const cards = box.getByTestId("role-card")
  await cards.first().waitFor()
  ok((await cards.count()) === 2 && (await bg(cards.nth(0))) !== (await bg(cards.nth(1))), `${tag} theming: one markup, two themes`)

  // Modes: the region's attributes are set, and the Select's list (portaled) carries the region's theme and density
  box = await open("/docs/modes")
  const region = box.getByTestId("mode-region")
  await region.waitFor()
  ok((await region.getAttribute("data-kl-density")) === "compact" && (await region.getAttribute("class")).split(" ").includes("dark"), `${tag} modes: the region is dark and compact`)
  const ctlH = async () => region.getByRole("combobox").evaluate((e) => Math.round(e.getBoundingClientRect().height))
  const compactH = await ctlH()
  await box.getByRole("radio", { name: "Comfortable" }).click()
  ok((await ctlH()) > compactH, `${tag} modes: comfortable makes the controls taller (${compactH} → ${await ctlH()})`)
  await box.getByRole("radio", { name: "Compact" }).click()
  await region.getByRole("combobox").click()
  const list = p.getByRole("listbox").last()
  await list.waitFor()
  const carried = await list.evaluate((e) => { const r = e.closest("[data-kl-density]"); return [r?.getAttribute("data-kl-density"), !!e.closest(".dark")] })
  ok(carried[0] === "compact" && carried[1], `${tag} modes: the portaled list carries the region's density and theme (${carried})`)
  await p.keyboard.press("Escape")
  await box.getByRole("radio", { name: "RTL" }).click()
  ok((await region.evaluate((e) => getComputedStyle(e).direction)) === "rtl", `${tag} modes: RTL mirrors the region`)

  // Configuration: a palette changes the scope's commit colour and the generated CSS names the scope
  box = await open("/docs/configuration")
  const scope = box.getByTestId("config-scope")
  await scope.waitFor()
  const commit = () => scope.evaluate((e) => getComputedStyle(e).getPropertyValue("--kl-commit").trim())
  const css = box.getByTestId("config-css")
  const c0 = await commit()
  ok((await css.textContent()).includes('[data-kl-config="branch"]') && (await css.textContent()).includes(c0), `${tag} configuration: the CSS is the scope's own tokens (${c0})`)
  await box.getByRole("radio", { name: "Ember" }).click()
  const c1 = await commit()
  ok(c1 !== c0 && (await css.textContent()).includes(c1), `${tag} configuration: another palette changes the scope and its CSS (${c1})`)
  ok((await scope.getAttribute("class"))?.split(" ").includes("light") !== true, `${tag} configuration: theme "system" follows the page (no theme class)`)

  // Composition: declared cells have no frame of their own; controls keep their 2px frame
  box = await open("/docs/composition")
  const footer = box.getByTestId("footer")
  await footer.waitFor()
  const bw = () => footer.getByRole("button", { name: "Save draft" }).evaluate((e) => getComputedStyle(e).borderTopWidth)
  ok((await bw()) === "0px", `${tag} composition: a cell has no border (${await bw()})`)
  await box.getByRole("radio", { name: /control/ }).click()
  ok((await bw()) === "2px", `${tag} composition: a control keeps its 2px frame (${await bw()})`)

  // Shipments: the block renders its table, and selecting a row brings the bulk bar
  box = await open("/docs/blocks/shipments")
  const ship = box.getByTestId("shipments")
  await ship.locator("tbody tr").first().waitFor({ timeout: 10000 })
  ok((await ship.locator("tbody tr").count()) >= 12, `${tag} shipments: the table renders a page of shipments`)
  const hint = ship.getByText("Select rows to assign, reschedule or cancel them.")
  ok(await hint.isVisible(), `${tag} shipments: the bulk bar says what selecting is for`)
  await ship.getByRole("checkbox", { name: /^Select / }).first().check()
  await hint.waitFor({ state: "detached", timeout: 3000 }).catch(() => {})
  ok((await hint.count()) === 0, `${tag} shipments: selecting a row turns the bulk bar to its actions`)

  // Search finds a guide by what it answers, not only by its name
  await p.goto(`${BASE}/docs/theming`, { waitUntil: "networkidle" }) // the Shipments block binds ⌘K to its own menu
  await p.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k")
  const search = p.getByRole("dialog", { name: "Search the docs" })
  if (await search.isVisible().catch(() => false)) {
    await search.getByRole("combobox").fill("density")
    ok((await search.getByRole("option", { name: /Modes/ }).count()) === 1, `${tag} search: "density" finds Modes`)
    await p.keyboard.press("Escape")
  }

  ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
  await p.context().close()
}

/* ---------- the Actions pages: each lead example's main interaction, by pointer and keyboard ---------- */
const docs = async (p, name) => {
  await p.goto(`${BASE}/docs/components/${name}`, { waitUntil: "networkidle" })
  const sx = await p.evaluate(() => document.documentElement.scrollWidth)
  ok(sx <= p.viewportSize().width, `${name}: no horizontal page scroll (${sx}px)`)
  return (i) => p.locator("[data-testid=demo]").nth(i)
}
const statusOf = (d) => d.getByRole("status").first().textContent()
const copyMatches = async (p, d, file, label) => {
  await d.getByRole("tab", { name: "Code" }).click()
  await d.getByRole("button", { name: `Copy ${label}` }).click()
  const want = fs.readFileSync(new URL(`../site/examples/${file}`, import.meta.url), "utf8")
  ok((await p.evaluate(() => navigator.clipboard.readText())) === want, `${file}: copy equals the source the preview renders`)
  await d.getByRole("tab", { name: "Preview" }).click()
}

for (const [width, reduce] of run("actions") ? [[1440, false], [390, false], [390, true]] : []) {
  const tag = `actions ${width}${reduce ? " reduced-motion" : ""}`
  console.log(tag)
  const p = await page(width, { reduce })

  // Button: pending, then done, then idle again; a failure that recovers on retry
  let demo = await docs(p, "button")
  let d = demo(0)
  const email = d.getByRole("button", { name: /Email invoice/ })
  await email.click()
  ok((await email.getAttribute("aria-busy")) === "true" && (await statusOf(d)).includes("Sending"), `${tag} button: pending while sending`)
  await p.waitForTimeout(1350)
  ok((await d.getByRole("button", { name: /Email again/ }).getAttribute("data-signal")) === "done" && (await statusOf(d)).includes("Emailed at"), `${tag} button: done, and the status says where it went`)
  await p.waitForTimeout(1800)
  ok((await d.getByRole("button", { name: /Email again/ }).getAttribute("data-signal")) === null, `${tag} button: back to idle`)
  d = demo(2)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("button", { name: /Send 3 orders/ }).focus()
  await p.keyboard.press("Enter")
  await p.waitForTimeout(1200)
  const retry = d.getByRole("button", { name: /Try again/ })
  ok((await retry.getAttribute("data-signal")) === "failed" && (await statusOf(d)).includes("still saved"), `${tag} button: failed says what to do`)
  ok((await active(p)).text.includes("Try again"), `${tag} button: focus stays on the button through pending and failed`)
  await p.keyboard.press("Enter")
  await p.waitForTimeout(1200)
  ok((await statusOf(d)).includes("Sent."), `${tag} button: retry succeeds`)
  if (width === 1440) for (const [i, f, l] of [[0, "button-invoice.tsx", "example code"], [3, "button-affix.tsx", "affix example code"]]) await copyMatches(p, demo(i), f, l)

  // Button group: each button its own stop; the text cell updates
  demo = await docs(p, "button-group")
  d = demo(0)
  ok(await d.getByRole("button", { name: "Previous" }).isDisabled(), `${tag} button group: Previous starts disabled`)
  await d.getByRole("button", { name: "Next" }).click()
  ok((await d.getByRole("group").textContent()).includes("2 of 5") && (await d.getByTestId("preview-box").textContent()).includes("DM-4087"), `${tag} button group: Next shows order 2`)
  d = demo(2)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("button", { name: "Send the tracking link" }).click()
  await p.getByRole("menuitem", { name: "Text the sales rep" }).click()
  ok((await statusOf(d)).includes("Texted to Jim"), `${tag} button group: the menu cell's command runs`)

  // Split button: the action, then a menu choice by keyboard; Escape returns to the caret
  demo = await docs(p, "split-button")
  d = demo(0)
  await d.getByRole("button", { name: "Book delivery" }).click()
  ok((await statusOf(d)).includes("today at 2 PM"), `${tag} split button: the action runs`)
  const caret = d.getByRole("button", { name: "Other ways to deliver" })
  await caret.focus()
  await p.keyboard.press("Enter")
  await p.getByRole("menu").waitFor()
  await p.keyboard.press("Escape")
  await p.waitForTimeout(150)
  ok((await active(p)).label === "Other ways to deliver", `${tag} split button: Escape returns focus to the caret`)
  await caret.click()
  await p.getByRole("menuitem", { name: /Customer pickup/ }).click()
  ok((await statusOf(d)).includes("Held at the branch"), `${tag} split button: a menu choice runs`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("button", { name: "Export formats" }).click()
  await p.getByRole("menuitem", { name: "CSV" }).click()
  ok((await d.getByRole("button", { name: "Export as CSV" }).count()) === 1, `${tag} split button: the action repeats the last format`)

  // Toggle: pressed filters the list; the label never changes
  demo = await docs(p, "toggle")
  d = demo(0)
  const tg = d.getByRole("button", { name: /Missing receipt/ })
  await tg.click()
  ok((await tg.getAttribute("aria-pressed")) === "true" && (await d.getByRole("listitem").count()) === 2 && (await tg.textContent()).includes("Missing receipt"), `${tag} toggle: pressed shows the 2 without receipts, same label`)

  // Toggle group: one Tab stop, arrows move, Space presses; at Narrow the row scrolls in its frame
  demo = await docs(p, "toggle-group")
  d = demo(0)
  await d.getByRole("button", { name: /Dwight/ }).focus()
  await p.keyboard.press("ArrowRight")
  ok((await active(p)).text.startsWith("Jim"), `${tag} toggle group: arrows move between items`)
  await p.keyboard.press("Space")
  ok((await statusOf(d)).includes("Jim"), `${tag} toggle group: Space presses Jim`)
  await d.getByRole("radio", { name: "Narrow" }).click()
  await p.waitForTimeout(300)
  const g = d.getByRole("group", { name: "Sales rep" })
  const fit = await g.evaluate((e) => ({ w: e.getBoundingClientRect().width, box: e.closest("[data-testid=preview-box]").clientWidth, more: e.getAttribute("data-kl-more") }))
  ok(fit.w <= fit.box && fit.more, `${tag} toggle group: at Narrow the row stays in its container and marks the hidden edge (${Math.round(fit.w)}/${fit.box}, ${fit.more})`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("button", { name: "Low stock" }).click()
  await d.getByRole("button", { name: "On order" }).click()
  ok((await d.getByTestId("preview-box").textContent()).includes("need a reorder"), `${tag} toggle group: nothing matches, and the panel says what to do`)
  const hh = await d.locator("[data-slot=panel-header]").evaluate((e) => e.getBoundingClientRect().height)
  ok(hh < 64, `${tag} toggle group: the panel header keeps its height with a group in it (${Math.round(hh)}px)`)

  // Menu: submenu radio, a destructive row, undo; focus comes back to the trigger
  demo = await docs(p, "menu")
  d = demo(0)
  const actions = d.getByRole("button", { name: "Actions" })
  // keyboard into the submenu: Down to Assign to, Right opens it on the checked rep, Down, Enter
  await actions.focus()
  await p.keyboard.press("Enter")
  await p.getByRole("menu").first().waitFor()
  for (let i = 0; i < 6 && !(await active(p)).text.startsWith("Assign to"); i++) { await p.keyboard.press("ArrowDown"); await p.waitForTimeout(50) }
  await p.keyboard.press("ArrowRight")
  await p.getByRole("menuitemradio", { name: "Jim Halpert" }).waitFor()
  await p.keyboard.press("ArrowDown")
  await p.keyboard.press("Enter")
  await p.waitForTimeout(150)
  ok((await d.getByTestId("preview-box").textContent()).includes("Jim Halpert"), `${tag} menu: the submenu assigns Jim from the keyboard`)
  // a radio row keeps the menus open: Escape closes the submenu, then the menu
  await p.keyboard.press("Escape")
  await p.keyboard.press("Escape")
  await p.waitForTimeout(300)
  ok((await p.getByRole("menu").count()) === 0 && (await active(p)).text.includes("Actions"), `${tag} menu: Escape closes both menus, focus back on Actions`)
  await actions.click()
  await p.getByRole("menuitem", { name: "Cancel order" }).click()
  await p.waitForTimeout(150)
  ok((await d.getByTestId("preview-box").textContent()).includes("Cancelled") && (await active(p)).text.includes("Actions"), `${tag} menu: cancelled, focus back on Actions`)
  await d.getByRole("button", { name: "Undo" }).click()
  ok(!(await d.getByTestId("preview-box").textContent()).includes("Cancelled"), `${tag} menu: Undo restores the order`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("button", { name: "Notify me" }).click()
  await p.getByRole("menuitemcheckbox", { name: "Someone mentions me" }).click()
  ok((await p.getByRole("menu").count()) === 1 && (await statusOf(d)).includes("someone mentions me"), `${tag} menu: a checkbox row keeps the menu open and applies`)
  await p.keyboard.press("Escape")

  // Menubar: a checkbox row, and Right moves to the next open menu
  demo = await docs(p, "menubar")
  d = demo(0)
  await d.getByRole("menuitem", { name: "View" }).click()
  await p.getByRole("menuitemcheckbox", { name: "Branch targets" }).click()
  ok(!(await statusOf(d)).includes("against targets"), `${tag} menubar: View › Branch targets turns off`)
  await p.keyboard.press("ArrowRight")
  await p.waitForTimeout(150)
  ok((await p.getByRole("menuitem", { name: "Email the sales team" }).count()) === 1, `${tag} menubar: Right opens Share`)
  await p.keyboard.press("Escape")
  if (width === 1440) await copyMatches(p, d, "menubar-report.tsx", "example code")

  // Context menu: keyboard opens it on the focused client; archiving all three leaves a way back
  demo = await docs(p, "context-menu")
  d = demo(0)
  const clients = d.getByRole("list", { name: "Clients" })
  // Shift+F10 and the Menu key fire `contextmenu` on the focused element; CDP key presses don't, so fire it
  const second = clients.getByRole("listitem").nth(1).locator("[tabindex='0']")
  await second.focus()
  const bb = await second.boundingBox()
  await second.dispatchEvent("contextmenu", { bubbles: true, cancelable: true, button: 2, clientX: bb.x + 8, clientY: bb.y + bb.height })
  await p.getByRole("menu").waitFor({ timeout: 2000 }).catch(() => {})
  ok((await p.getByRole("menu").count()) === 1, `${tag} context menu: Shift+F10 opens it on the focused client`)
  if (await p.getByRole("menu").count()) {
    await p.getByRole("menuitem", { name: /Remind Jim/ }).click()
    ok((await statusOf(d)).includes("Jim will get a reminder"), `${tag} context menu: the row's command runs`)
  }
  for (let i = 0; i < 3; i++) {
    await clients.locator("[tabindex='0']").first().click({ button: "right" })
    await p.getByRole("menuitem", { name: "Archive client" }).click()
    await p.waitForTimeout(100)
  }
  ok((await d.getByRole("button", { name: "Restore all three" }).count()) === 1, `${tag} context menu: the empty list offers a way back`)
  await d.getByRole("button", { name: "Restore all three" }).click()
  ok((await clients.getByRole("listitem").count()) === 3, `${tag} context menu: restored`)

  ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
  await p.context().close()
}

/* ---------- the Inputs pages: validation, keyboard and the states each lead example shows ---------- */
for (const [width, reduce] of run("inputs") ? [[1440, false], [390, false], [390, true]] : []) {
  const tag = `inputs ${width}${reduce ? " reduced-motion" : ""}`
  console.log(tag)
  const p = await page(width, { reduce })
  const box = (d) => d.getByTestId("preview-box")

  // Field and form: a failed check stops the submit, says what to do and takes focus; at Narrow labels go on top
  let demo = await docs(p, "field")
  let d = demo(0)
  const qty = d.getByRole("spinbutton", { name: "Quantity" })
  await qty.fill("500")
  await d.getByRole("button", { name: "Place order" }).click()
  await p.waitForTimeout(150)
  ok((await box(d).textContent()).includes("The warehouse has 480 cases") && (await qty.getAttribute("aria-invalid")) === "true", `${tag} field: 500 cases fails and says why`)
  ok((await active(p)).tag === "INPUT" && (await qty.evaluate((e) => e === document.activeElement)), `${tag} field: focus goes to the failed field`)
  ok(!(await statusOf(d)).includes("placed"), `${tag} field: nothing is placed`)
  await qty.fill("40")
  await d.getByRole("textbox", { name: "Client" }).fill("")
  await d.getByRole("button", { name: "Place order" }).click()
  await p.waitForTimeout(150)
  ok((await box(d).textContent()).includes("Who is the order for?"), `${tag} field: an empty client gets its own message`)
  await d.getByRole("textbox", { name: "Client" }).fill("Lackawanna County")
  await d.getByRole("button", { name: "Place order" }).click()
  await p.waitForTimeout(150)
  ok((await statusOf(d)).includes("40 cases for Lackawanna County"), `${tag} field: a valid order is placed`)
  const side = async () => box(d).getByText("Client", { exact: true }).evaluate((l) => {
    const i = l.closest("[data-slot=field]").querySelector("input").getBoundingClientRect()
    return l.getBoundingClientRect().bottom <= i.top + 1 ? "above" : "beside"
  })
  if (width === 1440) {
    ok((await side()) === "beside", `${tag} field: at Standard the label sits beside the input`)
    await d.getByRole("radio", { name: "Narrow" }).click()
    await p.waitForTimeout(300)
  }
  ok((await side()) === "above", `${tag} field: in a narrow container the label goes above`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("button", { name: "Track" }).click()
  await p.waitForTimeout(800)
  ok((await box(d).textContent()).includes("No shipment DM-9999 today"), `${tag} field: the server's error shows under its field`)
  await d.getByRole("textbox", { name: "Tracking number" }).fill("dm-4102")
  // the clear lands a render after the input event: wait for it rather than read once
  await box(d).getByText(/No shipment/).waitFor({ state: "detached", timeout: 1000 }).catch(() => {})
  ok(!(await box(d).textContent()).includes("No shipment"), `${tag} field: editing clears the server error`)
  await p.keyboard.press("Enter")
  await p.waitForTimeout(800)
  ok((await statusOf(d)).includes("On Darryl's truck"), `${tag} field: Enter submits and the shipment is found`)
  d = demo(2)
  await d.scrollIntoViewIfNeeded()
  ok((await d.getByRole("alert").textContent()).includes("won't fit"), `${tag} field: the carton breaks the shelf rule`)
  await d.getByRole("textbox", { name: "H" }).fill("28")
  ok((await d.getByRole("alert").count()) === 0, `${tag} field: a legal height clears it`)

  // Checkbox: the whole row toggles; Space on the box; all four done
  demo = await docs(p, "checkbox")
  d = demo(0)
  await box(d).getByText("Lock the warehouse door").click()
  ok((await d.getByRole("checkbox", { name: "Lock the warehouse door" }).getAttribute("aria-checked")) === "true", `${tag} checkbox: clicking the label checks the box`)
  await d.getByRole("checkbox", { name: "Clear the kitchen fridge" }).focus()
  await p.keyboard.press("Space")
  await d.getByRole("checkbox", { name: "Set the alarm" }).click()
  ok((await statusOf(d)).includes("Office closed"), `${tag} checkbox: Space and click finish the list`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("checkbox", { name: "Print INV-2201" }).click()
  await d.getByRole("checkbox", { name: "Print INV-2207" }).click()
  await d.getByRole("button", { name: "Print 2 invoices" }).click()
  ok((await statusOf(d)).includes("Sent 2"), `${tag} checkbox: the bare boxes pick two invoices`)

  // Checkbox group: All checks every enabled option and counts; the disabled rep keeps his state
  demo = await docs(p, "checkbox-group")
  d = demo(0)
  await d.getByRole("checkbox", { name: "All of sales" }).click()
  ok((await d.getByRole("checkbox", { name: "Andy Bernard" }).getAttribute("aria-checked")) === "false" && (await statusOf(d)).includes("Phyllis, Stanley") && (await box(d).textContent()).includes("4/5"), `${tag} checkbox group: All checks the four enabled reps`)
  await d.getByRole("checkbox", { name: "All of sales" }).click()
  ok((await statusOf(d)).includes("Nobody"), `${tag} checkbox group: All again clears them`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("button", { name: "Send to Angela" }).click()
  await p.waitForTimeout(150)
  ok((await box(d).textContent()).includes("Pick at least one"), `${tag} checkbox group: validate stops an empty list`)
  await d.getByRole("checkbox", { name: "Sheet cake" }).click()
  await d.getByRole("button", { name: "Send to Angela" }).click()
  await p.waitForTimeout(150)
  ok((await statusOf(d)).includes("1 item."), `${tag} checkbox group: the checked values reach the form`)

  // Radio group: arrows move and choose
  demo = await docs(p, "radio-group")
  d = demo(0)
  await d.getByRole("radio", { name: /Thursday route/ }).focus()
  await p.keyboard.press("ArrowDown")
  ok((await d.getByRole("radio", { name: /Next morning/ }).getAttribute("aria-checked")) === "true" && (await statusOf(d)).includes("Courier booked"), `${tag} radio group: ArrowDown chooses the next row`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("radio", { name: /cardstock/ }).click()
  ok((await statusOf(d)).includes("$1,152"), `${tag} radio group: the panel total follows the choice`)

  // Switch: the row flips it; the managed setting can't be changed
  demo = await docs(p, "switch")
  d = demo(0)
  await box(d).getByText("Text me if a delivery runs late").click()
  ok((await statusOf(d)).includes("late deliveries"), `${tag} switch: clicking the label turns it on`)
  await d.getByRole("switch", { name: /Email me/ }).focus()
  await p.keyboard.press("Space")
  ok(!(await statusOf(d)).includes("reorders"), `${tag} switch: Space turns it off`)
  ok(await d.getByRole("switch", { name: /Weekly sales report/ }).isDisabled(), `${tag} switch: the corporate report is not yours to change`)

  // Segmented: arrows choose; at Narrow the row scrolls in its frame
  demo = await docs(p, "segmented")
  d = demo(0)
  await d.getByRole("radio", { name: "This week" }).focus()
  await p.keyboard.press("ArrowRight")
  ok((await statusOf(d)).includes("6,420"), `${tag} segmented: ArrowRight chooses This month`)
  if (width === 1440) {
    await d.getByRole("radio", { name: "Narrow" }).click()
    await p.waitForTimeout(300)
  }
  const sg = d.getByRole("radiogroup", { name: "Period" })
  const fit = await sg.evaluate((e) => ({ w: e.getBoundingClientRect().width, box: e.closest("[data-testid=preview-box]").clientWidth, more: e.getAttribute("data-kl-more") }))
  ok(fit.w <= fit.box && fit.more, `${tag} segmented: in a narrow container the row scrolls in its frame (${Math.round(fit.w)}/${fit.box}, ${fit.more})`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("radio", { name: "Calls" }).click()
  ok((await d.getByRole("list", { name: "Ranked by calls" }).count()) === 1, `${tag} segmented: the panel ranks by calls`)

  // Select: keyboard open, a disabled option can't be chosen, Escape returns focus
  demo = await docs(p, "select")
  d = demo(0)
  const trig = d.getByRole("combobox", { name: /Lackawanna/ })
  await trig.focus()
  await p.keyboard.press("Enter")
  await p.getByRole("listbox").waitFor()
  await p.keyboard.press("Escape")
  await p.waitForTimeout(200)
  ok((await p.getByRole("listbox").count()) === 0 && (await trig.evaluate((e) => e === document.activeElement)), `${tag} select: Escape closes and focus is back on the field`)
  await trig.click()
  await p.getByRole("option", { name: /Stanley Hudson/ }).click({ force: true })
  await p.waitForTimeout(100)
  ok(!(await statusOf(d)).includes("Stanley"), `${tag} select: a disabled option is not chosen`)
  await p.getByRole("option", { name: /Jim Halpert/ }).click()
  await p.waitForTimeout(150)
  ok((await statusOf(d)).includes("Jim has the lead") && (await trig.textContent()).includes("Jim Halpert"), `${tag} select: Jim is chosen and shown`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("button", { name: "Send quote" }).click()
  await p.waitForTimeout(150)
  ok((await box(d).textContent()).includes("Choose a weight. The price depends on it."), `${tag} select: required stops the quote with its message`)
  await d.getByRole("combobox", { name: "Paper weight" }).click()
  await p.getByRole("option", { name: "24 lb premium" }).click()
  await p.waitForTimeout(150)
  await d.getByRole("button", { name: "Send quote" }).click()
  await p.waitForTimeout(150)
  ok((await statusOf(d)).includes("24 lb premium") && !(await box(d).textContent()).includes("price depends"), `${tag} select: chosen, the quote goes and the error clears`)

  // Native select: required with a placeholder, then a real branch
  demo = await docs(p, "native-select")
  d = demo(0)
  await d.getByRole("button", { name: "Request transfer" }).click()
  await p.waitForTimeout(150)
  ok((await box(d).textContent()).includes("Choose a branch to send the request to."), `${tag} native select: required stops the request`)
  ok(await d.getByRole("option", { name: "Buffalo (closed)" }).isDisabled(), `${tag} native select: closed branches can't be chosen`)
  await d.getByRole("combobox", { name: "Transfer to" }).selectOption("utica")
  await d.getByRole("button", { name: "Request transfer" }).click()
  await p.waitForTimeout(150)
  ok((await statusOf(d)).includes("Request sent to Utica"), `${tag} native select: the request goes to Utica`)

  if (width === 1440)
    for (const [n, i, f, l] of [["field", 0, "field-order.tsx", "example code"], ["select", 0, "select-assign.tsx", "example code"], ["checkbox-group", 1, "checkbox-group-party.tsx", "form example code"]]) {
      demo = await docs(p, n)
      await demo(i).scrollIntoViewIfNeeded()
      await copyMatches(p, demo(i), f, l)
    }

  ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
  await p.context().close()
}

/* ---------- Inputs, second half: scales, searches, codes, times and dates ---------- */
for (const [width, reduce] of run("inputs2") ? [[1440, false], [390, false], [390, true]] : []) {
  const tag = `inputs II ${width}${reduce ? " reduced-motion" : ""}`
  console.log(tag)
  const p = await page(width, { reduce })
  const box = (d) => d.getByTestId("preview-box")
  // the example's own result line is the last status: a slider readout or an OTP field is a status too
  const said = (d) => box(d).getByRole("status").last().textContent()
  const enabledDay = (n = 0) => p.locator(".kl-positioner [role=grid] button:not([disabled])").nth(n)

  // Slider: arrows step; past 10% the result asks for Michael; a range has two named thumbs
  let demo = await docs(p, "slider")
  let d = demo(0)
  await d.getByRole("slider").focus()
  for (let i = 0; i < 5; i++) await p.keyboard.press("ArrowRight")
  ok((await d.getByRole("slider").getAttribute("aria-valuenow")) === "11" && (await said(d)).includes("Michael has to approve"), `${tag} slider: five steps to 11% asks for Michael`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("slider", { name: "Price per case, to" }).focus()
  await p.keyboard.press("End")
  ok((await said(d)).includes("5 of 5"), `${tag} slider: End on the "to" thumb shows every paper`)
  await d.getByRole("slider", { name: "Price per case, from" }).focus()
  await p.keyboard.press("End")
  ok((await said(d)).includes("Nothing in that range"), `${tag} slider: an empty range says what to do`)

  // Number field: Shift+Arrow takes the large step; over stock is an error; at min the − cell is off
  demo = await docs(p, "number-field")
  d = demo(0)
  const qty = d.getByRole("textbox", { name: "Reorder for Blue Cross" })
  await qty.focus()
  await p.keyboard.press("Shift+ArrowUp")
  ok((await qty.inputValue()) === "34" && (await said(d)).includes("340 reams"), `${tag} number field: Shift+ArrowUp steps by 10`)
  await qty.fill("500")
  await p.keyboard.press("Enter")
  ok((await box(d).textContent()).includes("Split it into two deliveries") && (await said(d)) === "Not sent.", `${tag} number field: 500 cases is an error`)
  await qty.fill("1")
  await p.keyboard.press("Enter")
  ok(await d.getByRole("button", { name: "Decrease" }).isDisabled(), `${tag} number field: at the minimum the − cell is disabled`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  const price = d.getByRole("textbox", { name: "Price per case" })
  await price.fill("30")
  await p.keyboard.press("Tab") // the field formats its text on blur
  ok((await price.inputValue()) === "$30.00" && (await said(d)).includes("Below the floor"), `${tag} number field: currency formats and the floor warns`)

  // Combobox: typing filters and underlines; a disabled client can't be chosen; async errors offer Retry
  demo = await docs(p, "combobox")
  d = demo(0)
  const client = d.getByRole("combobox", { name: "Client" })
  await client.pressSequentially("barre", { delay: 30 })
  await p.getByRole("option", { name: /Wilkes-Barre Library/ }).waitFor()
  ok((await p.getByRole("option").count()) === 1 && (await p.locator(".kl-positioner mark").first().textContent()).toLowerCase() === "barre", `${tag} combobox: "barre" leaves one client, the match marked`)
  await p.keyboard.press("ArrowDown")
  await p.keyboard.press("Enter")
  ok((await said(d)).includes("Wilkes-Barre Library"), `${tag} combobox: Enter chooses it`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  const who = d.getByRole("combobox", { name: "Escalate to" })
  await who.fill("utica") // one input event into the closed field, as a paste is
  await p.getByRole("option", { name: /Karen Filippelli/ }).waitFor({ timeout: 3000 })
  ok((await p.locator(".kl-cb-status").first().textContent()).includes("1 match"), `${tag} combobox: the status line counts the matches`)
  await p.getByRole("option", { name: /Karen Filippelli/ }).click()
  ok((await said(d)).includes("Karen Filippelli gets the complaint"), `${tag} combobox: an async result is chosen`)
  await p.getByRole("listbox").waitFor({ state: "detached" })
  await who.focus()
  await p.keyboard.press("Escape")
  ok((await said(d)).includes("Karen Filippelli gets the complaint") && (await who.inputValue()) === "Karen Filippelli", `${tag} combobox: Escape on the closed field keeps the choice`)
  await who.fill("")
  await p.keyboard.press("Escape")
  await p.getByRole("listbox").waitFor({ state: "detached" }).catch(() => {})
  await who.fill("stamford") // pasted into the closed field: the failing search is the one shown
  await p.getByRole("button", { name: "Retry" }).waitFor({ timeout: 3000 }).catch(() => {})
  ok((await p.locator(".kl-cb-status").first().textContent()).includes("timed out") && (await p.getByRole("button", { name: "Retry" }).count()) === 1, `${tag} combobox: a failed search says so and offers Retry`)
  await p.keyboard.press("Escape")

  // Multiselect: search, add a token, remove one
  demo = await docs(p, "multiselect")
  d = demo(0)
  const ms = d.getByRole("combobox").first()
  await ms.fill("toby") // pasted into the closed field
  await p.locator(".kl-ms-status").filter({ hasText: "1 match for “toby”" }).waitFor({ timeout: 3000 }).catch(() => {})
  ok((await p.getByRole("option").count()) === 1, `${tag} multiselect: a pasted "toby" lists only Toby`)
  await p.getByRole("option", { name: /Toby Flenderson/ }).click()
  ok((await said(d)).includes("2 people") && (await said(d)).includes("Toby"), `${tag} multiselect: Toby is added as a token`)
  await ms.focus()
  await p.keyboard.press("Escape")
  await p.getByRole("listbox").waitFor({ state: "detached" }).catch(() => {})
  await p.keyboard.press("Escape")
  ok((await said(d)).includes("2 people"), `${tag} multiselect: Escape after a pick keeps every token`)
  await d.getByRole("button", { name: "Remove Angela Martin" }).click()
  ok((await said(d)).includes("1 person"), `${tag} multiselect: a token's remove cell takes it out`)

  // OTP field: a wrong code fails in the frame; the right one signs in
  demo = await docs(p, "otp-field")
  d = demo(0)
  await d.getByRole("textbox", { name: "Code from your phone" }).click()
  await p.keyboard.type("123456")
  await p.waitForTimeout(100)
  ok((await d.locator("[aria-busy=true]").count()) >= 1, `${tag} otp: checking is shown while pending`)
  await p.waitForTimeout(1100)
  ok((await box(d).textContent()).includes("doesn't match") && (await d.getByRole("textbox", { name: "Code from your phone" }).evaluate((e) => e === document.activeElement)), `${tag} otp: a wrong code says so and returns to the first cell`)
  await p.keyboard.type("271828")
  await p.waitForTimeout(1200)
  ok((await said(d)).includes("Signed in"), `${tag} otp: the right code signs in`)

  // Time field: arrows step inside the dock's hours
  demo = await docs(p, "time-field")
  d = demo(0)
  await d.getByRole("spinbutton", { name: "Hours" }).focus()
  await p.keyboard.press("ArrowUp")
  ok((await said(d)).includes("11:30 AM"), `${tag} time field: ArrowUp on the hours moves to 11:30 AM`)
  await d.getByRole("spinbutton", { name: "Minutes" }).focus()
  await p.keyboard.press("ArrowDown")
  ok((await said(d)).includes("11:15 AM"), `${tag} time field: minutes step by 15`)

  // Date picker: weekends are named unavailable; Escape returns focus; a weekday is chosen
  demo = await docs(p, "date-picker")
  d = demo(0)
  const trigger = d.getByRole("button", { name: /Deliver on/ })
  await trigger.click()
  await p.locator(".kl-positioner [role=grid]").waitFor()
  ok((await p.locator(".kl-positioner [role=grid] button[disabled]").count()) > 0 && (await p.locator(".kl-positioner [role=grid]").getByRole("button", { name: /no weekend deliveries/ }).count()) + (await p.locator(".kl-positioner [aria-label*='no weekend deliveries'], .kl-positioner [aria-label*='unavailable']").count()) > 0, `${tag} date picker: weekends are unavailable and say why`)
  await p.keyboard.press("Escape")
  await p.waitForTimeout(200)
  ok(await trigger.evaluate((e) => e === document.activeElement), `${tag} date picker: Escape returns focus to the field`)
  await trigger.click()
  await enabledDay(0).click()
  await p.waitForTimeout(150)
  ok((await said(d)).includes("On Darryl's route"), `${tag} date picker: a weekday is chosen`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await d.getByRole("button", { name: /Meet the Lackawanna/ }).click()
  await enabledDay(0).click()
  await p.getByRole("radio", { name: "11:00 AM" }).click()
  await p.waitForTimeout(150)
  ok((await said(d)).includes("Booked"), `${tag} date picker: a day and a slot book the meeting`)
  await p.keyboard.press("Escape")

  // Date range: two days make a range; weekends are left out of the count
  demo = await docs(p, "date-range")
  d = demo(0)
  await d.getByRole("button", { name: /Vacation/ }).click()
  // the first and the fifth weekday left this month (fewer late in a month): every enabled day between counts
  const last = Math.min(4, (await p.locator(".kl-positioner [role=grid] button:not([disabled])").count()) - 1)
  await enabledDay(0).click()
  await enabledDay(last).click()
  await p.waitForTimeout(150)
  const m = (await said(d)).match(/(\d+) working day/)
  ok(m && +m[1] === last + 1, `${tag} date range: ${last + 1} weekdays chosen count as ${last + 1}, weekends left out (${m?.[1]})`)

  if (width === 1440)
    for (const [n, i, f, l] of [["combobox", 1, "combobox-directory.tsx", "async search example code"], ["date-picker", 0, "date-picker-delivery.tsx", "example code"], ["otp-field", 0, "otp-sign-in.tsx", "example code"]]) {
      demo = await docs(p, n)
      await demo(i).scrollIntoViewIfNeeded()
      await copyMatches(p, demo(i), f, l)
    }

  ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
  await p.context().close()
}

/* ---------- Data, first half: states, figures, loading and empty places, people, keys, timelines ---------- */
for (const [width, reduce] of run("data") ? [[1440, false], [390, false], [390, true]] : []) {
  const tag = `data ${width}${reduce ? " reduced-motion" : ""}`
  console.log(tag)
  const p = await page(width, { reduce })
  const box = (d) => d.getByTestId("preview-box")
  const said = (d) => box(d).getByRole("status").last().textContent()

  // Status and badge: a stop moves from loading to out to delivered; the held stop says what to do
  let demo = await docs(p, "status")
  let d = demo(0)
  await box(d).getByRole("button", { name: "Mark delivered" }).first().click()
  ok((await said(d)).startsWith("1 of 4 delivered. DM-4102 signed for"), `${tag} status: a delivery is signed for and counted`)
  await box(d).getByRole("button", { name: "Load truck" }).click()
  ok((await box(d).getByText("DM-4115 is on the truck").count()) === 1 && (await box(d).getByRole("button", { name: "Mark delivered" }).count()) === 2, `${tag} status: a loaded stop goes out for delivery`)
  ok((await box(d).getByText(/Held: No one to sign/).count()) === 1, `${tag} status: the held stop says what to do`)

  // Stat and meter: the quarter changes every figure and the quota meter's value
  demo = await docs(p, "stat")
  d = demo(0)
  await box(d).getByRole("radio", { name: "Q3" }).click()
  ok((await box(d).getByText("18,240").count()) === 1 && (await box(d).getByRole("meter").getAttribute("aria-valuenow")) === "81", `${tag} stat: Q3 shows its figures and quota`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  const receive = box(d).getByRole("button", { name: "Receive 8 pallets" })
  for (let i = 0; i < 2; i++) await receive.click()
  ok((await said(d)).startsWith("Over 100") && (await box(d).getByRole("meter").getAttribute("aria-valuenow")) === "104", `${tag} meter: past high it says what to do`)
  await receive.click()
  await receive.click()
  ok(await receive.isDisabled(), `${tag} meter: Receive stops at the limit`)

  // Progress: the first send drops and keeps where it stopped; the retry completes
  demo = await docs(p, "progress")
  d = demo(0)
  await box(d).getByRole("button", { name: "Send report" }).click()
  await box(d).getByRole("button", { name: "Try again" }).waitFor({ timeout: 6000 })
  const bar = box(d).getByRole("progressbar")
  ok((await bar.getAttribute("aria-valuetext"))?.startsWith("Failed at") && (await box(d).getByText(/connection to Stamford dropped/).count()) === 1, `${tag} progress: a failure keeps its value and says why`)
  await box(d).getByRole("button", { name: "Try again" }).click()
  await box(d).getByText(/Jan in New York has it/).waitFor({ timeout: 8000 })
  ok((await bar.getAttribute("aria-valuenow")) === "100", `${tag} progress: the retry completes`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await box(d).getByRole("button", { name: "Print" }).click()
  ok((await box(d).getByRole("progressbar").getAttribute("aria-valuenow")) === null && (await box(d).getByRole("progressbar").getAttribute("aria-valuetext")) === "Warming up", `${tag} progress: indeterminate while the printer warms up`)
  await box(d).getByText(/All 40 printed/).waitFor({ timeout: 8000 })
  ok((await box(d).getByRole("progressbar").getAttribute("aria-valuetext")) === "40 of 40 pages", `${tag} progress: pages are counted`)

  // Skeleton: the region is busy and says what is loading, then the content replaces it
  demo = await docs(p, "skeleton")
  d = demo(0)
  const group = box(d).locator("[aria-busy]")
  await box(d).getByText(/Buys in bulk/).waitFor({ timeout: 4000 })
  await box(d).getByRole("button", { name: "Reload" }).click()
  ok((await group.count()) === 1 && (await box(d).getByRole("status").textContent()) === "Loading Lackawanna County", `${tag} skeleton: busy, announced once`)
  await box(d).getByText(/Buys in bulk/).waitFor({ timeout: 4000 })
  ok((await group.count()) === 0 && (await box(d).getByText("$48,200").count()) === 1, `${tag} skeleton: the content lands in place`)

  // Empty: no match offers the way out; an error retries; first use creates
  demo = await docs(p, "empty")
  d = demo(0)
  ok((await box(d).getByRole("heading", { name: /No clients match/ }).count()) === 1 && (await box(d).getByRole("status").count()) === 1, `${tag} empty: no match, announced`)
  await box(d).getByRole("button", { name: "Clear search" }).click()
  ok((await box(d).getByRole("listitem").count()) === 6, `${tag} empty: clearing shows every client`)
  await box(d).getByRole("searchbox").fill("vance")
  ok((await box(d).getByRole("listitem").count()) === 1, `${tag} empty: a search that matches lists it`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await box(d).getByRole("alert").waitFor({ timeout: 4000 })
  await box(d).getByRole("button", { name: "Retry" }).click()
  await box(d).getByRole("button", { name: "Log a call" }).click({ timeout: 4000 })
  ok((await box(d).getByText(/Called Lackawanna County/).count()) === 1, `${tag} empty: retry, then the first call is logged`)

  // Avatar: more people than max fold into a count; a photo that fails shows initials
  demo = await docs(p, "avatar")
  d = demo(0)
  await box(d).getByRole("checkbox", { name: "Stanley Hudson" }).click()
  await box(d).getByRole("checkbox", { name: "Andy Bernard" }).click()
  const team = box(d).getByRole("group", { name: "On the Lackawanna County account" })
  ok((await team.getByRole("img").count()) === 4 && (await team.getByRole("img", { name: "2 more" }).count()) === 1, `${tag} avatar: five people show three and +2`)
  d = demo(1)
  ok((await box(d).getByRole("img", { name: "Toby Flenderson, offline" }).textContent()) === "TF" && (await box(d).getByRole("img", { name: "Dwight Schrute, needs attention" }).count()) === 1, `${tag} avatar: initials hold a failed photo; status joins the name`)

  // Kbd: the shortcuts fire from the keyboard, including a two-key sequence
  demo = await docs(p, "kbd")
  d = demo(0)
  await box(d).getByLabel("Order screen. Try a shortcut.").focus()
  await p.keyboard.press("n")
  ok((await said(d)).startsWith("New order"), `${tag} kbd: N`)
  await p.keyboard.press("g")
  await p.keyboard.press("i")
  ok((await said(d)).startsWith("Go to invoices"), `${tag} kbd: G then I`)
  await p.keyboard.press("Control+s")
  ok((await said(d)).startsWith("Save the order"), `${tag} kbd: Ctrl+S`)

  // Marker: pending is a busy status, then the step is done
  demo = await docs(p, "marker")
  d = demo(0)
  await box(d).getByRole("button", { name: "Send to the warehouse" }).click()
  ok((await box(d).locator("[role=status][aria-busy=true]").getByText(/picking 120 cases/).count()) === 1, `${tag} marker: pending is announced`)
  await box(d).getByText("Picked and on the truck for Thursday").waitFor({ timeout: 5000 })
  ok((await box(d).getByRole("separator").count()) === 2, `${tag} marker: the day dividers are separators`)

  // Table: views, search, empty row, sort, select a page, a bulk action, the pager
  demo = await docs(p, "table")
  d = demo(0)
  const bodyRows = () => box(d).locator("tbody tr.kl-tr").count()
  await box(d).getByRole("tab", { name: /Held/ }).click()
  ok((await bodyRows()) === 2, `${tag} table: the Held view has two orders`)
  await box(d).getByRole("tab", { name: /All/ }).click()
  await box(d).getByRole("searchbox", { name: "Search orders" }).fill("stamford")
  ok((await box(d).getByRole("heading", { name: /No orders match/ }).count()) === 1, `${tag} table: a search that matches nothing says so`)
  await box(d).getByRole("button", { name: "Clear search" }).click()
  ok((await bodyRows()) === 5 && /1–5\s+of\s+11\s+orders/.test(await box(d).locator("[data-slot=table-pager]").innerText()), `${tag} table: cleared, five a page of 11`)
  await box(d).getByRole("button", { name: /Cases/ }).click()
  ok((await box(d).getByRole("columnheader", { name: /Cases/ }).getAttribute("aria-sort")) === "descending" && (await box(d).locator("tbody tr").first().innerText()).includes("Sabre"), `${tag} table: Cases sorts largest first`)
  await box(d).getByRole("checkbox", { name: "Select every order on this page" }).click()
  ok((await box(d).locator("[data-slot=table-bulk]").innerText()).includes("5 of 11 orders"), `${tag} table: the page is selected and counted`)
  await box(d).getByRole("button", { name: "Mark delivered" }).click()
  ok(/Delivered\s*6/.test(await box(d).getByRole("tab", { name: /Delivered/ }).innerText()), `${tag} table: the bulk action delivers the page (four more, one was already)`)
  await box(d).getByRole("button", { name: "Next page" }).click()
  ok(/6–10/.test(await box(d).locator("[data-slot=table-pager]").innerText()), `${tag} table: next page`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await box(d).getByRole("button", { name: "Lines in DM-4115" }).click()
  // the detail mounts a frame after the press (presence), then unfolds
  await box(d).getByText(/Envelopes/).waitFor({ timeout: 3000 }).catch(() => {})
  ok((await box(d).getByRole("button", { name: "Lines in DM-4115" }).getAttribute("aria-expanded")) === "true" && (await box(d).getByText(/Envelopes/).count()) === 1, `${tag} table: a row unfolds its lines`)
  d = demo(2)
  await d.scrollIntoViewIfNeeded()
  await box(d).getByRole("alert").waitFor({ timeout: 5000 })
  await box(d).getByRole("button", { name: "Retry" }).click()
  await box(d).getByText("INV-2207").waitFor({ timeout: 5000 })
  ok(/1–4\s+of\s+4\s+invoices/.test(await box(d).locator("[data-slot=table-pager]").innerText()), `${tag} table: retry loads the rows and the pager`)

  // Chart: the Table view carries the same rows; the plot is a named tab stop that reads each point
  demo = await docs(p, "chart")
  d = demo(0)
  const plot = box(d).locator(".recharts-surface[tabindex='0'], .recharts-wrapper [tabindex='0']").first()
  ok((await plot.count()) === 1, `${tag} chart: the plot is one tab stop`)
  await plot.focus()
  await p.keyboard.press("ArrowRight")
  await p.waitForTimeout(150)
  const heard = await box(d).locator("[data-slot=chart] [role=status]").textContent()
  ok(/Dwight|Jim/.test(heard ?? ""), `${tag} chart: arrow keys read a rep's figures (${heard})`)
  await box(d).getByRole("radio", { name: "Table" }).click()
  ok((await box(d).getByRole("rowheader", { name: "Dwight" }).count()) === 1 && (await box(d).getByRole("cell", { name: "5,120" }).count()) === 1, `${tag} chart: the table view has the same figures`)

  if (width === 1440)
    for (const [n, i, f, l] of [["status", 0, "status-deliveries.tsx", "example code"], ["progress", 0, "progress-upload.tsx", "example code"], ["empty", 1, "empty-calls.tsx", "first use and errors example code"], ["kbd", 0, "kbd-shortcuts.tsx", "example code"], ["table", 0, "table-orders.tsx", "example code"], ["chart", 2, "chart-returns.tsx", "the alert colour example code"]]) {
      demo = await docs(p, n)
      await demo(i).scrollIntoViewIfNeeded()
      await copyMatches(p, demo(i), f, l)
    }

  ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
  await p.context().close()
}

/* ---------- Navigation: tabs, breadcrumb, pagination, nav, navigation menu, command menu ---------- */
for (const [width, reduce] of run("navigation") ? [[1440, false], [390, false], [390, true]] : []) {
  const tag = `navigation ${width}${reduce ? " reduced-motion" : ""}`
  console.log(tag)
  const p = await page(width, { reduce })
  const box = (d) => d.getByTestId("preview-box")
  const said = (d) => box(d).getByRole("status").last().textContent()

  // Tabs: arrows move and choose; a view without panels filters the list
  let demo = await docs(p, "tabs")
  let d = demo(0)
  await box(d).getByRole("tab", { name: "Overview" }).click()
  await p.keyboard.press("ArrowRight")
  ok((await box(d).getByRole("tab", { name: /Orders/ }).getAttribute("aria-selected")) === "true" && (await box(d).getByRole("tabpanel").getByText("DM-4107").count()) === 1, `${tag} tabs: ArrowRight chooses Orders and shows its panel`)
  d = demo(1)
  await box(d).getByRole("tab", { name: /Called/ }).click()
  ok((await box(d).getByRole("list", { name: "Calls" }).getByRole("listitem").count()) === 2, `${tag} tabs: the Called view lists two`)

  // Breadcrumb: deep paths fold; a crumb goes up; the fold's menu reaches the rest
  demo = await docs(p, "breadcrumb")
  d = demo(0)
  const here = () => box(d).locator("[aria-current=page]").textContent()
  ok((await box(d).getByRole("button", { name: /Earlier levels \(4\)/ }).count()) === 1 && (await here()) === "Q4 orders", `${tag} breadcrumb: four levels fold, the page is current`)
  await box(d).getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Lackawanna County" }).click()
  ok((await here()) === "Lackawanna County" && (await box(d).getByRole("button", { name: "Q4 orders" }).count()) === 1, `${tag} breadcrumb: a crumb goes up a level`)
  await box(d).getByRole("button", { name: /Earlier levels/ }).click()
  await p.getByRole("menuitem", { name: /Sales/ }).click()
  ok((await here()) === "Sales", `${tag} breadcrumb: the folded menu reaches an earlier level`)

  // Pagination: next, the last page, and Next out of service there
  demo = await docs(p, "pagination")
  d = demo(0)
  await box(d).getByRole("button", { name: "Next page" }).click()
  ok((await box(d).locator("[aria-current=page]").textContent()) === "2" && (await box(d).getByText("INV-2203").count()) === 1, `${tag} pagination: next shows page 2`)
  if (width > 400) await box(d).getByRole("button", { name: "Page 19" }).click()
  else for (let i = 2; i < 19; i++) await box(d).getByRole("button", { name: "Next page" }).click()
  ok((await box(d).getByRole("button", { name: "Next page" }).isDisabled()) && (await box(d).getByRole("listitem").count()) === 4, `${tag} pagination: the last page, Next out of service`)

  // Nav: a section, a nested link, a disabled item
  demo = await docs(p, "nav")
  d = demo(0)
  const nav = box(d).getByRole("navigation", { name: "Scranton branch" })
  await nav.getByRole("button", { name: /Clients/ }).click()
  ok((await said(d)) === "64 active clients" && (await nav.locator("[aria-current]").textContent())?.includes("Clients"), `${tag} nav: a section is current`)
  await nav.getByRole("button", { name: /Reports/ }).click()
  ok((await nav.getByRole("button", { name: /Reports/ }).getAttribute("aria-expanded")) === "true", `${tag} nav: Reports opens its list`)
  await nav.getByRole("button", { name: "Weekly sales" }).click()
  ok((await said(d)).startsWith("Weekly sales"), `${tag} nav: a nested link is current`)
  ok(await nav.getByRole("button", { name: /Human resources/ }).isDisabled(), `${tag} nav: a disabled section can't be chosen`)

  // Navigation menu: keyboard opens a section; a card says where it would go; Escape returns to the trigger
  demo = await docs(p, "navigation-menu")
  d = demo(0)
  const products = box(d).getByRole("button", { name: "Products" })
  await products.focus()
  await p.keyboard.press("Enter")
  await p.getByRole("link", { name: /Cardstock/ }).waitFor({ timeout: 3000 })
  ok((await products.getAttribute("aria-expanded")) === "true", `${tag} navigation menu: Enter opens Products`)
  await p.keyboard.press("Escape")
  await p.waitForTimeout(200)
  ok(await products.evaluate((e) => e === document.activeElement), `${tag} navigation menu: Escape returns focus to the trigger`)
  await products.click()
  await p.getByRole("link", { name: /Cardstock/ }).click()
  ok((await said(d)) === "Would open /products/cardstock.", `${tag} navigation menu: a card is followed`)

  // Command menu: Ctrl+K opens it; typing filters; Enter runs; ⌥1 runs the first result; no match says so
  demo = await docs(p, "command")
  d = demo(0)
  await p.keyboard.press("Control+k")
  const dialog = p.getByRole("dialog", { name: "Command menu" })
  await dialog.waitFor({ timeout: 3000 })
  await p.keyboard.type("print")
  await p.keyboard.press("Enter")
  await dialog.waitFor({ state: "detached", timeout: 3000 })
  ok((await said(d)) === "Sent 40 invoices to the printer.", `${tag} command: Ctrl+K, type, Enter runs it`)
  const opener = box(d).getByRole("button", { name: "Commands" })
  await opener.click()
  await dialog.waitFor()
  await dialog.getByRole("combobox").fill("qqqq")
  // cmdk filters a render after the input event
  await dialog.getByText(/No commands match/).waitFor({ timeout: 2000 }).catch(() => {})
  ok((await dialog.getByText(/No commands match/).count()) === 1, `${tag} command: no match says so`)
  await dialog.getByRole("combobox").fill("")
  await p.keyboard.press("Alt+Digit1")
  await dialog.waitFor({ state: "detached", timeout: 3000 })
  ok((await said(d)) === "Opened Orders." && (await opener.evaluate((e) => e === document.activeElement)), `${tag} command: ⌥1 runs the first result; focus returns to the opener`)

  if (width === 1440)
    for (const [n, f] of [["tabs", "tabs-account.tsx"], ["breadcrumb", "breadcrumb-drive.tsx"], ["nav", "nav-sidebar.tsx"], ["command", "command-office.tsx"]]) {
      demo = await docs(p, n)
      await demo(0).scrollIntoViewIfNeeded()
      await copyMatches(p, demo(0), f, "example code")
    }

  ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
  await p.context().close()
}

/* ---------- Overlays: focus in and back, Escape, a form error, destructive confirm, toast undo and promise ---------- */
for (const [width, reduce] of run("overlays") ? [[1440, false], [390, false], [390, true]] : []) {
  const tag = `overlays ${width}${reduce ? " reduced-motion" : ""}`
  console.log(tag)
  const p = await page(width, { reduce })
  const box = (d) => d.getByTestId("preview-box")
  const said = (d) => box(d).getByRole("status").last().textContent()
  const focused = (l) => l.evaluate((e) => e === document.activeElement)

  // Dialog: an empty company is an error; a filled one joins the list; focus returns to the trigger
  let demo = await docs(p, "dialog")
  let d = demo(0)
  const add = box(d).getByRole("button", { name: "Add a client" })
  await add.click()
  let dlg = p.getByRole("dialog", { name: "Add a client" })
  await dlg.waitFor()
  ok(await focused(dlg.getByRole("textbox", { name: "Company" })) || (await dlg.evaluate((e) => e.contains(document.activeElement))), `${tag} dialog: focus moves in`)
  await dlg.getByRole("button", { name: "Add client" }).click()
  ok((await dlg.getByText("Which company?").count()) === 1, `${tag} dialog: an empty company is an error`)
  await dlg.getByRole("textbox", { name: "Company" }).fill("Scranton White Pages")
  await dlg.getByRole("button", { name: "Add client" }).click()
  await dlg.waitFor({ state: "detached", timeout: 3000 })
  ok((await box(d).getByRole("list", { name: "Clients" }).getByText("Scranton White Pages").count()) === 1, `${tag} dialog: the client joins the list`)
  ok(await focused(add), `${tag} dialog: focus returns to the trigger`)
  await add.click()
  await dlg.waitFor()
  await p.keyboard.press("Escape")
  await dlg.waitFor({ state: "detached", timeout: 3000 })
  ok((await box(d).getByRole("listitem").count()) === 3, `${tag} dialog: Escape adds nothing`)

  // Alert dialog: the safe choice has focus; Enter keeps the client; confirming removes it
  demo = await docs(p, "alert-dialog")
  d = demo(0)
  await box(d).getByRole("button", { name: "Remove" }).first().click()
  let alert = p.getByRole("alertdialog")
  await alert.waitFor()
  ok(await focused(alert.getByRole("button", { name: "Keep the client" })), `${tag} alert dialog: the safe choice has focus`)
  await p.keyboard.press("Enter")
  await alert.waitFor({ state: "detached", timeout: 3000 })
  ok((await box(d).getByRole("listitem").count()) === 3, `${tag} alert dialog: Enter keeps the client`)
  await box(d).getByRole("button", { name: "Remove" }).first().click()
  await alert.getByRole("button", { name: "Remove client" }).click()
  await alert.waitFor({ state: "detached", timeout: 3000 })
  ok((await said(d)) === "Vance Refrigeration removed." && (await box(d).getByRole("listitem").count()) === 2, `${tag} alert dialog: confirming removes it`)

  // Drawer: opens with its route; Escape puts it away; the footer action runs and closes
  demo = await docs(p, "drawer")
  d = demo(0)
  await box(d).getByRole("button", { name: "Darryl's route" }).click()
  let drawer = p.getByRole("dialog", { name: "Darryl's route today" })
  await drawer.waitFor()
  ok((await drawer.getByRole("listitem").count()) === 6, `${tag} drawer: the route lists six stops`)
  await p.keyboard.press("Escape")
  await drawer.waitFor({ state: "detached", timeout: 3000 })
  await box(d).getByRole("button", { name: "Darryl's route" }).click()
  await drawer.getByRole("button", { name: "Call Bob Vance" }).click()
  await drawer.waitFor({ state: "detached", timeout: 3000 })
  ok((await said(d)).startsWith("Calling Vance Refrigeration"), `${tag} drawer: the footer action runs and closes`)

  // Sheet: marks the order delivered, and the row behind it follows
  demo = await docs(p, "sheet")
  d = demo(0)
  await box(d).getByRole("button", { name: "Details" }).click()
  const sheet = p.getByRole("dialog", { name: "DM-4107" })
  await sheet.waitFor()
  await sheet.getByRole("button", { name: "Mark delivered" }).click()
  ok(await sheet.getByRole("button", { name: "Delivered" }).isDisabled(), `${tag} sheet: marked delivered`)
  await sheet.getByRole("button", { name: "Close", exact: true }).click()
  await sheet.waitFor({ state: "detached", timeout: 3000 })
  ok((await box(d).getByText("Delivered").count()) === 1, `${tag} sheet: the row follows`)

  // Popover: Cancel drops the draft, Save keeps it
  demo = await docs(p, "popover")
  d = demo(0)
  const noteBtn = box(d).getByRole("button", { name: "Delivery note" })
  await noteBtn.click()
  let note = p.getByRole("dialog", { name: "Delivery note" })
  await note.getByRole("textbox").fill("Ring twice.")
  await note.getByRole("button", { name: "Cancel" }).click()
  ok((await said(d)) === "Note: Loading dock is round the back.", `${tag} popover: Cancel drops the draft`)
  await noteBtn.click()
  note = p.getByRole("dialog", { name: "Delivery note" })
  ok((await note.getByRole("textbox").inputValue()) === "Loading dock is round the back.", `${tag} popover: reopening starts from the saved note`)
  await note.getByRole("textbox").fill("Ring twice.")
  await note.getByRole("button", { name: "Save note" }).click()
  ok((await said(d)) === "Note: Ring twice.", `${tag} popover: Save keeps it`)

  // Hover card: keyboard focus opens the card
  demo = await docs(p, "hover-card")
  d = demo(0)
  await box(d).getByRole("link", { name: "Vance Refrigeration" }).focus()
  const card = p.locator("[data-slot=hover-card-header]")
  await card.waitFor({ timeout: 3000 }).catch(() => {})
  ok((await card.getByText("C-0187").count()) === 1, `${tag} hover card: focus opens the card`)

  // Tooltip: focus shows the name and shortcut; the button still works
  demo = await docs(p, "tooltip")
  d = demo(0)
  await box(d).getByRole("button", { name: "Email to client" }).focus()
  const tip = p.locator("[data-slot=tooltip]")
  await tip.waitFor({ timeout: 3000 }).catch(() => {})
  ok((await tip.textContent())?.includes("⌘E"), `${tag} tooltip: focus shows the shortcut`)
  await p.keyboard.press("Enter")
  ok((await said(d)) === "Emailed to Lackawanna County.", `${tag} tooltip: the button still works`)

  // Toast: Undo puts the order back in its place; a failed promise retries to done
  demo = await docs(p, "toast")
  d = demo(0)
  await box(d).getByRole("button", { name: "Archive" }).nth(1).click()
  await p.getByRole("button", { name: "Undo" }).click()
  ok((await box(d).getByRole("listitem").nth(1).textContent())?.startsWith("DM-4104"), `${tag} toast: Undo puts the order back in its place`)
  d = demo(1)
  await d.scrollIntoViewIfNeeded()
  await box(d).getByRole("button", { name: "Send to corporate" }).click()
  await p.locator("h2", { hasText: "Corporate didn't pick up" }).waitFor({ state: "attached", timeout: 4000 })
  // a failed toast is high priority: Base UI hides its root from the tree until focused (a live region announces it)
  await p.locator("button", { hasText: "Retry" }).click()
  await p.locator("h2", { hasText: "Report sent to Jan" }).waitFor({ state: "attached", timeout: 4000 })
  ok(true, `${tag} toast: a failed send retries to done`)
  // updated in place (loading → done gains a description), it is re-measured: hovering (the expanded stack, sized
  // from --toast-height) keeps it at full height instead of the title-only loading height, clipping the description
  const sent = p.locator(".kl-toast", { hasText: "Report sent to Jan" })
  await p.waitForTimeout(400)
  const rest = (await sent.boundingBox())?.height ?? 0
  await sent.hover()
  await p.waitForTimeout(500)
  const open = (await sent.boundingBox())?.height ?? 0
  const fits = await sent.locator(".kl-toast-text").evaluate((e) => e.scrollHeight <= e.clientHeight)
  ok(Math.abs(open - rest) < 1 && fits, `${tag} toast: an updated toast keeps its height when the stack expands (${rest} → ${open})`)

  // Notice: Reorder turns it done; dismissing folds it; it comes back
  demo = await docs(p, "notice")
  d = demo(0)
  await box(d).getByRole("button", { name: "Reorder 120 cases" }).click()
  ok((await box(d).getByText("120 cases reordered from the mill").count()) === 1, `${tag} notice: Reorder turns it done`)
  await box(d).getByRole("button", { name: "Dismiss" }).click()
  await box(d).getByRole("button", { name: "Show the warning again" }).click()
  ok((await box(d).getByText("Letter paper is down to 30 cases").isVisible()), `${tag} notice: it comes back`)

  if (width === 1440)
    for (const [n, f] of [["dialog", "dialog-new-client.tsx"], ["toast", "toast-undo.tsx"]]) {
      demo = await docs(p, n)
      await demo(0).scrollIntoViewIfNeeded()
      await copyMatches(p, demo(0), f, "example code")
    }

  ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
  await p.context().close()
}

/* ---------- Layout: shell layouts and sheets, rail, panes, disclosure, carousel ends, inspector, direction ---------- */
for (const [width, reduce] of run("layout") ? [[1440, false], [390, false], [390, true]] : []) {
  const tag = `layout ${width}${reduce ? " reduced-motion" : ""}`
  console.log(tag)
  const p = await page(width, { reduce })
  const box = (d) => d.getByTestId("preview-box")
  const said = (d) => box(d).getByRole("status").last().textContent()
  const focused = (l) => l.evaluate((e) => e === document.activeElement)
  const wide = width > 400

  // App shell: wide keeps the sidebar; narrow puts it in a sheet; an order opens the aside, focus comes back
  let demo = await docs(p, "app-shell")
  let d = demo(0)
  const branch = box(d).getByRole("navigation", { name: "Scranton branch" })
  if (wide) ok(await branch.isVisible(), `${tag} app shell: the sidebar sits beside the page`)
  else {
    ok((await branch.count()) === 0, `${tag} app shell: narrow, the sidebar is a sheet`)
    await box(d).getByRole("button", { name: "Show scranton branch" }).click()
  }
  await p.getByRole("navigation", { name: "Scranton branch" }).getByRole("button", { name: "Clients" }).click()
  ok((await box(d).locator("[aria-current=page]").first().textContent()) === "Clients", `${tag} app shell: the crumb follows the sidebar`)
  if (!wide) {
    await p.getByRole("dialog", { name: "Scranton branch" }).waitFor({ state: "detached", timeout: 3000 }).catch(() => {})
    ok((await p.getByRole("dialog", { name: "Scranton branch" }).count()) === 0, `${tag} app shell: choosing closes the sheet`)
  }
  if (!wide) await box(d).getByRole("button", { name: "Show scranton branch" }).click()
  await p.getByRole("navigation", { name: "Scranton branch" }).getByRole("button", { name: "Orders" }).click()
  const row = box(d).getByRole("button", { name: /Vance Refrigeration/ })
  await row.click()
  const aside = p.getByRole("dialog", { name: "Order" })
  await aside.waitFor({ timeout: 3000 })
  ok((await aside.getByText("DM-4109").count()) === 1, `${tag} app shell: an order opens the aside`)
  await p.keyboard.press("Escape")
  await aside.waitFor({ state: "detached", timeout: 3000 })
  ok(await focused(row), `${tag} app shell: focus returns to the order`)

  // Sidebar: wide, the toggle folds it to a rail and an icon still works; narrow, a sheet
  demo = await docs(p, "sidebar")
  d = demo(0)
  if (wide) {
    await box(d).getByRole("button", { name: "Collapse scranton branch" }).click()
    ok((await box(d).getByRole("button", { name: "Expand scranton branch" }).getAttribute("aria-expanded")) === "false", `${tag} sidebar: the toggle folds it to a rail`)
    await box(d).getByRole("navigation", { name: "Scranton branch" }).getByRole("button", { name: /Clients/ }).click()
  } else {
    await box(d).getByRole("button", { name: "Show scranton branch" }).click()
    await p.getByRole("dialog", { name: "Scranton branch" }).getByRole("button", { name: /Clients/ }).click()
  }
  ok((await said(d)) === "64 active clients.", `${tag} sidebar: an item is chosen ${wide ? "from the rail" : "from the sheet"}`)

  // Panel: the footer action
  demo = await docs(p, "panel")
  d = demo(0)
  await box(d).getByRole("button", { name: "Send to corporate" }).click()
  ok((await said(d)) === "Sent to Jan.", `${tag} panel: the footer action runs`)

  // Resizable: the button collapses the list; the separator moves with the keyboard
  demo = await docs(p, "resizable")
  d = demo(0)
  const sep = box(d).getByRole("separator", { name: "Call list height" })
  const before = Number(await sep.getAttribute("aria-valuenow"))
  await sep.focus()
  await p.keyboard.press("ArrowDown")
  ok(Number(await sep.getAttribute("aria-valuenow")) > before, `${tag} resizable: ArrowDown moves the seam (${before} → ${await sep.getAttribute("aria-valuenow")})`)
  await box(d).getByRole("button", { name: "Hide list" }).click()
  await box(d).getByRole("button", { name: "Show list" }).waitFor({ timeout: 2000 }).catch(() => {})
  ok(Number(await sep.getAttribute("aria-valuenow")) === 0, `${tag} resizable: Hide list collapses it`)
  await box(d).getByRole("button", { name: "Show list" }).click()
  ok(Number(await sep.getAttribute("aria-valuenow")) > 30, `${tag} resizable: Show list brings it back`)

  // Scroll area: the region is named and scrolls from the keyboard
  demo = await docs(p, "scroll-area")
  d = demo(0)
  const region = box(d).getByRole("region", { name: "Today's activity" })
  await region.focus()
  await p.keyboard.press("End")
  await p.waitForTimeout(400)
  ok((await region.evaluate((e) => e.scrollTop)) > 200, `${tag} scroll area: End scrolls the named region`)

  // Accordion: one open; opening another keeps it (multiple); Enter toggles
  demo = await docs(p, "accordion")
  d = demo(0)
  await box(d).getByRole("button", { name: /Delivery/ }).focus()
  await p.keyboard.press("Enter")
  ok((await box(d).getByRole("button", { name: /Returns/ }).getAttribute("aria-expanded")) === "true" && (await box(d).getByRole("button", { name: /Delivery/ }).getAttribute("aria-expanded")) === "true", `${tag} accordion: Enter opens Delivery and Returns stays open`)

  // Collapsible: closed; it opens; its meta counts what's set inside
  demo = await docs(p, "collapsible")
  d = demo(0)
  const opts = box(d).getByRole("button", { name: /Delivery options/ })
  ok((await opts.getAttribute("aria-expanded")) === "false", `${tag} collapsible: closed at first`)
  await opts.click()
  await box(d).getByRole("switch", { name: /Liftgate truck/ }).click()
  ok((await opts.textContent())?.includes("1 set"), `${tag} collapsible: the meta counts the setting`)

  // Carousel: Previous says why at the start; Next moves on; a position cell jumps
  demo = await docs(p, "carousel")
  d = demo(0)
  ok((await box(d).getByRole("button", { name: "Previous slide" }).getAttribute("aria-disabled")) === "true", `${tag} carousel: Previous is out of service at the start`)
  await box(d).getByRole("button", { name: "Next slide" }).click()
  await p.waitForTimeout(500)
  ok((await box(d).getByRole("button", { name: "Go to 2 of 5" }).getAttribute("aria-current")) === "true", `${tag} carousel: Next moves to slide 2`)
  await box(d).getByRole("button", { name: "Go to 5 of 5" }).click()
  await p.waitForTimeout(600)
  ok((await box(d).getByRole("button", { name: "Next slide" }).getAttribute("aria-disabled")) === "true", `${tag} carousel: at the end Next is out of service`)

  // Inspector: releasing a hold; another row; closing
  demo = await docs(p, "inspector")
  d = demo(0)
  await box(d).getByRole("button", { name: "Release the hold" }).click()
  ok((await box(d).getByText("Held", { exact: true }).count()) === 0 && (await box(d).getByRole("button", { name: "Not held" }).isDisabled()), `${tag} inspector: the hold is released`)
  await box(d).getByRole("button", { name: /Lackawanna County/ }).click()
  ok((await box(d).getByRole("complementary", { name: "Order DM-4107" }).count()) === 1, `${tag} inspector: another row is inspected`)
  await box(d).getByRole("button", { name: "Close inspector" }).click()
  ok((await box(d).getByText("Choose an order to inspect it.").count()) === 1, `${tag} inspector: closing says what to do`)

  // Item: a switch in a row, named by its row
  demo = await docs(p, "item")
  d = demo(0)
  const low = box(d).getByRole("switch", { name: "Low paper stock" })
  await low.click()
  ok((await low.getAttribute("aria-checked")) === "true", `${tag} item: a row's switch turns on`)

  // Direction: Arabic mirrors the chevrons; English puts them back
  demo = await docs(p, "direction")
  d = demo(0)
  const sepScale = () => box(d).locator("nav[aria-label] a svg").first().evaluate((e) => getComputedStyle(e).scale)
  ok((await sepScale()) === "-1 1", `${tag} direction: right to left mirrors the chevrons`)
  await box(d).getByText("English · LTR").click()
  ok((await sepScale()) === "none" && (await box(d).locator("[data-slot=direction]").getAttribute("lang")) === "en", `${tag} direction: English, left to right`)

  ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
  await p.context().close()
}

/* ---------- Conversation: retry, reactions, the log's end and jump, uploads, a questionnaire to the end ---------- */
for (const [width, reduce] of run("conversation") ? [[1440, false], [390, false], [390, true]] : []) {
  const tag = `conversation ${width}${reduce ? " reduced-motion" : ""}`
  console.log(tag)
  const p = await page(width, { reduce })
  const box = (d) => d.getByTestId("preview-box")
  const focused = (l) => l.evaluate((e) => e === document.activeElement)

  // Message: a failed message retries to Sent
  let demo = await docs(p, "message")
  let d = demo(0)
  await box(d).getByRole("button", { name: "Retry" }).click()
  ok((await box(d).getByRole("status").textContent()) === "Sending…", `${tag} message: Retry sends`)
  await box(d).getByText("Sent", { exact: true }).waitFor({ timeout: 3000 })
  ok((await box(d).locator("[data-slot=bubble][aria-busy]").count()) === 0, `${tag} message: it lands as Sent`)

  // Bubble: a reaction toggles and says its count
  demo = await docs(p, "bubble")
  d = demo(0)
  await box(d).getByRole("button", { name: /Thumbs up, 4/ }).click()
  ok((await box(d).getByRole("button", { name: "Thumbs up, 5, you reacted" }).getAttribute("aria-pressed")) === "true", `${tag} bubble: the reaction is yours and counts 5`)

  // Message scroller: sending lands at the end; scrolled up, a reply is counted on the jump cell, which goes to it
  demo = await docs(p, "message-scroller")
  d = demo(0)
  const log = box(d).locator(".kl-ms-vp")
  const atEnd = () => log.evaluate((e) => e.scrollHeight - e.clientHeight - e.scrollTop <= 4)
  await box(d).getByRole("textbox", { name: "Message" }).fill("Thanks, Darryl.")
  await box(d).getByRole("button", { name: "Send" }).click()
  await p.waitForTimeout(700)
  ok((await box(d).getByText("Thanks, Darryl.").count()) === 1 && (await atEnd()), `${tag} message scroller: a sent message shows at the end`)
  await log.evaluate((e) => e.scrollTo({ top: 0 }))
  await p.waitForTimeout(300)
  await box(d).getByRole("button", { name: "Darryl replies" }).click()
  const jump = box(d).getByRole("button", { name: /Latest, 1 new message/ })
  await jump.waitFor({ timeout: 3000 }).catch(() => {})
  ok((await jump.count()) === 1 && !(await atEnd()), `${tag} message scroller: scrolled up, the reply is counted and the place holds`)
  await jump.click()
  await p.waitForTimeout(1200)
  ok(await atEnd(), `${tag} message scroller: the jump cell goes to the end`)

  // Attachment: an upload completes; the dock photo fails part way and retries
  demo = await docs(p, "attachment")
  d = demo(0)
  const attach = box(d).getByRole("button", { name: "Attach a file" })
  await attach.click()
  await attach.click()
  const retry = box(d).getByRole("button", { name: "Retry loading-dock.jpg" })
  await retry.waitFor({ timeout: 5000 })
  ok((await box(d).getByText("The connection dropped at 60%.").count()) === 1, `${tag} attachment: a failed upload says why`)
  await retry.click()
  await retry.waitFor({ state: "detached", timeout: 5000 })
  await p.waitForTimeout(2400)
  ok((await box(d).locator("[data-slot=attachment]").evaluateAll((els) => els.every((e) => e.getAttribute("data-state") === "done"))), `${tag} attachment: every file ends done`)
  await box(d).getByRole("button", { name: "Remove invoice-DM-4107.pdf" }).click()
  ok((await box(d).getByRole("listitem").count()) === 2, `${tag} attachment: Remove takes it off`)

  // Questionnaire: Next is blocked; a letter key chooses; Skip; a required name; the answers come back
  demo = await docs(p, "questionnaire")
  d = demo(0)
  const q = box(d).getByRole("form", { name: "Meredith's birthday" })
  await q.getByRole("button", { name: "Next" }).click()
  ok((await q.getByText("Choose a cake to continue.").isVisible()), `${tag} questionnaire: Next without an answer says why`)
  // the radio input covers its row; the letter shortcut chooses it, as a reader would
  await q.getByRole("radio", { name: /Chocolate/ }).focus()
  await p.keyboard.press("b")
  ok(await q.getByRole("radio", { name: /Carrot/ }).isChecked(), `${tag} questionnaire: the B key chooses Carrot`)
  await q.getByRole("button", { name: "Next" }).click()
  ok(await focused(q.getByRole("heading", { name: "Any dietary needs?" })), `${tag} questionnaire: the next question takes focus`)
  await q.getByRole("button", { name: "Skip" }).click()
  await q.getByRole("textbox", { name: "Who's answering?" }).fill("Kevin Malone")
  await q.getByRole("button", { name: "Next" }).click()
  await q.getByRole("button", { name: "Send answers" }).click()
  ok(await q.getByText("Write a note, or Skip.").isVisible(), `${tag} questionnaire: an empty optional step asks for a note or Skip`)
  await q.getByRole("button", { name: "Skip" }).click()
  const thanks = box(d).getByText("Thanks, Angela has it")
  await thanks.waitFor({ timeout: 3000 })
  ok((await box(d).getByText("Kevin Malone").count()) === 1 && (await box(d).getByText("Carrot").count()) === 1 && (await focused(thanks)), `${tag} questionnaire: the answers come back and the heading has focus`)

  ok(p.errors.length === 0, `${tag}: no console errors${p.errors.length ? ": " + p.errors.join(" | ") : ""}`)
  await p.context().close()
}

await browser.close()
console.log(fails ? `\n${fails} failed` : "\nall passed")
process.exit(fails ? 1 : 0)
