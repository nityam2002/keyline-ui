"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { tokenMs, useStretch } from "../lib/keyline-motion";
import { useScrollEdges } from "../lib/scroll-edges";
import { Tooltip, TooltipProvider } from "./tooltip";

type NavItem = {
  value: string;
  label: React.ReactNode;
  href?: string;
  count?: React.ReactNode;
  disabled?: boolean;
  /** A 16px glyph in the item's key cell (authored SVG, aria-hidden). Needed for the shell's rail. */
  icon?: React.ReactNode;
  /**
   * Nested links. The item becomes a disclosure (a button with aria-expanded) over an indented
   * list on the key column's seam; it is not a destination itself. It opens by itself while one of its links
   * is current, and while it is closed the band rests on it. On a rail the list is hidden and pressing the
   * item widens the sidebar with the list open.
   */
  items?: NavItem[];
  /** Open at first render. Default: open when a nested link is current. */
  defaultOpen?: boolean;
  /**
   * A cell at the row's end for the item's own commands: usually a <NavAction> as a MenuTrigger's
   * render. It is a separate Tab stop beside the item, never inside the link. Hidden on a rail.
   */
  action?: React.ReactNode;
};
type NavGroup = { label: string; items: NavItem[] };

/** Set by AppShell when the sidebar is a rail (icons only): labels fly out on hover and focus. */
const NavRailContext = React.createContext(false);
/** Set by AppShell: widens a rail (a nested item pressed on the rail opens its list in the full sidebar). */
const NavExpandContext = React.createContext<(() => void) | null>(null);

const has = (it: NavItem, value: string): boolean => !!it.items?.some((c) => c.value === value || has(c, value));

// one chevron that turns a quarter (the Accordion's and Collapsible's caret motion), not a path swap
const Caret = () => (
  <svg
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    aria-hidden
  >
    <path d="m6 4 4 4-4 4" />
  </svg>
);

/**
 * A nested list's fold: it unfolds with the Accordion's timing (--kl-t-unfold, ease-out) and folds
 * with --kl-t-fold (ease-in), staying mounted while it folds. `onReady` fires once it is fully open, so the band
 * can hand off from the parent to the link inside. Open at first render means open with no motion.
 */
function NavFold({ open, onReady, children }: { open: boolean; onReady: () => void; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(open);
  const [shown, setShown] = React.useState(open);
  const ready = React.useRef(onReady);
  ready.current = onReady;
  const first = React.useRef(true);
  React.useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      if (open) ready.current(); // mounted open (first paint, or a rail widening with the list open): already there
      return;
    }
    if (open) {
      setMounted(true);
      let t: ReturnType<typeof setTimeout> | undefined;
      // two frames: the folded state must be painted before the open one, or the rows transition never runs
      let r = requestAnimationFrame(() => {
        r = requestAnimationFrame(() => {
          setShown(true);
          t = setTimeout(() => ready.current(), tokenMs(ref.current, "--kl-t-unfold", 160));
        });
      });
      return () => {
        cancelAnimationFrame(r);
        clearTimeout(t);
      };
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), tokenMs(ref.current, "--kl-t-fold", 120));
    return () => clearTimeout(t);
  }, [open]);
  if (!mounted) return null;
  return (
    <div ref={ref} className="kl-nav-fold" data-kl-clip="" data-open={shown ? "" : undefined} inert={!open}>
      {children}
    </div>
  );
}

type NavProps = {
  /** Flat list of items. Or pass `groups`. */
  items?: NavItem[];
  /** Labelled sections, separated by a heavy seam; one cobalt band still runs across all of them. */
  groups?: NavGroup[];
  value: string;
  onValueChange?: (v: string) => void;
  label: string;
  header?: React.ReactNode;
  /** Pinned to the bottom of the nav (who is signed in, a workspace, settings). */
  footer?: React.ReactNode;
  layout?: "control" | "cell";
  /** responsive: vertical while the nav is narrower than 300px, a row when wider (container query). */
  orientation?: "vertical" | "horizontal" | "responsive";
  /**
   * What renders an `href` item. Default `"a"` (a full page load). Pass your router's link, such as
   * Next's `Link`, so items navigate client-side; it receives the anchor's props (href, className, onClick, aria-*).
   */
  linkComponent?: React.ElementType;
  className?: string;
};

/**
 * App location. A region frame holding a list of items; the current item is under a cobalt band that
 * STRETCHES between items, vertically in a sidebar and horizontally once the layout turns it into a row
 * (axis follows the list's flex direction). Items are links (`href`) or buttons; current = aria-current.
 *
 * - `groups` label sections (a list per group, named by its label); the band crosses between them.
 * - `icon` puts a glyph in a key cell at the item's start; in AppShell's rail only the key cells show and
 *   the label flies out beside the item on hover and on keyboard focus (it stays the accessible name).
 * - `footer` sits at the bottom of the column.
 */
function Nav({
  items,
  groups,
  value,
  onValueChange,
  label,
  header,
  footer,
  layout = "control",
  orientation = "vertical",
  linkComponent: Link = "a",
  className,
}: NavProps) {
  const ref = React.useRef<HTMLUListElement>(null);
  const rail = React.useContext(NavRailContext);
  const expand = React.useContext(NavExpandContext);
  const id = React.useId();
  const all = groups ? groups.flatMap((g) => g.items) : (items ?? []);
  // nested lists: which are open (a list holding the current link opens when it becomes current)
  const [open, setOpen] = React.useState<Set<string>>(() => {
    const o = new Set<string>();
    const walk = (l: NavItem[]) =>
      l.forEach((it) => {
        if (it.items && (it.defaultOpen ?? has(it, value))) o.add(it.value);
        if (it.items) walk(it.items);
      });
    walk(all);
    return o;
  });
  // lists fully unfolded: until then the band rests on the parent, then hands off to the link inside
  const [ready, setReady] = React.useState<Set<string>>(() => new Set(open));
  const markReady = (v: string) => setReady((r) => (r.has(v) ? r : new Set([...r, v])));
  // a disclosure changes the layout, not the selection: the band is placed, never sent travelling
  const snap = React.useRef(false);
  const [seen, setSeen] = React.useState(value);
  if (seen !== value) {
    setSeen(value);
    const add: string[] = [];
    const walk = (l: NavItem[]) =>
      l.forEach((it) => {
        if (it.items && has(it, value) && !open.has(it.value)) add.push(it.value);
        if (it.items) walk(it.items);
      });
    walk(all);
    if (add.length) setOpen(new Set([...open, ...add]));
  }
  const isOpen = (it: NavItem) => !rail && open.has(it.value);
  const toggle = (it: NavItem) => {
    snap.current = true;
    if (rail) {
      setOpen(new Set([...open, it.value]));
      expand?.();
      return;
    }
    const n = new Set(open);
    if (n.has(it.value)) {
      n.delete(it.value);
      // the selection folds into its parent at the press: its rows stop being items now, not when the fold ends
      setReady((r) => {
        const x = new Set(r);
        x.delete(it.value);
        return x;
      });
    } else n.add(it.value);
    setOpen(n);
  };
  const bandOnParent = (it: NavItem) => !!it.items && (!isOpen(it) || !ready.has(it.value)) && has(it, value);
  // the band's target, in the order the items are drawn: the current link, or the closed item holding it
  const shown: NavItem[] = [];
  const walkShown = (l: NavItem[]) =>
    l.forEach((it) => {
      shown.push(it);
      if (it.items && isOpen(it)) walkShown(it.items);
    });
  walkShown(all);
  const target = shown.findIndex((it) => (it.items ? bandOnParent(it) : it.value === value));
  useStretch(ref, target, { axis: "auto", instant: snap.current });
  React.useLayoutEffect(() => {
    snap.current = false;
  });
  useScrollEdges(ref);
  // `live` false: a row inside a folding list, still drawn but no longer an item of the band
  const item = (it: NavItem, depth = 0, live = true): React.ReactNode => {
    const current = it.value === value;
    if (it.items) return parent(it, depth, live);
    const inner = (
      <>
        {it.icon ? (
          <span className="kl-nav-ic" aria-hidden>
            {it.icon}
          </span>
        ) : null}
        <span className="kl-nav-l">{it.label}</span>
        {it.count != null ? <span className="kl-code kl-nav-n">{it.count}</span> : null}
      </>
    );
    const el = it.href ? (
      <Link
        data-kl-item={live ? "" : undefined}
        href={it.href}
        aria-current={current ? "page" : undefined}
        aria-disabled={it.disabled || undefined}
        className="kl-nav-i"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          if (it.disabled) return e.preventDefault();
          if (onValueChange) {
            e.preventDefault();
            onValueChange(it.value);
          }
        }}
      >
        {inner}
      </Link>
    ) : (
      <button
        type="button"
        data-kl-item={live ? "" : undefined}
        aria-current={current ? "page" : undefined}
        disabled={it.disabled}
        className="kl-nav-i"
        onClick={() => onValueChange?.(it.value)}
      >
        {inner}
      </button>
    );
    return row(it, el, depth);
  };
  // on a rail the label is visually hidden (still the accessible name) and shown beside the key cell
  const tip = (it: NavItem, el: React.ReactElement) =>
    rail && it.icon ? (
      <Tooltip
        side="inline-end"
        delay={150}
        content={
          <>
            {it.label}
            {it.count != null ? <span className="kl-code kl-nav-tipn">{it.count}</span> : null}
          </>
        }
      >
        {el}
      </Tooltip>
    ) : (
      el
    );
  const row = (it: NavItem, el: React.ReactElement, depth: number, sub?: React.ReactNode) => (
    <li key={it.value} data-kl-depth={depth || undefined}>
      {it.action && !rail ? (
        <div className="kl-cells kl-nav-row">
          {tip(it, el)}
          <span className="kl-nav-act-cell">{it.action}</span>
        </div>
      ) : (
        tip(it, el)
      )}
      {sub}
    </li>
  );
  const parent = (it: NavItem, depth: number, live: boolean) => {
    const o = isOpen(it);
    const subId = `${id}-s-${it.value}`;
    const el = (
      <button
        type="button"
        data-kl-item={live ? "" : undefined}
        data-kl-holds={bandOnParent(it) ? "" : undefined}
        aria-expanded={rail ? undefined : o}
        aria-controls={o ? subId : undefined}
        disabled={it.disabled}
        className="kl-nav-i kl-nav-parent"
        onClick={() => toggle(it)}
      >
        {it.icon ? (
          <span className="kl-nav-ic" aria-hidden>
            {it.icon}
          </span>
        ) : null}
        <span className="kl-nav-l">{it.label}</span>
        {it.count != null ? <span className="kl-code kl-nav-n">{it.count}</span> : null}
        {rail ? null : (
          <span className="kl-nav-caret" aria-hidden>
            <Caret />
          </span>
        )}
      </button>
    );
    return row(
      it,
      el,
      depth,
      rail ? null : (
        <NavFold open={o} onReady={() => markReady(it.value)}>
          <ul id={subId} className="kl-nav-sub" aria-label={typeof it.label === "string" ? it.label : undefined}>
            {it.items!.map((c) => item(c, depth + 1, live && o))}
          </ul>
        </NavFold>
      ),
    );
  };
  const tree = (
    <nav
      aria-label={label}
      data-slot="nav"
      data-kl-layout={layout}
      data-orientation={orientation}
      data-kl-rail={rail ? "" : undefined}
      data-kl-icons={all.some((i) => i.icon) ? "" : undefined}
      className={cn("kl-frame kl-nav", className)}
    >
      {header ? <div className="kl-nav-h">{header}</div> : null}
      <ul ref={ref} data-kl-stretch="" className="kl-rows kl-nav-list">
        {/* the band is a presentational list item: a <ul> may only contain <li> (it was a <span>) */}
        <li data-kl-band="" role="presentation" className="kl-nav-band" aria-hidden hidden />
        {groups
          ? groups.map((g, gi) => (
              <li key={g.label} className="kl-nav-g">
                <span id={`${id}-g${gi}`} className="kl-nav-gl">
                  {g.label}
                </span>
                <ul aria-labelledby={`${id}-g${gi}`} className="kl-nav-gi">
                  {g.items.map((it) => item(it))}
                </ul>
              </li>
            ))
          : all.map((it) => item(it))}
      </ul>
      {footer ? <div className="kl-nav-f">{footer}</div> : null}
    </nav>
  );
  // one provider for the rail: once a label is showing, scanning down the rail shows the next one at once (no delay,
  // no fade: the tooltip's data-instant), as a toolbar of hints should behave (each item re-waited 150ms)
  return rail ? <TooltipProvider delay={150}>{tree}</TooltipProvider> : tree;
}

/**
 * A header or footer identity for a sidebar Nav: a square mark cell, then a title and a meta line (a site
 * code, a role). On a rail only the mark shows; the title and meta stay in the accessibility tree.
 */
function NavIdentity({
  mark,
  title,
  meta,
  className,
}: {
  mark: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <span data-slot="nav-identity" className={cn("kl-nav-id", className)}>
      <span className="kl-nav-id-m" aria-hidden>
        {mark}
      </span>
      <span className="kl-nav-id-t">
        <span className="kl-nav-id-n">{title}</span>
        {meta != null ? <span className="kl-code kl-nav-id-s">{meta}</span> : null}
      </span>
    </span>
  );
}

/**
 * The ⋯ key cell of a row action: pass it as a MenuTrigger's render, so the item's commands open in
 * a Menu docked to the row. `label` names it ("More for Saved view: Late arrivals").
 */
function NavAction({ label, className, children, ...props }: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button type="button" aria-label={label} data-slot="nav-action" className={cn("kl-nav-act", className)} {...props}>
      {children ?? (
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
          <rect x="2" y="7" width="2.5" height="2.5" />
          <rect x="6.75" y="7" width="2.5" height="2.5" />
          <rect x="11.5" y="7" width="2.5" height="2.5" />
        </svg>
      )}
    </button>
  );
}

export { Nav, NavIdentity, NavAction, NavRailContext, NavExpandContext, type NavItem, type NavGroup, type NavProps };
