"use client";

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { DirectionProvider } from "@base-ui/react/direction-provider"

import { cn } from "@/lib/utils"
import { useDomDirection } from "../lib/keyline-scope"

type ScrollbarVisibility = "system" | "scroll" | "always"

type ScrollAreaProps = Omit<React.ComponentProps<typeof ScrollAreaPrimitive.Root>, "children"> & {
  children?: React.ReactNode
  /** Which scrollbars to provide. Overflow on an axis without a scrollbar stays scrollable by wheel,
   *  touch and keyboard, it just has no bar. Default: vertical. */
  scrollbars?: "vertical" | "horizontal" | "both"
  /**
   * When a thumb shows (the bar's cell and seam are always there while its axis overflows).
   * system (default): follow the platform. Where native scrollbars overlay content (macOS "Automatically",
   * iOS, Android), the thumb shows while that axis scrolls, while the pointer is over the bar, and while
   * it is held, then fades. Where native scrollbars take space (macOS "Always", Windows, a mouse on
   * "Automatically"), it always shows.
   * scroll: always behave like an overlay platform. always: always show.
   * Forced colours and a request for more contrast always show it.
   */
  scrollbarVisibility?: ScrollbarVisibility
  /**
   * Names the scrollable region. The viewport is focusable whenever it overflows (Base UI), so keyboard
   * users can scroll content that has no focusable children; a name tells them what they are in.
   * Give it when the region is not already labelled by its surroundings.
   */
  label?: string
  /**
   * How a bar meets the region (declared, never inferred from ancestors).
   * cell (default): the region is a frame or sits inside one; each bar is a cell on its edge with a 1px seam.
   * rail: the region is not a frame (a page or a pane on the page background); a bar has no cell to belong
   * to, so it is a 1px keyline rail with the solid thumb centred on it.
   */
  track?: "cell" | "rail"
  viewportClassName?: string
  contentClassName?: string
}

/* Whether the platform's own scrollbars take space (classic) or overlay content. The browser exposes the
   user's choice only this way: an overflow:scroll box is narrower than its border box when bars are classic.
   Measured once per page; a mouse plugged in later is picked up on the next load. */
let classicBars: boolean | undefined
function nativeBarsTakeSpace() {
  if (classicBars === undefined) {
    const probe = document.createElement("div")
    probe.style.cssText = "position:absolute;top:-200px;width:50px;height:50px;overflow:scroll;visibility:hidden;pointer-events:none"
    document.body.appendChild(probe)
    classicBars = probe.offsetWidth - probe.clientWidth > 0
    probe.remove()
  }
  return classicBars
}
const noSubscribe = () => () => {}
/** "scroll" (thumbs reveal and fade) or "always", resolved from the platform for "system". */
function useScrollbarReveal(visibility: ScrollbarVisibility) {
  const classic = React.useSyncExternalStore(noSubscribe, nativeBarsTakeSpace, () => false)
  return visibility === "system" ? (classic ? "always" : "scroll") : visibility
}

/** The bars, thumbs and corner of a scroll area. Shared by ScrollArea and MessageScroller. */
function ScrollAreaBars({ scrollbars = "vertical" }: { scrollbars?: ScrollAreaProps["scrollbars"] }) {
  const v = scrollbars !== "horizontal"
  const h = scrollbars !== "vertical"
  return (
    <>
      {v ? (
        <ScrollAreaPrimitive.Scrollbar orientation="vertical" className="kl-scrollbar">
          <ScrollAreaPrimitive.Thumb className="kl-scroll-thumb" />
        </ScrollAreaPrimitive.Scrollbar>
      ) : null}
      {h ? (
        <ScrollAreaPrimitive.Scrollbar orientation="horizontal" className="kl-scrollbar">
          <ScrollAreaPrimitive.Thumb className="kl-scroll-thumb" />
        </ScrollAreaPrimitive.Scrollbar>
      ) : null}
      {v && h ? <ScrollAreaPrimitive.Corner className="kl-scroll-corner" /> : null}
    </>
  )
}

/** The root of a Keyline scroll area: direction, construction attributes and the resolved reveal mode. */
function ScrollAreaRoot({
  className,
  scrollbars = "vertical",
  track = "cell",
  scrollbarVisibility = "system",
  ref: outerRef,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & Pick<ScrollAreaProps, "scrollbars" | "track" | "scrollbarVisibility">) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [dir] = useDomDirection(ref)
  const reveal = useScrollbarReveal(scrollbarVisibility)
  const setRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      ref.current = el
      if (typeof outerRef === "function") outerRef(el)
      else if (outerRef) outerRef.current = el
    },
    [outerRef],
  )
  return (
    <DirectionProvider direction={dir}>
      <ScrollAreaPrimitive.Root ref={setRef} data-kl-bars={scrollbars} data-kl-track={track} data-kl-reveal={reveal} className={cn("kl-scroll", className)} {...props} />
    </DirectionProvider>
  )
}

/**
 * A native scroll container with Keyline scrollbars (Base UI Scroll Area). Scrolling itself is the
 * browser's: wheel, trackpad, touch momentum, keyboard and find-in-page all behave natively; Base UI
 * hides the native bar and drives the thumb from the real scroll position.
 *
 * Construction: a scrollbar is a cell on the region's inline-end (or block-end) edge. It owns the 1px
 * seam that divides it from the content; its thumb is a solid block inset 2px. Content is padded by
 * the bar's width only while that axis overflows, so the bar never covers text. With both bars, the
 * corner cell closes the L-junction. Bars render only while their axis overflows.
 *
 * Behaviour (after macOS overlay scrollbars): the cell stays, the thumb reveals inside it.
 * Scrolling an axis shows its thumb slim at once; the pointer on the bar widens it to the cell and darkens
 * it; holding it inks it. A short idle after the last of these, it fades; new input brings it back from
 * wherever the fade is. Pressing the track lands the thumb under the pointer and keeps dragging.
 */
function ScrollArea({ className, children, scrollbars = "vertical", track = "cell", scrollbarVisibility = "system", label, viewportClassName, contentClassName, ...props }: ScrollAreaProps) {
  return (
    <ScrollAreaRoot data-slot="scroll-area" scrollbars={scrollbars} track={track} scrollbarVisibility={scrollbarVisibility} className={className} {...props}>
      <ScrollAreaPrimitive.Viewport className={cn("kl-scroll-vp", viewportClassName)} role={label ? "region" : undefined} aria-label={label}>
        <ScrollAreaPrimitive.Content className={cn("kl-scroll-content", contentClassName)}>{children}</ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaBars scrollbars={scrollbars} />
    </ScrollAreaRoot>
  )
}

export { ScrollArea, ScrollAreaRoot, ScrollAreaBars, type ScrollAreaProps, type ScrollbarVisibility }
