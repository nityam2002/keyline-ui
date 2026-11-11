// Skeleton: a busy group with one status, aria-hidden placeholders, the running segment, content replacing it,
// the control skeleton's height; reduced motion turns the running segment off.
import { test } from "./fixtures.mjs"
import { near, css, until } from "./lib/probe.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["participants","skeleton"] })

const READY = "#participants form"

test("skeleton: busy group, hidden placeholders, running segment, content swap", async ({ open, ok }) => {
  const p = await open({ ready: READY })
  const sec = p.locator("#skeleton")
  await sec.scrollIntoViewIfNeeded()
  const g = sec.getByTestId("specimen-skel")
  ok("skeleton: the group is busy and says what is loading once", (await g.getAttribute("aria-busy")) === "true" && (await g.getByRole("status").textContent()) === "Loading the carrier summary", null)
  const sk = sec.locator(".kl-skeleton")
  ok("skeleton: every placeholder is aria-hidden", (await sec.locator('[data-slot="skeleton"]:not([aria-hidden="true"])').count()) === 0 && (await sk.count()) > 4, await sk.count())
  ok("skeleton: the running segment animates", (await css(sk.first(), "animation-name", "::after")).startsWith("kl-run"), await css(sk.first(), "animation-name", "::after"))
  const ctl = sec.locator('.kl-skeleton[data-shape="control"]')
  const ctlH = (await ctl.boundingBox()).height
  await sec.getByRole("button", { name: "Show content" }).click()
  await until(async () => (await g.getAttribute("aria-busy")) === null && (await sec.getByText("94.2").isVisible()))
  ok("skeleton: content replaces it, the group is no longer busy and the status clears", (await g.getAttribute("aria-busy")) === null && (await g.getByRole("status").textContent()) === "" && (await sec.getByText("94.2").isVisible()), null)
  const trig = sec.locator('[data-slot="select-trigger"]')
  ok("skeleton: the control skeleton is the control's height", near((await trig.boundingBox()).height, ctlH, 1.5), [ctlH, (await trig.boundingBox()).height])
  ok("specimen: no page errors", p.errs.length === 0, p.errs)
})

test("reduced motion: the skeleton's running segment is off (rtl)", async ({ open, ok }) => {
  const q = await open({ q: "dir=rtl&motion=reduce", ready: READY })
  const sk = q.locator("#skeleton .kl-skeleton").first()
  ok("reduced motion: the skeleton's running segment is off", (await css(sk, "display", "::after")) === "none", await css(sk, "display", "::after"))
})
