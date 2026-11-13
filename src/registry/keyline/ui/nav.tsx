"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { tokenMs, useStretch } from "../lib/keyline-motion";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
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

/* ------------------------------------------------------------------ *
 * CLASSES
 * The list is a stretch row: the engine clones it for a move and drops the clone's data-slot and ARIA, so every
 * style sits on the element it styles (or on the list, counting children: the band is always its first child),
 * and the clone reads the same. What the nav's own state decides (icons, rail, depth, orientation) is chosen here
 * in JS; the root mirrors it as data-kl-icons, data-kl-rail and data-orientation for consumers.
 * ------------------------------------------------------------------ */

/** visually hidden, still the accessible name (the rail's labels) */
const srOnly = "absolute size-px -m-px overflow-hidden p-0 whitespace-nowrap [clip-path:inset(50%)]";

const focusRing =
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus focus-visible:outline-solid";

const header = cn(
  "flex min-h-[52px] items-center gap-2.5 py-0 ps-[calc(14px+var(--kl-c-room,0px))] pe-3.5",
  "border-b-(length:--kl-k3) border-b-kl-line text-[15px] font-(--kl-weight-strong)",
  // a header holding an identity is the brand block: ink, the full frame width, the cut on its corner
  "has-[>[data-slot=nav-identity]]:border-b-kl-inverse has-[>[data-slot=nav-identity]]:bg-kl-inverse",
  "has-[>[data-slot=nav-identity]]:p-0 has-[>[data-slot=nav-identity]]:text-kl-on-inverse",
  "*:data-[slot=nav-identity]:min-h-[60px] *:data-[slot=nav-identity]:flex-auto",
  // a responsive nav wide enough to be a row has no header
  "@min-[300px]/kl-nav:hidden",
);

/*
 * The list: rows on keylines. The first row after the band draws no top keyline; the last closes on one (a shadow, not
 * a border, so it takes no room: a 1px taller list toggled the shell's scroller, a WebKit ResizeObserver loop). A
 * responsive nav lays it out as a row once the nav is 300px wide (its own width, not the viewport's).
 */
const list = cn(
  "kl-rows relative isolate m-0 [scrollbar-width:thin] [scrollbar-color:var(--kl-ink-3)_transparent] list-none p-0",
  "[&>li:nth-child(2)]:border-t-0",
  "[&>li:last-child:not(:first-child,.kl-more-fade)]:[box-shadow:0_var(--kl-k1)_0_var(--kl-line)]",
  // forced colours drop box-shadows: the closing keyline becomes an outline (no layout change, so no resize loop)
  "forced-colors:[&>li:last-child:not(:first-child,.kl-more-fade)]:outline-1",
  "forced-colors:[&>li:last-child:not(:first-child,.kl-more-fade)]:outline-offset-[-1px]",
  "forced-colors:[&>li:last-child:not(:first-child,.kl-more-fade)]:outline-[CanvasText]",
  "forced-colors:[&>li:last-child:not(:first-child,.kl-more-fade)]:outline-solid",
  "@min-[300px]/kl-nav:flex-row @min-[300px]/kl-nav:overflow-x-auto",
  "@min-[300px]/kl-nav:[&>li:not(:first-child,.kl-more-fade)]:flex-none",
  "@min-[300px]/kl-nav:[&>li:not(:first-child,.kl-more-fade)+li:not(.kl-more-fade)]:border-t-0",
  "@min-[300px]/kl-nav:[&>li:not(:first-child,.kl-more-fade)+li:not(.kl-more-fade)]:border-s-(length:--kl-k1)",
  "@min-[300px]/kl-nav:[&>li:not(:first-child,.kl-more-fade)+li:not(.kl-more-fade)]:border-s-kl-seam",
);
/** horizontal: one row of cells that scrolls inside its own frame */
const listRow = cn(
  "flex-row overflow-x-auto [&>li:not(:first-child,.kl-more-fade)]:flex-none",
  "[&>li:not(:first-child,.kl-more-fade)+li:not(.kl-more-fade)]:border-t-0",
  "[&>li:not(:first-child,.kl-more-fade)+li:not(.kl-more-fade)]:border-s-(length:--kl-k1)",
  "[&>li:not(:first-child,.kl-more-fade)+li:not(.kl-more-fade)]:border-s-kl-seam",
);

const band = "pointer-events-none absolute -z-1 list-none bg-kl-cobalt";
/*
 * With icons, the current item's key cell is ink under the cobalt band: a key pressed in. The ink is the band's own,
 * over the key column (--kl-band-c0/c1: the band's distance from each side), so it travels with the band, edge for
 * edge. A nested row starts past the column, so its band has no ink.
 */
const bandInk = cn(
  "[background-image:linear-gradient(var(--kl-inverse),var(--kl-inverse))] [background-position:left_top] bg-no-repeat",
  "[background-size:max(0px,calc(44px_-_var(--kl-band-c0,0px)))_100%]",
  "kl-rtl:[background-size:max(0px,calc(44px_-_var(--kl-band-c1,0px)))_100%] kl-rtl:[background-position:right_top]",
);

/*
 * An item: a link or a button filling its row. Hover tints only rows the band is NOT on: a closed parent holding the
 * current link carries the band (on-cobalt text) without aria-current, and an opaque tint there hid the band under
 * white text. KEY: a press registers on the frame it lands, before the band or the page answers.
 */
const item = cn(
  "group/nav-item flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 border-0 bg-transparent px-3.5",
  "text-start font-(family-name:--kl-font) text-[14px] font-(--kl-weight-strong) text-inherit no-underline",
  "hover:[&:not([aria-current],[data-kl-covered],[data-kl-holds]):not(:disabled)]:bg-kl-tint",
  "active:[&:not([aria-current],[data-kl-covered],[data-kl-holds],:disabled,[aria-disabled])]:bg-kl-press",
  "data-kl-covered:not-disabled:not-aria-disabled:text-kl-on-cobalt",
  "disabled:cursor-not-allowed disabled:bg-(image:--kl-hatch) disabled:text-kl-dis",
  "aria-disabled:cursor-not-allowed aria-disabled:bg-(image:--kl-hatch) aria-disabled:text-kl-dis",
  focusRing,
);
/** the covered item's key cell takes the ink fill's colours (a disabled item keeps the disabled ink) */
const icon = cn(
  "me-3 grid w-11 flex-none place-items-center self-stretch border-e-(length:--kl-k1) border-e-kl-seam [&_svg]:block",
  "group-data-kl-covered/nav-item:border-e-kl-inverse",
);
const iconCovered = "group-[[data-kl-covered]:not(:disabled,[aria-disabled])]/nav-item:text-kl-on-inverse";
/** on a rail the whole item is the key cell: the current one shows the cobalt band itself (an ink cell here would
 * merge with the ink brand block above it) */
const iconRail =
  "m-0 w-full border-e-0 group-[[data-kl-covered]:not(:disabled,[aria-disabled])]/nav-item:text-kl-on-cobalt";
const count = "kl-code flex-none ps-2 font-normal text-inherit";
const countRail = "absolute end-1 top-[3px] p-0 text-[10px]/none";

const caret = "ms-1 grid w-5 flex-none place-items-center text-kl-ink-2 group-data-kl-covered/nav-item:text-inherit";
/* the caret turns a quarter toward the list, with the Accordion's timing; in RTL it points left, so it turns back */
const caretGlyph = cn(
  "[transition:rotate_var(--kl-t-fold)_var(--kl-ease-in)] kl-rtl:[transform:scaleX(-1)]",
  "group-aria-expanded/nav-item:rotate-90 group-aria-expanded/nav-item:[transition:rotate_var(--kl-t-unfold)_var(--kl-ease-out)]",
  "kl-rtl:group-aria-expanded/nav-item:-rotate-90",
);

/** GROUPS: labelled sections; a heavy seam between them (the band still crosses) */
const group = "block not-nth-2:border-t-(length:--kl-k3)";
const groupLabel = "flex min-h-9 items-center px-3.5 py-2 text-[12px] font-(--kl-weight-display) text-kl-ink-2";
const groupList = cn(
  "m-0 flex list-none flex-col p-0",
  "[&>li]:border-t-(length:--kl-k1) [&>li]:border-t-kl-line [&>li:first-child]:border-t-kl-seam",
);

/** NESTED LINKS: the fold unfolds on its rows track (Accordion timing); the list inside hangs on the key column's seam */
const fold = cn(
  "grid grid-rows-[0fr] [transition:grid-template-rows_var(--kl-t-fold)_var(--kl-ease-in)]",
  "data-open:grid-rows-[1fr] data-open:[transition:grid-template-rows_var(--kl-t-unfold)_var(--kl-ease-out)]",
);
const sub = cn(
  "m-0 flex min-h-0 list-none flex-col overflow-hidden border-s-(length:--kl-k1) border-s-kl-seam p-0",
  "[&>li]:border-t-(length:--kl-k1) [&>li]:border-t-kl-line",
);

/** ROW ACTIONS: the item and its ⋯ key share one row on a seam; the band covers the item only */
const row = "kl-cells min-w-0 [&>:first-child]:min-w-0 [&>:first-child]:flex-auto";

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
    className={caretGlyph}
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
    <div
      ref={ref}
      data-slot="nav-fold"
      className={fold}
      data-kl-clip=""
      data-open={shown ? "" : undefined}
      inert={!open}
    >
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
  header: headerContent,
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
  const icons = all.some((i) => i.icon);
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

  // what the nav's state decides for every item: icons, rail, depth
  const itemClass = (depth: number) =>
    cn(
      item,
      icons && "gap-0",
      icons && depth === 0 && "ps-0",
      depth > 0 && "min-h-10 ps-3 text-[13px]",
      rail && "relative min-h-12 justify-center p-0",
    );
  const iconEl = (it: NavItem) =>
    it.icon ? (
      <span data-slot="nav-item-icon" className={cn(icon, rail ? iconRail : iconCovered)} aria-hidden>
        {it.icon}
      </span>
    ) : null;
  const labelEl = (it: NavItem) => (
    <span data-slot="nav-item-label" className={cn("min-w-0 flex-auto", rail && srOnly)}>
      {it.label}
    </span>
  );
  const countEl = (it: NavItem) =>
    it.count != null ? (
      <span data-slot="nav-item-count" className={cn(count, rail && countRail)}>
        {it.count}
      </span>
    ) : null;

  // `live` false: a row inside a folding list, still drawn but no longer an item of the band
  const itemEl = (it: NavItem, depth = 0, live = true): React.ReactNode => {
    const current = it.value === value;
    if (it.items) return parent(it, depth, live);
    const inner = (
      <>
        {iconEl(it)}
        {labelEl(it)}
        {countEl(it)}
      </>
    );
    const el = it.href ? (
      <Link
        data-slot="nav-item"
        data-kl-item={live ? "" : undefined}
        href={it.href}
        aria-current={current ? "page" : undefined}
        aria-disabled={it.disabled || undefined}
        className={itemClass(depth)}
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
        data-slot="nav-item"
        data-kl-item={live ? "" : undefined}
        aria-current={current ? "page" : undefined}
        disabled={it.disabled}
        className={itemClass(depth)}
        onClick={() => onValueChange?.(it.value)}
      >
        {inner}
      </button>
    );
    return rowEl(it, el, depth);
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
            {it.count != null ? (
              <span data-slot="nav-tooltip-count" className="kl-code ms-2 font-normal">
                {it.count}
              </span>
            ) : null}
          </>
        }
      >
        {el}
      </Tooltip>
    ) : (
      el
    );
  const rowEl = (it: NavItem, el: React.ReactElement, depth: number, subList?: React.ReactNode) => (
    // a top-level row of an ungrouped list is a block (a group's rows and a nested list's are list items)
    <li key={it.value} data-kl-depth={depth || undefined} className={depth === 0 && !groups ? "block" : undefined}>
      {it.action && !rail ? (
        <div data-slot="nav-row" className={row}>
          {tip(it, el)}
          <span data-slot="nav-item-action" className="flex flex-none border-s-kl-seam">
            {it.action}
          </span>
        </div>
      ) : (
        tip(it, el)
      )}
      {subList}
    </li>
  );
  const parent = (it: NavItem, depth: number, live: boolean) => {
    const o = isOpen(it);
    const subId = `${id}-s-${it.value}`;
    const el = (
      <button
        type="button"
        data-slot="nav-item"
        data-kl-item={live ? "" : undefined}
        data-kl-holds={bandOnParent(it) ? "" : undefined}
        aria-expanded={rail ? undefined : o}
        aria-controls={o ? subId : undefined}
        disabled={it.disabled}
        className={itemClass(depth)}
        onClick={() => toggle(it)}
      >
        {iconEl(it)}
        {labelEl(it)}
        {countEl(it)}
        {rail ? null : (
          <span data-slot="nav-item-caret" className={caret} aria-hidden>
            <Caret />
          </span>
        )}
      </button>
    );
    return rowEl(
      it,
      el,
      depth,
      rail ? null : (
        <NavFold open={o} onReady={() => markReady(it.value)}>
          <ul
            id={subId}
            data-slot="nav-sub"
            className={cn(sub, depth > 0 ? "ms-3" : icons ? "ms-[calc(44px_-_var(--kl-k1))]" : "ms-3.5")}
            aria-label={typeof it.label === "string" ? it.label : undefined}
          >
            {it.items!.map((c) => itemEl(c, depth + 1, live && o))}
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
      data-kl-icons={icons ? "" : undefined}
      className={cn("kl-frame flex min-w-0 flex-col", orientation === "responsive" && "@container/kl-nav", className)}
    >
      {headerContent ? (
        <div data-slot="nav-header" className={cn(header, orientation === "horizontal" && "hidden")}>
          {headerContent}
        </div>
      ) : null}
      <ul
        ref={ref}
        data-slot="nav-list"
        data-kl-stretch=""
        className={cn(list, orientation === "horizontal" && listRow)}
      >
        {/* the band is a presentational list item: a <ul> may only contain <li> (it was a <span>) */}
        <li data-kl-band="" role="presentation" className={cn(band, icons && !rail && bandInk)} aria-hidden hidden />
        {groups
          ? groups.map((g, gi) => (
              <li key={g.label} data-slot="nav-group" className={group}>
                <span
                  id={`${id}-g${gi}`}
                  data-slot="nav-group-label"
                  className={cn(groupLabel, icons && "ps-14", rail && srOnly)}
                >
                  {g.label}
                </span>
                <ul
                  aria-labelledby={`${id}-g${gi}`}
                  data-slot="nav-group-list"
                  className={cn(groupList, rail && "[&>li:first-child]:border-t-0")}
                >
                  {g.items.map((it) => itemEl(it))}
                </ul>
              </li>
            ))
          : all.map((it) => itemEl(it))}
      </ul>
      {footer ? (
        <div data-slot="nav-footer" className="mt-auto border-t-(length:--kl-k3) border-t-kl-line">
          {footer}
        </div>
      ) : null}
    </nav>
  );
  // one provider for the rail: once a label is showing, scanning down the rail shows the next one at once (no delay,
  // no fade: the tooltip's data-instant), as a toolbar of hints should behave (each item re-waited 150ms)
  return rail ? <TooltipProvider delay={150}>{tree}</TooltipProvider> : tree;
}

type NavPartState = Record<string, never>;
const PART_STATE: NavPartState = {};

type NavIdentityProps = Omit<PartProps<"span", NavPartState>, "title" | "children"> & {
  mark: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
};

/**
 * A header or footer identity for a sidebar Nav: a square mark cell, then a title and a meta line (a site
 * code, a role). On a rail only the mark shows; the title and meta stay in the accessibility tree.
 */
function NavIdentity({ mark, title, meta, render, className, style, ...props }: NavIdentityProps): React.ReactElement {
  const rail = React.useContext(NavRailContext);
  const own = {
    "data-slot": "nav-identity",
    className: resolveClassName("flex min-h-[52px] min-w-0 items-stretch", className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: (
      <>
        <span
          data-slot="nav-identity-mark"
          aria-hidden
          className={cn(
            "grid w-11 flex-none place-items-center text-[14px] font-(--kl-weight-display)",
            // in a footer the mark is a key cell on a seam; in a header it clears the frame's cut
            rail
              ? "m-0 w-full border-0"
              : "in-data-[slot=nav-footer]:border-e-(length:--kl-k1) in-data-[slot=nav-footer]:border-e-kl-seam in-data-[slot=nav-header]:ms-[var(--kl-c-room,0px)]",
          )}
        >
          {mark}
        </span>
        <span
          data-slot="nav-identity-title"
          className={cn("grid min-w-0 flex-auto content-center gap-0.5 py-2 ps-3 pe-3.5", rail && srOnly)}
        >
          <span data-slot="nav-identity-name" className="truncate text-[14px]/[1.2] font-(--kl-weight-display)">
            {title}
          </span>
          {meta != null ? (
            <span
              data-slot="nav-identity-meta"
              className="kl-code truncate text-[11px]/[1.2] text-kl-ink-2 in-data-[slot=nav-header]:text-inherit in-data-[slot=nav-header]:opacity-72"
            >
              {meta}
            </span>
          ) : null}
        </span>
      </>
    ),
  };
  return useRender({ defaultTagName: "span", render, state: PART_STATE, props: mergeProps<"span">(props, own) });
}

const action = cn(
  "grid min-h-10 w-10 cursor-pointer place-items-center border-0 bg-transparent p-0 text-kl-ink-2",
  "hover:not-data-popup-open:bg-kl-tint hover:not-data-popup-open:text-kl-ink",
  "data-popup-open:bg-kl-inverse data-popup-open:text-kl-on-inverse",
  "forced-colors:data-popup-open:bg-[Highlight] forced-colors:data-popup-open:text-[HighlightText] forced-colors:data-popup-open:forced-color-adjust-none",
  focusRing,
);

type NavActionProps = PartProps<"button", NavPartState> & {
  /** Names the cell ("More for Saved view: Late arrivals"). */
  label: string;
};

/**
 * The ⋯ key cell of a row action: pass it as a MenuTrigger's render, so the item's commands open in
 * a Menu docked to the row. `label` names it ("More for Saved view: Late arrivals").
 */
function NavAction({ label, render, className, style, children, ...props }: NavActionProps): React.ReactElement {
  const own = {
    type: "button" as const,
    "aria-label": label,
    "data-slot": "nav-action",
    className: resolveClassName(action, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: children ?? (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
        <rect x="2" y="7" width="2.5" height="2.5" />
        <rect x="6.75" y="7" width="2.5" height="2.5" />
        <rect x="11.5" y="7" width="2.5" height="2.5" />
      </svg>
    ),
  };
  return useRender({ defaultTagName: "button", render, state: PART_STATE, props: mergeProps<"button">(props, own) });
}

export {
  Nav,
  NavIdentity,
  NavAction,
  NavRailContext,
  NavExpandContext,
  type NavItem,
  type NavGroup,
  type NavProps,
  type NavIdentityProps,
  type NavActionProps,
};
