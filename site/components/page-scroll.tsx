"use client";

import * as React from "react";
import { ScrollArea } from "@/components/keyline/ui/scroll-area";

const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp"]);

/** The page's own scroller: the document never scrolls; the whole site scrolls in Keyline's ScrollArea, rail track
 *  (the page is not a frame). Anything that follows the page's scroll reads `pageScroller()`. */
export function PageScroll({ children }: { children: React.ReactNode }) {
  // The document used to take Space, Page Up/Down, Home/End and arrows when nothing had focus. A nested
  // scroller only gets them while focus is in it, so with focus on <body> the page scroller takes focus
  // (without moving) before the key's default runs. It is the outermost box, so the next Tab still goes
  // to the first control (the skip link). A key press is keyboard use, so its focus ring is the right signal there.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || !SCROLL_KEYS.has(e.key)) return;
      const a = document.activeElement;
      if (a && a !== document.body && a !== document.documentElement) return;
      // a popup opening has not taken focus yet: its keys are its own
      if (document.querySelector("[role=menu], [role=dialog], [role=alertdialog], [role=listbox], [role=tooltip]"))
        return;
      (document.querySelector(".s-page-vp") as HTMLElement | null)?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey, { capture: true });
    // Nothing takes focus on load. Focusing the scroller from script before any input counts as keyboard focus,
    // so it drew its focus ring around the whole page until the first click. The handler above already moves
    // focus to it at the first scrolling key, which is the only thing the load-time focus was for.
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, []);
  return (
    <ScrollArea
      track="rail"
      // the rail sits in the sheet's inset: the page gives up no width for it, and on a phone it is the inset's width
      className="s-page [@media(max-width:720px)]:[--kl-sb:var(--s-pad)]"
      viewportClassName="s-page-vp data-has-overflow-y:pe-0"
      data-testid="page-scroll"
    >
      {children}
    </ScrollArea>
  );
}

/** The element the page scrolls in (the document's scrolling element before hydration or off the site). */
export const pageScroller = (): Element =>
  document.querySelector(".s-page-vp") ?? document.scrollingElement ?? document.documentElement;
