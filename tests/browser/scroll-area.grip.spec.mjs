// ScrollArea grip: the forgiving press, 1:1 drag, the held thumb, release outside; track presses near both ends
// and mid; content growing and shrinking mid-scroll.
import { test } from "./fixtures.mjs"
import { state, tokens, center, until, frames, ready } from "./lib/scroll-area.mjs"
// the specimen entries these tests use (fixtures.mjs: only)
test.use({ only: ["scroll-area"] })

const noErrors = (ok, p) => ok("no page errors", p.errs.length + p.consoleErrs.length === 0, [...p.errs, ...p.consoleErrs])
const VIEW = { width: 1280, height: 1000, ready: "[data-testid=sa-v]" }

test("scroll area grip: press past the thumb, drag 1:1, hold, leave, release outside, fade", async ({ open, ok }) => {
  const p = await open(VIEW)
  const v = await ready(p, "sa-v")
  const tk = await tokens(p)
  await v.getByRole("region", { name: "Activity" }).evaluate((el) => (el.scrollTop = 0))
  await frames(p)
  let s = await state(v)
  const th = s.bars.vertical.thumb
  const gx = th.x + th.width / 2
  // a press 4px below the thumb takes the thumb where it is (the forgiving grip), it does not jump
  const gy = th.bottom + 4
  await p.mouse.move(gx, gy)
  await p.mouse.down()
  // the held state is shown once the thumb has turned ink at full width; a wrong jump would have happened by then
  await until(v, (ops, root) => { const t = root.querySelector(":scope > [data-orientation=vertical]").firstElementChild; return ops.vertical === 1 && /^(1|none)$/.test(getComputedStyle(t).scale) && !t.getAnimations().some((a) => a.playState === "running") }, 1500)
  let held = await state(v)
  ok("grip: a press 4px past the thumb's end takes the thumb in place (no jump)", held.top === 0, held.top)
  ok("press: the held thumb is ink, full width and visible", held.bars.vertical.bg === tk.ink && held.bars.vertical.op === 1 && (held.bars.vertical.scale === "1" || held.bars.vertical.scale === "none"), held.bars.vertical)
  await p.mouse.move(gx, gy + 30, { steps: 5 })
  await frames(p)
  let dragged = await state(v)
  const moved = dragged.bars.vertical.thumb.y - th.y
  ok("drag: the thumb follows the pointer 1:1 and keeps its grab offset (30px ±1)", Math.abs(moved - 30) <= 1 && dragged.top > 0, { moved, top: dragged.top })
  await p.waitForTimeout(1300) // timing: held still past the ~0.9s idle time — the thumb must not fade
  held = await state(v)
  ok("drag: held still past the idle time, the thumb stays (held is shown)", held.bars.vertical.op === 1, held.bars.vertical.op)
  // leave the area entirely while held, then release outside
  const frame = await p.getByTestId("sa-v-frame").boundingBox()
  await p.mouse.move(frame.x + frame.width + 200, gy + 60, { steps: 6 })
  await frames(p)
  dragged = await state(v)
  ok("drag: outside the area the drag still tracks the pointer (captured)", Math.abs(dragged.bars.vertical.thumb.y - th.y - 60) <= 1.5, dragged.bars.vertical.thumb.y - th.y)
  await p.mouse.up()
  await p.mouse.move(frame.x + frame.width + 220, gy + 80)
  const releasedTop = (await state(v)).top
  await p.mouse.move(frame.x + 40, frame.y + 40, { steps: 4 })
  await p.mouse.move(frame.x + 80, frame.y + 100, { steps: 4 })
  const after = await state(v)
  ok("release outside: the drag ends cleanly (moving over the area afterwards does not scroll it)", after.top === releasedTop, { releasedTop, after: after.top })
  await p.waitForTimeout(1500) // timing: the usual hold-then-fade after the release
  ok("release outside: the thumb then fades as usual", (await state(v)).bars.vertical.op === 0)
  noErrors(ok, p)
})

test("scroll area grip: track presses near the end, near the start and mid; a track press keeps dragging", async ({ open, ok }) => {
  // Where the area sits on the page must not matter: it is measured where the filtered specimen puts it and again
  // shifted by fractional offsets. (The thumb once landed 2px short of the pointer, Base UI subtracting both ends'
  // padding, and WebKit's whole-pixel clientY made it 3.05px at some positions: the bar now has no travel-axis padding.)
  const p = await open(VIEW)
  const v = await ready(p, "sa-v")
  const s = await state(v)
  const tb = s.bars.vertical.bar
  const [cx, cy] = center(s.vpRect)
  await p.mouse.move(tb.x + 6, tb.bottom - 4)
  await p.mouse.down()
  await until(v, (ops, root) => { const vp = root.firstElementChild; return Math.abs(vp.scrollTop - (vp.scrollHeight - vp.clientHeight)) <= 1 }, 1000)
  await frames(p)
  let tp = await state(v)
  ok("track near the end: the thumb lands at the end (the region at its last row)", Math.abs(tp.top - tp.maxTop) <= 1, { top: tp.top, max: tp.maxTop })
  await p.mouse.move(tb.x + 6, tb.bottom - 44, { steps: 4 })
  await frames(p)
  const tp2 = await state(v)
  ok("track press keeps dragging: moving up 40px moves the thumb with it", tp2.top < tp.top && Math.abs(tp2.bars.vertical.thumb.y - tp.bars.vertical.thumb.y + 40) <= 1.5, { from: tp.bars.vertical.thumb.y, to: tp2.bars.vertical.thumb.y })
  await p.mouse.up()
  await p.mouse.move(tb.x + 6, tb.y + 4)
  await p.mouse.down()
  await until(v, (ops, root) => root.firstElementChild.scrollTop <= 1, 1000)
  await frames(p)
  tp = await state(v)
  ok("track near the start: the thumb lands at the start", tp.top <= 1, tp.top)
  await p.mouse.up()
  // the reference is where the browser says the press was (WebKit reports whole pixels), so the only slack left is
  // the viewport's scroll granularity, scaled down by the track
  const misses = []
  for (const shift of [0, 0.25, 0.5, 0.75]) {
    await v.evaluate((root, y) => { root.style.top = `${y}px`; root.firstElementChild.scrollTop = 0 }, shift)
    await frames(p)
    const bar = (await state(v)).bars.vertical.bar
    const mid = bar.y + bar.height * 0.6
    const pressAt = v.evaluate((root) => new Promise((res) => root.addEventListener("pointerdown", (e) => res(e.clientY), { once: true, capture: true })))
    await p.mouse.move(bar.x + 6, mid)
    await p.mouse.down()
    const y = await pressAt
    await until(v, (ops, root) => root.firstElementChild.scrollTop > 1, 1000)
    await frames(p)
    const [, tcy] = center((await state(v)).bars.vertical.thumb)
    misses.push({ shift, miss: +(tcy - y).toFixed(2) })
    await p.mouse.up()
  }
  await v.evaluate((root) => (root.style.top = ""))
  ok("track mid: the thumb's centre lands under the pointer at every sub-pixel position (±1px)", misses.every((m) => Math.abs(m.miss) <= 1), misses)
  await p.mouse.move(cx - 200, cy)
  noErrors(ok, p)
})

test("scroll area: content growing and shrinking mid-scroll keeps the thumb accurate and the place", async ({ open, ok }) => {
  const p = await open(VIEW)
  const v = await ready(p, "sa-v")
  const [cx, cy] = center((await state(v)).vpRect)
  await p.mouse.move(cx - 100, cy)
  await p.mouse.wheel(0, 80)
  await until(v, (ops, root) => root.firstElementChild.scrollTop > 0, 1000)
  await frames(p)
  const g0 = await state(v)
  await p.getByTestId("sa-grow").evaluate((el) => el.click())
  await p.waitForFunction((h) => document.querySelector("[data-testid=sa-v] > [data-orientation=vertical]").firstElementChild.getBoundingClientRect().height < h, g0.bars.vertical.thumb.height, { timeout: 3000, polling: "raf" }).catch(() => {})
  await frames(p)
  const g1 = await state(v)
  const want = (st) => {
    const b = st.bars.vertical.bar
    const track = b.height - 4
    const size = Math.max(16, (track * st.vpRect.height) / (st.maxTop + st.vpRect.height))
    const pos = b.y + 2 + (st.top / st.maxTop) * (track - size)
    return { size, pos }
  }
  const w1 = want(g1)
  ok("content grows mid-scroll: the thumb shrinks and sits where the scroll position says (±1.5px)", g1.bars.vertical.thumb.height < g0.bars.vertical.thumb.height && Math.abs(g1.bars.vertical.thumb.y - w1.pos) <= 1.5 && Math.abs(g1.bars.vertical.thumb.height - w1.size) <= 1.5, { thumb: g1.bars.vertical.thumb, w1 })
  ok("content grows mid-scroll: the reader's place is kept (no scroll)", g1.top === g0.top, { before: g0.top, after: g1.top })
  await p.getByTestId("sa-shrink").evaluate((el) => el.click())
  await p.waitForFunction((h) => document.querySelector("[data-testid=sa-v] > [data-orientation=vertical]").firstElementChild.getBoundingClientRect().height > h, g1.bars.vertical.thumb.height, { timeout: 3000, polling: "raf" }).catch(() => {})
  await frames(p)
  const g2 = await state(v)
  const w2 = want(g2)
  ok("content shrinks: the thumb grows back and stays accurate", g2.bars.vertical.thumb.height > g1.bars.vertical.thumb.height && Math.abs(g2.bars.vertical.thumb.height - w2.size) <= 1.5 && Math.abs(g2.bars.vertical.thumb.y - w2.pos) <= 1.5, { thumb: g2.bars.vertical.thumb, w2 })
  noErrors(ok, p)
})
