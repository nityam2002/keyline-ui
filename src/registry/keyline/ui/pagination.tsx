"use client";

import * as React from "react";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { pageWindow } from "../lib/collection";

type PaginationProps = Omit<React.ComponentProps<"nav">, "children" | "onChange"> & {
  /** The current page, 1-based (the number printed). */
  page: number;
  /** How many pages. null while unknown: the numbers show "–" and every cell is out of service. */
  pageCount: number | null;
  onPageChange?: (page: number) => void;
  /** Links instead of buttons: the page's URL. Each number is then an <a>, so pages open in new tabs. */
  getHref?: (page: number) => string;
  /** Pages shown on each side of the current one (default 1). */
  siblings?: number;
  /** control: its own 2px frame. cell: a row of an enclosing frame (a panel's or table's footer). */
  layout?: "control" | "cell";
  /** Name of the navigation landmark. */
  label?: string;
  /** Text read for a page number (default "Page 4"). */
  pageLabel?: (page: number) => string;
};

/*
 * PAGINATION: the frame hugs its cells. Number cells are as wide as the largest page number (tabular figures, and one
 * weight for every cell, so `ch` is the same in numbers and gaps): paging never changes the frame's width. The nav is
 * the size container (kl-pg) the narrow layout measures, and the outermost Keyline element (kl-type). --kl-pg-sw is
 * a step cell's width: square in the frame.
 */
const frameVariants = cva("kl-ctl kl-cells box-border max-w-full align-top [@container_kl-pg_(max-width:360px)]:flex", {
  variants: {
    // as a row of a wider frame, the rest of the row is an empty cell: its seam closes the last key
    layout: {
      control: "inline-flex min-h-(--kl-ctl) bg-kl-cell [--kl-pg-sw:calc(var(--kl-ctl)-2*var(--kl-bw,0px))]",
      cell: cn(
        "flex min-h-(--kl-row) [--kl-pg-sw:var(--kl-row)]",
        "after:flex-[1_1_0] after:border-s-(length:--kl-k1) after:border-s-kl-line after:content-['']",
      ),
    },
  },
  defaultVariants: { layout: "control" },
});
const cellBase = "kl-cell min-h-0 justify-center font-(--kl-weight-strong) tabular-nums";
const numberWidth = "box-border min-w-[calc((var(--kl-pg-ch,2)+0.5)*1ch+2*var(--kl-inset))]";
const narrowHidden = "[@container_kl-pg_(max-width:360px)]:hidden";
const parts = {
  /* Previous and Next: out of service (hatched) at the ends. The first cell (Previous) widens by the cut's room. */
  step: cn(
    "w-(--kl-pg-sw) flex-none p-0",
    "first:w-[calc(var(--kl-pg-sw)+var(--kl-c,0px)*0.35)] first:ps-[calc(var(--kl-c,0px)*0.35)]",
    "disabled:cursor-not-allowed disabled:bg-(image:--kl-hatch) disabled:text-kl-dis",
    "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
  ),
  /* here: the location cell */
  page: cn(
    numberWidth,
    narrowHidden,
    "px-(--kl-inset) aria-[current=page]:cursor-default aria-[current=page]:bg-kl-cobalt aria-[current=page]:text-kl-on-cobalt",
    "aria-[current=page]:focus-visible:outline-current",
    "forced-colors:aria-[current=page]:bg-[Highlight] forced-colors:aria-[current=page]:text-[HighlightText] forced-colors:aria-[current=page]:forced-color-adjust-none",
  ),
  gap: cn(numberWidth, narrowHidden, "px-1 text-kl-ink-2"),
  /* "5 / 20": shown when narrow, and with "–" while the count is unknown */
  status: cn(
    "kl-code min-w-[calc(var(--kl-pg-ch,2)*2ch+3ch+2*var(--kl-inset))] text-(length:--kl-text-label) text-kl-ink",
    "[@container_kl-pg_(max-width:360px)]:flex [@container_kl-pg_(max-width:360px)]:flex-1",
  ),
};

const Arrow = ({ d }: { d: string }) => (
  <svg
    className="kl-rtl:-scale-x-100"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="square"
    aria-hidden
  >
    <path d={d} />
  </svg>
);

/**
 * Page numbers as cells in one frame:
 *
 *   ┌───┬───┬───┬───┬━━━┳───┬───┬────┬───┐
 *   │ ‹ │ 1 │ … │ 4 │ 5 ┃ 6 │ … │ 20 │ › │      the current page is the cobalt cell
 *   └───┴───┴───┴───┴━━━┻───┴───┴────┴───┘
 *
 * - The window keeps a constant number of cells (first, last, the current page and its siblings, and
 *   gaps), and number cells are as wide as the largest page number: the frame never changes width while
 *   you page, so Previous and Next stay under the pointer.
 * - The current page is cobalt (location) with aria-current="page"; it stays focusable, it does nothing.
 * - Below 360px of its own width the numbers fold into one "5 / 20" cell between Previous and Next.
 * - Previous and Next mirror in RTL; they are out of service (hatched) at the ends.
 * - Buttons by default; `getHref` makes them links (Previous/Next at the ends become plain cells).
 */
function Pagination({
  page,
  pageCount,
  onPageChange,
  getHref,
  siblings = 1,
  layout = "control",
  label = "Pagination",
  pageLabel = (p) => `Page ${p}`,
  className,
  style,
  ...props
}: PaginationProps): React.ReactElement {
  const known = pageCount != null && pageCount > 0;
  const slots = known ? pageWindow(page, pageCount, siblings) : [];
  const digits = String(pageCount ?? 0).length;

  const cell = (
    target: number | null,
    content: React.ReactNode,
    extra: { slot: string; className: string; label?: string; current?: boolean },
  ) => {
    const disabled = target == null || !known;
    const common = {
      "data-slot": extra.slot,
      className: cn(cellBase, "kl-key", extra.className),
      "aria-label": extra.label,
      "aria-current": extra.current ? ("page" as const) : undefined,
    };
    if (getHref) {
      if (disabled)
        return (
          // a link out of service (the APG's disabled link): aria-disabled needs the link role, a bare span forbids it
          <span {...common} role="link" aria-disabled="true" data-disabled="">
            {content}
          </span>
        );
      return (
        <a
          {...common}
          href={getHref(target)}
          onClick={onPageChange ? (e) => (e.preventDefault(), onPageChange(target)) : undefined}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        type="button"
        {...common}
        disabled={disabled}
        onClick={() => !extra.current && target != null && onPageChange?.(target)}
      >
        {content}
      </button>
    );
  };

  return (
    <nav
      aria-label={label}
      data-kl-layout={layout}
      className={cn("kl-type @container/kl-pg min-w-0", className)}
      style={{ "--kl-pg-ch": digits, ...style } as React.CSSProperties}
      {...props}
      data-slot="pagination"
    >
      <div data-slot="pagination-frame" data-kl-layout={layout} className={cn(frameVariants({ layout }))}>
        {cell(known && page > 1 ? page - 1 : null, <Arrow d="m10 4-4 4 4 4" />, {
          slot: "pagination-previous",
          className: parts.step,
          label: "Previous page",
        })}
        {slots.map((s) =>
          typeof s === "number" ? (
            <React.Fragment key={s}>
              {cell(s, <span>{s}</span>, {
                slot: "pagination-page",
                className: parts.page,
                label: pageLabel(s),
                current: s === page,
              })}
            </React.Fragment>
          ) : (
            <span key={s} data-slot="pagination-ellipsis" className={cn(cellBase, parts.gap)} aria-hidden>
              …
            </span>
          ),
        )}
        <span
          data-slot="pagination-status"
          className={cn(cellBase, parts.status, known ? "hidden" : "flex")}
          aria-live="polite"
        >
          {known ? (
            <bdi>
              {page} / {pageCount}
            </bdi>
          ) : (
            "–"
          )}
        </span>
        {cell(known && page < pageCount ? page + 1 : null, <Arrow d="m6 4 4 4-4 4" />, {
          slot: "pagination-next",
          className: parts.step,
          label: "Next page",
        })}
      </div>
    </nav>
  );
}

export { Pagination, type PaginationProps };
