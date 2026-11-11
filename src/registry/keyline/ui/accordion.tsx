"use client";

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"

type AccordionProps<V> = React.ComponentProps<typeof AccordionPrimitive.Root<V>> & {
  /** control: its own 2px frame. cell: the rows sit directly in an enclosing frame (a panel body, an inspector). */
  layout?: "control" | "cell"
}

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
 * has meta (a column, once started, runs the full height). The caret turns on the unfold timing, as the
 * table's expand cell does.
 *
 * One or many open (`multiple`), controlled or not, keyboard (Tab between headers, as the current APG
 * pattern has it; Enter and Space toggle), heading semantics and find-in-page (`hiddenUntilFound`) are Base UI Accordion's.
 */
function Accordion<V>({ className, layout = "control", ...props }: AccordionProps<V>) {
  return <AccordionPrimitive.Root<V> data-slot="accordion" data-kl-layout={layout} className={cn("kl-ctl kl-accordion", className)} {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("kl-acc-item", className)} {...props} />
}

type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  description?: React.ReactNode
  /** Trailing text before the caret cell: a count, a status, a short code. It never wraps; the title does. */
  meta?: React.ReactNode
  /** Heading level of the header (default 3). */
  level?: 2 | 3 | 4 | 5 | 6
}

function AccordionTrigger({ className, children, description, meta, level = 3, ...props }: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="kl-acc-header" render={React.createElement(`h${level}`)}>
      <AccordionPrimitive.Trigger data-slot="accordion-trigger" className={cn("kl-key kl-acc-trigger", className)} {...props}>
        <span className="kl-acc-title">
          <span>{children}</span>
          {description ? <small>{description}</small> : null}
        </span>
        {meta != null ? <span className="kl-acc-meta">{meta}</span> : null}
        <span className="kl-acc-caret" aria-hidden>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

type AccordionPanelProps = React.ComponentProps<typeof AccordionPrimitive.Panel> & {
  /** Drop the panel's inset, for content that brings its own cells (an item list, a key/value grid). */
  flush?: boolean
}

function AccordionPanel({ className, children, flush, ...props }: AccordionPanelProps) {
  return (
    <AccordionPrimitive.Panel data-slot="accordion-panel" className="kl-acc-panel" {...props}>
      <div className={cn("kl-acc-body", className)} data-flush={flush || undefined}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel }
