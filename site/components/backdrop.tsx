"use client"

import { Pause, Play } from "lucide-react"
import * as React from "react"
import { Toggle } from "@/components/keyline/ui/toggle"
import { chainsOf, isIndex, createTracer, INTERVAL, KEY_LEVEL, splineFlat, VIEW, type Traced } from "@site/lib/contours"
import { createTerrain, MAX_REACH, type Box } from "@site/lib/terrain"

// past the visible slice by more than the terrain ever moves a point (MAX_REACH), so no cut end can drift into view
const OVERSCAN = MAX_REACH + 40

type Chain = { rest: Float64Array; live: Float64Array; n: number; closed: boolean; key: boolean }

/* the pointer's hill fades in over this distance (CSS px) from a control or the heading's letters */
const CLEAR = [10, 64] as const
/* what the pointer cannot bend the land under: the demo, its controls and labels, the heading's letters */
const SOLID = ".s-plate, .s-pager, .s-motion, .s-site-ctl"

/** the part of the sheet the hero actually shows: the viewBox is sliced to fill it (xMidYMid), so a phone sees a
 * narrow middle band and a wide screen a short one; with a margin, past it */
function visibleBox(w: number, h: number, margin = OVERSCAN): Box {
  const k = Math.max(w / VIEW.w, h / VIEW.h) || 1
  const vw = w / k, vh = h / k
  const x0 = VIEW.x + (VIEW.w - vw) / 2, y0 = VIEW.y + (VIEW.h - vh) / 2
  return { x0: x0 - margin, y0: y0 - margin, x1: x0 + vw + margin, y1: y0 + vh + margin }
}

/** chains cut to the visible slice and its overscan (a closed ring that leaves it becomes open runs): only what can
 * be seen is moved and redrawn */
function cutChains(src: readonly { pts: Float64Array; closed: boolean }[], box: Box, key: boolean, out: Chain[] = []): Chain[] {
  for (const c of src) {
    const n = c.pts.length / 2
    const inside = (k: number) => {
      const x = c.pts[2 * k], y = c.pts[2 * k + 1]
      return x > box.x0 && x < box.x1 && y > box.y0 && y < box.y1
    }
    const all = Array.from({ length: n }, (_, k) => inside(k))
    const push = (idx: number[], closed: boolean) => {
      if (idx.length < 3) return
      const rest = new Float64Array(idx.length * 2)
      idx.forEach((k, j) => {
        rest[2 * j] = c.pts[2 * k]
        rest[2 * j + 1] = c.pts[2 * k + 1]
      })
      out.push({ rest, live: new Float64Array(rest), n: idx.length, closed, key })
    }
    if (all.every(Boolean)) {
      push([...Array(n).keys()], c.closed)
      continue
    }
    // walk from a point outside, so a run that wraps the ring's seam stays one run; keep one point past each end
    const start = all.indexOf(false)
    let run: number[] = []
    for (let s = 0; s <= (c.closed ? n : n - 1 - start); s++) {
      const k = c.closed ? (start + s) % n : start + s
      if (all[k]) {
        if (!run.length) run.push(c.closed ? (k - 1 + n) % n : Math.max(0, k - 1))
        run.push(k)
      } else if (run.length) {
        run.push(k)
        push(run, false)
        run = []
      }
    }
    if (run.length) push(run, false)
    // an open chain may begin inside the box (it never does with this field, whose open chains start at the grid's edge)
    if (!c.closed && start > 0) push([...Array(start + 1).keys()], false)
  }
  return out
}

/** the same Catmull-Rom spline as splineFlat (contours.ts), traced onto a canvas path */
function traceSpline(ctx: CanvasRenderingContext2D, p: Float64Array, n: number, closed: boolean) {
  const ix = (j: number) => 2 * (closed ? (j + n) % n : Math.min(n - 1, Math.max(0, j)))
  ctx.moveTo(p[0], p[1])
  for (let j = 0; j < (closed ? n : n - 1); j++) {
    const a = ix(j - 1), b = ix(j), c = ix(j + 1), e = ix(j + 2)
    ctx.bezierCurveTo(p[b] + (p[c] - p[a]) / 6, p[b + 1] + (p[c + 1] - p[a + 1]) / 6, p[c] - (p[e] - p[b]) / 6, p[c + 1] - (p[e + 1] - p[b + 1]) / 6, p[c], p[c + 1])
  }
  if (closed) ctx.closePath()
}

/** The hero's decorative layer: it fills the heading's row and the specimen's row (site.css, .s-backdrop) and is
 * clipped to them. It fades behind the heading, so it measures where the heading ends however it wraps
 * (--s-title-end). And it is a quiet, living survey map: every contour, the keyline and the spot heights move through
 * one shared, bounded deformation (terrain.ts), outside React. On its own, broad bends form and relax in whatever
 * open land the hero shows, one always under way. A mouse or pen over open land (never touch, never over the demo or
 * the heading's letters) raises a hill in the land: new contour rings open around it at once and widen, and as it
 * moves on, the land it leaves sinks back, so it draws a ridge that collapses in its wake. While any hill stands the
 * contours are traced again from the field each frame (contours.ts, createTracer), so they stay true level sets.
 *
 * Two renderers, one geometry. The inline SVG is the resting drawing: server-rendered, all that reduced motion
 * shows, and what stands whenever the land is still (paused, offscreen, a hidden tab), holding the moved shape. While
 * the land moves, a canvas under the SVG draws the same chains through the same map and the SVG's paths step aside
 * (data-live): profiled on a throttled phone, redrawing SVG paths every frame cost about 3.5× the main-thread time.
 * The spot heights stay SVG text. It picks up where it left off, and has a pause control. */
export function Backdrop({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [paused, setPaused] = React.useState(false)
  const pausedRef = React.useRef(paused)
  const wake = React.useRef<() => void>(() => {})
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useLayoutEffect(() => {
    const el = ref.current
    const title = el?.parentElement?.querySelector<HTMLElement>(".s-title")
    if (!el || !title) return
    const set = () => el.style.setProperty("--s-title-end", `${Math.round(title.getBoundingClientRect().bottom - el.getBoundingClientRect().top)}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(title)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    const el = ref.current
    const svg = el?.querySelector("svg")
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!el || !svg || !canvas || !ctx) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    // the resting drawing, read once before anything moves it
    const paths = [...svg.querySelectorAll<SVGPathElement>("path.s-contour, path.s-keyline")].map((p) => ({ p, key: p.classList.contains("s-keyline"), index: p.classList.contains("s-index"), level: Number(p.dataset.level ?? KEY_LEVEL), rest: chainsOf(p.getAttribute("d") ?? ""), chains: [] as Chain[] }))
    // the three inks, read from the SVG so CSS styles both renderers: gray contours, blue index contours, the keyline
    const inks = [paths.find((p) => !p.key && !p.index)?.p, paths.find((p) => p.index)?.p, paths.find((p) => p.key)?.p]
    const inkOf = (p: (typeof paths)[number]) => (p.key ? 2 : p.index ? 1 : 0)
    // where a freshly traced chain is drawn: the keyline's path, or its level's (a level with no path at rest, the
    // keyline's own when a hill gives it a second ring, takes the nearest level's of the same ink)
    const pathFor = (t: Traced) => {
      if (t.key) return paths.find((p) => p.key)!
      const index = isIndex(t.level)
      let best: (typeof paths)[number] | undefined
      for (const p of paths)
        if (!p.key && p.index === index && (!best || Math.abs(p.level - t.level) < Math.abs(best.level - t.level))) best = p
      return best ?? paths.find((p) => !p.key)!
    }
    const labels = [...svg.querySelectorAll<SVGTextElement>("text.s-elev")].map((t) => ({ t, x: Number(t.getAttribute("x")), y: Number(t.getAttribute("y")) }))
    const terrain = createTerrain()
    let tracer: ReturnType<typeof createTracer> | null = null // made the first time the pointer comes over the land
    let traced = false // the chains come from the tracer (a hill stands), not the resting drawing
    let drawnHills: number[] = [], drawnAt: number[] = [] // the hills the traced chains show
    const out = new Float64Array(2)

    // the sheet → the canvas's pixels: the same slice as the SVG's xMidYMid slice
    let w = 0, h = 0, k = 1, ox = 0, oy = 0, dpr = 1, box: Box = { x0: 0, y0: 0, x1: 0, y1: 0 }
    // the land with the pointer's hills: traced again while any stands; the resting drawing once they have sunk
    const reshape = () => {
      const hills = terrain.hills
      if (!hills.length || !tracer) {
        if (traced) cut()
        return
      }
      // standing hills need no new tracing: only one that is rising or wearing away changes the lines
      let same = traced && hills.length === drawnHills.length
      for (let i = 0; same && i < hills.length; i++) same = Math.abs(hills[i].h - drawnHills[i]) < 0.02 && hills[i].x === drawnAt[i]
      if (same) return
      drawnHills = hills.map((b) => b.h)
      drawnAt = hills.map((b) => b.x)
      for (const path of paths) path.chains = []
      for (const t of tracer(hills)) {
        const path = pathFor(t)
        cutChains([t], box, path.key, path.chains)
      }
      traced = true
    }
    const cut = () => {
      w = svg.clientWidth
      h = svg.clientHeight
      k = Math.max(w / VIEW.w, h / VIEW.h) || 1
      ox = (w - VIEW.w * k) / 2 - VIEW.x * k
      oy = (h - VIEW.h * k) / 2 - VIEW.y * k
      dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      box = visibleBox(w, h)
      for (const path of paths) path.chains = cutChains(path.rest, box, path.key)
      traced = false
      layout()
    }

    // every point through the one shared map
    const move = () => {
      for (const { chains } of paths)
        for (const c of chains)
          for (let i = 0; i < c.n; i++) {
            terrain.displace(c.rest[2 * i], c.rest[2 * i + 1], out)
            c.live[2 * i] = c.rest[2 * i] + out[0]
            c.live[2 * i + 1] = c.rest[2 * i + 1] + out[1]
          }
      // the spot heights ride on their contours: the same map at their anchor
      for (const l of labels) {
        terrain.displace(l.x, l.y, out)
        l.t.setAttribute("x", (l.x + out[0]).toFixed(1))
        l.t.setAttribute("y", (l.y + out[1]).toFixed(1))
      }
    }
    // while it moves: the canvas, in the SVG's own colours (read from its paths, so the
    // transition and the theme all carry over)
    const paint = () => {
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy)
      ctx.clearRect(VIEW.x - OVERSCAN, VIEW.y - OVERSCAN, VIEW.w + 2 * OVERSCAN, VIEW.h + 2 * OVERSCAN)
      for (let ink = 0; ink < 3; ink++) {
        const el = inks[ink]
        if (!el) continue
        const from = getComputedStyle(el)
        ctx.beginPath()
        for (const path of paths) {
          if (inkOf(path) !== ink) continue
          for (const c of path.chains) traceSpline(ctx, c.live, c.n, c.closed)
        }
        ctx.strokeStyle = from.stroke
        ctx.lineWidth = parseFloat(from.strokeWidth) / k // the SVG's strokes do not scale; nor do these
        ctx.stroke()
      }
    }
    // the terrain's lead bends start in open land: tell it what is in view and what covers it, in sheet units
    const layout = () => {
      const at = svg.getBoundingClientRect(), sheet = (r: DOMRect): Box => ({ x0: (r.left - at.left - ox) / k, y0: (r.top - at.top - oy) / k, x1: (r.right - at.left - ox) / k, y1: (r.bottom - at.top - oy) / k })
      terrain.frame(visibleBox(w, h, 0), solids().map(sheet))
    }
    // at rest (paused, offscreen, hidden tab): hand the moved land back to the SVG, once, and let the canvas go
    const settle = () => {
      for (const { p, chains } of paths) p.setAttribute("d", chains.map((c) => splineFlat(c.live, c.n, c.closed)).join(""))
      el.dataset.live = "false"
    }

    // the pointer (a mouse or a pen: touch scrolls the page and never bends the land)
    const host = el.parentElement ?? el
    const title = host.querySelector(".s-title")
    const ptr = { x: 0, y: 0, on: false }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      Object.assign(ptr, { x: e.clientX, y: e.clientY, on: true })
    }
    const onLeave = () => (ptr.on = false)
    host.addEventListener("pointermove", onMove, { passive: true })
    host.addEventListener("pointerleave", onLeave, { passive: true })
    // what the land must not bend under: the heading's letters (not its box), the demo, its controls and labels
    const solids = () => {
      const rects: DOMRect[] = []
      if (title) {
        const r = document.createRange()
        r.selectNodeContents(title)
        rects.push(...r.getClientRects())
      }
      for (const n of host.querySelectorAll(SOLID)) rects.push(n.getBoundingClientRect())
      return rects.filter((r) => r.width && r.height)
    }
    // how far the pointer is from any of them
    const clearance = (x: number, y: number) => {
      let gap = Infinity
      for (const r of solids()) {
        gap = Math.min(gap, Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom)))
      }
      return gap
    }
    const smooth = (a: number, b: number, v: number) => {
      const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
      return t * t * (3 - 2 * t)
    }
    cut()
    let laid = 0
    const sense = (dt: number) => {
      const at = svg.getBoundingClientRect()
      const inside = ptr.on && ptr.x > at.left && ptr.x < at.right && ptr.y > at.top && ptr.y < at.bottom
      const clear = inside ? smooth(CLEAR[0], CLEAR[1], clearance(ptr.x, ptr.y)) : 0
      const sx = (ptr.x - at.left - ox) / k, sy = (ptr.y - at.top - oy) / k
      // a hill rises under it wherever it is over open land
      if (clear > 0 && !tracer) tracer = createTracer()
      terrain.aim(sx, sy, clear)
      // the layout can change under the land (a narrower demo, a wrapped heading): look again now and then
      if ((laid += dt) > 1) {
        laid = 0
        layout()
      }
      // state for tests and tools, written only when it changes
      flag("bend", terrain.raised > INTERVAL / 2)
    }
    const flag = (name: "bend", on: boolean) => {
      if ((el.dataset[name] === "true") !== on) el.dataset[name] = String(on)
    }
    let raf = 0, last = 0, visible = true
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      // a resumed loop starts from where it stopped: the first frame advances nothing (and step() clamps any long one)
      const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 0
      last = now
      sense(dt)
      terrain.step(dt)
      reshape()
      move()
      paint()
      el.dataset.live = "true"
    }
    const sync = () => {
      const run = visible && !document.hidden && !reduce.matches && !pausedRef.current
      if (run && !raf) {
        last = 0
        raf = requestAnimationFrame(frame)
      } else if (!run && raf) {
        cancelAnimationFrame(raf)
        raf = 0
        settle()
      }
    }
    wake.current = sync
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      sync()
    })
    io.observe(el)
    // a new size shows a different slice: cut again; at rest after moving, the SVG takes the new cut at once
    const ro = new ResizeObserver(() => {
      cut()
      if (terrain.time > 0) {
        move()
        if (raf) paint()
        else settle()
      }
    })
    ro.observe(svg)
    document.addEventListener("visibilitychange", sync)
    reduce.addEventListener("change", sync)
    sync()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      host.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerleave", onLeave)
      document.removeEventListener("visibilitychange", sync)
      reduce.removeEventListener("change", sync)
    }
  }, [])

  return (
    <>
      <div className="s-backdrop" ref={ref} aria-hidden="true" data-live="false">
        <canvas className="s-land-live" ref={canvasRef} />
        {children}
      </div>
      <Toggle
        icon
        className="s-motion"
        aria-label="Pause background motion"
        pressed={paused}
        onPressedChange={(v) => {
          setPaused(v)
          pausedRef.current = v
          wake.current()
        }}
        data-testid="motion-toggle"
      >
        {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
      </Toggle>
    </>
  )
}
