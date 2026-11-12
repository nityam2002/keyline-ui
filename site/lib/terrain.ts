/** The living terrain: one smooth, seeded deformation of the sheet's plane, shared by every contour, the keyline
 * and the spot heights. The resting land (contours.ts) is the identity; this moves it. Two parts, tuned apart:
 *
 * The ambient field, which needs no one. Broad zones, each a Gaussian bump carrying a push (bends a band of lines,
 * drawing them together on one side and opening them on the other) and a swell (opens or gathers the lines around its
 * centre). Two lead zones take turns in the open land the hero shows (frame): one forms a bend, holds it, relaxes it
 * flat or turns it into another, and before it is done the other starts somewhere else, so a bend is always forming or
 * relaxing in view and the sequence never repeats. Each change is a slow smootherstep, so nothing starts or stops with
 * a jolt. A few quieter zones breathe on damped springs elsewhere. It can flex the land but never fold it:
 * p → p + D(p) is one-to-one while D's Lipschitz constant is under 1, so every frame the field's measured stretch (the
 * Jacobian's norm on a grid) is held at MAX_STRAIN and a proven bound everywhere (that maximum plus the most it could
 * grow between samples) under HARD_LIMIT, by scaling every zone together. Displacement and speed are bounded too.
 *
 * The pointer's hills (aim): see HILL. They change the land itself, not this map. */

export const MAX_STRAIN = 0.4 // bound on the ambient field's |∇D|: spacing stays within (1 ± this) of the drawing's
export const HARD_LIMIT = 0.9 // the ambient field's proven strain never passes this, whatever the zones do
export const MAX_REACH = 140 // units: no point ever moves further than this from where it rests
export const MAX_SPEED = 14 // units per second: the quiet zones' push (a lead bend peaks near twice this, mid-change)
/* Where the pointer is over open land, it raises a hill in the land's height field, and the land keeps it: new
   contour rings open around the pointer within a moment, and the longer it rests the higher the hill builds. As it
   moves on it leaves that hill standing and starts another, so a path across open land leaves a run of hills with
   saddles between them, like the contours of hill country. No two are alike: each has its own height, a long axis
   at its own angle, and a shoulder or spur off its summit. They stand a while, then wear away slowly, oldest first.
   The hills are not part of this map: the contours are traced again from the field with them added (contours.ts,
   createTracer), so every line is still a level set of one continuous field and none can cross. */
export const HILL = { height: 150, radius: 42 } // in the field's units: one contour is 34, so ~4 new rings for a full hill
const HILL_STEP = 80 // units the pointer travels before it leaves a hill standing and starts another
const HILL_RISE = 9, HILL_FALL = 1.1 // 1/s: the first ring within ~0.15 s, most of the hill in ~0.5 s; it wears away over ~4 s
const HILL_STAND: Range = [8, 12] // s a hill stands after the pointer leaves it
const HILL_BUILD = 1.2 // s of rest for a hill to build to its full height (it starts at 75% of it)
const HILL_CROWD = 1.2 // the land under a new hill never rises past this many full hills (it rises on its neighbours)
const STANDING = 8 // hills standing at once; past this the oldest starts to wear away
const HILLS = 14
const IDLE_REACH = MAX_REACH
export const VIEW_TOP = -100 // the sheet's top (contours.ts VIEW.y)

type Range = readonly [number, number]
/** a rise in the height field (contours.ts Bump) */
export type Bump = { x: number; y: number; h: number; c: number; s: number; ra: number; rb: number }
export type Box = { x0: number; y0: number; x1: number; y1: number }
type ZoneSpec = { x: Range; y: Range; r: Range; push: number; swell: number; rate: Range; dwell: Range; relax: number }

/* The lead bends: how strong, how broad, and how long each change takes. HANDOFF is how far through one change the
   other lead starts its own, so their changes overlap and the land is never wholly still. */
const LEAD = { push: 56, swell: 0.07, r: [190, 260] as Range, form: [3.5, 5] as Range, relax: [4, 5.5] as Range, turn: [5, 7] as Range, handoff: [0.4, 0.6] as Range }
const TURN_ODDS = 0.35 // a formed bend turns into another, rather than relaxing flat
/* The quiet zones: the rest of the sheet barely breathes, quietest behind the heading. */
const ZONES: ZoneSpec[] = [
  { x: [980, 1400], y: [-60, 200], r: [160, 240], push: 24, swell: 0.06, rate: [0.5, 0.6], dwell: [5, 10], relax: 0.3 }, // right, upper
  { x: [560, 1000], y: [400, 620], r: [180, 260], push: 28, swell: 0.07, rate: [0.5, 0.6], dwell: [5, 10], relax: 0.3 }, // below the table
  { x: [40, 360], y: [160, 560], r: [160, 220], push: 20, swell: 0.06, rate: [0.5, 0.6], dwell: [5, 10], relax: 0.3 }, // left of the table
  { x: [300, 1000], y: [-80, 140], r: [220, 300], push: 9, swell: 0.03, rate: [0.4, 0.5], dwell: [8, 14], relax: 0.3 }, // behind the heading
]
/* Until the page says what it shows (frame), the wide hero's: the slice of the sheet in view, and the demo and the
   heading's letters, under which a bend would be wasted. */
const VIEWED: Box = { x0: 0, y0: -27, x1: 1400, y1: 527 }
const COVERED: Box[] = [
  { x0: 41, y0: -6, x1: 1003, y1: 103 },
  { x0: 143, y0: 137, x1: 1037, y1: 174 },
  { x0: 143, y0: 216, x1: 984, y1: 470 },
]
const ENVELOPE: Range = [-100, 260] // y: heading strip quiet (×0.45) → full motion by here
const ENV_MIN = 0.45
const ENV_SLOPE = (1.5 * (1 - ENV_MIN)) / (ENVELOPE[1] - ENVELOPE[0]) // smoothstep's steepest gradient
const ENV_CURVE = (6 * (1 - ENV_MIN)) / (ENVELOPE[1] - ENVELOPE[0]) ** 2 // smoothstep's largest second derivative
const GRID = 40 // spacing of the strain samples, in sheet units (zones are 140+ wide)
const G = Math.exp(-0.5)
/* smoothness of the limits: a maximum over the grid is a log-sum-exp (never below the true maximum, so the bounds
   stay strict) and the scale is a soft minimum of what each limit allows (never above the strictest): plain max and
   min would put kinks in the motion whenever the binding sample or limit changed */
const GLIDE = 0.5 // 1/s: how quickly a quiet zone's spring anchor follows a newly picked goal
const SOFT_STRAIN = 0.01 // the strain's log-sum-exp temperature (overestimates by at most 0.07)
const SOFT_DISP = 1.5 // the displacement's, in units (at most ~10 over)
const SOFT_MIN = 10 // p of the soft minimum // max of ρ·e^(−ρ²/2) is e^(−1/2)

/** a[i] where i is in range by construction (a zone's six state slots, a grid sample): reading past the end would be
 * a bug, so it throws instead of letting undefined turn into NaN. Typed arrays only, so it stays monomorphic and V8
 * inlines it in the per-frame loops. */
function f64(a: Float64Array, i: number): number {
  const v = a[i]
  if (v === undefined) throw new RangeError(`index ${i} is out of range (length ${a.length})`)
  return v
}

/** 0 → 1 with no speed and no acceleration at either end */
const smoother = (u: number) => u * u * u * (u * (u * 6 - 15) + 10)

/** mulberry32: small, fast, seeded */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// a zone's state: [cx, cy, r, ax, ay, s]. A quiet zone eases each on its own spring; a lead zone moves them all
// together, from one shape to the next
const N = 6
type Change = { from: Float64Array; to: Float64Array; t: number; T: number; handoff: number; moving: boolean; formed: boolean }
type Zone = { spec: ZoneSpec; q: Float64Array; v: Float64Array; target: Float64Array; goal: Float64Array; omega: number; dwell: number; held: boolean; relaxed: boolean; lead?: Change }
// a hill: its centre (where the land rests), height, how fast that is changing, and whether the pointer holds it
type Hill = {
  x: number; y: number; h: number; v: number; held: boolean; t: number; stand: number; left: number; born: number
  peak: number; c: number; s: number; ra: number; rb: number; sx: number; sy: number; share: number
}

export type Terrain = {
  /** advance by dt seconds (clamped, so a long frame or a resumed tab never jumps) */
  step(dt: number): void
  /** what the hero shows, in sheet units: the slice in view and what covers it (the demo, the heading's letters).
   * The lead bends start in the open land that is left. */
  frame(view: Box, covered: Box[]): void
  /** the pointer over the land, in sheet units as drawn, and how much it is there (0 = gone, or over the demo or
   * the heading's letters; 1 = over open land). A hill rises under it and sinks when it moves on. */
  aim(x: number, y: number, presence: number): void
  /** the hills as rises to add to the land's height field (each hill is two: its summit and its shoulder), where
   * the land rests */
  readonly hills: readonly Bump[]
  /** the highest hill now, in the field's units */
  readonly raised: number
  /** displacement of the point (x, y), written into out */
  displace(x: number, y: number, out: Float64Array): void
  /** the bounds the current state holds to: measured strain, proven strain, proven displacement (for tests) */
  bounds(): { strain: number; proven: number; reach: number }
  /** seconds simulated so far */
  readonly time: number
}

export function createTerrain(seed = 0x6b65796c): Terrain {
  const rand = rng(seed)
  const between = ([a, b]: Range) => a + (b - a) * rand()
  const pick = (z: Zone) => {
    const s = z.spec, t = z.goal
    t[0] = between(s.x)
    t[1] = between(s.y)
    t[2] = between(s.r)
    // either a formed bend (a push of random direction, a real strength) or a relaxing one, nearly flat
    const relax = !z.relaxed && rand() < s.relax // never two relaxations running
    z.relaxed = relax
    const ang = rand() * Math.PI * 2, mag = s.push * (relax ? 0.06 + 0.14 * rand() : 0.6 + 0.4 * rand())
    t[3] = Math.cos(ang) * mag
    t[4] = Math.sin(ang) * mag
    t[5] = (rand() * 2 - 1) * s.swell * (relax ? 0.2 : 1)
    z.dwell = between(s.dwell) // seconds before it changes its mind, arrived or not
    z.held = false
  }
  const zone = (spec: ZoneSpec): Zone => ({ spec, q: new Float64Array(N), v: new Float64Array(N), target: new Float64Array(N), goal: new Float64Array(N), omega: 0, dwell: 0, held: false, relaxed: false })
  const quiet = ZONES.map((spec) => {
    const z = zone(spec)
    // start at rest exactly (no push, no swell): the first frame is the server's drawing, then bends form
    z.q[0] = between(spec.x)
    z.q[1] = between(spec.y)
    z.q[2] = between(spec.r)
    z.omega = between(spec.rate)
    z.target.set(z.q) // at rest: the spring starts by holding still, then follows its first goal
    pick(z)
    z.dwell *= 0.5 + rand() * 0.5 // stagger the first changes of mind
    return z
  })
  const leadSpec: ZoneSpec = { x: [0, 0], y: [0, 0], r: LEAD.r, push: LEAD.push, swell: LEAD.swell, rate: [0, 0], dwell: [0, 0], relax: 0 }
  const lead = () => {
    const z = zone(leadSpec)
    z.q[0] = 1200 // somewhere harmless until its first change places it
    z.q[2] = LEAD.r[0]
    z.lead = { from: new Float64Array(N), to: new Float64Array(N), t: 0, T: 1, handoff: 0, moving: false, formed: false }
    return z
  }
  const leads: [Zone, Zone] = [lead(), lead()]
  // each lead with the other, in the order step() offers them the next change
  const pairs: [Zone, Zone][] = [[leads[0], leads[1]], [leads[1], leads[0]]]
  const zones = [...leads, ...quiet]

  // the open land the lead bends start in
  let view = VIEWED, covered = COVERED
  const gap = (x: number, y: number) => {
    let d = Infinity
    for (const c of covered) d = Math.min(d, Math.hypot(Math.max(c.x0 - x, 0, x - c.x1), Math.max(c.y0 - y, 0, y - c.y1)))
    return d
  }
  // somewhere in view, clear of what covers it and, if the other lead is formed, away from its bend
  const spot = (other: Zone): [number, number] => {
    let bx = 0, by = 0, best = -Infinity
    const m = 24, x0 = view.x0 + m, x1 = Math.max(x0, view.x1 - m), y0 = view.y0 + m, y1 = Math.max(y0, view.y1 - m)
    for (let i = 0; i < 24; i++) {
      const x = x0 + (x1 - x0) * rand(), y = y0 + (y1 - y0) * rand()
      const away = other.lead!.formed || other.lead!.moving ? Math.min(Math.hypot(x - f64(other.q, 0), y - f64(other.q, 1)), 320) : 320
      const score = Math.min(gap(x, y), 140) + 0.35 * away + 30 * rand()
      if (score > best) [best, bx, by] = [score, x, y]
    }
    return [bx, by]
  }
  // the next change for a lead: a flat one forms a bend in fresh open land; a formed one relaxes, or turns
  const begin = (z: Zone, other: Zone) => {
    const c = z.lead!
    if (!c.formed) {
      const [x, y] = spot(other)
      z.q[0] = x // invisible: with no push and no swell the zone moves nothing
      z.q[1] = y
      z.q[2] = between(LEAD.r)
    }
    c.from.set(z.q)
    c.to.set(z.q)
    // a new bend's direction: any, or for a turn, well away from the one it has (a turn that barely turns is a stall)
    const bend = (strength: number, turning = false) => {
      const was = Math.atan2(f64(z.q, 4), f64(z.q, 3)), swing = (Math.PI / 2 + rand() * Math.PI / 2) * (rand() < 0.5 ? -1 : 1)
      const ang = turning ? was + swing : rand() * Math.PI * 2, mag = LEAD.push * strength
      c.to[3] = Math.cos(ang) * mag
      c.to[4] = Math.sin(ang) * mag
      c.to[5] = (rand() * 2 - 1) * LEAD.swell
    }
    if (!c.formed) {
      bend(0.7 + 0.3 * rand())
      c.T = between(LEAD.form)
      c.formed = true
    } else if (rand() < TURN_ODDS) {
      // turn: the bend drifts a little and takes another direction
      const ang = rand() * Math.PI * 2
      c.to[0] = Math.min(view.x1, Math.max(view.x0, f64(z.q, 0) + Math.cos(ang) * 60))
      c.to[1] = Math.min(view.y1, Math.max(view.y0, f64(z.q, 1) + Math.sin(ang) * 60))
      bend(0.6 + 0.4 * rand(), true)
      c.T = between(LEAD.turn)
    } else {
      c.to[3] = c.to[4] = c.to[5] = 0
      c.T = between(LEAD.relax)
      c.formed = false
    }
    // the other lead must be done by this change's handoff, so it can start its next there, mid-way through this
    // one: never at its slow end (the two slow ends together would be a still moment)
    const left = other.lead!.moving ? other.lead!.T - other.lead!.t : 0
    c.T = Math.max(c.T, left / 0.62)
    c.handoff = Math.max(between(LEAD.handoff), left / c.T)
    c.t = 0
    c.moving = true
  }
  begin(leads[0], leads[1]) // the first change starts at once: a bend is forming from the first second

  // the hills the pointer raises: one held, the rest sinking
  const hills: Hill[] = Array.from({ length: HILLS }, () => ({ x: 0, y: 0, h: 0, v: 0, held: false, t: 0, stand: 0, left: 0, born: 0, peak: 0, c: 1, s: 0, ra: 1, rb: 1, sx: 0, sy: 0, share: 0 }))
  const aimed = { x: 0, y: 0, presence: 0 }
  const shown: Bump[] = []
  // how high a hill, summit and shoulder, lifts the land at (x, y)
  const lump = (dx: number, dy: number, h: Hill, ka: number, kb: number) => {
    const u = dx * h.c + dy * h.s, w = dy * h.c - dx * h.s
    return Math.exp(-u * u * ka - w * w * kb)
  }
  const rise = (h: Hill, x: number, y: number) =>
    h.h * (lump(x - h.x, y - h.y, h, 1 / (2 * h.ra * h.ra), 1 / (2 * h.rb * h.rb)) + h.share * lump(x - h.x - h.sx, y - h.y - h.sy, h, 1 / (2 * (0.7 * h.ra) ** 2), 1 / (2 * (0.8 * h.rb) ** 2)))
  // a new hill, its own shape: a long summit at some angle, and a shoulder off one end of it
  const raise = (h: Hill, x: number, y: number) => {
    const ang = rand() * Math.PI, R = HILL.radius, side = rand() < 0.5 ? -1 : 1
    Object.assign(h, { x, y, h: 0, v: 0, held: true, t: 0, left: 0, born: time, stand: between(HILL_STAND) })
    h.peak = HILL.height * (0.75 + 0.5 * rand())
    h.c = Math.cos(ang)
    h.s = Math.sin(ang)
    h.ra = R * (1 + 0.5 * rand())
    h.rb = R * (0.6 + 0.25 * rand())
    const off = side * h.ra * (0.8 + 0.5 * rand()), skew = (rand() * 2 - 1) * 0.5 * h.rb
    h.sx = h.c * off - h.s * skew
    h.sy = h.s * off + h.c * skew
    h.share = 0.35 + 0.25 * rand()
  }
  let time = 0
  let scale = 1 // the common factor that holds the strain bound

  const env = (y: number) => {
    const t = Math.min(1, Math.max(0, (y - ENVELOPE[0]) / (ENVELOPE[1] - ENVELOPE[0])))
    return ENV_MIN + (1 - ENV_MIN) * t * t * (3 - 2 * t)
  }
  // how fast the Jacobian itself can change (a bound on the field's second derivatives): per zone, a·g'' ≤ a/r²
  // (with room) and the swell's terms ≤ 3|s|/r; the envelope adds |∇D|·|w'| twice and |D|·|w''|. With it the grid
  // maximum below becomes a bound for every point between the samples, not just at them.
  const curvature = () => {
    let h = 0, reach = 0, grad = 0
    for (const z of zones) {
      // smooth stand-ins for |push| and |swell| (never below them): a plain abs would kink the bound, and so the
      // motion, each time a swell or a push passes through zero
      const r = f64(z.q, 2), a = Math.hypot(f64(z.q, 3), f64(z.q, 4), 1), s = Math.hypot(f64(z.q, 5), 0.005)
      h += (1.2 * a) / (r * r) + (3 * s) / r
      reach += a + s * r * G
      grad += (G * a) / r + s
    }
    return { h: h + 2 * grad * ENV_SLOPE + reach * ENV_CURVE, reach }
  }
  // the actual largest stretch or squeeze over the sheet (and its overscan): the spectral norm of the field's
  // Jacobian, sampled on a grid far finer than any zone
  let lastDisp = 0
  const jacobian = (x: number, y: number) => {
    let a = 0, b = 0, c = 0, d = 0, dx = 0, dy = 0
    for (const z of zones) {
      const r = f64(z.q, 2), ex = x - f64(z.q, 0), ey = y - f64(z.q, 1), r2 = r * r, s = f64(z.q, 5)
      const g = Math.exp(-(ex * ex + ey * ey) / (2 * r2))
      const ux = f64(z.q, 3) + s * ex, uy = f64(z.q, 4) + s * ey
      dx += ux * g
      dy += uy * g
      a += (s - (ux * ex) / r2) * g
      b += (-(ux * ey) / r2) * g
      c += (-(uy * ex) / r2) * g
      d += (s - (uy * ey) / r2) * g
    }
    const t = Math.min(1, Math.max(0, (y - ENVELOPE[0]) / (ENVELOPE[1] - ENVELOPE[0])))
    const w = ENV_MIN + (1 - ENV_MIN) * t * t * (3 - 2 * t)
    const wy = t > 0 && t < 1 ? ((1 - ENV_MIN) * 6 * t * (1 - t)) / (ENVELOPE[1] - ENVELOPE[0]) : 0
    lastDisp = Math.hypot(dx, dy) * w
    const j0 = w * a, j1 = w * b + dx * wy, j2 = w * c, j3 = w * d + dy * wy
    const T = j0 * j0 + j1 * j1 + j2 * j2 + j3 * j3, det = j0 * j3 - j1 * j2
    return Math.sqrt((T + Math.sqrt(Math.max(0, T * T - 4 * det * det))) / 2)
  }
  // the largest stretch and the largest displacement over the sheet and its overscan, as smooth maxima
  const NS = Math.floor(940 / GRID + 1) * Math.floor(1720 / GRID + 1)
  const ms = new Float64Array(NS), ds = new Float64Array(NS)
  const softMax = (v: Float64Array, hard: number, tau: number) => {
    let sum = 0
    for (let i = 0; i < v.length; i++) sum += Math.exp((f64(v, i) - hard) / tau)
    return hard + tau * Math.log(sum)
  }
  const measured = () => {
    let i = 0, m = 0, disp = 0
    for (let y = -220; y <= 720; y += GRID)
      for (let x = -160; x <= 1560; x += GRID) {
        ms[i] = jacobian(x, y)
        ds[i] = lastDisp
        m = Math.max(m, f64(ms, i))
        disp = Math.max(disp, f64(ds, i++))
      }
    return { m: softMax(ms.subarray(0, i), m, SOFT_STRAIN), disp: softMax(ds.subarray(0, i), disp, SOFT_DISP) }
  }
  const settle = () => {
    // the measured stretch sets the scale (MAX_STRAIN); the proven bound (measured + the most it can grow between
    // samples) is held under HARD_LIMIT < 1, so folding is impossible anywhere, not just at the samples
    // and between samples a point can be displaced at most |∇D|·(half the grid's diagonal) more than at one
    const { m, disp } = measured(), proven = m + (GRID / Math.SQRT2) * curvature().h, far = disp + (GRID / Math.SQRT2) * proven
    // soft minimum of 1 and what each limit allows: (1 + Σ (x/limit)^p)^(−1/p) ≤ every one of them
    const p = SOFT_MIN, sum = 1 + (m / MAX_STRAIN) ** p + (proven / HARD_LIMIT) ** p + (far / IDLE_REACH) ** p
    scale = sum ** (-1 / p)
  }

  function step(dtIn: number) {
    const dt = Math.min(Math.max(dtIn, 0), 1 / 20)
    if (!dt) return
    time += dt
    // the leads: each change runs its course; partway through one, the other lead starts its next
    for (const z of leads) {
      const c = z.lead!
      if (!c.moving) continue
      c.t += dt
      const u = Math.min(1, c.t / c.T), e = smoother(u)
      for (let k = 0; k < N; k++) z.q[k] = f64(c.from, k) + (f64(c.to, k) - f64(c.from, k)) * e
      if (u >= 1) c.moving = false
    }
    // an idle lead starts its next change once the other is well into its own (or still): so one change always
    // starts while the other is mid-way, and their slow ends never meet
    for (const [z, other] of pairs) {
      const o = other.lead!
      if (z.lead!.moving || (o.moving && o.t / o.T < o.handoff)) continue
      begin(z, other)
      break
    }
    for (const z of quiet) {
      z.dwell -= dt
      let near = 0
      for (let k = 0; k < N; k++) near = Math.max(near, Math.abs(f64(z.goal, k) - f64(z.q, k)) / (k < 3 ? 60 : k < 5 ? z.spec.push : z.spec.swell))
      // arrived: hold the shape a moment, then move on
      if (near < 0.12 && !z.held) {
        z.held = true
        z.dwell = Math.min(z.dwell, 2 + rand() * 3)
      }
      if (z.dwell <= 0) pick(z)
      // the spring's anchor glides to a new goal rather than jumping, so the pull, and the acceleration, stay smooth
      const glide = 1 - Math.exp(-GLIDE * dt)
      for (let k = 0; k < N; k++) z.target[k] = f64(z.target, k) + (f64(z.goal, k) - f64(z.target, k)) * glide
      // a slightly underdamped spring: eases out of each turn, never stops dead
      const w = z.omega, c = 2 * 0.85 * w
      for (let k = 0; k < N; k++) {
        z.v[k] = f64(z.v, k) + (w * w * (f64(z.target, k) - f64(z.q, k)) - c * f64(z.v, k)) * dt
      }
      // speed limits on the moving parts (the centre and the push in units/s, the radius, the swell): a drag that
      // only grows past the limit, so a fast zone eases off instead of being cut (which would jolt it)
      const lim = (i: number, j: number, max: number) => {
        const over = Math.hypot(f64(z.v, i), j < 0 ? 0 : f64(z.v, j)) / max - 1
        if (over > 0) {
          const f = 1 / (1 + 12 * over * over * dt * 60 * dt)
          z.v[i] = f64(z.v, i) * f
          if (j >= 0) z.v[j] = f64(z.v, j) * f
        }
      }
      lim(0, 1, MAX_SPEED * 1.4)
      lim(2, -1, MAX_SPEED)
      lim(3, 4, MAX_SPEED)
      lim(5, -1, 0.05)
      for (let k = 0; k < N; k++) z.q[k] = f64(z.q, k) + f64(z.v, k) * dt
    }
    // the hills: the one under the pointer builds while it rests; once the pointer has moved HILL_STEP on, it is
    // left standing and another starts under the pointer
    const present = Math.min(1, Math.max(0, aimed.presence))
    let held = hills.find((h) => h.held)
    if (held && (present < 0.05 || Math.hypot(aimed.x - held.x, aimed.y - held.y) > HILL_STEP)) {
      held.held = false
      held = undefined
    }
    if (!held && present >= 0.05) {
      const slot = hills.reduce((m, h) => (h.h < m.h ? h : m))
      // every hill busy (a very fast pointer): skip this spot rather than pull one down at once
      if (slot.h < 1) raise(slot, aimed.x, aimed.y)
    }
    // too many standing: the oldest starts to wear away
    const standing = hills.filter((h) => h.h > 1 && (h.held || h.left < h.stand))
    if (standing.length > STANDING) {
      const oldest = standing.reduce((m, h) => (h.born < m.born ? h : m))
      oldest.held = false
      oldest.left = Math.max(oldest.left, oldest.stand)
    }
    for (const h of hills) {
      if (h.h <= 0 && !h.held) continue
      let want: number
      if (h.held) {
        h.t += dt
        // it rises on its neighbours' flanks, never past HILL_CROWD hills high
        let others = 0
        for (const o of hills) if (o !== h && o.h > 0) others += rise(o, h.x, h.y)
        want = Math.max(0, Math.min(h.peak * present * (0.75 + 0.25 * Math.min(1, h.t / HILL_BUILD)), HILL_CROWD * HILL.height - others))
      } else {
        h.left += dt
        want = h.left < h.stand ? h.h : 0 // stands as it was left, then wears away
        if (h.left < h.stand && h.v <= 0) h.v = 0
      }
      // critically damped: up briskly, caught as briskly when cut short, down slowly
      const w = want > h.h || h.v > 0 ? HILL_RISE : HILL_FALL
      h.v += (w * w * (want - h.h) - 2 * w * h.v) * dt
      h.h += h.v * dt
      if (h.h < 0) h.h = h.v = 0
    }
    shown.length = 0
    for (const h of hills) {
      if (h.h < 0.05) continue
      shown.push({ x: h.x, y: h.y, h: h.h, c: h.c, s: h.s, ra: h.ra, rb: h.rb })
      shown.push({ x: h.x + h.sx, y: h.y + h.sy, h: h.h * h.share, c: h.c, s: h.s, ra: h.ra * 0.7, rb: h.rb * 0.8 })
    }
    settle()
  }

  function aim(x: number, y: number, presence: number) {
    // where the land under the pointer rests: undo the ambient map (it is far from folding, so this settles fast)
    let rx = x, ry = y
    for (let i = 0; i < 4; i++) {
      displace(rx, ry, inv)
      rx = x - f64(inv, 0)
      ry = y - f64(inv, 1)
    }
    aimed.x = rx
    aimed.y = ry
    aimed.presence = presence
  }
  const inv = new Float64Array(2)

  function frame(v: Box, c: Box[]) {
    view = v
    covered = c
  }

  function displace(x: number, y: number, out: Float64Array) {
    let dx = 0, dy = 0
    for (const z of zones) {
      const r = f64(z.q, 2), s = f64(z.q, 5), ex = x - f64(z.q, 0), ey = y - f64(z.q, 1), r2 = r * r
      const g = Math.exp(-(ex * ex + ey * ey) / (2 * r2))
      dx += (f64(z.q, 3) + s * ex) * g
      dy += (f64(z.q, 4) + s * ey) * g
    }
    const w = env(y) * scale
    out[0] = dx * w
    out[1] = dy * w
  }

  function bounds() {
    const { m, disp } = measured(), proven = m + (GRID / Math.SQRT2) * curvature().h
    return { strain: m * scale, proven: proven * scale, reach: (disp + (GRID / Math.SQRT2) * proven) * scale }
  }

  return {
    step,
    frame,
    aim,
    get hills() {
      return shown
    },
    get raised() {
      return shown.reduce((m, h) => Math.max(m, h.h), 0)
    },
    displace,
    bounds,
    get time() {
      return time
    },
  }
}
