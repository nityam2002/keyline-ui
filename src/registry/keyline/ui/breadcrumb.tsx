"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { Menu, MenuTrigger, MenuContent, MenuItem } from "./menu";

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

const Chevron = () => (
  <svg
    className="kl-crumb-sep"
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

function CrumbLink({ crumb }: { crumb: Crumb }) {
  return useRender({
    render: crumb.render ?? <a href={crumb.href} />,
    props: {
      className: "kl-cell kl-key kl-crumb-link",
      children: (
        <>
          <span className="kl-crumb-text">{crumb.label}</span>
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
}: BreadcrumbProps) {
  const n = items.length;
  const current = items[n - 1];
  const parentIndex = n - 2;
  const early = items.slice(0, Math.max(0, parentIndex));
  const folded = n > maxItems;
  return (
    <nav
      aria-label="Breadcrumb"
      data-slot="breadcrumb"
      data-kl-layout={layout}
      data-kl-folded={folded || undefined}
      className={cn("kl-crumbs", className)}
      {...props}
    >
      <ol data-kl-layout={layout} className="kl-ctl kl-cells kl-crumbs-list">
        {early.length ? (
          <li className="kl-crumb kl-crumb-more">
            <Menu>
              <MenuTrigger className="kl-cell kl-key kl-crumb-link" aria-label={`${moreLabel} (${early.length})`}>
                <span aria-hidden>…</span>
                <Chevron />
              </MenuTrigger>
              <MenuContent attachWeight={layout === "cell" ? 1 : 2}>
                {early.map((c, i) => (
                  <MenuItem key={i} code={i + 1} render={c.render ?? <a href={c.href} />}>
                    {c.label}
                  </MenuItem>
                ))}
              </MenuContent>
            </Menu>
          </li>
        ) : null}
        {items.slice(0, -1).map((c, i) => (
          <li key={i} className="kl-crumb" data-kl-early={i < parentIndex || undefined}>
            <CrumbLink crumb={c} />
          </li>
        ))}
        {current ? (
          <li className="kl-crumb kl-crumb-here">
            <span className="kl-cell kl-crumb-cur" aria-current="page">
              <span className="kl-crumb-text">{current.label}</span>
            </span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}

export { Breadcrumb, type Crumb, type BreadcrumbProps };
