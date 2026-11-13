"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Menu, MenuTrigger, MenuPopup, MenuItem } from "./menu";

type Crumb = {
  label: React.ReactNode;
  href?: string;
  /** A router link instead of <a>: render={<Link to="…" />}. Props and refs merge (Base UI useRender). */
  render?: React.ReactElement;
};

type BreadcrumbProps = Omit<React.ComponentProps<"nav">, "children"> & {
  /** Ancestors first; the last item is the current page (not a link). */
  items: Crumb[];
  /** Above this many items the ones before the parent fold into a "…" cell with a menu. Default 4. */
  maxItems?: number;
  /** control: its own 2px frame. cell: a row of an enclosing frame (a panel's or page header's top cell). */
  layout?: "control" | "cell";
  /** Name of the "…" menu trigger. */
  moreLabel?: string;
};

/*
 * BREADCRUMB: the frame hugs its crumbs (inline), up to the width it is given. Seams sit on each crumb's end edge,
 * so folding a crumb away never leaves a doubled edge. The nav is the size container (kl-crumbs) the folding measures,
 * and the outermost Keyline element (kl-type). The frame keeps the cut's room, so it holds whichever crumb is first.
 */
const listVariants = cva(
  "kl-ctl kl-cells m-0 box-border max-w-full list-none p-0 ps-[calc(var(--kl-c,0px)*0.35)] align-top",
  {
    variants: {
      // a cell gives its background to the enclosing frame (the foundation's layout="cell") and fills the row
      layout: { control: "inline-flex min-h-(--kl-ctl) bg-kl-cell", cell: "flex min-h-(--kl-row)" },
    },
    defaultVariants: { layout: "control" },
  },
);

/** A crumb: a cell of the frame that gives up room before the current page does. */
const crumb = "flex min-w-0 flex-[0_3_auto] border-s-0 not-last:border-e-(length:--kl-k1) not-last:border-e-kl-seam";
/** Folded away by count (data-kl-folded on the nav) or by width (under 480px of the nav's own width). */
const early = "group-data-kl-folded/breadcrumb:hidden [@container_kl-crumbs_(max-width:480px)]:hidden";
const link = cn(
  "group/breadcrumb-link kl-cell kl-key min-h-0 gap-1.5 text-(length:--kl-text-body) text-kl-ink no-underline",
);
const text = "min-w-0 truncate";

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      data-slot="breadcrumb-separator"
      className={cn("flex-none text-kl-ink-3 kl-rtl:-scale-x-100", className)}
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      aria-hidden
    >
      <path d="m6 4 4 4-4 4" />
    </svg>
  );
}

function CrumbLink({ crumb: c }: { crumb: Crumb }) {
  return useRender({
    render: c.render ?? <a href={c.href} />,
    props: {
      "data-slot": "breadcrumb-link",
      className: cn(link, "max-w-[22ch] [@container_kl-crumbs_(max-width:480px)]:max-w-[14ch]"),
      children: (
        <>
          <span
            className={cn(text, "group-hover/breadcrumb-link:underline group-hover/breadcrumb-link:underline-offset-3")}
          >
            {c.label}
          </span>
          <Chevron />
        </>
      ),
    },
  });
}

/**
 * Where this page sits, as cells in one frame:
 *
 *   ┌─────────┬──────────┬───┬───────────┬━━━━━━━━━━━━━━━━━━━━┓
 *   │ Network ›│ Europe › │ … │ Rotterdam ›│ ECT Delta (here)  ┃   ancestors are link cells; here is cobalt
 *   └─────────┴──────────┴───┴───────────┴━━━━━━━━━━━━━━━━━━━━┛
 *
 * - The current page is the cobalt cell (location, as in Nav and Tabs), aria-current="page", not a link.
 * - Each ancestor ends in a chevron that mirrors in RTL. Long labels truncate inside their cell; the
 *   current page keeps the most room.
 * - Folding: more than `maxItems`, or less than 480px of its own width, folds every ancestor before the
 *   parent into a "…" cell whose menu lists them in order. The parent and the page itself always show.
 */
function Breadcrumb({
  items,
  maxItems = 4,
  layout = "control",
  moreLabel = "Earlier levels",
  className,
  ...props
}: BreadcrumbProps): React.ReactElement {
  const n = items.length;
  const current = items[n - 1];
  const parentIndex = n - 2;
  const earlier = items.slice(0, Math.max(0, parentIndex));
  const folded = n > maxItems;
  return (
    <nav
      aria-label="Breadcrumb"
      data-kl-layout={layout}
      data-kl-folded={folded || undefined}
      className={cn("group/breadcrumb kl-type @container/kl-crumbs min-w-0", className)}
      {...props}
      data-slot="breadcrumb"
    >
      <ol data-slot="breadcrumb-list" data-kl-layout={layout} className={cn(listVariants({ layout }))}>
        {earlier.length ? (
          <li
            data-slot="breadcrumb-more"
            className={cn(
              crumb,
              "hidden group-data-kl-folded/breadcrumb:flex [@container_kl-crumbs_(max-width:480px)]:flex",
            )}
          >
            <Menu>
              <MenuTrigger
                className={cn(
                  link,
                  "font-(--kl-weight-strong) data-popup-open:bg-kl-inverse data-popup-open:text-kl-on-inverse",
                )}
                aria-label={`${moreLabel} (${earlier.length})`}
              >
                <span aria-hidden>…</span>
                <Chevron className="group-data-popup-open/breadcrumb-link:text-inherit" />
              </MenuTrigger>
              <MenuPopup attachWeight={layout === "cell" ? 1 : 2}>
                {earlier.map((c, i) => (
                  <MenuItem key={i} code={i + 1} render={c.render ?? <a href={c.href} />}>
                    {c.label}
                  </MenuItem>
                ))}
              </MenuPopup>
            </Menu>
          </li>
        ) : null}
        {items.slice(0, -1).map((c, i) => (
          <li
            key={i}
            data-slot="breadcrumb-item"
            data-kl-early={i < parentIndex || undefined}
            className={cn(crumb, i < parentIndex && early)}
          >
            <CrumbLink crumb={c} />
          </li>
        ))}
        {current ? (
          <li data-slot="breadcrumb-item" className={cn(crumb, "flex-[0_1_auto]")}>
            <span
              data-slot="breadcrumb-page"
              aria-current="page"
              className={cn(
                "kl-cell min-h-0 bg-kl-cobalt text-(length:--kl-text-body) font-(--kl-weight-strong) text-kl-on-cobalt",
                "forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:forced-color-adjust-none",
              )}
            >
              <span className={text}>{current.label}</span>
            </span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}

export { Breadcrumb, type Crumb, type BreadcrumbProps };
