import { test } from "node:test"
import assert from "node:assert/strict"
import { land, chainsOf, splineFlat, createTracer, INTERVAL, KEY_LEVEL } from "../site/lib/contours.ts"
import { createTerrain, MAX_STRAIN, HARD_LIMIT, MAX_REACH, MAX_SPEED, HILL, type Box } from "../site/lib/terrain.ts"
import { flatten, crossings } from "./geometry.ts"
import { defined } from "./defined.ts"

const DT = 1 / 60
const out = new Float64Array(2)
/** the displacement last written into out */
const disp = (): [number, number] => [defined(out[0]), defined(out[1])]
// probes across the sheet: the open right, below the table, left of it, behind the heading
const PROBES = [[1200, 350], [1300, 120], [800, 520], [200, 330], [650, -20]] as const
const at = (t: ReturnType<typeof createTerrain>) =>
  PROBES.map(([x, y]) => {
    t.displace(x, y, out)
    return disp()
  })

test("the field starts at rest: the first frame is the server's drawing", () => {
  const t = createTerrain()
  t.step(0)
  for (const [dx, dy] of at(t)) assert.equal(Math.hypot(dx, dy), 0)
})

/** the open land a hero shows, as points on a grid: the slice in view less what covers it */
function openLand(view: Box, covered: Box[]) {
  const pts: [number, number][] = []
  for (let x = view.x0 + 20; x < view.x1; x += 40)
    for (let y = view.y0 + 20; y < view.y1; y += 40) if (!covered.some((c) => x > c.x0 && x < c.x1 && y > c.y0 && y < c.y1)) pts.push([x, y])
  return pts
}
// the wide hero (1440 × 800) and a phone's (390 × 844), in sheet units, measured from the page
const WIDE = { view: { x0: 0, y0: -27, x1: 1400, y1: 527 }, covered: [{ x0: 41, y0: -6, x1: 1003, y1: 103 }, { x0: 143, y0: 137, x1: 1037, y1: 174 }, { x0: 143, y0: 216, x1: 984, y1: 470 }] }
const PHONE = { view: { x0: 448, y0: -100, x1: 952, y1: 600 }, covered: [{ x0: 480, y0: -30, x1: 840, y1: 130 }, { x0: 465, y0: 165, x1: 950, y1: 255 }, { x0: 465, y0: 270, x1: 900, y1: 560 }] }
/** the fastest-moving point of open land, each frame */
function watch(t: ReturnType<typeof createTerrain>, pts: [number, number][]) {
  const prev = pts.map(([x, y]) => {
    t.displace(x, y, out)
    return disp()
  })
  return () => {
    let fast = 0, far = 0
    pts.forEach(([x, y], k) => {
      t.displace(x, y, out)
      const [dx, dy] = disp(), [px, py] = defined(prev[k])
      fast = Math.max(fast, Math.hypot(dx - px, dy - py) / DT)
      far = Math.max(far, Math.hypot(dx, dy))
      prev[k] = [dx, dy]
    })
    return { fast, far }
  }
}

test("over ten minutes it stays within its bounds, moves smoothly, and is never still", () => {
  const t = createTerrain()
  t.frame(WIDE.view, WIDE.covered)
  const seen = watch(t, openLand(WIDE.view, WIDE.covered))
  let prev = at(t), prevV = prev.map((): [number, number] => [0, 0])
  let maxV = 0, maxA = 0, worstStrain = 0, worstProven = 0, worstReach = 0, slowest = Infinity, heading = 0
  for (let i = 1; i <= 60 * 600; i++) {
    t.step(DT)
    const now = at(t)
    now.forEach((p, k) => {
      const [px, py] = defined(prev[k]), [pvx, pvy] = defined(prevV[k])
      const v: [number, number] = [(p[0] - px) / DT, (p[1] - py) / DT]
      maxV = Math.max(maxV, Math.hypot(v[0], v[1]))
      if (i > 1) maxA = Math.max(maxA, Math.hypot(v[0] - pvx, v[1] - pvy) / DT)
      prevV[k] = v
    })
    prev = now
    heading = Math.max(heading, Math.hypot(...defined(now[4])))
    const { fast } = seen()
    if (i > 60) slowest = Math.min(slowest, fast)
    if (i % 30 === 0) {
      const b = t.bounds()
      worstStrain = Math.max(worstStrain, b.strain)
      worstProven = Math.max(worstProven, b.proven)
      worstReach = Math.max(worstReach, b.reach)
    }
  }
  assert.ok(worstStrain <= MAX_STRAIN + 1e-9, `measured strain ${worstStrain}`)
  assert.ok(worstProven <= HARD_LIMIT + 1e-9, `proven strain ${worstProven}: the map stays one-to-one`)
  assert.ok(worstReach <= MAX_REACH + 1e-9, `reach ${worstReach}`)
  assert.ok(maxV < 3 * MAX_SPEED, `fastest point ${maxV.toFixed(1)} units/s`)
  assert.ok(maxA < 40, `sharpest acceleration ${maxA.toFixed(1)} units/s²: nothing starts or turns suddenly`)
  // a bend is always forming or relaxing somewhere in view: past the first second, never a still frame
  assert.ok(slowest > 0.8, `the open land in view never slows below ${slowest.toFixed(2)} units/s`)
  assert.ok(heading < 8, `behind the heading the land barely breathes (${heading.toFixed(1)})`)
})

test("on a phone, whose slice misses the wide hero's open land, the bends come into view and never stop", () => {
  const t = createTerrain()
  t.frame(PHONE.view, PHONE.covered)
  const seen = watch(t, openLand(PHONE.view, PHONE.covered))
  let slowest = Infinity, far = 0
  for (let i = 1; i <= 60 * 180; i++) {
    t.step(DT)
    const s = seen()
    if (i > 60) slowest = Math.min(slowest, s.fast)
    far = Math.max(far, s.far)
  }
  assert.ok(slowest > 0.8, `slowest ${slowest.toFixed(2)} units/s`)
  assert.ok(far > 25, `the bends in view reach ${far.toFixed(0)} units`)
})

test("the first bend forms in view within a few seconds, and takes its time", () => {
  const t = createTerrain()
  t.frame(WIDE.view, WIDE.covered)
  const seen = watch(t, openLand(WIDE.view, WIDE.covered))
  let early = 0, formed = 0
  for (let i = 1; i <= 60 * 8; i++) {
    t.step(DT)
    const { far } = seen()
    if (i === 60 * 2) early = far
    formed = far
  }
  assert.ok(early > 2 && early < formed / 2, `under way at 2 s (${early.toFixed(1)}), not done`)
  assert.ok(formed > 20, `formed by 8 s (${formed.toFixed(1)} units)`)
})

test("a hill rises under the pointer at once, builds while it rests, stands a while after it leaves, then wears away", () => {
  const t = createTerrain()
  for (let i = 0; i < 60 * 10; i++) t.step(DT)
  const run = (s: number) => {
    for (let i = 0; i < Math.round(s * 60); i++) t.step(DT)
  }
  t.aim(1200, 330, 1)
  run(0.15)
  assert.ok(t.raised > INTERVAL, `${t.raised.toFixed(0)} up after 0.15 s: a new ring has opened`)
  run(0.35)
  const quick = t.raised
  run(1.5)
  assert.ok(t.raised > quick * 1.1 && t.raised > 0.7 * HILL.height, `it builds while the pointer rests (${quick.toFixed(0)} → ${t.raised.toFixed(0)})`)
  const built = t.raised
  t.aim(1200, 330, 0)
  run(6)
  assert.ok(t.raised > 0.95 * built, `standing 6 s after the pointer left (${t.raised.toFixed(0)} of ${built.toFixed(0)})`)
  run(12)
  assert.ok(t.raised < 0.02 * HILL.height, `worn away after 18 (${t.raised.toFixed(1)})`)
})

test("a pointer moving across open land leaves a run of different hills, never piled too high", () => {
  const t = createTerrain()
  for (let i = 0; i < 60 * 10; i++) t.step(DT)
  let most = 0
  const at = (x: number, y: number) => t.hills.reduce((s, h) => {
    const dx = x - h.x, dy = y - h.y, u = dx * h.c + dy * h.s, w = dy * h.c - dx * h.s
    return s + h.h * Math.exp(-(u * u) / (2 * h.ra * h.ra) - (w * w) / (2 * h.rb * h.rb))
  }, 0)
  for (let i = 0; i <= 180; i++) {
    t.aim(1000 + i * 2, 300 + 60 * Math.sin(i / 30), 1) // 120 units/s, wandering
    t.step(DT)
    for (let x = 980; x < 1400; x += 20) for (let y = 200; y < 420; y += 20) most = Math.max(most, at(x, y))
  }
  t.aim(0, 0, 0)
  t.step(DT)
  const summits = t.hills.filter((h, i) => i % 2 === 0 && h.h > INTERVAL)
  assert.ok(summits.length >= 4, `${summits.length} hills along the way`)
  assert.equal(new Set(summits.map((h) => `${h.ra.toFixed(1)} ${h.rb.toFixed(1)} ${h.c.toFixed(3)}`)).size, summits.length, "no two alike")
  assert.ok(most < 2 * HILL.height, `where hills meet the land rises to a massif, never past two hills high: it reaches ${(most / HILL.height).toFixed(2)} hills high`)
})

test("the land traced with hills: with none it is the drawing, to the tenth; with them, new rings and no crossings", () => {
  const tracer = createTracer()
  const { rings, keyline } = land()
  const sig = (c: { level: number; key: boolean; closed: boolean; pts: Float64Array }) => `${c.level}${c.key}${c.closed}:${Array.from(c.pts, (v) => v.toFixed(1)).join(",")}`
  const drawn = [...rings.flatMap((r) => chainsOf(r.d).map((c) => ({ level: r.level, key: false, ...c }))), ...chainsOf(keyline).map((c) => ({ level: KEY_LEVEL, key: true, ...c }))]
  assert.deepEqual(new Set(tracer([]).map(sig)), new Set(drawn.map(sig)))
  // hills from a pointer that has wandered past the keyline and the open land
  const t = createTerrain()
  const keyPts = defined(chainsOf(keyline)[0], "keyline chain").pts
  const path: [number, number][] = [[defined(keyPts[40]), defined(keyPts[41])], [1200, 300], [900, 520], [300, 420], [1150, 180]]
  for (let s = 1; s < path.length; s++)
    for (let i = 0; i <= 60; i++) {
      const [a, b] = [defined(path[s - 1]), defined(path[s])]
      t.aim(a[0] + ((b[0] - a[0]) * i) / 60, a[1] + ((b[1] - a[1]) * i) / 60, 1)
      t.step(DT)
      if (i % 20) continue
      const traced = tracer(t.hills)
      const flat = traced.flatMap((c) => flatten(splineFlat(c.pts, c.pts.length / 2, c.closed)).map((pts) => ({ level: c.level, pts })))
      assert.deepEqual(crossings(flat), [], `leg ${s}, step ${i}`)
      assert.equal(traced.filter((c) => c.key).length, 1, "one keyline")
    }
  const before = tracer([]).filter((c) => c.closed).length, after = tracer(t.hills).filter((c) => c.closed).length
  assert.ok(after > before, `the hills close new rings (${before} → ${after})`)
})

test("no repeated sequence: the field never returns to an earlier state", () => {
  const t = createTerrain()
  const sig: number[][] = []
  for (let i = 1; i <= 60 * 600; i++) {
    t.step(DT)
    if (i % 60 === 0) sig.push(at(t).flat())
  }
  // compare every pair of moments at least 20 s apart; the closest any two come is still a real difference
  let closest = Infinity
  for (let a = 0; a < sig.length; a++) {
    const p = defined(sig[a])
    for (let b = a + 20; b < sig.length; b++) {
      const q = defined(sig[b])
      closest = Math.min(closest, Math.hypot(...p.map((v, k) => v - defined(q[k]))))
    }
  }
  assert.ok(closest > 4, `closest return ${closest.toFixed(1)} units`)
})

test("the moving land never folds: no contour crosses another or itself at any moment", () => {
  const { rings, keyline } = land()
  const drawn = [...rings.map((r) => r.d), keyline].map((d) => chainsOf(d))
  const t = createTerrain()
  for (let s = 1; s <= 600; s++) {
    t.step(DT)
    for (let i = 0; i < 59; i++) t.step(DT)
    if (s % 40 !== 0) continue // every 40 s of a 10-minute watch
    assert.deepEqual(crossings(live(drawn, t)), [], `at ${s} s`)
  }
})

/** every contour as the terrain has moved it, flattened for the crossing check */
function live(drawn: ReturnType<typeof chainsOf>[], t: ReturnType<typeof createTerrain>) {
  return drawn.flatMap((chains, level) =>
    chains.flatMap((c) => {
      const n = c.pts.length / 2, moved = new Float64Array(c.pts.length)
      for (let k = 0; k < n; k++) {
        const x = defined(c.pts[2 * k]), y = defined(c.pts[2 * k + 1])
        t.displace(x, y, out)
        const [dx, dy] = disp()
        moved[2 * k] = x + dx
        moved[2 * k + 1] = y + dy
      }
      return flatten(splineFlat(moved, n, c.closed)).map((pts) => ({ level, pts }))
    }),
  )
}
