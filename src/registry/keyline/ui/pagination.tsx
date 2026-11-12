"use client";

import * as React from "react";

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

const Arrow = ({ d }: { d: string }) => (
  <svg
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
}: PaginationProps) {
  const known = pageCount != null && pageCount > 0;
  const slots = known ? pageWindow(page, pageCount, siblings) : [];
  const digits = String(pageCount ?? 0).length;

  const cell = (
    target: number | null,
    content: React.ReactNode,
    extra: { className: string; label?: string; current?: boolean },
  ) => {
    const disabled = target == null || !known;
    const common = {
      className: cn("kl-cell kl-key", extra.className),
      "aria-label": extra.label,
      "aria-current": extra.current ? ("page" as const) : undefined,
    };
    if (getHref) {
      if (disabled)
        return (
          <span {...common} aria-disabled="true" data-disabled="">
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
      data-slot="pagination"
      data-kl-layout={layout}
      className={cn("kl-pg", className)}
      style={{ "--kl-pg-ch": digits, ...style } as React.CSSProperties}
      {...props}
    >
      <div data-kl-layout={layout} className="kl-ctl kl-cells kl-pg-frame">
        {cell(known && page > 1 ? page - 1 : null, <Arrow d="m10 4-4 4 4 4" />, {
          className: "kl-pg-step",
          label: "Previous page",
        })}
        {slots.map((s) =>
          typeof s === "number" ? (
            <React.Fragment key={s}>
              {cell(s, <span>{s}</span>, { className: "kl-pg-n", label: pageLabel(s), current: s === page })}
            </React.Fragment>
          ) : (
            <span key={s} className="kl-cell kl-pg-gap" aria-hidden>
              …
            </span>
          ),
        )}
        <span className="kl-cell kl-code kl-pg-of" aria-live="polite">
          {known ? (
            <bdi>
              {page} / {pageCount}
            </bdi>
          ) : (
            "–"
          )}
        </span>
        {cell(known && page < pageCount ? page + 1 : null, <Arrow d="m6 4 4 4-4 4" />, {
          className: "kl-pg-step",
          label: "Next page",
        })}
      </div>
    </nav>
  );
}

export { Pagination, type PaginationProps };
