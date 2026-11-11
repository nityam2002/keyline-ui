import type * as React from "react"

/**
 * Demo shell only. Keyboard focus that lands at the edge of a scroll area is scrolled into view with the
 * viewport's scroll-padding, so its focus ring is never clipped. Chromium already does this when focus
 * moves; WebKit stops once the control is partly visible. Pointer focus is left alone (no jump on click),
 * and wheel, trackpad and keyboard scrolling stay entirely native.
 */
export function revealFocus(e: React.FocusEvent<HTMLElement>) {
  const t = e.target
  // the scroll area's own viewport (the root's focusable child, where this handler sits) is the region being
  // read, not something inside it
  if (t.parentElement === e.currentTarget || !t.matches(":focus-visible")) return
  t.scrollIntoView({ block: "nearest", inline: "nearest" })
}
