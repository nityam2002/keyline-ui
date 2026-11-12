import { TENTHS } from "../site/lib/contours.ts"
import { defined } from "./defined.ts"

export type P = [number, number]


/** the drawn paths, flattened: every cubic sampled finely, one polyline per subpath */
export function flatten(d: string): P[][] {
  const out: P[][] = []
  const tok = d.match(/[MCZ]|-?\d*\.?\d+/g)! // a drawn path always has commands; null would throw on .length below anyway
  let k = 0, cur: P[] = [], pen: P = [0, 0]
  const num = () => +defined(tok[k++]) / TENTHS // paths are written in tenths of a unit
  while (k < tok.length) {
    const c = tok[k++]
    if (c === "M") {
      if (cur.length) out.push(cur)
      pen = [num(), num()]
      cur = [pen]
    } else if (c === "C") {
      const a: P = [num(), num()], b: P = [num(), num()], e: P = [num(), num()]
      for (let s = 1; s <= 12; s++) {
        const t = s / 12, u = 1 - t
        cur.push([
          u * u * u * pen[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * e[0],
          u * u * u * pen[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * e[1],
        ])
      }
      pen = e
    } else if (c === "Z") {
      cur.push(defined(cur[0], "subpath start"))
    }
  }
  if (cur.length) out.push(cur)
  return out
}

export const cross = (p: P, q: P, r: P, s: P) => {
  const o = (a: P, b: P, c: P) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]))
  return o(p, q, r) * o(p, q, s) < 0 && o(r, s, p) * o(r, s, q) < 0
}


/** every place two drawn segments cross, other than neighbours on one path: [] means no line meets another */
export function crossings(paths: { level: number; pts: P[] }[]): string[] {
  // bucket every segment on a coarse grid, then test only neighbours
  const C = 40
  const segs = paths.flatMap((p, path) => p.pts.slice(1).map((b, n) => ({ path, n, a: defined(p.pts[n]), b, closedLen: p.pts.length - 1 })))
  const buckets = new Map<string, number[]>()
  segs.forEach((s, id) => {
    const [x0, x1] = [Math.min(s.a[0], s.b[0]), Math.max(s.a[0], s.b[0])], [y0, y1] = [Math.min(s.a[1], s.b[1]), Math.max(s.a[1], s.b[1])]
    for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++)
      for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) {
        const key = `${gx},${gy}`
        const list = buckets.get(key)
        if (list) list.push(id)
        else buckets.set(key, [id])
      }
  })
  const hits = new Set<string>()
  for (const ids of buckets.values())
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) {
        const s = defined(segs[defined(ids[i])]), t = defined(segs[defined(ids[j])])
        if (s.path === t.path) {
          const gap = Math.abs(s.n - t.n)
          if (gap <= 1 || gap >= s.closedLen - 1) continue // neighbours share an end
        }
        if (cross(s.a, s.b, t.a, t.b)) hits.add(`${defined(paths[s.path]).level}/${defined(paths[t.path]).level} near ${s.a.map(Math.round).join(",")}`)
      }
  return [...hits]
}
