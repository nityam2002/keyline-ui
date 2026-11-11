"use client";

import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

/**
 * Resizable (on react-resizable-panels v4 since the round-20 review): panels that share a seam
 * you can move. The library owns the behaviour: the separator's ARIA (value, bounds, controls), arrows,
 * Home/End, Enter to collapse, double-click to reset, pointer and touch hit targets, layout persistence
 * (`useDefaultLayout`) and the imperative API (`groupRef`, `panelRef`: collapse, expand, resize).
 * Keyline only draws it.
 *
 *   ┌────────────┃──────────────────┐
 *   │ Manifests  ┃ MSCU 1234567     │   the seam is the shared keyline (C1, C3): one 1px line, no gap.
 *   │            ▐▌                 │   hover or drag thickens it to 3px ink; keyboard focus draws it in
 *   │            ┃                  │   the focus colour; the grip cell (withHandle) sits on the seam.
 *   └────────────┃──────────────────┘
 *
 * - Sizes follow the library: numbers are pixels, strings are percentages ("30%" or "30").
 * - Name each separator (`aria-label`) after the panel it resizes.
 * - Dragging needs a pointer alternative (WCAG 2.5.7): double-click resets the layout; for collapse, give
 *   the page a button that calls `panelRef.current.collapse()` / `.expand()`.
 * - No frame of its own: put it in a Panel body, a shell column or any frame.
 */
function ResizablePanelGroup({ className, ...props }: ResizablePrimitive.GroupProps) {
  return <ResizablePrimitive.Group data-slot="resizable" className={cn("kl-rz", className)} {...props} />
}

function ResizablePanel({ className, ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" className={cn("kl-rz-panel", className)} {...props} />
}

function ResizableHandle({ withHandle, className, children, ...props }: ResizablePrimitive.SeparatorProps & { withHandle?: boolean }) {
  return (
    <ResizablePrimitive.Separator data-slot="resizable-handle" className={cn("kl-rz-handle", className)} {...props}>
      {withHandle ? <span className="kl-rz-grip" aria-hidden /> : null}
      {children}
    </ResizablePrimitive.Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
export { usePanelRef, useGroupRef, useDefaultLayout, type PanelImperativeHandle, type GroupImperativeHandle, type Layout } from "react-resizable-panels"
