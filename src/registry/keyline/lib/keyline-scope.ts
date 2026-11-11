"use client";

import * as React from "react"

/* ------------------------------------------------------------------ *
 * PORTAL SCOPE
 * Overlays render in a portal under <body>, so they would lose any configuration set on a subtree:
 * the public configuration tokens (palette, type, cut), data-kl-density, data-kl-motion, .dark / .light
 * and dir. A hidden marker stays where the component is written; on open, the overlay copies the
 * marker's resolved configuration onto its own root and marks it data-kl-config, so the theme's
 * derivations (fills, foregrounds, focus, data colours) recompute there from the copied sources.
 * No provider, no context: the DOM is the source of truth.
 * ------------------------------------------------------------------ */

/** The public configuration tokens. Only these travel into portals; every other --kl-* is derived. */
export const KEYLINE_CONFIG_TOKENS = [
  "--kl-working",
  "--kl-commit",
  "--kl-attention",
  "--kl-neutral-h",
  "--kl-neutral-c",
  "--kl-font",
  "--kl-font-mono",
  "--kl-weight-strong",
  "--kl-weight-display",
  "--kl-cut",
] as const

export type KeylineScope = {
  style?: React.CSSProperties
  className?: string
  dir?: "ltr" | "rtl"
  "data-kl-density"?: string
  "data-kl-motion"?: string
}

function read(marker: Element): KeylineScope {
  return readAt(marker.parentElement ?? marker)
}

function readAt(host: Element): KeylineScope {
  const out: KeylineScope = {}
  const cs = getComputedStyle(host)
  const style: Record<string, string> = {}
  for (const t of KEYLINE_CONFIG_TOKENS) {
    const v = cs.getPropertyValue(t).trim()
    if (v) style[t] = v
  }
  if (Object.keys(style).length) out.style = style as React.CSSProperties
  const density = host.closest("[data-kl-density]")?.getAttribute("data-kl-density")
  if (density) out["data-kl-density"] = density
  const motion = host.closest("[data-kl-motion]")?.getAttribute("data-kl-motion")
  if (motion) out["data-kl-motion"] = motion
  const theme = host.closest(".dark, .light")
  if (theme) out.className = theme.classList.contains("dark") ? "dark" : "light"
  // the same lookup as domDir: a dir="auto" text run between the host and the page does not set the popup's direction
  const dir = host.closest('[dir]:not([dir="auto" i])')?.getAttribute("dir")?.toLowerCase()
  if (dir === "rtl" || dir === "ltr") out.dir = dir
  return out
}

const same = (a: KeylineScope, b: KeylineScope) => JSON.stringify(a) === JSON.stringify(b)

/** Everything but the direction matches: a portal under <body> would resolve the same configuration. */
const inherits = (a: KeylineScope, b: KeylineScope) => same({ ...a, dir: undefined }, { ...b, dir: undefined })

/** The first guess: the page's direction (what an overlay on a page configured at <html> ends up with). */
function pageScope(): KeylineScope {
  if (typeof document === "undefined" || !document.body) return {}
  const dir = document.body.closest("[dir]")?.getAttribute("dir")
  return dir === "rtl" || dir === "ltr" ? { dir } : {}
}

/** Reads the scope after every render of the overlay it sits in (see `useKeylineScope`). */
function ScopeProbe({ sync }: { sync: () => void }) {
  React.useLayoutEffect(sync)
  return null
}

/**
 * Returns `[marker, scope, probe]`. Render `marker` next to the portal (it is `display: none`), and spread
 * `scope` (via `scopeProps`) on the portaled root. The scope is re-read after every render (a computed-style
 * read, committed only when something changed), so a configuration that changes while the overlay is
 * mounted (a theme switch, a tenant scope, the playground) reaches it too. Who reads:
 * - `open` true (the default): the owner, after each of its renders while `open` holds;
 * - `open` false and `probe` rendered inside the portal: the probe, only while the portal is mounted. A
 *   closed overlay then costs nothing, which is what lets a page hold many of them.
 *
 * Where the marker resolves to what a portal under <body> inherits anyway (the usual case: configuration on
 * <html>), only the direction is kept, and the first state is that guess, so opening an overlay does not
 * re-render it. Pass `container` when the portal goes elsewhere: the full scope is kept.
 */
export function useKeylineScope(open = true, container?: unknown): [React.ReactElement, KeylineScope, React.ReactElement] {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [scope, setScope] = React.useState<KeylineScope>(pageScope)
  const sync = React.useCallback(() => {
    if (!ref.current) return
    let next = read(ref.current)
    if (container == null && document.body && inherits(next, readAt(document.body))) next = next.dir ? { dir: next.dir } : {}
    setScope((prev) => (same(prev, next) ? prev : next))
  }, [container])
  React.useLayoutEffect(() => {
    if (open) sync()
  })
  const marker = React.createElement("span", { ref, hidden: true, "data-kl-scope": "" })
  return [marker, scope, React.createElement(ScopeProbe, { sync })]
}

/** Merge a scope into props for a portaled element (keeps the element's own className and style). */
export function scopeProps<P extends { className?: string; style?: React.CSSProperties }>(scope: KeylineScope, own: P = {} as P) {
  return {
    ...own,
    dir: scope.dir,
    "data-kl-config": scope.style ? "" : undefined,
    "data-kl-density": scope["data-kl-density"],
    "data-kl-motion": scope["data-kl-motion"],
    className: [own.className, scope.className].filter(Boolean).join(" ") || undefined,
    style: { ...scope.style, ...own.style },
  }
}

/* ------------------------------------------------------------------ *
 * DOCK GEOMETRY (the CSS half is in keyline.css, "DOCK GEOMETRY")
 * One place decides where a docked surface meets its owner, so Select, Multiselect, DatePicker and
 * DateRangePicker cannot drift apart. Values are the keyline weights (k1 1px, k2 2px), which are
 * identity constants, not configuration.
 * ------------------------------------------------------------------ */
export type DockLayout = "control" | "cell"

/** Positioner offsets and popup style for a surface docked to a field-type trigger. */
export function dockGeometry(layout: DockLayout) {
  const cell = layout === "cell"
  return {
    /** control: overlap the trigger's own k2 border. cell: sit on the keyline just outside the cell. */
    sideOffset: cell ? 0 : -2,
    /** cell: start k2 before the trigger, so the surface's border covers the cell's start keyline. */
    alignOffset: cell ? -2 : 0,
    style: { "--kl-attach": cell ? "1px" : "2px", "--kl-dock-grow": cell ? "2px" : "0px" } as React.CSSProperties,
  }
}

/* ------------------------------------------------------------------ *
 * DIRECTION
 * Base UI reads direction from its DirectionProvider; Keyline's source of truth is the DOM `dir`
 * (an RTL subtree, a portal carrying its scope). Components whose geometry or arrow keys depend on
 * direction (Scroll Area, Slider) read it from the element and wrap themselves in a DirectionProvider.
 * Re-read after every render, and on demand (`refresh`) before an interaction, so a `dir` that changes
 * on an ancestor is picked up before the next drag or key press.
 * ------------------------------------------------------------------ */
/** The element's direction from the nearest explicit `dir` (an attribute lookup: no style recalculation, so it is
 *  safe to call after every render; `dir="auto"` text runs are skipped, they do not set a component's layout). */
export function domDir(el: Element): "ltr" | "rtl" {
  return el.closest('[dir]:not([dir="auto" i])')?.getAttribute("dir")?.toLowerCase() === "rtl" ? "rtl" : "ltr"
}

export function useDomDirection(ref: React.RefObject<HTMLElement | null>): ["ltr" | "rtl", () => void] {
  // first guess: the page's direction, so an RTL page does not re-render every scroller on mount
  const [dir, setDir] = React.useState<"ltr" | "rtl">(() => (pageScope().dir === "rtl" ? "rtl" : "ltr"))
  const refresh = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const next = domDir(el)
    setDir((prev) => (prev === next ? prev : next))
  }, [ref])
  React.useLayoutEffect(refresh)
  return [dir, refresh]
}

/** A component's own ref and the one passed in, as one callback ref (both are kept current). */
export function useMergedRef<T>(own: React.RefObject<T | null>, outer: React.Ref<T> | undefined) {
  return React.useCallback(
    (el: T | null) => {
      own.current = el
      if (typeof outer === "function") outer(el)
      else if (outer) (outer as React.RefObject<T | null>).current = el
    },
    [own, outer],
  )
}
