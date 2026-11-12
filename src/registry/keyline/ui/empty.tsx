"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

type EmptyKind = "empty" | "error" | "start";
type EmptyLayout = "control" | "cell";

/*
 * EMPTY: one frame of cells (count · message · actions). It is its own size container (kl-empty), so the narrow
 * layout (520px and under) follows the space it is given (a sidebar, a panel cell), not the viewport: the count
 * becomes a band across the top, the actions a row under the message. Every narrow rule is written in full
 * ([@container_kl-empty_(max-width:520px)]:…), the inclusive bound the design measures with.
 */
const emptyVariants = cva(
  [
    "@container/kl-empty grid min-h-[200px] min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-stretch",
    "bg-kl-cell text-kl-ink",
  ],
  {
    variants: {
      layout: { control: "kl-frame", cell: "min-h-0" },
      kind: { empty: "", error: "", start: "" },
    },
    compoundVariants: [{ layout: "control", kind: "error", className: "border-kl-red [--kl-cut-line:var(--kl-red)]" }],
  },
);

/* the count cell; compact density outranks the narrow band (one attribute more), as it did in the stylesheet */
const countVariants = cva(
  [
    "grid min-w-[168px] place-items-center content-center gap-2 py-6 ps-[calc(16px+var(--kl-c,0px)*0.35)] pe-4",
    "border-e-(length:--kl-k1) border-e-kl-line text-[72px]/none font-(--kl-weight-strong) tabular-nums",
    "[[data-kl-density=compact]_&]:min-w-32 [[data-kl-density=compact]_&]:px-3 [[data-kl-density=compact]_&]:py-4",
    "[[data-kl-density=compact]_&]:text-[56px]",
    "[@container_kl-empty_(max-width:520px)]:col-span-full [@container_kl-empty_(max-width:520px)]:grid-flow-col",
    "[@container_kl-empty_(max-width:520px)]:items-baseline [@container_kl-empty_(max-width:520px)]:justify-start",
    "[@container_kl-empty_(max-width:520px)]:min-w-0 [@container_kl-empty_(max-width:520px)]:gap-3",
    "[@container_kl-empty_(max-width:520px)]:border-e-0 [@container_kl-empty_(max-width:520px)]:py-3",
    "[@container_kl-empty_(max-width:520px)]:border-b-(length:--kl-k1)",
    "[@container_kl-empty_(max-width:520px)]:border-b-kl-line [@container_kl-empty_(max-width:520px)]:text-[40px]",
  ],
  {
    variants: {
      kind: {
        empty: "",
        error:
          "bg-kl-red text-kl-on-red forced-colors:bg-[Mark] forced-colors:text-[MarkText] forced-colors:forced-color-adjust-none",
        start: "text-kl-ink-2",
      },
    },
  },
);

const content = cn(
  "grid min-w-0 content-center gap-1.5 p-6",
  "[@container_kl-empty_(max-width:520px)]:col-span-full [@container_kl-empty_(max-width:520px)]:px-(--kl-inset)",
  "[@container_kl-empty_(max-width:520px)]:py-4",
);

const actions = cn(
  "flex flex-col justify-center gap-2 border-s-(length:--kl-k1) border-s-kl-line-soft p-6",
  "[@container_kl-empty_(max-width:520px)]:col-span-full [@container_kl-empty_(max-width:520px)]:flex-row",
  "[@container_kl-empty_(max-width:520px)]:flex-wrap [@container_kl-empty_(max-width:520px)]:justify-start",
  "[@container_kl-empty_(max-width:520px)]:px-(--kl-inset) [@container_kl-empty_(max-width:520px)]:pt-0",
  "[@container_kl-empty_(max-width:520px)]:border-s-0 [@container_kl-empty_(max-width:520px)]:pb-4",
);

type EmptyState = { kind: EmptyKind; layout: EmptyLayout };

type EmptyProps = Omit<PartProps<"div", EmptyState>, "title" | "children"> & {
  /**
   * empty: a query or filter matched nothing (the count is 0) · error: the content could not be loaded
   * (red count cell) · start: nothing has been made yet (first use; the count cell shows a + key line).
   */
  kind?: EmptyKind;
  /** The figure in the count cell. Defaults to 0 for empty, "!" for error; start shows a glyph. */
  count?: React.ReactNode;
  /** The Code word under the figure. Defaults to RESULTS, ERROR or NEW. */
  code?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Recovery or first actions: Buttons. The first is the way out (clear filters, retry, create). */
  actions?: React.ReactNode;
  /** control: its own 2px region frame. cell: a cell of an enclosing frame (a panel body, a table). */
  layout?: EmptyLayout;
  /** Heading level of the title (default 3). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Announce when it appears (status; alert for error). Use when it replaces content the user was looking at. */
  live?: boolean;
};

const CODE: Record<EmptyKind, string> = { empty: "RESULTS", error: "ERROR", start: "NEW" };

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
function Empty({
  kind = "empty",
  count,
  code,
  title,
  description,
  actions: actionNodes,
  layout = "control",
  headingLevel = 3,
  live,
  render,
  className,
  style,
  ...props
}: EmptyProps): React.ReactElement {
  const H = `h${headingLevel}` as "h3";
  const figure = count ?? (kind === "empty" ? 0 : kind === "error" ? "!" : null);
  const state: EmptyState = { kind, layout };
  const own = {
    ...dataAttrs({ kind, "kl-layout": layout }),
    "data-slot": "empty",
    className: resolveClassName(cn(emptyVariants({ layout, kind })), className)(state),
    style: resolveStyle(undefined, style)(state),
    children: (
      <>
        <div data-slot="empty-count" className={cn(countVariants({ kind }))}>
          {figure != null ? (
            <span data-slot="empty-figure">{figure}</span>
          ) : (
            <svg
              data-slot="empty-figure"
              viewBox="0 0 32 32"
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="square"
              aria-hidden
            >
              <path d="M16 6v20M6 16h20" />
            </svg>
          )}
          <span data-slot="empty-code" className="kl-code text-inherit">
            {code ?? CODE[kind]}
          </span>
        </div>
        <div data-slot="empty-content" className={content}>
          <H
            data-slot="empty-title"
            className="m-0 text-(length:--kl-text-title)/[1.25] font-(--kl-weight-strong) wrap-anywhere"
          >
            {title}
          </H>
          {description ? (
            <div
              data-slot="empty-description"
              className="m-0 max-w-[52ch] leading-[1.45] wrap-anywhere text-kl-ink-2 [&>:is(p,ul)]:m-0"
            >
              {description}
            </div>
          ) : null}
        </div>
        {actionNodes ? (
          <div data-slot="empty-actions" className={actions}>
            {actionNodes}
          </div>
        ) : null}
      </>
    ),
  };
  const defaults = { role: live ? (kind === "error" ? "alert" : "status") : undefined };
  return useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(defaults, props, own) });
}

export { Empty, type EmptyKind, type EmptyProps };
