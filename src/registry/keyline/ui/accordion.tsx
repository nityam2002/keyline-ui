"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { resolveClassName } from "../lib/keyline-render";

/*
 * ACCORDION: rows on shared keylines in one frame. Header rows are cells; a panel unfolds from its header's bottom
 * keyline. Only the caret column is divided, so it runs the full height.
 */
const rootVariants = cva("kl-ctl flex min-w-0 flex-col", {
  variants: {
    // a cell leaves the surface to its frame (the foundation's layout="cell" clears the background)
    layout: { control: "bg-kl-cell", cell: "" },
  },
  defaultVariants: { layout: "control" },
});

/** A row after the first draws the seam above it. */
const item = "not-first:border-t-(length:--kl-k1) not-first:border-t-kl-seam";

const header = "m-0 [font:inherit]";

/*
 * The header row is a cell: its ring sits inside, clear of the keylines. A disabled row is out of service: hatched,
 * and every voice in it (description, meta, caret) in the disabled ink.
 */
const trigger = cn(
  "group/accordion-trigger kl-key m-0 grid min-h-(--kl-row) w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_40px] items-stretch",
  "bg-transparent p-0 text-start font-(family-name:--kl-font) text-inherit",
  "hover:not-data-disabled:bg-kl-tint focus-visible:outline-offset-(--kl-ring-in) active:not-data-disabled:bg-kl-press",
  "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
  "forced-colors:focus-visible:outline-[3px] forced-colors:focus-visible:-outline-offset-4 forced-colors:focus-visible:outline-[Highlight] forced-colors:focus-visible:outline-solid",
);

const title = "grid min-w-0 content-center gap-0.5 px-(--kl-inset) py-[9px] leading-[1.3] wrap-anywhere";
const descriptionClass =
  "text-(length:--kl-text-label) text-kl-ink-2 group-data-disabled/accordion-trigger:text-kl-dis";
const metaClass = cn(
  "flex items-center gap-2 pe-(--kl-inset) text-(length:--kl-text-label) whitespace-nowrap text-kl-ink-2 tabular-nums",
  "group-data-disabled/accordion-trigger:text-kl-dis",
);
/* the caret turns on the unfold timing, as the table's expand cell does */
const caret = cn(
  "col-start-3 grid place-items-center border-s-(length:--kl-k1) border-s-kl-seam text-kl-ink-2",
  "group-data-disabled/accordion-trigger:text-kl-dis group-data-panel-open/accordion-trigger:group-not-data-disabled/accordion-trigger:text-kl-ink",
);
const caretIcon = cn(
  "transition-[rotate] duration-(--kl-t-fold) ease-(--kl-ease-in)",
  "group-data-panel-open/accordion-trigger:rotate-180 group-data-panel-open/accordion-trigger:duration-(--kl-t-unfold) group-data-panel-open/accordion-trigger:ease-(--kl-ease-out)",
);

/*
 * UNFOLD from the header's keyline: Base UI measures the panel (--accordion-panel-height) and marks the start and
 * end of the transition; reduced motion makes both durations 0. The seam lives on the content, inside the clip, so
 * it folds away with it and never doubles the next row's rule.
 */
const panel = cn(
  "h-(--accordion-panel-height) overflow-hidden transition-[height] duration-(--kl-t-unfold) ease-(--kl-ease-out)",
  "data-ending-style:h-0 data-ending-style:duration-(--kl-t-fold) data-ending-style:ease-(--kl-ease-in) data-starting-style:h-0",
);
const content = cn(
  "border-t-(length:--kl-k1) border-t-kl-seam p-(--kl-inset) pb-[calc(var(--kl-inset)+4px)] text-(length:--kl-text-body)/[1.5]",
  "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
);

type AccordionRootProps<V> = AccordionPrimitive.Root.Props<V> & {
  /** control: its own 2px frame. cell: the rows sit directly in an enclosing frame (a panel body, an inspector). */
  layout?: "control" | "cell";
};

/**
 * Stacked sections in one frame. Each item is a header row and a panel; rows share keylines (one edge,
 * one owner), and an open panel UNFOLDS from its header's bottom keyline (160ms, folds back in 120ms; the
 * header row never moves). Opening does not also flood: the caret turns, the panel arrives.
 *
 *   ┌─────────────────────────────────────────┬────┐
 *   │ Customs documents             3 files   │ ⌃  │   title (+ description) and meta · caret cell
 *   ├─────────────────────────────────────────┴────┤
 *   │ panel content                                │
 *   ├─────────────────────────────────────────┬────┤
 *   │ Billing                                 │ ⌄  │
 *   └─────────────────────────────────────────┴────┘
 *
 * The caret cell is the only divided column, so it runs straight down the frame whether or not a row
 * has meta (a column, once started, runs the full height).
 *
 * One or many open (`multiple`), controlled or not, keyboard (Tab between headers, as the current APG
 * pattern has it; Enter and Space toggle), heading semantics and find-in-page (`hiddenUntilFound`) are Base UI
 * Accordion's.
 */
function AccordionRoot<V>({ className, layout = "control", ...props }: AccordionRootProps<V>): React.ReactElement {
  return (
    <AccordionPrimitive.Root<V>
      data-kl-layout={layout}
      className={resolveClassName(cn(rootVariants({ layout })), className)}
      {...props}
      data-slot="accordion"
    />
  );
}

/** A section: its header row and its panel (Base UI Accordion.Item). */
function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props): React.ReactElement {
  return (
    <AccordionPrimitive.Item className={resolveClassName(item, className)} {...props} data-slot="accordion-item" />
  );
}

/* Set inside an AccordionHeader, so a trigger composed in one doesn't render a second. */
const HeaderContext = React.createContext(false);

type AccordionHeaderProps = AccordionPrimitive.Header.Props & {
  /** Heading level (default 3). */
  level?: 2 | 3 | 4 | 5 | 6;
};

/** The heading that holds a trigger (Base UI Accordion.Header). AccordionTrigger renders one when it has none. */
function AccordionHeader({ className, level = 3, render, ...props }: AccordionHeaderProps): React.ReactElement {
  return (
    <HeaderContext.Provider value>
      <AccordionPrimitive.Header
        render={render ?? React.createElement(`h${level}`)}
        className={resolveClassName(header, className)}
        {...props}
        data-slot="accordion-header"
      />
    </HeaderContext.Provider>
  );
}

type AccordionTriggerProps = AccordionPrimitive.Trigger.Props & {
  description?: React.ReactNode;
  /** Trailing text before the caret cell: a count, a status, a short code. It never wraps; the title does. */
  meta?: React.ReactNode;
  /** Heading level of the header it renders when it is not inside an AccordionHeader (default 3). */
  level?: 2 | 3 | 4 | 5 | 6;
};

/** The header row (Base UI Accordion.Trigger): title, description and meta, and the caret cell. */
function AccordionTrigger({
  className,
  children,
  description,
  meta,
  level = 3,
  ...props
}: AccordionTriggerProps): React.ReactElement {
  const inHeader = React.useContext(HeaderContext);
  const row = (
    <AccordionPrimitive.Trigger
      className={resolveClassName(trigger, className)}
      {...props}
      data-slot="accordion-trigger"
    >
      <span data-slot="accordion-title" className={title}>
        <span className="text-(length:--kl-text-lead) font-(--kl-weight-strong)">{children}</span>
        {description ? (
          <small data-slot="accordion-description" className={descriptionClass}>
            {description}
          </small>
        ) : null}
      </span>
      {meta != null ? (
        <span data-slot="accordion-meta" className={metaClass}>
          {meta}
        </span>
      ) : null}
      <span data-slot="accordion-caret" className={caret} aria-hidden>
        <svg
          className={caretIcon}
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="square"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </span>
    </AccordionPrimitive.Trigger>
  );
  return inHeader ? row : <AccordionHeader level={level}>{row}</AccordionHeader>;
}

type AccordionPanelProps = AccordionPrimitive.Panel.Props & {
  /** Drop the content's inset, for content that brings its own cells (an item list, a key/value grid). */
  flush?: boolean;
  /** Classes for the content inside the panel's clip (its layout: `grid gap-4`). */
  contentClassName?: string;
};

/** The section's content (Base UI Accordion.Panel). It unfolds; its content sits inside the clip. */
function AccordionPanel({
  className,
  contentClassName,
  children,
  flush,
  ...props
}: AccordionPanelProps): React.ReactElement {
  return (
    <AccordionPrimitive.Panel className={resolveClassName(panel, className)} {...props} data-slot="accordion-panel">
      <div
        data-slot="accordion-content"
        data-flush={flush || undefined}
        className={cn(content, flush && "p-0", contentClassName)}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

/** The root under its short name, as before the parts were named after Base UI's. */
const Accordion = AccordionRoot;

export {
  Accordion,
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
  type AccordionRootProps,
  type AccordionHeaderProps,
  type AccordionTriggerProps,
  type AccordionPanelProps,
};
