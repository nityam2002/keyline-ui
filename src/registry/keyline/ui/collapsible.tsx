"use client";

import * as React from "react";
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

import { cn } from "@/lib/utils";
import { resolveClassName } from "../lib/keyline-render";

/*
 * COLLAPSIBLE: an unframed disclosure. The caret box (--kl-coll-box, 18px) is the anchor; its keyline continues down
 * the panel's start edge (the spine), centred on the box. The root is the outermost Keyline element (kl-type), so its
 * content takes Keyline's type from it, and a Collapsible inside another Keyline element inherits instead.
 */
const root = "kl-type grid min-w-0 [--kl-coll-box:18px]";

const trigger = cn(
  "group/collapsible-trigger kl-key m-0 inline-flex min-h-8 max-w-full cursor-pointer items-center gap-2.5 justify-self-start",
  "bg-transparent p-0 pe-1 text-start font-(family-name:--kl-font) text-inherit focus-visible:outline-offset-(--kl-ring-out)",
  "data-disabled:cursor-not-allowed data-disabled:text-kl-dis",
  "forced-colors:focus-visible:outline-[3px] forced-colors:focus-visible:outline-[Highlight] forced-colors:focus-visible:outline-solid",
);

/* the square caret box: tints under the pointer, darkens while pressed, hatched out of service */
const box = cn(
  "box-border grid size-(--kl-coll-box) flex-none place-items-center border-(length:--kl-k2) border-kl-line bg-kl-cell",
  "group-hover/collapsible-trigger:group-not-data-disabled/collapsible-trigger:bg-kl-tint",
  "group-active/collapsible-trigger:group-not-data-disabled/collapsible-trigger:bg-kl-press",
  "group-data-disabled/collapsible-trigger:border-kl-dis-line group-data-disabled/collapsible-trigger:bg-(image:--kl-hatch)",
);
const boxIcon = cn(
  "transition-[rotate] duration-(--kl-t-fold) ease-(--kl-ease-in)",
  "group-data-panel-open/collapsible-trigger:rotate-180 group-data-panel-open/collapsible-trigger:duration-(--kl-t-unfold) group-data-panel-open/collapsible-trigger:ease-(--kl-ease-out)",
);
const label = cn(
  "text-(length:--kl-text-body) font-(--kl-weight-strong) wrap-anywhere",
  "group-hover/collapsible-trigger:group-not-data-disabled/collapsible-trigger:underline",
  "group-hover/collapsible-trigger:group-not-data-disabled/collapsible-trigger:decoration-[1.5px]",
  "group-hover/collapsible-trigger:group-not-data-disabled/collapsible-trigger:underline-offset-3",
);

/* UNFOLD (Base UI measures --collapsible-panel-height); reduced motion makes both durations 0 */
const panel = cn(
  "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-(--kl-t-unfold) ease-(--kl-ease-out)",
  "data-ending-style:h-0 data-ending-style:duration-(--kl-t-fold) data-ending-style:ease-(--kl-ease-in) data-starting-style:h-0",
);
/* the spine: the box's 2px keyline continues down the content's start edge */
const content = cn(
  "ms-[calc(var(--kl-coll-box)/2-1px)] min-w-0 border-s-(length:--kl-k2) border-s-kl-line pt-2 pb-1",
  "ps-[calc(var(--kl-coll-box)/2+9px)] [&>:first-child]:mt-0 [&>:last-child]:mb-0",
);

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
function CollapsibleRoot({ className, ...props }: CollapsiblePrimitive.Root.Props): React.ReactElement {
  return <CollapsiblePrimitive.Root className={resolveClassName(root, className)} {...props} data-slot="collapsible" />;
}

type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props & {
  /** Trailing text in the Code voice: a count of what is hidden ("12"), a short status. */
  meta?: React.ReactNode;
};

/** The trigger (Base UI Collapsible.Trigger): the caret box, the label and the meta. */
function CollapsibleTrigger({ className, children, meta, ...props }: CollapsibleTriggerProps): React.ReactElement {
  return (
    <CollapsiblePrimitive.Trigger
      className={resolveClassName(trigger, className)}
      {...props}
      data-slot="collapsible-trigger"
    >
      <span data-slot="collapsible-box" className={box} aria-hidden>
        <svg
          className={boxIcon}
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
      <span data-slot="collapsible-label" className={label}>
        {children}
      </span>
      {meta != null ? (
        <span data-slot="collapsible-meta" className="kl-code ps-0.5">
          {meta}
        </span>
      ) : null}
    </CollapsiblePrimitive.Trigger>
  );
}

type CollapsiblePanelProps = CollapsiblePrimitive.Panel.Props & {
  /** Classes for the content inside the panel's clip (its layout: `grid gap-4`). */
  contentClassName?: string;
};

/** The panel (Base UI Collapsible.Panel). It unfolds; its content sits inside the clip, on the spine. */
function CollapsiblePanel({
  className,
  contentClassName,
  children,
  ...props
}: CollapsiblePanelProps): React.ReactElement {
  return (
    <CollapsiblePrimitive.Panel className={resolveClassName(panel, className)} {...props} data-slot="collapsible-panel">
      <div data-slot="collapsible-content" className={cn(content, contentClassName)}>
        {children}
      </div>
    </CollapsiblePrimitive.Panel>
  );
}

/** The root under its short name, as before the parts were named after Base UI's. */
const Collapsible = CollapsibleRoot;

export {
  Collapsible,
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsiblePanel,
  type CollapsibleTriggerProps,
  type CollapsiblePanelProps,
};
