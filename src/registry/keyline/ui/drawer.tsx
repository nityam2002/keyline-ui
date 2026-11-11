"use client";

import * as React from "react"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"

import { cn } from "@/lib/utils"
import { scopeProps, useKeylineScope, type KeylineScope } from "../lib/keyline-scope"
import { releaseEasing, velocityTracker } from "../lib/keyline-motion"
import { DialogFooter, DialogHeader } from "./dialog"

/* A drawer is a sheet you can swipe away, on Base UI Drawer (as the reference): the swipe, its velocity,
   snap points, nested drawers, focus trap, Escape, scroll lock and the keyboard inset are the library's.
   Keyline adds the construction (the page-facing edge at region weight, no radius, a grip cell on that
   edge), logical sides (end and start mirror in RTL) and motion on the system's timings (reduced motion
   lands at once; a swipe still follows the finger). Use Sheet when nothing should be swiped. */

type Side = "bottom" | "end" | "start"
const DrawerSide = React.createContext<{ side: Side; scope: KeylineScope; snap: boolean; probe: React.ReactNode }>({ side: "bottom", scope: {}, snap: false, probe: null })

const physical = (side: Side, rtl: boolean): React.ComponentProps<typeof DrawerPrimitive.Root>["swipeDirection"] =>
  side === "bottom" ? "down" : (side === "end") !== rtl ? "right" : "left"

type DrawerProps = Omit<React.ComponentProps<typeof DrawerPrimitive.Root>, "swipeDirection"> & {
  /** bottom (default) · end (the inline end; right in LTR, left in RTL) · start. The drawer swipes away toward its side. */
  side?: Side
}

function Drawer({ side = "bottom", children, ...props }: DrawerProps) {
  // read only while the drawer is mounted (the probe sits in its portal); a closed drawer costs nothing
  const [marker, scope, probe] = useKeylineScope(false)
  return (
    <DrawerSide.Provider value={{ side, scope, snap: !!props.snapPoints?.length, probe }}>
      {marker}
      <DrawerPrimitive.Root swipeDirection={physical(side, scope.dir === "rtl")} {...props}>
        {children}
      </DrawerPrimitive.Root>
    </DrawerSide.Provider>
  )
}

const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerClose = DrawerPrimitive.Close

type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Popup> & {
  /** Height (bottom) or width (end/start), px or any CSS length. */
  size?: number | string
  /** Hide the grip cell (it is decorative: the swipe works anywhere on the drawer, Escape and Close always do). */
  hideGrip?: boolean
  container?: React.ComponentProps<typeof DrawerPrimitive.Portal>["container"]
}

function DrawerContent({ className, style, size, hideGrip, container, children, ref: refProp, ...props }: DrawerContentProps) {
  const { side, scope, snap, probe } = React.useContext(DrawerSide)
  const len = typeof size === "number" ? `${size}px` : size
  const ref = useReleaseFromHand(refProp)
  return (
    <DrawerPrimitive.Portal container={container}>
      {probe}
      <DrawerPrimitive.Backdrop data-kl-snap={snap ? "" : undefined} {...scopeProps(scope, { className: "kl-scrim kl-drawer-scrim" })} />
      <DrawerPrimitive.Viewport {...scopeProps(scope, { className: "kl-drawer-vp" })}>
        <DrawerPrimitive.Popup
          data-slot="drawer"
          data-side={side}
          ref={ref}
          className={cn("kl-frame kl-drawer", className)}
          style={(state) => ({ ...(len ? { "--kl-drawer-size": len } : null), ...(typeof style === "function" ? style(state) : style) }) as React.CSSProperties}
          {...props}
        >
          {hideGrip ? null : <span className="kl-drawer-grip" aria-hidden />}
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  )
}

/**
 * RELEASE: a released drawer starts at the speed the hand let go at, both ways. Base UI decides
 * whether the swipe dismisses or springs back; at release Keyline writes one curve for each outcome
 * (--kl-release-back, --kl-release-out) whose first slope matches the pointer's velocity, so a fling leaves
 * without the stall an ease-in gave it (it nearly stopped, then accelerated away), and a drag that came to rest
 * returns from rest instead of jumping 20px in its first frame.
 */
function useReleaseFromHand(forward?: React.Ref<HTMLDivElement>) {
  const cleanup = React.useRef<() => void>(undefined)
  const fwd = React.useRef(forward)
  fwd.current = forward
  return React.useCallback((el: HTMLDivElement | null) => {
    const f = fwd.current
    if (typeof f === "function") f(el)
    else if (f) (f as React.RefObject<HTMLDivElement | null>).current = el
    cleanup.current?.()
    cleanup.current = undefined
    if (!el) return
    const vt = velocityTracker()
    let clear: ReturnType<typeof setTimeout> | undefined
    const move = (e: PointerEvent) => {
      if (el.hasAttribute("data-swiping")) vt.push(e)
    }
    const down = () => vt.reset()
    const up = (e: PointerEvent) => {
      if (!el.hasAttribute("data-swiping")) return
      const dir = el.getAttribute("data-swipe-direction")
      const y = dir === "down"
      const cs = getComputedStyle(el)
      const moved = Math.abs(parseFloat(cs.getPropertyValue(y ? "--drawer-swipe-movement-y" : "--drawer-swipe-movement-x")) || 0)
      const size = y ? el.offsetHeight : el.offsetWidth
      const v = vt.get(e.timeStamp)
      const out = dir === "down" ? v.y : dir === "right" ? v.x : dir === "left" ? -v.x : 0 // toward dismissal
      const ms = (name: string, k: number) => (parseFloat(cs.getPropertyValue(name)) || 0) * k
      el.style.setProperty("--kl-release-back", releaseEasing(-out, moved, ms("--kl-t-unfold", 1.25)))
      el.style.setProperty("--kl-release-out", releaseEasing(out, size - moved, ms("--kl-t-fold", 1.25)))
      el.setAttribute("data-kl-released", "")
      clearTimeout(clear)
      clear = setTimeout(() => el.removeAttribute("data-kl-released"), ms("--kl-t-unfold", 1.25) + 80)
    }
    el.addEventListener("pointerdown", down, true)
    window.addEventListener("pointermove", move, true)
    window.addEventListener("pointerup", up, true)
    cleanup.current = () => {
      clearTimeout(clear)
      el.removeEventListener("pointerdown", down, true)
      window.removeEventListener("pointermove", move, true)
      window.removeEventListener("pointerup", up, true)
    }
  }, [])
}

/** The scrolling body. A swipe that starts here scrolls first and dismisses only from the scroll edge. */
function DrawerBody({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return <DrawerPrimitive.Content data-slot="drawer-body" className={cn("kl-drawer-b", className)} {...props} />
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return <DrawerPrimitive.Title className={cn("kl-dialog-title", className)} {...props} />
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return <DrawerPrimitive.Description className={cn("kl-dialog-desc", className)} {...props} />
}

const DrawerHeader = DialogHeader
const DrawerFooter = DialogFooter

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerTitle, DrawerDescription }
