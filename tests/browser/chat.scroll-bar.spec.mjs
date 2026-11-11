// The shared ScrollArea bar inside the MessageScroller: semantics kept, reveal on reading, arrivals re-measure
// without revealing, the jump and the reveal as one response, a press stopping a jump, a drag while messages
// arrive, and the one focus ring.
import { test } from "./fixtures.mjs"
import { state, sample, until as barUntil, frames } from "./lib/scroll-area.mjs"
import { scrollStill, until } from "./lib/chat.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["chat"] })

const VIEW = { width: 1280, height: 1000, ready: "[data-testid=ms-frame]" }
const chatErrors = (ok, p) => ok("chat: no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs])

async function setup(p) {
  const frame = p.getByTestId("ms-frame")
  await frame.scrollIntoViewIfNeeded()
  const sc = frame.locator("[data-slot=message-scroller-scroll]")
  const log = frame.getByRole("region", { name: "Conversation with Tomasz Wolak" })
  await log.waitFor()
  const geo = () => log.evaluate((v) => ({ top: Math.round(v.scrollTop), gap: Math.round(v.scrollHeight - v.clientHeight - v.scrollTop) }))
  // opened on the newest message, the platform probe run, the thumb at rest
  await until(p, () => { const v = document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-viewport]") ?? document.querySelector("[data-testid=ms-frame] .kl-ms-vp"); return v && v.scrollHeight - v.clientHeight - v.scrollTop <= 2 })
  await barUntil(sc, (ops, root) => !!root.dataset.klReveal && ops.vertical === 0, 3000)
  await scrollStill(log)
  const fb = await frame.boundingBox()
  // read history by wheel, the way a reader does
  const wheelUp = async (n, dy, gapMs) => {
    await p.mouse.move(fb.x + 200, fb.y + 200)
    for (let i = 0; i < n; i++) {
      await p.mouse.wheel(0, dy)
      await p.waitForTimeout(gapMs) // timing: kept, wheel ticks spaced like a reader's
    }
  }
  return { frame, sc, log, geo, fb, wheelUp }
}

test("chat bar: semantics kept, reveal on reading, arrivals and prepends re-measure without revealing", async ({ open, ok }) => {
  const p = await open(VIEW)
  const { frame, sc, log, geo, wheelUp } = await setup(p)
  let s = await state(sc)
  ok("chat: the log keeps its semantics (region + name, a tab stop, a role=log list) inside the shared scroll area", (await log.getAttribute("tabindex")) === "0" && (await frame.getByRole("log").count()) === 1 && s.reveal === "scroll", s.reveal)
  ok("chat: the shared bar is a cell on the frame's edge, its thumb hidden at rest", s.bars.vertical.bar.width === 12 && s.bars.vertical.op === 0 && Math.abs(s.bars.vertical.bar.right - s.vpRect.right) < 0.6, s.bars.vertical)
  await wheelUp(4, -150, 60)
  s = await state(sc)
  ok("chat: reading history by wheel reveals the thumb", s.bars.vertical.op === 1, s.bars.vertical.op)
  await until(p, () => document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-button]")?.dataset.active === "true", null, 2000)
  const left = await frame.locator("[data-slot=message-scroller-button]").evaluate((j) => ({ active: j.dataset.active, label: j.getAttribute("aria-label") }))
  ok("chat: leaving the end by scrolling offers Latest and counts nothing (everything there was seen)", left.active === "true" && !left.label, left)
  // the thumb has faded (so an arrival revealing it would show)
  await barUntil(sc, (ops) => ops.vertical === 0, 4000)
  await scrollStill(log)
  const g0 = await geo()
  const t0 = (await state(sc)).bars.vertical.thumb
  const n0 = await frame.locator("[data-slot=bubble]").count()
  await p.getByTestId("ms-incoming").evaluate((el) => el.click())
  await until(p, (n) => document.querySelectorAll("[data-testid=ms-frame] [data-slot=bubble]").length > n, n0, 3000)
  await scrollStill(log)
  await p.waitForTimeout(250) // timing: "without revealing" — a reveal would start within this window
  const g1 = await geo()
  s = await state(sc)
  ok("chat: a message arriving while reading history holds the reader's place", g1.top === g0.top && g1.gap > g0.gap, { g0, g1 })
  ok("chat: the thumb re-measures (shorter) without revealing: an arrival is not the reader's scroll", s.bars.vertical.thumb.height < t0.height && s.bars.vertical.op === 0, { before: t0.height, after: s.bars.vertical.thumb.height, op: s.bars.vertical.op })
  await p.getByTestId("ms-earlier").evaluate((el) => el.click())
  await frame.locator('[data-msg="e1"]').waitFor({ state: "attached" })
  await scrollStill(log)
  await frames(p)
  const g2 = await geo()
  s = await state(sc)
  const w = (() => { const b = s.bars.vertical.bar; const track = b.height - 4; const size = Math.max(16, (track * s.vpRect.height) / (s.maxTop + s.vpRect.height)); return { size, pos: b.y + 2 + (s.top / s.maxTop) * (track - size) } })()
  ok("chat: older messages prepended: the line holds (scroll moves by what was added) and the thumb is where the position says", g2.top > g1.top && Math.abs(s.bars.vertical.thumb.y - w.pos) <= 1.5 && Math.abs(s.bars.vertical.thumb.height - w.size) <= 1.5, { g2, thumb: s.bars.vertical.thumb, w })
  chatErrors(ok, p)
})

test("chat bar: the jump reveals the thumb as it starts, lands, then the bar fades", { tag: "@timing" }, async ({ open, ok }) => {
  const p = await open(VIEW)
  const { frame, sc, geo, wheelUp } = await setup(p)
  await wheelUp(4, -150, 60)
  await barUntil(sc, (ops) => ops.vertical === 0, 4000)
  const jump = frame.getByRole("button", { name: /Latest/ })
  await jump.click()
  const js = await sample(sc, 260) // timing: the reveal's start relative to the jump is measured
  const area1 = await sc.evaluate((r) => r.hasAttribute("data-kl-travel"))
  ok("jump: the thumb reveals as the jump starts (within 120ms) and travels with it", js.find(([, o]) => o > 0)?.[0] <= 120 && js.at(-1)[1] === 1, js.slice(0, 6))
  await p.waitForTimeout(1200) // timing: landed, and the usual idle has begun the fade
  const g3 = await geo()
  const after = await state(sc)
  ok("jump: it lands at the newest message and then the bar fades with the usual idle", g3.gap <= 2 && !(await sc.evaluate((r) => r.hasAttribute("data-kl-travel"))) && after.bars.vertical.op < 1, { g3, travelDuring: area1, op: after.bars.vertical.op })
  chatErrors(ok, p)
})

test("chat bar: pressing the bar stops a jump in flight", async ({ open, ok }) => {
  const p = await open(VIEW)
  const { frame, sc, log, geo, fb } = await setup(p)
  const jump = frame.getByRole("button", { name: /Latest/ })
  await p.mouse.move(fb.x + 200, fb.y + 200)
  for (let i = 0; i < 10 && (await geo()).top > 0; i++) {
    await p.mouse.wheel(0, -800)
    await p.waitForTimeout(60) // timing: kept, wheel ticks spaced like a reader's
  }
  await scrollStill(log)
  // the press must land while the jump is in flight: the page watches the jump start (the log has moved) and, on
  // that frame, hands the thumb's position to the test through a binding, which presses there at once
  let pressed
  const done = new Promise((r) => (pressed = r))
  await p.exposeBinding("__klPressBar", async (_, x, y) => {
    await p.mouse.move(x, y)
    await p.mouse.down()
    pressed()
  })
  const watch = sc.evaluate(
    (root) =>
      new Promise((res) => {
        const vp = root.querySelector("[data-slot=message-scroller-viewport]") ?? root.firstElementChild
        const top0 = vp.scrollTop
        const t0 = performance.now()
        const f = () => {
          if (vp.scrollTop > top0 + 1 || performance.now() - t0 > 3000) {
            const t = root.querySelector(":scope > [data-orientation=vertical]").firstElementChild.getBoundingClientRect()
            window.__klPressBar(t.x + 3, t.y + t.height / 2)
            return res(vp.scrollTop - top0)
          }
          requestAnimationFrame(f)
        }
        f()
      }),
  )
  await jump.click()
  await watch
  await done
  const bb = (await state(sc)).bars.vertical.bar
  // the press lands the thumb under the pointer (a track press) or takes it (a thumb press); either way the
  // jump is over: from then on the content moves only with the pointer, which is still
  await p.waitForTimeout(100) // timing: let the press take effect before the position is noted
  const stopAt = (await geo()).top
  await p.waitForTimeout(600) // timing: "nothing moves while the pointer is still" — watched for 600ms
  const stopped = await geo()
  ok("jump: pressing the bar stops a jump in flight (the reader took over; nothing moves while the pointer is still)", Math.abs(stopped.top - stopAt) <= 1 && stopped.gap > 50, { stopAt, stopped, bar: bb })
  await p.mouse.up()
  chatErrors(ok, p)
})

test("chat bar: a drag while messages arrive keeps the reader in control", async ({ open, ok }) => {
  const p = await open(VIEW)
  const { frame, sc, log, geo } = await setup(p)
  // a fresh log opens at the end already (asserted in chat.scroller)
  const bb = (await state(sc)).bars.vertical.bar
  const th = (await state(sc)).bars.vertical.thumb
  const gx = th.x + th.width / 2
  const gy = th.y + th.height / 2
  await p.mouse.move(gx, gy)
  await p.mouse.down()
  await barUntil(sc, (ops) => ops.vertical === 1, 1000)
  const d0 = await geo()
  const n0 = await frame.locator("[data-slot=bubble]").count()
  await p.getByTestId("ms-three").evaluate((el) => el.click())
  await until(p, (n) => document.querySelectorAll("[data-testid=ms-frame] [data-slot=bubble]").length === n + 3, n0, 4000)
  await scrollStill(log)
  const d1 = await geo()
  ok("drag + arrival: holding the thumb at the end, a new message does not move the content under it", d1.top === d0.top && d1.gap > 20, { d0, d1 })
  const jl = await frame.locator("[data-slot=message-scroller-button]").evaluate((j) => { const vp = j.closest("[data-slot=message-scroller]").querySelector("[data-slot=message-scroller-viewport]"); return { active: j.dataset.active, label: j.getAttribute("aria-label"), text: j.textContent, bottom: Math.round(vp.getBoundingClientRect().bottom), tops: [...vp.querySelectorAll("[data-slot=bubble]")].slice(-3).map((b) => [Math.round(b.getBoundingClientRect().top), b.textContent.slice(0, 20)]) } })
  // the arrivals the reader cannot see yet (their top below the fold) are counted; one whose top shows is not "new"
  const unseen = jl.tops.filter(([t]) => t > jl.bottom - 8).length
  ok("drag + arrival: Latest is offered and counts the messages that arrived below the held thumb's view", jl.active === "true" && unseen > 0 && new RegExp(`${unseen} new`).test(jl.label || ""), { unseen, ...jl })
  const t1 = (await state(sc)).bars.vertical.thumb
  await p.mouse.move(gx, gy - 40, { steps: 5 })
  await frames(p)
  const d2 = await geo()
  const t2 = (await state(sc)).bars.vertical.thumb
  ok("drag + arrival: the next 40px of drag moves the thumb 40px, continuously (no jump)", Math.abs(t2.y - t1.y + 40) <= 1.5 && d2.top < d1.top, { t1: t1.y, t2: t2.y, d1, d2 })
  await p.mouse.move(gx, bb.bottom + 80, { steps: 6 })
  await p.mouse.up()
  await scrollStill(log)
  const d3 = await geo()
  const n1 = await frame.locator("[data-slot=bubble]").count()
  await p.getByTestId("ms-incoming").evaluate((el) => el.click())
  await until(p, (n) => document.querySelectorAll("[data-testid=ms-frame] [data-slot=bubble]").length > n, n1, 3000)
  await until(p, () => { const v = document.querySelector("[data-testid=ms-frame] [data-slot=message-scroller-viewport]"); return v.scrollHeight - v.clientHeight - v.scrollTop <= 2 }, null, 2000)
  await scrollStill(log)
  const d4 = await geo()
  ok("drag + arrival: released at the end, the log follows the newest again", d3.gap <= 2 && d4.gap <= 2, { d3, d4 })
  chatErrors(ok, p)
})

test("chat bar: keyboard focus on the log draws one ring, above the bar", async ({ open, ok }) => {
  const p = await open(VIEW)
  const { sc, log } = await setup(p)
  await log.focus()
  await p.keyboard.press("ArrowUp")
  await frames(p)
  const ring = await sc.evaluate((r) => { const a = getComputedStyle(r, "::after"); return { style: a.outlineStyle, z: a.zIndex, own: getComputedStyle(r.firstElementChild).outlineStyle } })
  ok("chat: keyboard focus on the log draws one ring, the scroll area's, above the bar", ring.style === "solid" && +ring.z > 1 && ring.own === "none", ring)
  chatErrors(ok, p)
})
