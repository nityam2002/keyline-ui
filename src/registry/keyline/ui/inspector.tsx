"use client";

import * as React from "react"

import { cn } from "@/lib/utils"
import { ScrollArea } from "./scroll-area"

/**
 * Non-modal contextual panel. Its header cites the inspected object's code (e.g. R3/12) so the object
 * and its detail share an address; the action strip is sticky and part of the frame.
 */
function Inspector({ className, ...props }: React.ComponentProps<"aside">) {
  return <aside data-slot="inspector" className={cn("kl-frame kl-insp", className)} {...props} />
}

function InspectorHeader({ code, title, status, onClose, closeLabel = "Close inspector" }: { code?: React.ReactNode; title: React.ReactNode; status?: React.ReactNode; onClose?: () => void; closeLabel?: string }) {
  return (
    <header className="kl-cells kl-insp-h">
      <div className="kl-insp-t">
        {code ? <span className="kl-code">{code}</span> : null}
        <h2>{title}</h2>
        {status}
      </div>
      {onClose ? (
        <button type="button" className="kl-cell kl-insp-x" onClick={onClose} aria-label={closeLabel}>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" aria-hidden>
            <path d="m4.5 4.5 7 7m0-7-7 7" />
          </svg>
        </button>
      ) : null}
    </header>
  )
}

/** Key/value cells, two-up. */
function InspectorFacts({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="kl-insp-kv">
      {items.map((it) => (
        <div key={it.label}>
          <dt className="kl-code">{it.label}</dt>
          <dd>{it.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** The inspector's scrolling body: a Keyline Scroll Area (bar on the inline-end edge, native scrolling). */
function InspectorBody({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <ScrollArea data-slot="inspector-body" className="kl-insp-scroll" contentClassName={cn("kl-insp-b", className)} {...(props as object)}>
      {children}
    </ScrollArea>
  )
}

/** A labelled cell. `span` makes two short sections share a row. */
function InspectorSection({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("kl-insp-s", className)} {...props} />
}
function InspectorRow({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("kl-insp-row", className)} {...props} />
}

function InspectorActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("kl-cells kl-insp-a", className)} {...props} />
}

export { Inspector, InspectorHeader, InspectorFacts, InspectorBody, InspectorSection, InspectorRow, InspectorActions }
