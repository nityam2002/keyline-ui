// Accordion (single and multiple), Collapsible, and the reduced-motion transitions of the accordion panel and the
// slider thumb.
import { test, idle, stable } from "./fixtures.mjs"
import { near, box, active, until } from "./lib/probe.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["slider","disclosure"] })

const READY = "#slider .kl-slider"

test("accordion (single): headings, caret column, single mode, panel position, Tab order", async ({ open, ok }) => {
  const p = await open({ ready: READY })
  const acc = p.locator("#disclosure .kl-accordion").first()
  await acc.scrollIntoViewIfNeeded()
  const triggers = acc.locator(".kl-acc-trigger")
  ok("accordion: headers are buttons inside headings, the default item is expanded", (await acc.locator("h3 > button").count()) === 4 && (await triggers.nth(0).getAttribute("aria-expanded")) === "true", null)
  const carets = await acc.locator(".kl-acc-caret").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)))
  ok("accordion: the caret column runs straight (rows with and without meta, long title)", new Set(carets).size === 1, carets)
  await triggers.nth(1).click()
  await until(async () => (await triggers.nth(1).getAttribute("aria-expanded")) === "true" && (await triggers.nth(0).getAttribute("aria-expanded")) === "false")
  await idle(p)
  ok("accordion: single mode: opening Billing closes Customs documents", (await triggers.nth(1).getAttribute("aria-expanded")) === "true" && (await triggers.nth(0).getAttribute("aria-expanded")) === "false", null)
  const body = acc.locator(".kl-acc-item").nth(1).locator(".kl-acc-panel")
  // the panel unfolds (JS-driven height); measure once its box has stopped moving
  await stable(body)
  const pbx = await box(body)
  const hb = await box(triggers.nth(1))
  ok("accordion: the panel unfolds from its header's bottom keyline", near(pbx.y, hb.y + hb.height, 1.5), { pbx, hb })
  await triggers.nth(1).focus()
  await p.keyboard.press("Tab")
  ok("accordion: Tab walks the headers (APG: no roving focus), skipping the disabled one", /very long/.test((await active(p)).text), await active(p))
  ok("accordion: a disabled item cannot be opened", (await triggers.nth(2).getAttribute("aria-disabled")) === "true" || (await triggers.nth(2).isDisabled()), null)
  ok("no page errors", p.errs.length === 0, p.errs)
})

test("accordion (multiple, cell): opening one keeps the other open", async ({ open, ok }) => {
  const p = await open({ ready: READY })
  const inner = p.locator("#disclosure .kl-panel .kl-accordion")
  await inner.scrollIntoViewIfNeeded()
  const it = inner.locator(".kl-acc-trigger")
  ok("accordion (multiple, cell): starts with Weights open; no own border", (await it.nth(0).getAttribute("aria-expanded")) === "true" && (await inner.evaluate((el) => getComputedStyle(el).borderTopWidth)) === "0px", null)
  await it.nth(1).click()
  await until(async () => (await it.nth(1).getAttribute("aria-expanded")) === "true")
  ok("accordion (multiple): opening Lanes keeps Weights open", (await it.nth(0).getAttribute("aria-expanded")) === "true" && (await it.nth(1).getAttribute("aria-expanded")) === "true", null)
  ok("no page errors", p.errs.length === 0, p.errs)
})

test("collapsible: starts closed, Enter opens, the spine sits under the caret box", async ({ open, ok }) => {
  const p = await open({ ready: READY })
  const coll = p.locator("#disclosure .kl-collapsible")
  await coll.scrollIntoViewIfNeeded()
  const ct = coll.locator(".kl-coll-trigger")
  ok("collapsible: starts closed", (await ct.getAttribute("aria-expanded")) === "false", null)
  await ct.focus()
  await p.keyboard.press("Enter")
  await until(async () => (await ct.getAttribute("aria-expanded")) === "true")
  await idle(p)
  const cb = await box(coll.locator(".kl-coll-body"))
  const bx = await box(coll.locator(".kl-coll-box"))
  ok("collapsible: Enter opens; the spine is centred under the caret box", (await ct.getAttribute("aria-expanded")) === "true" && near(cb.x + 1, bx.x + bx.width / 2, 1.5), { cb, bx })
  ok("no page errors", p.errs.length === 0, p.errs)
})

test("reduced motion: accordion panel and slider thumb do not transition", { tag: "@timing" }, async ({ open, ok }) => {
  const q = await open({ q: "motion=reduce", ready: READY })
  const acc = q.locator("#disclosure .kl-accordion").first()
  await acc.scrollIntoViewIfNeeded()
  ok("reduced motion: accordion panel and slider thumb have 0s transitions", (await acc.locator(".kl-acc-panel").first().evaluate((el) => getComputedStyle(el).transitionDuration)).split(",").every((d) => parseFloat(d) === 0) && (await q.locator("#slider .kl-slider-thumb").first().evaluate((el) => getComputedStyle(el).transitionDuration)).split(",").every((d) => parseFloat(d) === 0), null)
  await acc.locator(".kl-acc-trigger").nth(1).click()
  await q.waitForTimeout(60) // timing: the subject is "full height within one frame" (no transition under reduced motion)
  const h = await acc.locator(".kl-acc-item").nth(1).locator(".kl-acc-panel").evaluate((el) => [el.offsetHeight, el.scrollHeight])
  ok("reduced motion: a panel is at full height within one frame", h[0] > 20 && near(h[0], h[1], 1), h)
})
