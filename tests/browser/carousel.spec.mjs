// Carousel (embla): region and slide semantics, inert slides, prev/next, arrows, ticks, two-up, RTL, reduced motion.
import { test, stable } from "./fixtures.mjs"
import { until } from "./lib/chat.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["carousel","chat"] })

const VIEW = { width: 1280, height: 1000 }
const noErrors = (ok, p) => ok("no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs])

/** Waits for a carousel to show `n / N` and for its slides to stop moving. */
async function landed(p, id, text) {
  await until(p, ([id, text]) => document.querySelector(`[data-testid=${id}] .kl-carousel-n`)?.innerText === text, [id, text])
  await stable(p.getByTestId(id).locator("[aria-roledescription=slide]").first(), 4).catch(() => {})
}

test("carousel: one-up semantics, prev/next, arrows, ticks and the tab order", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=cr-one]" })
  const one = p.getByTestId("cr-one")
  await one.scrollIntoViewIfNeeded()
  const slides = one.locator("[aria-roledescription=slide]")
  await stable(slides.first()).catch(() => {})
  const labels = await slides.evaluateAll((s) => s.map((x) => x.getAttribute("aria-label")))
  ok("carousel: a named region with carousel roledescription; slides are groups named n of N", (await one.evaluate((e) => e.tagName === "SECTION" && e.getAttribute("aria-roledescription") === "carousel" && e.getAttribute("aria-label"))) === "Trailers at dock 4" && labels.join("|") === "1 of 5|2 of 5|3 of 5|4 of 5|5 of 5" && (await slides.first().getAttribute("role")) === "group", labels)
  const inert = () => slides.evaluateAll((s) => s.map((x) => (x.inert ? 0 : 1)).join(""))
  ok("carousel: only the slide in view is reachable (the rest inert)", (await inert()) === "10000", await inert())
  const prev = one.getByRole("button", { name: "Previous slide" })
  const next = one.getByRole("button", { name: "Next slide" })
  ok("carousel: at the start Previous is out of service but stays focusable", (await prev.getAttribute("aria-disabled")) === "true" && (await prev.getAttribute("tabindex")) !== "-1")
  const pos = () => one.locator(".kl-carousel-n").innerText()
  await next.click()
  await landed(p, "cr-one", "2 / 5")
  await until(p, () => [...document.querySelectorAll("[data-testid=cr-one] [aria-roledescription=slide]")].map((x) => (x.inert ? 0 : 1)).join("") === "01000")
  ok("carousel: Next moves one slide; position reads 2 / 5 and the second tick is current", (await pos()) === "2 / 5" && (await one.locator(".kl-carousel-tick[aria-current]").getAttribute("aria-label")) === "Go to 2 of 5" && (await inert()) === "01000", [await pos(), await inert()])
  await p.waitForFunction(() => document.querySelector("[data-testid=cr-one] [aria-live=polite]")?.textContent, null, { timeout: 3000 }).catch(() => {})
  ok("carousel: the move is announced politely once it settles", (await one.locator("[aria-live=polite]").innerText()) === "Slide 2 of 5", await one.locator("[aria-live=polite]").innerText())
  await next.focus()
  await p.keyboard.press("ArrowRight")
  await landed(p, "cr-one", "3 / 5")
  ok("carousel: ArrowRight on the region steps forward", (await pos()) === "3 / 5", await pos())
  await p.keyboard.press("ArrowLeft")
  await landed(p, "cr-one", "2 / 5")
  ok("carousel: ArrowLeft steps back", (await pos()) === "2 / 5", await pos())
  await one.getByRole("button", { name: "Go to 5 of 5" }).click()
  await landed(p, "cr-one", "5 / 5")
  await until(p, () => [...document.querySelectorAll("[data-testid=cr-one] [aria-roledescription=slide]")].map((x) => (x.inert ? 0 : 1)).join("") === "00001")
  ok("carousel: a tick jumps to its slide; at the end Next is out of service", (await pos()) === "5 / 5" && (await next.getAttribute("aria-disabled")) === "true" && (await inert()) === "00001", [await pos(), await inert()])
  // Tab reaches the visible slide's link, never a hidden one
  await one.getByRole("button", { name: "Go to 1 of 5" }).click()
  await landed(p, "cr-one", "1 / 5")
  await until(p, () => [...document.querySelectorAll("[data-testid=cr-one] [aria-roledescription=slide]")].map((x) => (x.inert ? 0 : 1)).join("") === "10000")
  const links = await one.evaluate((e) => [...e.querySelectorAll("a")].filter((a) => !a.closest("[inert]")).length)
  ok("carousel: links in hidden slides are out of the tab order", links === 1, links)
  noErrors(ok, p)
})

test("carousel: two-up shows two slides with a shared seam", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=cr-two]" })
  const two = p.getByTestId("cr-two")
  await two.scrollIntoViewIfNeeded()
  const tslides = two.locator("[aria-roledescription=slide]")
  await stable(tslides.nth(1)).catch(() => {})
  ok("carousel two-up: two slides in view, four positions", (await tslides.evaluateAll((s) => s.filter((x) => !x.inert).length)) === 2 && (await two.locator(".kl-carousel-n").innerText()) === "1 / 4")
  const seam = await tslides.nth(1).evaluate((x) => [getComputedStyle(x).borderInlineStartWidth, getComputedStyle(x).borderInlineStartStyle])
  ok("carousel two-up: neighbours share a 1px seam", seam.join(" ") === "1px solid", seam)
  noErrors(ok, p)
})

test("carousel: RTL steps forward with ArrowLeft, from the left", async ({ open, ok }) => {
  const p = await open({ ...VIEW, ready: "[data-testid=cr-rtl]" })
  const rtl = p.getByTestId("cr-rtl")
  await rtl.scrollIntoViewIfNeeded()
  const rs = rtl.locator("[aria-roledescription=slide]")
  await stable(rs.nth(1)).catch(() => {})
  const [x0, x1] = [await rs.nth(0).boundingBox(), await rs.nth(1).boundingBox()]
  ok("carousel RTL: the second slide waits at the inline end (left)", x1.x < x0.x, [x0.x, x1.x])
  await rtl.getByRole("button", { name: "Next slide" }).focus()
  await p.keyboard.press("ArrowLeft")
  await landed(p, "cr-rtl", "2 / 5")
  await stable(rs.nth(1), 4).catch(() => {})
  const rpos = await rtl.locator(".kl-carousel-n").innerText()
  const rb = await rs.nth(1).boundingBox()
  const vb = await rtl.locator(".kl-carousel-vp").boundingBox()
  ok("carousel RTL: ArrowLeft steps forward and the next slide comes in from the left", rpos === "2 / 5" && Math.abs(rb.x - vb.x) < 2, { rpos, rb: rb.x, vb: vb.x })
  ok("carousel RTL: the count stays 2 / 5 (isolated ltr)", (await rtl.locator(".kl-carousel-n").getAttribute("dir")) === "ltr")
  noErrors(ok, p)
})

test("carousel: reduced motion lands a step at once", async ({ open, ok }) => {
  const q = await open({ ...VIEW, q: "motion=reduce" })
  const one = q.getByTestId("cr-one")
  await one.waitFor()
  await one.scrollIntoViewIfNeeded()
  await stable(one.locator("[aria-roledescription=slide]").first()).catch(() => {})
  await one.getByRole("button", { name: "Next slide" }).click()
  await q.waitForTimeout(60) // timing: "at once" — the slide must be in place 60ms after the click
  const [sb, vb] = [await one.locator("[aria-roledescription=slide]").nth(1).boundingBox(), await one.locator(".kl-carousel-vp").boundingBox()]
  ok("carousel: reduced motion: a step lands at once", Math.abs(sb.x - vb.x) < 1, [sb.x, vb.x])
})
