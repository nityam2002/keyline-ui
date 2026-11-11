import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * A step in a conversation or activity timeline: "Searched the web", "Assigned to DHL Freight",
 * "Yesterday". Not a message: it sits between messages in the Code voice.
 *
 * - default: a glyph cell (MarkerIcon) then the words.
 * - `variant="separator"`: the words between two seams (a day or "New messages" divider).
 * - `variant="border"`: a keyline under the words (the head of a run of steps).
 * - `pending`: work in progress ("Thinking…"): the pending segment runs under the words, never a spinner, and
 *   the marker becomes a polite status so the change is announced. Drop `pending` when the step is done.
 */
function Marker({ className, variant = "default", pending, children, ...props }: React.ComponentProps<"div"> & { variant?: "default" | "separator" | "border"; pending?: boolean }) {
  return (
    <div
      data-slot="marker"
      data-variant={variant}
      data-pending={pending || undefined}
      role={variant === "separator" ? "separator" : pending ? "status" : undefined}
      aria-busy={pending || undefined}
      className={cn("kl-marker", className)}
      {...props}
    >
      {children}
      {pending ? <span className="kl-pending kl-marker-run" aria-hidden /> : null}
    </div>
  )
}

/** A 16px glyph cell (authored SVG or a Status glyph), hidden from assistive tech. */
function MarkerIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="marker-icon" aria-hidden className={cn("kl-marker-ic", className)} {...props} />
}

function MarkerContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="marker-content" className={cn("kl-marker-t", className)} {...props} />
}

export { Marker, MarkerIcon, MarkerContent }
