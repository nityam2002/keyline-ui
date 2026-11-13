"use client";

import type * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

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
/* The group is the outermost Keyline element of a layout that stands alone (kl-type): its panels take Keyline's type
   and ink from it, and a group inside another Keyline element inherits instead. */
function ResizablePanelGroup({ className, ...props }: ResizablePrimitive.GroupProps): React.ReactElement {
  return <ResizablePrimitive.Group className={cn("kl-type", className)} {...props} data-slot="resizable" />;
}

/* the library puts `className` on the panel's inner scroller, which may shrink below its content */
function ResizablePanel({ className, ...props }: ResizablePrimitive.PanelProps): React.ReactElement {
  return (
    <ResizablePrimitive.Panel className={cn("min-h-0 min-w-0", className)} {...props} data-slot="resizable-panel" />
  );
}

/*
 * The library draws nothing, so this is the whole look. Panels share one keyline and the keyline is the handle: at
 * rest the 1px seam (C1, C3: no gap, no second line). The library's state (data-separator: hover, active) thickens it
 * to 3px ink, centred on the seam (::after), so the panels never move under the pointer; keyboard focus draws it in
 * the focus colour. The library owns the hit target (larger than the line, larger still for touch).
 */
const handle = cn(
  "group/resizable-handle relative z-1 w-(--kl-k1) flex-none bg-kl-line outline-0 outline-none",
  "aria-[orientation=horizontal]:h-(--kl-k1) aria-[orientation=horizontal]:w-auto",
  "after:pointer-events-none after:absolute after:inset-y-0 after:left-1/2 after:w-(--kl-k3) after:[translate:-50%_0]",
  "after:bg-kl-ink after:opacity-0 after:content-['']",
  "aria-[orientation=horizontal]:after:inset-y-auto aria-[orientation=horizontal]:after:top-1/2",
  "aria-[orientation=horizontal]:after:right-0 aria-[orientation=horizontal]:after:left-0",
  "aria-[orientation=horizontal]:after:h-(--kl-k3) aria-[orientation=horizontal]:after:w-auto",
  "aria-[orientation=horizontal]:after:[translate:0_-50%]",
  "data-[separator=active]:after:opacity-100 data-[separator=hover]:after:opacity-100",
  "focus-visible:after:bg-kl-focus focus-visible:after:opacity-100",
  "forced-colors:bg-[CanvasText] forced-colors:after:bg-[Highlight] forced-colors:after:forced-color-adjust-none",
);

/* the grip: a cell on the seam with two short keylines; it inverts while dragging */
const grip = cn(
  "pointer-events-none absolute top-1/2 left-1/2 z-1 box-border h-7 w-3.5 [translate:-50%_-50%]",
  "border-(length:--kl-k1) border-kl-line bg-kl-cell",
  "bg-[linear-gradient(var(--kl-ink-2),var(--kl-ink-2)),linear-gradient(var(--kl-ink-2),var(--kl-ink-2))]",
  "bg-size-[1px_12px] bg-position-[4px_50%,7px_50%] bg-no-repeat",
  "group-aria-[orientation=horizontal]/resizable-handle:h-3.5 group-aria-[orientation=horizontal]/resizable-handle:w-7",
  "group-aria-[orientation=horizontal]/resizable-handle:bg-size-[12px_1px]",
  "group-aria-[orientation=horizontal]/resizable-handle:bg-position-[50%_4px,50%_7px]",
  "group-data-[separator=hover]/resizable-handle:border-kl-ink",
  "group-data-[separator=active]/resizable-handle:border-kl-inverse group-data-[separator=active]/resizable-handle:bg-kl-inverse",
  "group-data-[separator=active]/resizable-handle:bg-none",
  "group-focus-visible/resizable-handle:border-(length:--kl-ring) group-focus-visible/resizable-handle:border-kl-focus",
  "forced-colors:border-[CanvasText]",
);

function ResizableHandle({
  withHandle,
  className,
  children,
  ...props
}: ResizablePrimitive.SeparatorProps & { withHandle?: boolean }): React.ReactElement {
  return (
    <ResizablePrimitive.Separator className={cn(handle, className)} {...props} data-slot="resizable-handle">
      {withHandle ? <span data-slot="resizable-grip" className={grip} aria-hidden /> : null}
      {children}
    </ResizablePrimitive.Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
export {
  usePanelRef,
  useGroupRef,
  useDefaultLayout,
  type PanelImperativeHandle,
  type GroupImperativeHandle,
  type Layout,
} from "react-resizable-panels";
