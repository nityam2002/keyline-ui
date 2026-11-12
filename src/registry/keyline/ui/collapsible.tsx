"use client";

import * as React from "react";
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

import { cn } from "@/lib/utils";

/**
 * One disclosure, unframed, for a form or a panel body ("Advanced options", "Show 12 more").
 *
 *   ⊟  Advanced options                    the trigger: a square caret box and the label
 *   │  panel content                       the box's keyline runs down the panel's start edge,
 *   │                                      so the panel reads as the trigger's continuation
 *
 * The panel UNFOLDS from the trigger (160ms, folds in 120ms; instant under reduced motion). The spine is
 * the same idea as the table detail's merged index cell: continuity drawn by a keyline, not a connector.
 * Open state, keyboard, `aria-expanded` and find-in-page (`hiddenUntilFound`) are Base UI Collapsible's.
 */
function Collapsible({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" className={cn("kl-collapsible", className)} {...props} />;
}

type CollapsibleTriggerProps = React.ComponentProps<typeof CollapsiblePrimitive.Trigger> & {
  /** Trailing text in the Code voice: a count of what is hidden ("12"), a short status. */
  meta?: React.ReactNode;
};

function CollapsibleTrigger({ className, children, meta, ...props }: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn("kl-key kl-coll-trigger", className)}
      {...props}
    >
      <span className="kl-coll-box" aria-hidden>
        <svg
          viewBox="0 0 16 16"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </span>
      <span className="kl-coll-label">{children}</span>
      {meta != null ? <span className="kl-code kl-coll-meta">{meta}</span> : null}
    </CollapsiblePrimitive.Trigger>
  );
}

function CollapsiblePanel({ className, children, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Panel>) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-panel" className="kl-coll-panel" {...props}>
      <div className={cn("kl-coll-body", className)}>{children as React.ReactNode}</div>
    </CollapsiblePrimitive.Panel>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsiblePanel };
