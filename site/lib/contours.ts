/** A drawn piece of land for the homepage sheet: the contours of hill country, many hills of every size with
 * saddles and spurs between them, and one long level set as the keyline. Every line is a level set of the same
 * continuous field, traced with marching squares, so two levels can never cross and no level crosses itself.
 * Deterministic, computed once on the server, decorative. Coordinates are in the sheet's VIEW box (the heading's
 * strip sits above y = 0, the specimen's rise below it). */

type Pt = readonly [number, number]

/** the hero's drawing box, behind the heading and the specimen; it is sliced to fill the area, so the traced grid
 * below runs well past it on every side */
export const VIEW = { x: 0, y: -100, w: 1400, h: 700 }

/** a[i] where the caller keeps i in range by construction (every lookup below is a grid, ring or chain index):
 * reading past the end would be a bug, so it throws instead of letting undefined turn into NaN */
export function nth<T>(a: ArrayLike<T>, i: number): T {
  const v = a[i]
  if (v === undefined) throw outOfRange(i, a.length)
  return v
}
const outOfRange = (i: number, length: number) => new RangeError(`index ${i} is out of range (length ${length})`)
// the same check for the typed arrays read per sample every frame (the live tracer here, the backdrop's redraw): one
// reader per array type stays monomorphic, so V8 inlines it, where the generic nth (seeing every kind of array) would
// cost the frame budget
export function f64(a: Float64Array, i: number): number {
  const v = a[i]
  if (v === undefined) throw outOfRange(i, a.length)
  return v
}
function i32(a: Int32Array, i: number): number {
  const v = a[i]
  if (v === undefined) throw outOfRange(i, a.length)
  return v
}

/* ---------------- the field ---------------- */

// seeded gradient noise (Perlin's, with his quintic fade): smooth, and the same on the server and in the browser
const PERM = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i)
  let s = 0x2545f491
  for (let i = 255; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[p[i], p[j]] = [nth(p, j), nth(p, i)]
  }
  return Uint8Array.from([...p, ...p])
})()
const GX = Float64Array.from({ length: 256 }, (_, i) => Math.cos((i * 2 * Math.PI) / 256))
const GY = Float64Array.from({ length: 256 }, (_, i) => Math.sin((i * 2 * Math.PI) / 256))
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi
  const i = xi & 255, j = yi & 255
  const dot = (a: number, b: number, dx: number, dy: number) => {
    const g = nth(PERM, nth(PERM, i + a) + j + b)
    return nth(GX, g) * dx + nth(GY, g) * dy
  }
  const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10), v = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
  const a = dot(0, 0, fx, fy), b = dot(1, 0, fx - 1, fy), c = dot(0, 1, fx, fy - 1), d = dot(1, 1, fx - 1, fy - 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
/** a few octaves, each turned a little, so no grid shows through */
function fbm(x: number, y: number, octaves: number, gain = 0.5) {
  let sum = 0, amp = 1, norm = 0
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x, y)
    norm += amp
    const nx = x * 1.6 - y * 1.2, ny = x * 1.2 + y * 1.6 // ×2, turned ~37°
    x = nx + 5.3
    y = ny + 1.7
    amp *= gain
  }
  return sum / norm
}
/** the hills' spacing (units), how high they stand, and how much the land is pulled about before it is sampled */
const LAND = { scale: 400, height: 600, warp: 0.35, detail: 0.4 }

export function height(x: number, y: number) {
  // domain warp: the land is sampled where a second, broader field pushes it, which bends ridges and valleys into
  // the long, leaning shapes of real hill country rather than round blobs on a lattice
  const sx = x / LAND.scale, sy = y / LAND.scale
  const qx = fbm(sx * 0.6 + 3.1, sy * 0.6 + 7.7, 3), qy = fbm(sx * 0.6 + 11.4, sy * 0.6 + 2.2, 3)
  return LAND.height * fbm(sx + LAND.warp * qx * 2, sy + LAND.warp * qy * 2, 3, LAND.detail)
}

/* ---------------- marching squares ---------------- */

// the grid runs well past the sheet, so any line that is cut off is cut off by the hero's edge, not here
const G = { x0: -260, y0: -260, x1: 1660, y1: 860, s: 6 }
const NX = Math.round((G.x1 - G.x0) / G.s), NY = Math.round((G.y1 - G.y0) / G.s)
let grid: Float64Array | null = null
function samples() {
  if (grid) return grid
  grid = new Float64Array((NX + 1) * (NY + 1))
  for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) grid[j * (NX + 1) + i] = height(G.x0 + i * G.s, G.y0 + j * G.s)
  return grid
}

/** the level set h = level as chains of points; closed chains repeat no point */
export function trace(level: number): { pts: Pt[]; closed: boolean }[] {
  const g = samples()
  // a sample exactly on the level would make a degenerate segment; nudge it off
  const v = (i: number, j: number) => {
    const d = nth(g, j * (NX + 1) + i) - level
    return d === 0 ? 1e-9 : d
  }
  const at = (key: string): Pt => {
    const [k, a, b] = key.split(",")
    const i = Number(a), j = Number(b)
    const [i2, j2] = k === "h" ? [i + 1, j] : [i, j + 1]
    const va = v(i, j), vb = v(i2, j2), t = va / (va - vb)
    return [G.x0 + (i + (i2 - i) * t) * G.s, G.y0 + (j + (j2 - j) * t) * G.s]
  }
  const segs: [string, string][] = []
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const a = v(i, j), b = v(i + 1, j), c = v(i + 1, j + 1), d = v(i, j + 1)
      const T = `h,${i},${j}`, B = `h,${i},${j + 1}`, L = `v,${i},${j}`, R = `v,${i + 1},${j}`
      const code = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0)
      const centre = (a + b + c + d) / 4
      switch (code) {
        case 0: case 15: break
        case 1: case 14: segs.push([L, B]); break
        case 2: case 13: segs.push([B, R]); break
        case 3: case 12: segs.push([L, R]); break
        case 4: case 11: segs.push([T, R]); break
        case 6: case 9: segs.push([T, B]); break
        case 7: case 8: segs.push([L, T]); break
        // saddles: the centre decides which corners join, so the two pieces never touch
        case 5: if (centre > 0) segs.push([L, T], [B, R]); else segs.push([T, R], [L, B]); break
        case 10: if (centre > 0) segs.push([T, R], [L, B]); else segs.push([L, T], [B, R]); break
      }
    }
  }
  const byEdge = new Map<string, number[]>()
  segs.forEach(([p, q], n) => {
    for (const e of [p, q]) byEdge.set(e, [...(byEdge.get(e) ?? []), n])
  })
  const used = new Uint8Array(segs.length)
  const chains: { pts: Pt[]; closed: boolean }[] = []
  for (let s = 0; s < segs.length; s++) {
    if (used[s]) continue
    used[s] = 1
    const edges = [...nth(segs, s)]
    const walk = (fromEnd: boolean) => {
      for (;;) {
        const e = fromEnd ? nth(edges, edges.length - 1) : nth(edges, 0)
        const next = byEdge.get(e)!.find((n) => !used[n])
        if (next === undefined) return
        used[next] = 1
        const [p, q] = nth(segs, next)
        const other = p === e ? q : p
        if (fromEnd) edges.push(other)
        else edges.unshift(other)
      }
    }
    walk(true)
    const closed = edges[0] === edges[edges.length - 1]
    if (!closed) walk(false)
    const keys = closed ? edges.slice(0, -1) : edges
    chains.push({ pts: keys.map(at), closed })
  }
  return chains
}

/* ---------------- smoothing ---------------- */

/** even spacing along the chain, so the spline has no kinks from uneven grid crossings */
function resample(p: Pt[], closed: boolean, step: number): Pt[] {
  const src = closed ? [...p, nth(p, 0)] : p
  const len = [0]
  for (let k = 1; k < src.length; k++) {
    const [x0, y0] = nth(src, k - 1), [x1, y1] = nth(src, k)
    len.push(nth(len, k - 1) + Math.hypot(x1 - x0, y1 - y0))
  }
  const total = nth(len, len.length - 1)
  const n = Math.max(closed ? 6 : 2, Math.round(total / step))
  const out: Pt[] = []
  let k = 1
  for (let m = 0; m < (closed ? n : n + 1); m++) {
    const d = (m / n) * total
    while (k < src.length - 1 && nth(len, k) < d) k++
    const [x0, y0] = nth(src, k - 1), [x1, y1] = nth(src, k), l0 = nth(len, k - 1)
    const t = (d - l0) / (nth(len, k) - l0 || 1)
    out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t])
  }
  return out
}

/** Paths are written in integer tenths of a unit and drawn under scale(0.1) (land.tsx): the same precision as one
 * decimal, but integers turn into text several times faster, which is most of the cost of redrawing the land live. */
export const TENTHS = 10
const f1 = (n: number) => Math.round(n * TENTHS)

/** Catmull-Rom spline through the points, as cubic Béziers (open chains clamp their ends) */
export function spline(p: Pt[], closed: boolean): string {
  return splineFlat(Float64Array.from(p.flat()), p.length, closed)
}

/** the same spline over a flat [x0, y0, x1, y1, …] array of n points: what the living terrain redraws each frame,
 * so it allocates nothing but the string */
export function splineFlat(p: ArrayLike<number>, n: number, closed: boolean): string {
  const ix = (k: number) => 2 * (closed ? (k + n) % n : Math.min(n - 1, Math.max(0, k)))
  let d = `M${f1(nth(p, 0))} ${f1(nth(p, 1))}`
  for (let k = 0; k < (closed ? n : n - 1); k++) {
    const a = ix(k - 1), b = ix(k), c = ix(k + 1), e = ix(k + 2)
    const ax = nth(p, a), ay = nth(p, a + 1), bx = nth(p, b), by = nth(p, b + 1)
    const cx = nth(p, c), cy = nth(p, c + 1), ex = nth(p, e), ey = nth(p, e + 1)
    d += `C${f1(bx + (cx - ax) / 6)} ${f1(by + (cy - ay) / 6)} ${f1(cx - (ex - bx) / 6)} ${f1(cy - (ey - by) / 6)} ${f1(cx)} ${f1(cy)}`
  }
  return closed ? d + "Z" : d
}

/** The points a drawn path passes through (its M and every C's end point), one chain per subpath: the resting
 * geometry the living terrain moves (terrain.ts), read back from the drawing so it is never shipped twice. */
export function chainsOf(d: string): { pts: Float64Array; closed: boolean }[] {
  const out: { pts: Float64Array; closed: boolean }[] = []
  for (const sub of d.split("M").slice(1)) {
    const closed = sub.endsWith("Z")
    const nums = sub.replace("Z", "").split(/[C\s]+/).filter(Boolean).map((v) => Number(v) / TENTHS)
    // M x y, then six numbers per C: the end point is the last two
    const pts = [nums[0], nums[1]]
    for (let k = 2; k + 5 < nums.length + 0; k += 6) pts.push(nums[k + 4], nums[k + 5])
    // a closed spline ends where it began; keep each point once
    if (closed) pts.splice(-2, 2)
    out.push({ pts: Float64Array.from(pts), closed })
  }
  return out
}

/* ---------------- the sheet ---------------- */

export type Land = {
  rings: { d: string; level: number; label?: { x: number; y: number; text: string } }[]
  keyline: string
}

const STEP = 26 // one contour interval, in the field's units
const LOW = -221 // the lowest level drawn: levels sit between the field's round numbers
const levelOf = (i: number) => LOW + i * STEP
export const KEY_LEVEL = 10 // the middle level: in hill country, the line that wanders furthest
export const LEVELS = 20 // from the lowest hollow to above the highest summit (the land spans about -233 to 270)
/** an index contour: every fifth level counted from the keyline's, inked in a lighter blue, as a survey map
 * picks out every fifth line so the eye can count the climb (the keyline's own level is one) */
export const isIndex = (level: number) => (((level - KEY_LEVEL) % 5) + 5) % 5 === 0
/** levels a raised hill can reach above the bare land's highest: a hill built on a summit still gets its rings */
const RAISED = 10
const SPACING = 14

/** the smoothed chains of one level, for drawing (and for the geometry test) */
export function contour(i: number) {
  return trace(levelOf(i))
    .filter((c) => c.pts.length > 3)
    .map((c) => ({ closed: c.closed, pts: resample(c.pts, c.closed, SPACING) }))
}

/** the keyline: of the key level's chains, the one that runs furthest through the open land right of the demo
 * (where a wide hero shows it whole), then across the rest of the sheet */
export function keyScore(c: { pts: readonly Pt[] }) {
  let len = 0
  for (let k = 1; k < c.pts.length; k++) {
    const [x, y] = nth(c.pts, k), [px, py] = nth(c.pts, k - 1), d = Math.hypot(x - px, y - py)
    if (x > VIEW.x && x < VIEW.x + VIEW.w && y > 0 && y < VIEW.y + VIEW.h) len += x > 1020 ? d : 0.25 * d
  }
  return len
}
function keyOf<C extends { pts: Pt[] }>(chains: C[]): C {
  return chains.reduce((b, c) => (keyScore(c) > keyScore(b) ? c : b))
}

/* ---------------- live tracing ---------------- */

/** a rise added to the field: its centre, its height (in the field's units: STEP is one contour), the direction of
 * its long axis (cos, sin) and its radii along and across it */
export type Bump = { x: number; y: number; h: number; c: number; s: number; ra: number; rb: number }
export type Traced = { level: number; key: boolean; pts: Float64Array; closed: boolean }
/** one contour interval, in the field's units */
export const INTERVAL = STEP

/** The same contours as land(), traced again from the field with hills added, fast enough to run every frame: the
 * same grid, the same marching squares (in the same order, so with no hills it gives exactly the drawing's points,
 * to the tenth), but over typed arrays instead of string keys. Every line is still a level set of one continuous
 * field, so however the hills rise and fall, no line crosses another or itself. */
export function createTracer() {
  const W = NX + 1, HV = W * (NY + 1)
  const base = samples(), f = new Float64Array(base.length)
  const e1 = new Int32Array(2 * HV).fill(-1), e2 = new Int32Array(2 * HV).fill(-1)
  let A = new Int32Array(8192), B = new Int32Array(8192), used = new Uint8Array(8192)
  let touched = new Int32Array(16384)
  // per row of cells, the lowest and highest sample: a level outside that range crosses none of them
  const lo = new Float64Array(NY), hi = new Float64Array(NY)
  let ns = 0, nt = 0, level = 0
  const link = (e: number, s: number) => {
    if (i32(e1, e) < 0) {
      e1[e] = s
      if (nt === touched.length) touched = grow(touched)
      touched[nt++] = e
    } else e2[e] = s
  }
  const grow = (a: Int32Array) => {
    const b = new Int32Array(a.length * 2)
    b.set(a)
    return b
  }
  const seg = (p: number, q: number) => {
    if (ns === A.length) {
      A = grow(A)
      B = grow(B)
      used = new Uint8Array(A.length)
    }
    A[ns] = p
    B[ns] = q
    link(p, ns)
    link(q, ns)
    ns++
  }
  const v = (k: number) => {
    const d = f64(f, k) - level
    return d === 0 ? 1e-9 : d
  }
  // an edge's crossing point: edges below HV run along x from sample (i, j), the rest along y
  const point = (e: number): Pt => {
    const vert = e >= HV, k = vert ? e - HV : e, i = k % W, j = (k - i) / W
    const va = v(k), vb = v(vert ? k + W : k + 1), t = va / (va - vb)
    return vert ? [G.x0 + i * G.s, G.y0 + (j + t) * G.s] : [G.x0 + (i + t) * G.s, G.y0 + j * G.s]
  }
  const next = (e: number) => {
    const s1 = i32(e1, e), s2 = i32(e2, e)
    return s1 >= 0 && !used[s1] ? s1 : s2 >= 0 && !used[s2] ? s2 : -1
  }

  return (bumps: readonly Bump[]): Traced[] => {
    f.set(base)
    for (const b of bumps) {
      if (b.h < 1e-3) continue
      const reach = 3.6 * Math.max(b.ra, b.rb), ka = 1 / (2 * b.ra * b.ra), kb = 1 / (2 * b.rb * b.rb)
      const i0 = Math.max(0, Math.floor((b.x - reach - G.x0) / G.s)), i1 = Math.min(NX, Math.ceil((b.x + reach - G.x0) / G.s))
      const j0 = Math.max(0, Math.floor((b.y - reach - G.y0) / G.s)), j1 = Math.min(NY, Math.ceil((b.y + reach - G.y0) / G.s))
      for (let j = j0; j <= j1; j++) {
        const dy = G.y0 + j * G.s - b.y
        for (let i = i0; i <= i1; i++) {
          const dx = G.x0 + i * G.s - b.x
          const u = dx * b.c + dy * b.s, w = dy * b.c - dx * b.s
          const k = j * W + i
          f[k] = f64(f, k) + b.h * Math.exp(-u * u * ka - w * w * kb)
        }
      }
    }
    for (let j = 0; j < NY; j++) {
      let l = Infinity, h = -Infinity
      for (let k = j * W, end = k + 2 * W; k < end; k++) {
        const x = f64(f, k)
        if (x < l) l = x
        if (x > h) h = x
      }
      lo[j] = l
      hi[j] = h
    }
    const out: Traced[] = []
    for (let li = 0; li < LEVELS + RAISED; li++) {
      level = levelOf(li)
      ns = 0
      for (let j = 0; j < NY; j++) {
        if (level < f64(lo, j) || level > f64(hi, j)) continue
        for (let i = 0; i < NX; i++) {
          const k = j * W + i
          const a = v(k), b = v(k + 1), c = v(k + W + 1), d = v(k + W)
          const code = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (d > 0 ? 1 : 0)
          if (code === 0 || code === 15) continue
          const T = k, Bo = k + W, L = HV + k, R = HV + k + 1
          switch (code) {
            case 1: case 14: seg(L, Bo); break
            case 2: case 13: seg(Bo, R); break
            case 3: case 12: seg(L, R); break
            case 4: case 11: seg(T, R); break
            case 6: case 9: seg(T, Bo); break
            case 7: case 8: seg(L, T); break
            case 5:
              if (a + b + c + d > 0) {
                seg(L, T)
                seg(Bo, R)
              } else {
                seg(T, R)
                seg(L, Bo)
              }
              break
            case 10:
              if (a + b + c + d > 0) {
                seg(T, R)
                seg(L, Bo)
              } else {
                seg(L, T)
                seg(Bo, R)
              }
              break
          }
        }
      }
      used.fill(0, 0, ns)
      const chains: { pts: Pt[]; closed: boolean }[] = []
      for (let s0 = 0; s0 < ns; s0++) {
        if (used[s0]) continue
        used[s0] = 1
        const fwd = [i32(A, s0), i32(B, s0)]
        for (let n = next(nth(fwd, fwd.length - 1)); n >= 0; n = next(nth(fwd, fwd.length - 1))) {
          used[n] = 1
          const a = i32(A, n)
          fwd.push(a === nth(fwd, fwd.length - 1) ? i32(B, n) : a)
        }
        const closed = fwd[0] === fwd[fwd.length - 1]
        let edges = fwd
        if (!closed) {
          const back: number[] = []
          for (let e = nth(fwd, 0), n = next(e); n >= 0; n = next(e)) {
            used[n] = 1
            const a = i32(A, n)
            e = a === e ? i32(B, n) : a
            back.push(e)
          }
          edges = back.reverse().concat(fwd)
        }
        const keys = closed ? edges.slice(0, -1) : edges
        if (keys.length > 3) chains.push({ pts: resample(keys.map(point), closed, SPACING), closed })
      }
      for (let t = 0; t < nt; t++) {
        const e = i32(touched, t)
        e1[e] = e2[e] = -1
      }
      nt = 0
      const key = li === KEY_LEVEL && chains.length ? keyOf(chains) : null
      for (const c of chains) {
        const pts = new Float64Array(c.pts.length * 2)
        c.pts.forEach((p, n) => {
          pts[2 * n] = Math.round(p[0] * TENTHS) / TENTHS
          pts[2 * n + 1] = Math.round(p[1] * TENTHS) / TENTHS
        })
        out.push({ level: li, key: c === key, pts, closed: c.closed })
      }
    }
    return out
  }
}

const SPOTS = [[1120, 140], [1300, 260], [1150, 420], [1320, 500], [1200, 300]] as const

let cached: Land | null = null
export function land(): Land {
  if (cached) return cached
  const rings: Land["rings"] = []
  let keyline = ""
  for (let i = 0; i < LEVELS; i++) {
    let chains = contour(i)
    if (i === KEY_LEVEL) {
      // the keyline is this level's longest line through the open land; the level's other pieces stay ordinary
      // contours, so the sheet shows one keyline
      const key = keyOf(chains)
      keyline = spline(key.pts, key.closed)
      chains = chains.filter((c) => c !== key)
      if (chains.length) rings.push({ d: chains.map((c) => spline(c.pts, c.closed)).join(""), level: i })
      continue
    }
    if (!chains.length) continue // the very top and bottom of the range may hold nothing in sight
    const d = chains.map((c) => spline(c.pts, c.closed)).join("")
    // spot heights on a few contours, lettered where the sheet has room for them: in the open land right of the
    // demo, clear of the heading's strip (y < 80 lies under or against the lettering at every width)
    let label: Land["rings"][number]["label"]
    if (i % 5 === 2) {
      const spot = nth(SPOTS, (i / 5) | 0)
      const near = chains.flatMap((c) => c.pts).filter(([x, y]) => y > 80 && y < 560 && x > 1040 && x < 1380)
      const top = near.reduce<Pt | null>((b, p) => (!b || Math.hypot(p[0] - spot[0], p[1] - spot[1]) < Math.hypot(b[0] - spot[0], b[1] - spot[1]) ? p : b), null)
      if (top && Math.hypot(top[0] - spot[0], top[1] - spot[1]) < 120) label = { x: top[0], y: top[1], text: String(Math.round(400 + levelOf(i))) }
    }
    rings.push({ d, level: i, label })
  }
  cached = { rings, keyline }
  return cached
}
