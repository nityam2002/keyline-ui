"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";

/** Wrap a region once to share the open delay between neighbouring tooltips (optional). */
const TooltipProvider = TooltipPrimitive.Provider;

type TooltipProps = {
  /** The trigger. Must be a focusable element that accepts a ref (a Button, a link, an icon button). */
  children: React.ReactElement;
  content: React.ReactNode;
  /** Shortcut shown in its own cell, e.g. "⌘K". */
  shortcut?: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  delay?: number;
};

/**
 * An ink label docked to the trigger's FOCUS RING, not its box: the gap equals the ring (2px + 2px offset),
 * so keyboard and pointer show the same geometry. Never cut, never a surface of its own. It names or
 * explains; it never holds the only copy of information needed to act.
 */
function Tooltip({ children, content, shortcut, side = "top", delay = 500 }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [marker, scope] = useKeylineScope(open);
  return (
    <TooltipPrimitive.Root onOpenChange={setOpen}>
      <TooltipPrimitive.Trigger delay={delay} render={children} />
      {marker}
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={4} {...scopeProps(scope, { className: "kl-positioner" })}>
          <TooltipPrimitive.Popup data-slot="tooltip" className={cn("kl-tip", shortcut != null && "kl-cells")}>
            <span className="kl-tip-t">{content}</span>
            {shortcut != null ? <kbd className="kl-tip-k">{shortcut}</kbd> : null}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export { Tooltip, TooltipProvider };
