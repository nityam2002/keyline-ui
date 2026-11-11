import * as React from "react"

import { cn } from "@/lib/utils"

type EmptyKind = "empty" | "error" | "start"

type EmptyProps = Omit<React.ComponentProps<"div">, "title"> & {
  /**
   * empty: a query or filter matched nothing (the count is 0) · error: the content could not be loaded
   * (red count cell) · start: nothing has been made yet (first use; the count cell shows a + key line).
   */
  kind?: EmptyKind
  /** The figure in the count cell. Defaults to 0 for empty, "!" for error; start shows a glyph. */
  count?: React.ReactNode
  /** The Code word under the figure. Defaults to RESULTS, ERROR or NEW. */
  code?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Recovery or first actions: Buttons. The first is the way out (clear filters, retry, create). */
  actions?: React.ReactNode
  /** control: its own 2px region frame. cell: a cell of an enclosing frame (a panel body, a table). */
  layout?: "control" | "cell"
  /** Heading level of the title (default 3). */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** Announce when it appears (status; alert for error). Use when it replaces content the user was looking at. */
  live?: boolean
}

const CODE: Record<EmptyKind, string> = { empty: "RESULTS", error: "ERROR", start: "NEW" }

/**
 * A place with nothing in it, said plainly:
 *
 *   ┌────────┬──────────────────────────────────────┬──────────────┐
 *   │   0    │ No shipments match these filters     │ [Clear all]  │
 *   │RESULTS │ Status is Delayed · Carrier is DHL   │              │
 *   └────────┴──────────────────────────────────────┴──────────────┘
 *
 * One frame of three cells: the count (the Count voice: how many there are, which is the fact), the
 * message, and the way out. Below 520px of its own width the actions drop to a row of cells under the
 * message, and the count cell shrinks to a band. No illustration: the number is the picture.
 */
function Empty({ kind = "empty", count, code, title, description, actions, layout = "control", headingLevel = 3, live, className, ...props }: EmptyProps) {
  const H = `h${headingLevel}` as "h3"
  const figure = count ?? (kind === "empty" ? 0 : kind === "error" ? "!" : null)
  const role = live ? (kind === "error" ? "alert" : "status") : undefined
  return (
    <div data-slot="empty" data-kind={kind} data-kl-layout={layout} role={role} className={cn(layout === "control" ? "kl-frame" : null, "kl-empty", className)} {...props}>
      <div className="kl-empty-n">
        {figure != null ? (
          <span className="kl-empty-fig">{figure}</span>
        ) : (
          <svg className="kl-empty-fig" viewBox="0 0 32 32" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" aria-hidden>
            <path d="M16 6v20M6 16h20" />
          </svg>
        )}
        <span className="kl-code">{code ?? CODE[kind]}</span>
      </div>
      <div className="kl-empty-t">
        <H className="kl-empty-title">{title}</H>
        {description ? <div className="kl-empty-desc">{description}</div> : null}
      </div>
      {actions ? <div className="kl-empty-a">{actions}</div> : null}
    </div>
  )
}

export { Empty, type EmptyKind, type EmptyProps }
