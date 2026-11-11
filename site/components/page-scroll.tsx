"use client"

import * as React from "react"
import { ScrollArea } from "@/components/keyline/ui/scroll-area"

const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp"])

/** The page's own scroller: the document never scrolls; the whole site scrolls in Keyline's ScrollArea, rail track
 *  (the page is not a frame). Anything that follows the page's scroll reads `pageScroller()`. */
export function PageScroll({ children }: { children: React.ReactNode }) {
  // The document used to take Space, Page Up/Down, Home/End and arrows when nothing had focus. A nested
  // scroller only gets them while focus is in it, so with focus on <body> the page scroller takes focus
  // (without moving) before the key's default runs. It is the outermost box, so the next Tab still goes
  // to the first control (the skip link) and nothing visible changes.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || !SCROLL_KEYS.has(e.key)) return
      const a = document.activeElement
      if (a && a !== document.body && a !== document.documentElement) return
      // a popup opening has not taken focus yet: its keys are its own
      if (document.querySelector("[role=menu], [role=dialog], [role=alertdialog], [role=listbox], [role=tooltip]")) return
      ;(document.querySelector(".s-page-vp") as HTMLElement | null)?.focus({ preventScroll: true })
    }
    window.addEventListener("keydown", onKey, { capture: true })
    // On load the page holds focus, as the document did: the first Tab goes to the first control (the skip
    // link), not to the scroller itself (Base UI makes an overflowing viewport a stop, and it is the outermost
    // box). Only on load and only from <body>, so a later starting point (a skip link's target) is left alone.
    // Base UI sets the stop once it has measured the overflow, so wait for it.
    let frame = 0, tries = 0
    const settle = () => {
      const vp = document.querySelector<HTMLElement>(".s-page-vp")
      const idle = document.activeElement === document.body || !document.activeElement
      if (!vp || !idle) return
      if (vp.tabIndex >= 0) vp.focus({ preventScroll: true })
      else if (++tries < 30) frame = requestAnimationFrame(settle)
    }
    frame = requestAnimationFrame(settle)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("keydown", onKey, { capture: true })
    }
  }, [])
  return (
    <ScrollArea track="rail" className="s-page" viewportClassName="s-page-vp" data-testid="page-scroll">
      {children}
    </ScrollArea>
  )
}

/** The element the page scrolls in (the document's scrolling element before hydration or off the site). */
export const pageScroller = (): Element => document.querySelector(".s-page-vp") ?? document.scrollingElement ?? document.documentElement
