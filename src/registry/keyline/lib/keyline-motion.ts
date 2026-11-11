"use client";

import * as React from "react"

/* ------------------------------------------------------------------ *
 * FLOOD ORIGIN
 * A pointer press floods from the press point; keyboard floods from the
 * leading edge (the CSS default). Call from onPointerDown / onKeyDown.
 * ------------------------------------------------------------------ */
export function floodFromPointer(e: React.PointerEvent<HTMLElement>) {
  if (e.button !== 0 || !e.isPrimary) return
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  const x = Math.min(Math.max(e.clientX - r.left, 0), r.width)
  const y = Math.min(Math.max(e.clientY - r.top, 0), r.height)
  el.style.setProperty("--kl-fx", `${x}px`)
  el.style.setProperty("--kl-fy", `${y}px`)
  // SEED: while the press is held, the flood's first --kl-flood-seed of radius sits under the press
  // point, so the press registers where the change will come from. Release commits and the flood grows on from
  // the seed (a transition retargets, it never restarts); a cancelled press (pointer leaves, pointercancel,
  // Escape) lets the seed shrink back into the point. The seed is not state: it shows only on a cell that is off.
  el.setAttribute("data-kl-press", "")
  // the origin belongs to this press only: once the flood it started has run, a later change (programmatic, or a
  // label click) floods from the leading edge again (it reused the last press point indefinitely)
  const leave = () => el.removeAttribute("data-kl-press")
  const esc = (ev: KeyboardEvent) => ev.key === "Escape" && el.removeAttribute("data-kl-press")
  el.addEventListener("pointerleave", leave)
  window.addEventListener("keydown", esc, true)
  const release = () => {
    window.removeEventListener("pointerup", release, true)
    window.removeEventListener("pointercancel", release, true)
    window.removeEventListener("keydown", esc, true)
    el.removeEventListener("pointerleave", leave)
    el.removeAttribute("data-kl-press")
    setTimeout(() => {
      el.style.removeProperty("--kl-fx")
      el.style.removeProperty("--kl-fy")
    }, tokenMs(el, "--kl-t-flood", 140) + 40)
  }
  window.addEventListener("pointerup", release, true)
  window.addEventListener("pointercancel", release, true)
}

export function floodFromKeyboard(e: React.KeyboardEvent<HTMLElement>) {
  e.currentTarget.style.removeProperty("--kl-fx")
  e.currentTarget.style.removeProperty("--kl-fy")
}

/** Props to spread on any flood cell. */
export const floodHandlers = {
  onPointerDown: floodFromPointer,
  onKeyDown: floodFromKeyboard,
}

/* ------------------------------------------------------------------ *
 * SPRING: critically damped (zero bounce). Parameterised by SETTLE time.
 * Retargeting keeps position and velocity, so rapid input never jumps.
 * ------------------------------------------------------------------ */
/** ω·T for a critically damped spring to be within 0.3% of its travel at T: (1 + 8)·e^-8 = 0.302% (a 100px move: 0.3px). */
const SETTLE = 8
export class Spring {
  x: number
  v = 0
  t: number
  /** natural frequency ω (rad/s); 0 until tuned (the spring then coasts) */
  w = 0
  constructor(x: number) {
    this.x = this.t = x
  }
  /** settle time in ms (the same meaning as a CSS duration, so one token serves both); bounce is fixed at 0 */
  tune(ms: number) {
    this.w = SETTLE / (Math.max(ms, 1) / 1000)
    return this
  }
  /**
   * Advance by dt seconds with the exact solution of the critically damped spring, not a numerical integrator:
   *   e(τ) = (e₀ + (v₀ + ω·e₀)·τ)·e^(−ωτ),  v(τ) = (v₀ − ω·(v₀ + ω·e₀)·τ)·e^(−ωτ),  e = x − target
   * It is stable at any stiffness and any frame length, and the curve does not depend on the frame rate. (Fixed 4ms
   * Euler steps were stable only while ω·h < 2: a settle time of 20ms or less diverged to NaN and froze the band.)
   */
  step(dt: number) {
    const w = this.w
    const e0 = this.x - this.t
    const b = this.v + w * e0
    const decay = Math.exp(-w * dt)
    this.x = this.t + (e0 + b * dt) * decay
    this.v = (this.v - w * b * dt) * decay
  }
  done() {
    return Math.abs(this.x - this.t) < 0.3 && Math.abs(this.v) < 3
  }
  snap(x: number) {
    this.x = this.t = x
    this.v = 0
  }
}

type Ticker = (dt: number) => boolean
const tickers = new Set<Ticker>()
const fresh = new Set<Ticker>()
let raf = 0
let last = 0
function frame() {
  // One clock for every step. The rAF timestamp is when the frame began, which after a long task (a route render)
  // is earlier than the performance.now() that animate() started from: the first step came out as 1ms and the
  // next one made up the rest, so the band's edges leapt 70px and 40px in one frame. A frame that
  // arrives late counts as one ordinary frame, and a motion's first step is never more than one frame: it starts
  // from where it is.
  const now = performance.now()
  const gap = (now - last) / 1000
  const dt = gap > 0.05 ? 1 / 60 : Math.min(0.034, Math.max(0.001, gap))
  last = now
  for (const t of tickers) if (!t(fresh.delete(t) ? Math.min(dt, 1 / 60) : dt)) tickers.delete(t)
  raf = tickers.size ? requestAnimationFrame(frame) : 0
}
export function animate(t: Ticker) {
  tickers.add(t)
  fresh.add(t)
  if (!raf) {
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  return () => (fresh.delete(t), tickers.delete(t))
}

/* ------------------------------------------------------------------ *
 * TOKENS: custom properties are unparsed strings, and a consumer's CSS pipeline rewrites them (Lightning CSS,
 * esbuild and cssnano emit `160ms` as `.16s`). The unit decides the value: parseFloat alone read `.16s` as
 * 0.16ms and every timed motion collapsed in production builds.
 * ------------------------------------------------------------------ */
const NUM = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?`
const TIME = new RegExp(`^(${NUM})(ms|s)?$`, "i")
const LENGTH = new RegExp(`^(${NUM})(px)?$`, "i")

/** A CSS <time> in ms: `ms`, `s`, or a unitless number (read as ms, the --kl-stretch-* tokens). null otherwise. */
export function parseCssTime(value: string): number | null {
  const m = TIME.exec(value.trim())
  if (!m) return null
  const n = Number(m[1])
  return m[2]?.toLowerCase() === "s" ? n * 1000 : n
}

/** A CSS length in px: `px` or a unitless number. null otherwise (relative units need a context we do not have). */
export function parseCssLength(value: string): number | null {
  const m = LENGTH.exec(value.trim())
  return m ? Number(m[1]) : null
}

const readToken = (el: Element | null | undefined, prop: string) => (el ? getComputedStyle(el).getPropertyValue(prop) : "")

/** A timing token's value in ms (0 under reduced motion), read where the motion runs. */
export function tokenMs(el: Element | null | undefined, prop: string, fallback: number) {
  return parseCssTime(readToken(el, prop)) ?? fallback
}

/** A distance token's value in px, read where the motion runs. */
export function tokenPx(el: Element | null | undefined, prop: string, fallback: number) {
  return parseCssLength(readToken(el, prop)) ?? fallback
}

/* ------------------------------------------------------------------ *
 * INPUT: which kind of input caused the change being rendered now. A change made from the keyboard is shown
 * at once (keyboard work is fast and repeated); a pointer change may travel. One listener pair per document.
 * ------------------------------------------------------------------ */
const input = { key: false, t: 0 }
let inputListening = false
function listenInput() {
  if (inputListening || typeof document === "undefined") return
  inputListening = true
  const on = (key: boolean) => () => {
    input.key = key
    input.t = performance.now()
  }
  document.addEventListener("keydown", on(true), true)
  document.addEventListener("pointerdown", on(false), true)
}
/** True when the latest input was a key, pressed within the last 400ms (a programmatic change counts as pointer). */
export function changedByKey() {
  return input.key && performance.now() - input.t < 400
}

/* ------------------------------------------------------------------ *
 * RELEASE: a CSS curve that starts at the speed the hand let go at, so a released surface never stalls
 * (an ease-in after a fling) or jumps (a strong ease-out after a drag that came to rest). The curve is a
 * cubic-bezier whose initial slope is v·T/D; it always ends at rest, with no overshoot.
 *   v: release velocity toward the destination, px/ms (≤ 0: at rest or moving away)
 *   d: distance still to travel, px · ms: the transition's duration
 * ------------------------------------------------------------------ */
export function releaseEasing(v: number, d: number, ms: number) {
  const slope = d > 0.5 && ms > 0 ? Math.max(0, v) * (ms / d) : 0
  const x1 = 0.3
  const y1 = Math.min(1, slope * x1)
  return `cubic-bezier(${x1}, ${y1.toFixed(3)}, 0.2, 1)`
}

/** Pointer velocity along one axis over the last ~80ms of movement (px/ms). Feed it pointermove events. */
export function velocityTracker() {
  const pts: { t: number; x: number; y: number }[] = []
  return {
    push(e: { clientX: number; clientY: number; timeStamp: number }) {
      pts.push({ t: e.timeStamp, x: e.clientX, y: e.clientY })
      while (pts.length > 2 && pts[pts.length - 1].t - pts[0].t > 80) pts.shift()
    },
    reset() {
      pts.length = 0
    },
    /** velocity in px/ms; 0 when the pointer has rested for 60ms or more */
    get(now: number) {
      if (pts.length < 2) return { x: 0, y: 0 }
      const a = pts[0]
      const b = pts[pts.length - 1]
      const dt = Math.max(1, b.t - a.t)
      if (now - b.t > 60) return { x: 0, y: 0 }
      return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt }
    },
  }
}

/**
 * How far into `el`, from its edge on the side a band arrives from, the first ink lies: text, an icon, an image.
 * Cells inside the item (an icon cell, a box cell) are not ink, their content is. Used to keep a leaning band
 * off every label (a label under the band's edge would be ink on ink).
 */
function inkRoom(el: HTMLElement, axis: "x" | "y", fwd: boolean) {
  const r = el.getBoundingClientRect()
  let room = Infinity
  const take = (b: DOMRect) => {
    if (!b.width || !b.height) return
    room = Math.min(room, axis === "x" ? (fwd ? b.left - r.left : r.right - b.right) : fwd ? b.top - r.top : r.bottom - b.bottom)
  }
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let seen = 0
  for (let n = walk.nextNode(); n && seen < 40; n = walk.nextNode(), seen++) {
    if (n.nodeType === Node.TEXT_NODE) {
      if (!n.textContent?.trim()) continue
      range.selectNodeContents(n)
      Array.from(range.getClientRects()).forEach(take)
    } else if (n instanceof SVGSVGElement || n instanceof HTMLImageElement || (n as HTMLElement).matches?.(".kl-lamp, .kl-check, .kl-radio, .kl-glyph")) {
      take((n as Element).getBoundingClientRect())
    }
  }
  return room
}

/* ------------------------------------------------------------------ *
 * STRETCH: one band inside a frame. The edge on the travel side leads,
 * the other trails. Clamped to the frame.
 *
 * The motion runs on the compositor, never frame by frame on the main
 * thread: a page's render (a route change, an example mounting) is a long
 * task, and a band stepped from requestAnimationFrame stood still for its
 * length, several items tall, over labels it had not flipped. A move
 * samples both springs (exact, analytic) up front and plays them as
 * transform-only animations:
 *   - the band clips from its leading-in edge `a` onward (overflow: hidden),
 *   - a fill inside it (the band's own class: its colour, ink column, mark)
 *     ends at `b`, so what shows is exactly [a, b], at every instant, with
 *     nothing scaled;
 *   - a travel (a new selection, not a press's lean) carries a copy of the
 *     host with every item covered, inert and hidden from assistive
 *     technology, pinned to the real items. The band rises over them for
 *     the move, so a label reads in its covered colours exactly where the
 *     band is (a wipe) and never in the covered colours off the band.
 * At rest the band is a plain box under its items and the copy is gone;
 * an item the band covers carries data-kl-covered.
 *
 * Markup: container (position: relative) holding
 *   <span data-kl-band />   and items with [data-kl-item].
 * `active` is the index of the selected item (or -1 for none).
 * ------------------------------------------------------------------ */
/** Samples per second of a planned move: a keyframe every ~4ms, finer than any display refresh. */
const PLAN_HZ = 240
/** A move never plans past this (a stuck spring would otherwise plan forever). */
const PLAN_MAX_S = 4

/** Attributes a copy of the host must not keep: ids and form names duplicate the real ones; roles, slots and the
 * stretch hooks would make the copy's rows look like the real ones to the engine, to selectors and to the TUG rule (no
 * component styles by role; ARIA goes too, see ghostOf; the data- states styles read, such as data-checked, stay). */
const GHOST_DROP = ["id", "role", "name", "form", "for", "data-testid", "data-slot", "data-kl-item", "data-kl-stretch", "data-kl-tug", "data-kl-more", "autofocus", "tabindex"]

/** The host, every item covered: the labels as they read on the band. */
function ghostOf(host: HTMLElement, items: HTMLElement[]) {
  const mark = "data-kl-ghost-item"
  items.forEach((el) => el.setAttribute(mark, ""))
  const root = host.cloneNode(true) as HTMLElement
  items.forEach((el) => el.removeAttribute(mark))
  root.querySelectorAll(`[${mark}]`).forEach((el) => {
    el.removeAttribute(mark)
    el.setAttribute("data-kl-covered", "")
  })
  // the band's own copy stays as a hidden placeholder, so sibling and nth-child rules count the same children
  const band = root.querySelector<HTMLElement>(":scope > [data-kl-band]")
  if (band) {
    band.replaceChildren()
    band.removeAttribute("style")
    band.removeAttribute("data-kl-flight")
    band.removeAttribute("data-kl-band")
    band.hidden = true
  }
  root.querySelectorAll(".kl-more-fade").forEach((el) => el.remove())
  for (const el of [root, ...Array.from(root.querySelectorAll("*"))]) {
    for (const a of GHOST_DROP) el.removeAttribute(a)
    // no ARIA at all: the copy is hidden from assistive tech, and a second aria-current or aria-selected would answer
    // every [aria-current] lookup twice (the copy reads covered through data-kl-covered, not its ARIA state)
    for (const a of Array.from(el.attributes)) if (a.name.startsWith("aria-")) el.removeAttribute(a.name)
  }
  root.setAttribute("aria-hidden", "true")
  root.setAttribute("data-kl-ghost", "")
  root.inert = true
  const s = root.style
  s.position = "absolute"
  s.insetInlineStart = s.insetBlockStart = s.left = s.top = "0px"
  s.margin = "0"
  s.boxSizing = "border-box"
  s.width = `${host.offsetWidth}px`
  s.height = `${host.offsetHeight}px`
  s.overflow = "visible"
  s.background = "none"
  s.pointerEvents = "none"
  s.transition = "none"
  return root
}

export function useStretch(
  containerRef: React.RefObject<HTMLElement | null>,
  active: number,
  {
    axis: axisOpt = "x",
    inset = 0,
    instant = false,
    press = true,
  }: {
    axis?: "x" | "y" | "auto"
    inset?: number
    /**
     * Place the band without travel on this change: the caller knows the move is a layout change, not a new
     * selection (Nav: a nested list opened or closed). The selection's own element moving is detected anyway.
     */
    instant?: boolean
    /**
     * TUG: while a pointer is held on another item, the band's leading edge leans toward it by
     * --kl-stretch-tug (never past 45% of the way, so no label flips before the choice is made). Release
     * over it commits; sliding to another item leans there instead, and release over a radio or tab commits
     * that one (the browser sends a release that moved to the common ancestor); release elsewhere, Escape or
     * pointercancel (a scroll took over) lets the edge settle back. Default on.
     */
    press?: boolean
  } = {},
) {
  listenInput()
  const instantRef = React.useRef(instant)
  instantRef.current = instant
  const lastEl = React.useRef<HTMLElement | null>(null)
  type Measured = NonNullable<ReturnType<typeof measure>>
  type Box = Measured["boxes"][number]
  /**
   * The springs hold their state at `at` (performance.now()); while a move plays, their state at any later time is
   * an exact step from there. m and tgt live here so a resize mid-flight can re-plan the move on the new geometry.
   * `mode`: rest, a lean (a held press: the band stays under the items, nothing is copied) or a travel.
   */
  type Flight = { clip: HTMLElement; fill: HTMLElement; ghost?: HTMLElement; anims: Animation[]; size: string }
  type State = { a: Spring; b: Spring; at: number; m: Measured; tgt: Box; mode: "rest" | "lean" | "travel"; flight?: Flight }
  const state = React.useRef<State | null>(null)
  const written = React.useRef<Record<string, string>>({})

  const measure = React.useCallback(() => {
    const host = containerRef.current
    if (!host) return null
    const items = Array.from(host.querySelectorAll<HTMLElement>(":scope [data-kl-item]")).filter(
      (el) => el.closest("[data-kl-stretch]") === host,
    )
    const band = host.querySelector<HTMLElement>(":scope > [data-kl-band]")
    if (!band) return null
    // "auto" follows the container's flex direction, so a nav that turns from a column into a row keeps working
    const axis: "x" | "y" = axisOpt === "auto" ? (getComputedStyle(host).flexDirection.startsWith("column") ? "y" : "x") : axisOpt
    const hr = host.getBoundingClientRect()
    const box = (el: HTMLElement) => {
      let r: { left: number; right: number; top: number; bottom: number; width: number; height: number } = el.getBoundingClientRect()
      // an item inside a clipping fold ([data-kl-clip], e.g. a nested Nav list unfolding) counts only its visible
      // part: a row still hidden under the fold is never "covered" (its colours would flip with no band behind it)
      const clip = el.parentElement?.closest<HTMLElement>("[data-kl-clip]")
      if (clip && host.contains(clip)) {
        const c = clip.getBoundingClientRect()
        const top = Math.min(Math.max(r.top, c.top), c.bottom)
        const bottom = Math.max(Math.min(r.bottom, c.bottom), top)
        const left = Math.min(Math.max(r.left, c.left), c.right)
        const right = Math.max(Math.min(r.right, c.right), left)
        r = { left, right, top, bottom, width: right - left, height: bottom - top }
      }
      return axis === "x"
        ? { a: r.left - hr.left - host.clientLeft + host.scrollLeft, b: r.right - hr.left - host.clientLeft + host.scrollLeft, c0: r.top - hr.top - host.clientTop, cl: r.height, c1: host.clientHeight - (r.bottom - hr.top - host.clientTop) }
        : { a: r.top - hr.top - host.clientTop + host.scrollTop, b: r.bottom - hr.top - host.clientTop + host.scrollTop, c0: r.left - hr.left - host.clientLeft, cl: r.width, c1: host.clientWidth - (r.right - hr.left - host.clientLeft) }
    }
    // items on fractional pixels (a row with a description is 54.7px): the band's edge is anti-aliased while the
    // next item's seam snaps to a device pixel, so a paper hairline can show between them at some zooms (round
    // 27). An item the next one meets (within 2px) runs 1px under that item's seam, which paints over the band.
    const boxes = items.map(box)
    boxes.forEach((q, i) => {
      const n = boxes[i + 1]
      if (!n) return
      if (Math.abs(n.a - q.b) < 2) q.b = n.a + 1 // the next item follows (top to bottom, left to right)
      else if (Math.abs(n.b - q.a) < 2) q.a = n.b - 1 // it precedes (a right-to-left row)
    })
    let lo = Infinity
    let hi = -Infinity
    for (const q of boxes) {
      if (q.a < lo) lo = q.a
      if (q.b > hi) hi = q.b
    }
    return { host, band, items, boxes, axis, lo, hi }
  }, [containerRef, axisOpt])

  // write only what changed: the cross axis is constant through a move, so most writes are skipped
  const write = React.useCallback((band: HTMLElement, k: string, v: number) => {
    const w = written.current
    const px = `${Math.round(v * 100) / 100}px`
    if (w[k] !== px) band.style.setProperty(k, (w[k] = px))
  }, [])

  /** The band at rest on [a, b]; an item more than half under it is covered. */
  const render = React.useCallback(
    (m: Measured, a: number, b: number, cross: { c0: number; cl: number; c1?: number }) => {
      if (b - a < 2) b = a + 2
      const [main, mainSize, side, sideSize] = m.axis === "x" ? ["left", "width", "top", "height"] : ["top", "height", "left", "width"]
      write(m.band, main, a + inset)
      write(m.band, mainSize, b - a - 2 * inset)
      write(m.band, side, cross.c0 + inset)
      write(m.band, sideSize, cross.cl - 2 * inset)
      // how far the band sits from each side of the host across the travel (constant through a move): a host can
      // paint part of the band by the host's own columns, e.g. the Nav's ink key column
      write(m.band, "--kl-band-c0", cross.c0 + inset)
      write(m.band, "--kl-band-c1", (cross.c1 ?? 0) + inset)
      m.items.forEach((it, i) => {
        const q = m.boxes[i]
        const ov = Math.max(0, Math.min(b, q.b) - Math.max(a, q.a)) / Math.max(1, q.b - q.a)
        it.toggleAttribute("data-kl-covered", ov > 0.5)
      })
    },
    [inset, write],
  )

  /** End a move where it stands: its animations, the fill and the copy go; the band is a plain box again. */
  const ground = React.useCallback((st: State | null) => {
    const f = st?.flight
    if (!st || !f) return
    st.flight = undefined
    f.anims.forEach((x) => x.cancel())
    f.clip.remove()
    st.m.band.removeAttribute("data-kl-flight")
  }, [])

  /** Bring the springs to now: the exact state the playing move shows at this instant. */
  const advance = (st: State) => {
    const now = performance.now()
    const dt = (now - st.at) / 1000
    if (st.mode !== "rest" && dt > 0) {
      st.a.step(dt)
      st.b.step(dt)
    }
    st.at = now
  }

  /** Land a finished move: exactly on each edge's own target (the selected box, or the leaning edge of a tug). */
  const land = React.useCallback(
    (st: State) => {
      ground(st)
      st.a.snap(st.a.t)
      st.b.snap(st.b.t)
      st.mode = "rest"
      st.at = performance.now()
      render(st.m, st.a.t, st.b.t, st.tgt)
    },
    [ground, render],
  )

  /** Snap the band to a box with no motion (first paint, reduced motion, a layout change, resize at rest). */
  const place = React.useCallback(
    (m: Measured, t: Box) => {
      ground(state.current)
      state.current = { a: new Spring(t.a), b: new Spring(t.b), at: performance.now(), m, tgt: t, mode: "rest" }
      render(m, t.a, t.b, t)
    },
    [ground, render],
  )

  /**
   * Play the springs from their state now (call advance() before changing a target) to their targets, on the
   * compositor. `travel`: a new selection, so the copy of the covered labels rides in the band; a lean keeps the
   * band under the items. A move already travelling stays a travel.
   */
  const fly = React.useCallback(
    (st: State, travel: boolean) => {
      const { m, tgt } = st
      const clamp = (v: number) => Math.min(m.hi, Math.max(m.lo, v))
      // the whole move, sampled from the exact springs
      const a = new Spring(st.a.x)
      const b = new Spring(st.b.x)
      Object.assign(a, { v: st.a.v, t: st.a.t, w: st.a.w })
      Object.assign(b, { v: st.b.v, t: st.b.t, w: st.b.w })
      const ts = [0]
      const as = [clamp(a.x)]
      const bs = [clamp(b.x)]
      const dt = 1 / PLAN_HZ
      for (let i = 1; i <= PLAN_HZ * PLAN_MAX_S && !(a.done() && b.done()); i++) {
        a.step(dt)
        b.step(dt)
        ts.push(i * dt * 1000)
        as.push(clamp(a.x))
        bs.push(clamp(b.x))
      }
      // the last keyframe is the target itself
      as[as.length - 1] = clamp(a.t)
      bs[bs.length - 1] = clamp(b.t)
      const D = ts[ts.length - 1]
      if (D <= 0) return land(st)
      const mode = travel || st.mode === "travel" ? "travel" : "lean"
      st.mode = mode
      // Three boxes, only the inner two move: the band holds still over the run of items and clips (a moving
      // box's transformed bounds would add to a scrolling row's overflow and grow its scroll range mid-move); a clip
      // inside it starts at the leading-in edge; the fill inside that ends at the far edge.
      const y = m.axis === "y"
      const L = m.hi - m.lo + 4
      const [main, mainSize, side, sideSize] = y ? ["top", "height", "left", "width"] : ["left", "width", "top", "height"]
      const band = m.band
      write(band, main, m.lo)
      write(band, mainSize, m.hi - m.lo)
      write(band, side, tgt.c0 + inset)
      write(band, sideSize, tgt.cl - 2 * inset)
      write(band, "--kl-band-c0", tgt.c0 + inset)
      write(band, "--kl-band-c1", (tgt.c1 ?? 0) + inset)
      band.setAttribute("data-kl-flight", mode)
      let f = st.flight
      const box = (el: HTMLElement) => {
        const s = el.style
        s.position = "absolute"
        s.left = s.top = "0px"
        s.margin = "0"
        s.overflow = "hidden"
        s.pointerEvents = "none"
        s.setProperty(mainSize, `${L}px`)
        s.setProperty(sideSize, "100%")
      }
      if (!f) {
        const clip = document.createElement("span")
        clip.setAttribute("data-kl-band-clip", "")
        const fill = document.createElement("span")
        fill.className = band.className
        fill.setAttribute("data-kl-band-fill", "")
        box(clip)
        box(fill)
        clip.appendChild(fill)
        band.appendChild(clip)
        f = st.flight = { clip, fill, anims: [], size: "" }
      } else {
        box(f.clip)
        box(f.fill)
      }
      if (mode === "travel") {
        // a copy of the labels as they read on the band; re-made when the host's size changed under a move
        const size = `${m.host.offsetWidth}x${m.host.offsetHeight}`
        if (!f.ghost || f.size !== size) {
          f.ghost?.remove()
          f.ghost = ghostOf(m.host, m.items)
          f.size = size
          f.fill.appendChild(f.ghost)
        }
        // under the copy the real labels read as off the band: on paper they must never show the covered colours
        m.items.forEach((it) => it.removeAttribute("data-kl-covered"))
      }
      // each translation is linear in the samples, so what shows (their sum) is exact between keyframes too:
      // the clip starts at a, the fill ends at b, the copy is pinned to the host's own origin
      const T = (v: number) => (y ? `translateY(${v}px)` : `translateX(${v}px)`)
      const off = (i: number) => ts[i] / D
      const start = (i: number) => as[i] + inset
      const end = (i: number) => bs[i] - inset
      const baseMain = y ? -m.host.clientTop : -m.host.clientLeft
      const baseCross = (y ? -m.host.clientLeft : -m.host.clientTop) - (tgt.c0 + inset)
      const kfClip = ts.map((_, i) => ({ offset: off(i), transform: T(start(i) - m.lo) }))
      const kfFill = ts.map((_, i) => ({ offset: off(i), transform: T(end(i) - start(i) - L) }))
      const opts: KeyframeAnimationOptions = { duration: D, easing: "linear", fill: "forwards" }
      const prev = f.anims
      const anims = [f.clip.animate(kfClip, opts), f.fill.animate(kfFill, opts)]
      if (f.ghost) {
        // the fill's origin sits at end - L in the host's content box; the copy goes back to the host's border box
        const kfGhost = ts.map((_, i) => {
          const mm = baseMain - (end(i) - L)
          return { offset: off(i), transform: y ? `translate(${baseCross}px, ${mm}px)` : `translate(${mm}px, ${baseCross}px)` }
        })
        anims.push(f.ghost.animate(kfGhost, opts))
      }
      f.anims = anims
      prev.forEach((x) => x.cancel())
      anims[0].onfinish = () => {
        if (st.flight?.anims === anims) land(st)
      }
    },
    [inset, land, write],
  )

  React.useLayoutEffect(() => {
    const m = measure()
    if (!m) return
    roRef.current && m.items.forEach((el) => roRef.current!.observe(el)) // items inserted since mount reflow too
    // an element that stopped being an item (a row folding away, unmounting) must not keep the covered colours;
    // the copy riding in the band keeps its own
    m.host.querySelectorAll<HTMLElement>("[data-kl-covered]").forEach((el) => {
      if (!m.items.includes(el) && !el.closest("[data-kl-ghost]")) el.removeAttribute("data-kl-covered")
    })
    if (active < 0 || !m.boxes[active]) {
      lastEl.current = null
      ground(state.current)
      m.band.hidden = true
      m.items.forEach((it) => it.removeAttribute("data-kl-covered"))
      state.current = null
      return
    }
    m.band.hidden = false
    const tgt = m.boxes[active]
    const lead = tokenMs(m.host, "--kl-stretch-lead", 100)
    const trail = tokenMs(m.host, "--kl-stretch-trail", 220)
    const st = state.current
    // the same element at a new index: items were inserted or removed around it. The selection did not change,
    // so the band stays on it; travelling from the old coordinates would sweep across the neighbours that now
    // sit there (closing a nested Nav list swept the band over the next row)
    const same = lastEl.current === m.items[active]
    lastEl.current = m.items[active]
    if (!st || lead === 0 || same || instantRef.current) return place(m, tgt)
    advance(st)
    // the edge on the travel side leads; the other trails. Semantics are already committed (this runs after render)
    const forward = tgt.a > st.a.t
    const leading = forward ? st.b : st.a
    leading.tune(lead)
    ;(forward ? st.a : st.b).tune(trail)
    st.a.t = tgt.a
    st.b.t = tgt.b
    st.m = m
    st.tgt = tgt
    m.host.removeAttribute("data-kl-tug")
    // From the keyboard the leading edge lands at once, so the new choice is filled on the frame of the key
    // press (arrowing is fast and repeated: nothing to wait for); the trailing edge still catches up from where
    // the band was, which is what says where the choice came from
    if (changedByKey()) leading.snap(forward ? tgt.b : tgt.a)
    fly(st, true)
  }, [active, measure, place, fly, ground])

  // TUG: the pointer's intent before release (see `press`)
  React.useEffect(() => {
    if (!press) return
    // resolved at each press: a host element can be replaced while the hook stays mounted
    let host = containerRef.current as HTMLElement
    let pid = -1
    let down: HTMLElement | null = null
    let cancelled = false
    let hold = 0
    const off = (el: Element) => el.matches(":disabled, [data-disabled], [aria-disabled='true']")
    const itemAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-kl-item]")
      return el && el.closest("[data-kl-stretch]") === host ? el : null
    }
    const lean = (el: HTMLElement | null) => {
      const st = state.current
      if (!st) return
      const m = measure()
      if (!m) return
      st.m = m
      const rest = st.tgt
      let a = rest.a
      let b = rest.b
      const i = el && !off(el) ? m.items.indexOf(el) : -1
      const q = i >= 0 ? m.boxes[i] : null
      const tug = tokenPx(host, "--kl-stretch-tug", 12)
      const leadMs = tokenMs(host, "--kl-stretch-lead", 100)
      if (el && q && tug > 0 && leadMs > 0 && Math.abs(q.a - rest.a) > 1) {
        const fwd = q.a > rest.a
        // never over the target's label: the lean stops 2px short of its content (a 24px tug hid the M of
        // "Month" under the ink band; a compact item has only 10px of inset)
        // the lean enters the item next to the band on the travel side (by geometry, so RTL rows work), which is
        // the pressed one only when it is adjacent
        let near = -1
        m.boxes.forEach((x, k) => {
          if (fwd ? x.a >= rest.b - 2 && (near < 0 || x.a < m.boxes[near].a) : x.b <= rest.a + 2 && (near < 0 || x.b > m.boxes[near].b)) near = k
        })
        const into = near >= 0 ? m.items[near] : el
        const room = inkRoom(into, m.axis, fwd)
        const pull = Math.min(tug, room - 2)
        if (pull >= 3) {
          if (fwd) b = rest.b + Math.min(pull, 0.45 * (q.b - rest.b))
          else a = rest.a - Math.min(pull, 0.45 * (rest.a - q.a))
        }
      }
      if (Math.abs(st.a.t - a) < 0.01 && Math.abs(st.b.t - b) < 0.01) return
      advance(st)
      st.a.tune(leadMs)
      st.b.tune(leadMs)
      st.a.t = a
      st.b.t = b
      host.toggleAttribute("data-kl-tug", a !== rest.a || b !== rest.b)
      fly(st, false)
    }
    const block = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const end = () => {
      window.removeEventListener("pointermove", onMove, true)
      window.removeEventListener("pointerup", onUp, true)
      window.removeEventListener("pointercancel", onCancel, true)
      window.removeEventListener("keydown", onKey, true)
      clearTimeout(hold)
      pid = -1
      down = null
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId === pid && !cancelled) lean(itemAt(e.clientX, e.clientY))
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pid) return
      const from = down
      const over = cancelled ? null : itemAt(e.clientX, e.clientY)
      end()
      if (cancelled) {
        // the release still clicks the pressed item if it is under the pointer: swallow that one click
        host.addEventListener("click", block, true)
        setTimeout(() => host.removeEventListener("click", block, true))
      } else if (over && from && over !== from && !off(over) && over.matches("[role=radio], [role=tab], :has(input[type=radio])")) {
        // moved from one choice to another: the browser clicks their common ancestor, so commit the one released on
        const hit = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
        ;(hit && over.contains(hit) ? hit : over).click()
        lean(over)
      }
      if (!cancelled && over && (over === from || over.matches("[role=radio], [role=tab], :has(input[type=radio])"))) {
        // a release that commits keeps the lean until the selection lands (the layout effect then stretches on from
        // it). Letting go first pulled the band back, and brought the hover tint back, for as long as the change
        // took to render (a nav link renders a page: 50-80ms), so the band went the wrong way, then leapt.
        // If nothing selects it (a link that goes nowhere, a prevented click), the lean lets go shortly after.
        hold = window.setTimeout(() => lean(null), 300)
        return
      }
      lean(null)
    }
    const onCancel = (e: PointerEvent) => {
      if (e.pointerId !== pid) return
      end()
      lean(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      cancelled = true
      lean(null)
    }
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !e.isPrimary || pid !== -1) return
      const h = containerRef.current
      if (!h || !(e.target instanceof Node) || !h.contains(e.target)) return
      host = h
      clearTimeout(hold)
      const it = itemAt(e.clientX, e.clientY)
      if (!it) return
      pid = e.pointerId
      down = it
      cancelled = false
      window.addEventListener("pointermove", onMove, true)
      window.addEventListener("pointerup", onUp, true)
      window.addEventListener("pointercancel", onCancel, true)
      window.addEventListener("keydown", onKey, true)
      lean(it)
    }
    document.addEventListener("pointerdown", onDown, true)
    return () => {
      document.removeEventListener("pointerdown", onDown, true)
      end()
    }
  }, [containerRef, measure, fly, press])

  // a band that goes away mid-move takes its animations, fill and copy with it
  React.useEffect(() => () => ground(state.current), [ground])

  // Keep the band attached when anything resizes: the host, or an item whose text reflows (a webfont replacing
  // its fallback, a label change). At rest it snaps; mid-flight it re-plans the move from the springs' state now to
  // the new box, so a resize during a move never leaves the band on a stale geometry (it did, by up to 60px).
  const activeRef = React.useRef(active)
  activeRef.current = active
  const roRef = React.useRef<ResizeObserver | null>(null)
  React.useEffect(() => {
    const host = containerRef.current
    if (!host || typeof ResizeObserver === "undefined") return
    let last = ""
    const sync = () => {
      const m = measure()
      const i = activeRef.current
      const t = m && i >= 0 ? m.boxes[i] : undefined
      const key = t ? [i, t.a, t.b, t.c0, t.cl].map((v) => v.toFixed(1)).join(":") : ""
      if (!m || !t || key === last) return
      last = key
      const st = state.current
      if (st && st.mode !== "rest") {
        advance(st)
        st.m = m
        st.tgt = t
        st.a.t = t.a
        st.b.t = t.b
        fly(st, false)
      } else place(m, t)
    }
    const ro = new ResizeObserver(sync)
    roRef.current = ro
    ro.observe(host)
    measure()?.items.forEach((el) => ro.observe(el))
    // A layout transition inside the host (a nested list folding) moves items without resizing them or the host,
    // so no observer fires: follow it frame by frame while it runs (the band stayed behind on the old
    // row while the selected one slid away under the fold)
    const LAYOUT = /^(height|width|max-height|max-width|grid-template-rows|grid-template-columns)$/
    let running = 0
    let stopFollow: (() => void) | undefined
    const onRun = (e: TransitionEvent) => {
      if (!LAYOUT.test(e.propertyName)) return
      running++
      stopFollow ??= animate(() => {
        sync()
        return running > 0
      })
    }
    const onEnd = (e: TransitionEvent) => {
      if (!LAYOUT.test(e.propertyName)) return
      running = Math.max(0, running - 1)
      if (!running) {
        stopFollow = undefined
        sync() // the final layout, after the last frame the follower saw
      }
    }
    host.addEventListener("transitionrun", onRun)
    host.addEventListener("transitionend", onEnd)
    host.addEventListener("transitioncancel", onEnd)
    return () => {
      ro.disconnect()
      roRef.current = null
      host.removeEventListener("transitionrun", onRun)
      host.removeEventListener("transitionend", onEnd)
      host.removeEventListener("transitioncancel", onEnd)
      running = 0
    }
  }, [containerRef, measure, place, fly])
}

/** Signal helper: briefly mark an element as done (affix cell flood), e.g. after an async action. */
export function useTransientFlag(ms = 900): [boolean, () => void] {
  const [on, setOn] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const fire = React.useCallback(() => {
    clearTimeout(timer.current)
    setOn(true)
    timer.current = setTimeout(() => setOn(false), ms)
  }, [ms])
  React.useEffect(() => () => clearTimeout(timer.current), [])
  return [on, fire]
}

/**
 * UNFOLD presence: keeps a surface mounted while it folds back, and opens it one frame after mount so the
 * grid-template-rows transition runs. Exit time is read from --kl-t-fold (0 under reduced motion).
 */
export function usePresence(open: boolean, ref?: React.RefObject<HTMLElement | null>) {
  const [mounted, setMounted] = React.useState(open)
  const [shown, setShown] = React.useState(false)
  React.useEffect(() => {
    if (open) {
      setMounted(true)
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(r)
    }
    setShown(false)
    const el = ref?.current ?? document.documentElement
    const ms = tokenMs(el, "--kl-t-fold", 120)
    const t = setTimeout(() => setMounted(false), ms)
    return () => clearTimeout(t)
  }, [open, ref])
  return { mounted, shown }
}
