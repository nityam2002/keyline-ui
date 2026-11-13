"use client";

import * as React from "react";
import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
import { useMergedRef } from "../lib/keyline-scope";
import { NavExpandContext, NavRailContext } from "./nav";
import { Sheet, SheetPopup } from "./sheet";

/* ------------------------------------------------------------------ *
 * STATE
 * The root measures its own width and owns the sidebar's state; the parts read it from context. The width decides
 * three layouts: wide (sidebar, page and aside side by side), medium (the aside is a sheet), narrow (both are sheets).
 * ------------------------------------------------------------------ */

type ShellBand = "narrow" | "medium" | "wide";
type OpenChangeDetails = DialogPrimitive.Root.ChangeEventDetails;

type ShellContextValue = {
  band: ShellBand;
  navId: string;
  navLabel: string;
  collapse: "hide" | "rail";
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  navSheet: boolean;
  setNavSheet: (open: boolean) => void;
  rail: boolean;
  stickyHeader: boolean;
  headRef: React.RefObject<HTMLElement | null>;
  asideOpen: boolean;
  onAsideOpenChange?: (open: boolean, eventDetails: OpenChangeDetails) => void;
  setHasAside: React.Dispatch<React.SetStateAction<number>>;
  container?: React.ComponentProps<typeof SheetPopup>["container"];
};

const ShellContext = React.createContext<ShellContextValue | null>(null);

function useShell(part: string): ShellContextValue {
  const ctx = React.useContext(ShellContext);
  if (!ctx) throw new Error(`Keyline: <${part}> must be placed inside <AppShellRoot>.`);
  return ctx;
}

/** The breakpoints the root's own utilities carry (data-kl-at); any others bring their own rules (see shellRules). */
const DEFAULT_AT = "960-1400";

/**
 * The layout before any script for breakpoints other than the default: a container condition cannot read a custom
 * property, so these rules are written per shell. In @layer utilities, with an attribute more than the columns' own
 * utilities, so they win as the default breakpoints' container variants do.
 */
const shellRules = (at: string, narrowAt: number, inlineAt: number) => {
  const s = `[data-slot="app-shell"][data-kl-at="${at}"]`;
  return `@layer utilities{@container kl-shell (width < ${narrowAt}px){${s}>:is([data-slot="app-shell-nav"],[data-slot="app-shell-aside"]){display:none}${s}>[data-slot="app-shell-main"]{grid-column:1/-1}}@container kl-shell (${narrowAt}px <= width < ${inlineAt}px){${s}>[data-slot="app-shell-aside"]{display:none}${s}>[data-slot="app-shell-main"]{grid-column-end:-1}}}`;
};

/* ------------------------------------------------------------------ *
 * CLASSES
 * The rules over the shell's children have no specificity (:where), so a child's own utilities win, as they did
 * over the shell's stylesheet. --kl-shell-top, --kl-shell-nav and --kl-shell-aside are read with their defaults as
 * fallbacks, never set here, so a page's own value for them wins wherever it sets it.
 * ------------------------------------------------------------------ */

/*
 * APP SHELL: the header frame across the top; sidebar, page and aside one gutter apart (C1). A column that holds
 * nothing takes no track and no gutter, so the page's end edge lies on the header's. The narrow layout (an attribute
 * more) wins over all three. The shell is its own size container: its columns answer its width in CSS, so the
 * server's HTML is laid out for the shell it lands in.
 */
const root = cn(
  "@container/kl-shell relative grid min-w-0 items-start gap-(--kl-gutter) [:where(&>*)]:min-w-0",
  "grid-cols-[auto_minmax(0,1fr)_auto] [grid-template-areas:'head_head_head'_'nav_main_aside']",
  "[&:where(:has(>[data-slot=app-shell-nav]:not([hidden])):not(:has(>[data-slot=app-shell-aside])))]:grid-cols-[auto_minmax(0,1fr)]",
  "[&:where(:has(>[data-slot=app-shell-nav]:not([hidden])):not(:has(>[data-slot=app-shell-aside])))]:[grid-template-areas:'head_head'_'nav_main']",
  "[&:where(:has(>[data-slot=app-shell-aside]):not(:has(>[data-slot=app-shell-nav]:not([hidden]))))]:grid-cols-[minmax(0,1fr)_auto]",
  "[&:where(:has(>[data-slot=app-shell-aside]):not(:has(>[data-slot=app-shell-nav]:not([hidden]))))]:[grid-template-areas:'head_head'_'main_aside']",
  "[&:where(:not(:has(>[data-slot=app-shell-nav]:not([hidden]))):not(:has(>[data-slot=app-shell-aside])))]:grid-cols-[minmax(0,1fr)]",
  "[&:where(:not(:has(>[data-slot=app-shell-nav]:not([hidden]))):not(:has(>[data-slot=app-shell-aside])))]:[grid-template-areas:'head'_'main']",
  "data-[kl-shell=narrow]:grid-cols-[minmax(0,1fr)] data-[kl-shell=narrow]:[grid-template-areas:'head'_'main']",
  // with a sticky header, where the columns hold while the page scrolls: below the header and one gutter
  "data-kl-sticky-head:[--kl-shell-cols-top:calc(var(--kl-shell-top,var(--kl-gutter))+var(--kl-shell-head-h,0px)+var(--kl-gutter))]",
);

/** the width sentinel: spans the shell, no height, takes no grid cell */
const sentinel = "pointer-events-none invisible absolute inset-x-0 top-0 h-0";

/*
 * The header: one region frame of cells. STICKY (stickyHeader): it holds at --kl-shell-top and the strips above it
 * and between it and the columns are painted in the page background (--kl-shell-bg), so scrolled content never shows
 * through them.
 */
const header = "kl-frame kl-cells [grid-area:head] min-h-[calc(var(--kl-ctl)+2*var(--kl-k3))]";
const headerSticky = cn(
  "sticky top-[var(--kl-shell-top,var(--kl-gutter))] z-3",
  "[box-shadow:0_calc(-1*var(--kl-shell-top,var(--kl-gutter)))_0_var(--kl-shell-bg,var(--kl-paper)),0_var(--kl-gutter)_0_var(--kl-shell-bg,var(--kl-paper))]",
);

/** the toggle: a square key cell; its start padding is the cut's corner room, so the glyph clears the bevel */
const toggle = cn(
  "kl-cell kl-key w-[calc(var(--kl-ctl)+4px)] flex-none cursor-pointer justify-center border-0 bg-transparent p-0",
  "ps-[calc(var(--kl-c,0px)*0.35)] text-kl-ink hover:bg-kl-tint",
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus focus-visible:outline-solid",
);

/*
 * The header's content: a Breadcrumb there is a run of cells the full height of the frame, not a strip along its top.
 * With a Toolbar as the actions the crumbs give up room first, down to their minimum, then the toolbar moves its last
 * items into More: the crumbs' basis is 0, so the toolbar keeps its natural width while there is room.
 */
const crumbs = cn(
  "flex min-w-0 flex-auto items-stretch [:where(&>*)]:min-w-0 [:where(&>*)]:flex-auto",
  "[&_[data-slot=breadcrumb-list]]:min-h-0 [&_[data-slot=breadcrumb-list]]:flex-auto [:where(&>[data-slot=breadcrumb])]:flex",
  "[[data-slot=app-shell-header]:has(>[data-slot=app-shell-actions]>[data-slot=toolbar])>&]:min-w-[min(14rem,45%)]",
  "[[data-slot=app-shell-header]:has(>[data-slot=app-shell-actions]>[data-slot=toolbar])>&]:flex-[1_1_0]",
);
/** a framed toolbar is w-max and doesn't flex: as the actions it shrinks from its natural width */
const actions = cn(
  "kl-cells flex-none items-stretch",
  "has-[>[data-slot=toolbar]]:min-w-[calc(var(--kl-ctl)+4px)] has-[>[data-slot=toolbar]]:flex-[0_1_auto]",
  "*:data-[slot=toolbar]:min-w-0 *:data-[slot=toolbar]:flex-auto",
);

/*
 * A Nav straight in the sidebar or its sheet fills it: its list takes the rest and scrolls inside, its footer stays at
 * the bottom, and the key column's seam runs the full height, through the group labels and the empty end.
 */
const navFill = cn(
  "[&>[data-slot=nav]>[data-slot=nav-list]]:min-h-0 [&>[data-slot=nav]>[data-slot=nav-list]]:flex-auto [&>[data-slot=nav]>[data-slot=nav-list]]:overflow-y-auto",
  "[&>[data-slot=nav][data-kl-icons]:not([data-kl-rail])>[data-slot=nav-list]]:bg-no-repeat",
  "[&>[data-slot=nav][data-kl-icons]:not([data-kl-rail])>[data-slot=nav-list]]:[background-image:linear-gradient(to_right,transparent_calc(44px_-_var(--kl-k1)),var(--kl-seam)_0_44px,transparent_0)]",
  "kl-rtl:[&>[data-slot=nav][data-kl-icons]:not([data-kl-rail])>[data-slot=nav-list]]:[background-image:linear-gradient(to_left,transparent_calc(44px_-_var(--kl-k1)),var(--kl-seam)_0_44px,transparent_0)]",
);

/*
 * The sidebar: a region frame holding the Nav as a cell. It is a column, not a box: sticky one gutter from the top,
 * stretched to the row (the page sets it: size containment keeps the sidebar out of the row's sizing) and capped at
 * the viewport from where it starts (measured), so it ends with the page or the viewport, whichever is first. The rail
 * is the key cells' width; the toggle animates nothing (a layout change that moves the page is immediate).
 */
const nav = cn(
  "kl-frame sticky flex w-[var(--kl-shell-nav,15rem)] flex-col self-stretch overscroll-contain [contain:size] [grid-area:nav]",
  "max-h-[var(--kl-shell-nav-h,calc(100dvh_-_2*var(--kl-gutter)))] [&[hidden]]:hidden",
  // the default breakpoints (data-kl-at): below narrowAt the sidebar takes no room
  "@max-[960px]/kl-shell:[[data-kl-at='960-1400']>&]:hidden",
  "[:where(&>[data-slot=nav])]:min-h-0 [:where(&>[data-slot=nav])]:flex-auto",
  navFill,
);
/** the default breakpoints (data-kl-at): below narrowAt the page spans the row; below asideInlineAt it runs to the end */
const page = cn(
  "min-w-0 [grid-area:main]",
  "@max-[960px]/kl-shell:[[data-kl-at='960-1400']>&]:col-[1/-1]",
  "@min-[960px]/kl-shell:@max-[1400px]/kl-shell:[[data-kl-at='960-1400']>&]:col-end-[-1]",
);
const aside = cn(
  "sticky flex w-[var(--kl-shell-aside,22rem)] flex-col [grid-area:aside]",
  "[:where(&>*)]:min-h-0 [:where(&>*)]:flex-auto",
  // the default breakpoints (data-kl-at): below asideInlineAt the aside takes no room
  "@max-[1400px]/kl-shell:[[data-kl-at='960-1400']>&]:hidden",
);
/** the narrow layout: the sheet is the frame, so a framed child (Inspector, a Nav left at layout="control") gives up
 * its own border and cut and fills it */
const sheet = cn(
  "[:where(&>:is(.kl-frame,.kl-ctl))]:[--kl-bw:0px] [:where(&>:is(.kl-frame,.kl-ctl))]:[--kl-cut-size:0px]",
  "[:where(&>:is(.kl-frame,.kl-ctl))]:min-h-0 [:where(&>:is(.kl-frame,.kl-ctl))]:flex-auto [:where(&>:is(.kl-frame,.kl-ctl))]:overflow-y-auto",
);

const PanelGlyph = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <rect x="1.5" y="2.5" width="13" height="11" />
    <path d="M6 2.5v11" />
    {open ? <path d="M3.25 5.5h1M3.25 8h1" strokeWidth="1.5" /> : null}
  </svg>
);

/* ------------------------------------------------------------------ *
 * PARTS
 * ------------------------------------------------------------------ */

type AppShellState = { layout: ShellBand };
type AppShellPartState = Record<string, never>;
const PART_STATE: AppShellPartState = {};

type AppShellRootProps = PartProps<"div", AppShellState> & {
  /** Names the sidebar: the toggle cell says "Show <navLabel>", the narrow sheet is called this. */
  navLabel?: string;
  /** Wide layout: whether the sidebar column is shown. Controlled or not (default open). */
  navOpen?: boolean;
  defaultNavOpen?: boolean;
  onNavOpenChange?: (open: boolean) => void;
  /**
   * Wide layout: what closing the sidebar does. "hide" (default) removes the column; "rail" keeps a narrow
   * column of the Nav's key cells (items need `icon`), with each label as a tooltip on hover and focus.
   */
  collapse?: "hide" | "rail";
  /**
   * Keep the header in view while the page scrolls. The sidebar and aside then sit one gutter below it and
   * never move: the page scrolls past a fixed frame. The header sticks at --kl-shell-top (default one gutter;
   * set it to where the shell starts on the page, so nothing shifts on the first scroll), and the columns
   * leave the same room at the bottom.
   */
  stickyHeader?: boolean;
  /** Whether the aside (AppShellAside) is shown: beside the page where there is room, else as an end sheet. */
  asideOpen?: boolean;
  /** Called when the aside's sheet asks to close (Escape, the scrim), with Base UI's eventDetails. */
  onAsideOpenChange?: (open: boolean, eventDetails: OpenChangeDetails) => void;
  /** Below this width of the shell itself (not the viewport), the sidebar and aside become sheets. Default 960. */
  narrowAt?: number;
  /**
   * The aside sits beside the page only from this shell width (default narrowAt + 440: room for the
   * sidebar, the aside and a page still worth reading). Between narrowAt and this, the sidebar stays and
   * the aside opens as a sheet, so opening it never crushes the page.
   */
  asideInlineAt?: number;
  /** Wide-layout widths of the sidebar and the inline aside (any CSS length; numbers are px). Defaults 15rem and 22rem. */
  navSize?: number | string;
  asideSize?: number | string;
  /** Portal container for the sheets (the keyline scope travels with them either way). */
  container?: React.ComponentProps<typeof SheetPopup>["container"];
};

/**
 * The shell's root: the grid, the width it measures, and the sidebar's state. Holds AppShellHeader, AppShellNav,
 * AppShellMain and AppShellAside as direct children.
 */
function AppShellRoot({
  navLabel = "Navigation",
  navOpen: navOpenProp,
  defaultNavOpen = true,
  onNavOpenChange,
  collapse = "hide",
  stickyHeader = false,
  asideOpen = false,
  onAsideOpenChange,
  narrowAt = 960,
  asideInlineAt,
  container,
  navSize,
  asideSize,
  render,
  className,
  style,
  children,
  ...props
}: AppShellRootProps): React.ReactElement {
  const navId = React.useId();
  const headRef = React.useRef<HTMLElement | null>(null);
  // the shell re-renders only when its width crosses a breakpoint (narrow, aside inline), not on every
  // pixel: a scrollbar appearing as the inspector opens must not re-render the page under a measuring toast
  const inlineAt = asideInlineAt ?? narrowAt + 440;
  const at = `${narrowAt}-${inlineAt}`;
  // until it is measured (and on the server) the shell renders every column; its CSS hides what the width has no room for
  const [band, setBand] = React.useState<ShellBand>("wide");
  const narrow = band === "narrow";
  const [navInner, setNavInner] = React.useState(defaultNavOpen);
  const navOpen = navOpenProp ?? navInner;
  const setNavOpen = (o: boolean) => {
    if (navOpenProp === undefined) setNavInner(o);
    onNavOpenChange?.(o);
  };
  const [navSheet, setNavSheet] = React.useState(false);
  // AppShellAside registers itself, so the root can say whether an aside is open beside the page
  const [hasAside, setHasAside] = React.useState(0);

  // the width is read from a zero-height sentinel spanning the shell: observing the shell itself would also
  // report its height, which changes while Base UI's ScrollArea measures the inspector, and WebKit reports
  // that as a ResizeObserver loop
  const widthRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const el = widthRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setBand(w < narrowAt ? "narrow" : w >= inlineAt ? "wide" : "medium");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [narrowAt, inlineAt]);
  // a sheet left open while the shell widens would cover the page it now sits beside
  React.useEffect(() => {
    if (!narrow) setNavSheet(false);
  }, [narrow]);

  const rail = !narrow && !navOpen && collapse === "rail";
  const state: AppShellState = { layout: band };
  const ctx: ShellContextValue = {
    band,
    navId,
    navLabel,
    collapse,
    navOpen,
    setNavOpen,
    navSheet,
    setNavSheet,
    rail,
    stickyHeader,
    headRef,
    asideOpen,
    onAsideOpenChange,
    setHasAside,
    container,
  };
  const own = {
    "data-slot": "app-shell",
    "data-kl-shell": band,
    "data-kl-nav": !narrow && navOpen ? "open" : rail ? "rail" : "closed",
    "data-kl-aside": band === "wide" && asideOpen && hasAside > 0 ? "open" : "closed",
    "data-kl-sticky-head": stickyHeader ? "" : undefined,
    "data-kl-at": at,
    className: resolveClassName(root, className)(state),
    style: resolveStyle(
      {
        ...(navSize != null ? { "--kl-shell-nav": typeof navSize === "number" ? `${navSize}px` : navSize } : null),
        ...(asideSize != null
          ? { "--kl-shell-aside": typeof asideSize === "number" ? `${asideSize}px` : asideSize }
          : null),
      } as React.CSSProperties,
      style,
    )(state),
    children: (
      <ShellContext.Provider value={ctx}>
        {at === DEFAULT_AT ? null : <style>{shellRules(at, narrowAt, inlineAt)}</style>}
        <div ref={widthRef} data-slot="app-shell-sentinel" className={sentinel} aria-hidden />
        {children}
      </ShellContext.Provider>
    ),
  };
  return useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(props, own) });
}

/** The header frame: a row of cells across the top (AppShellToggle, AppShellCrumbs, AppShellActions). */
function AppShellHeader({
  render,
  className,
  style,
  ref: refProp,
  ...props
}: PartProps<"header", AppShellPartState>): React.ReactElement {
  const ctx = useShell("AppShellHeader");
  const setRef = useMergedRef(ctx.headRef, refProp);
  const { stickyHeader } = ctx;
  // a sticky header: its height places the columns below it (it can grow, e.g. a wrapped title)
  React.useLayoutEffect(() => {
    const h = ctx.headRef.current;
    const shell = h?.parentElement;
    if (!h || !shell || !stickyHeader) return;
    const set = () => shell.style.setProperty("--kl-shell-head-h", `${h.getBoundingClientRect().height}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(h);
    return () => {
      ro.disconnect();
      shell.style.removeProperty("--kl-shell-head-h");
    };
  }, [stickyHeader, ctx.headRef]);
  const own = {
    "data-slot": "app-shell-header",
    className: resolveClassName(cn(header, stickyHeader && headerSticky), className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({
    defaultTagName: "header",
    render,
    ref: setRef,
    state: PART_STATE,
    props: mergeProps<"header">(props, own),
  });
}

type AppShellToggleState = { expanded: boolean };

/**
 * The header's first cell: shows and hides the sidebar column (wide), collapses it to its rail (collapse="rail"),
 * or opens the start sheet (narrow). Named from the root's navLabel; its glyph is the default children.
 */
function AppShellToggle({
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"button", AppShellToggleState>): React.ReactElement {
  const { band, navOpen, setNavOpen, navSheet, setNavSheet, collapse, navLabel, navId } = useShell("AppShellToggle");
  const narrow = band === "narrow";
  const expanded = narrow ? navSheet : navOpen;
  const state: AppShellToggleState = { expanded };
  const railVerb = collapse === "rail" && !narrow;
  const own = {
    type: "button" as const,
    "aria-expanded": expanded,
    "aria-controls": narrow ? undefined : navId,
    "aria-label": `${expanded ? (railVerb ? "Collapse" : "Hide") : railVerb ? "Expand" : "Show"} ${navLabel.toLowerCase()}`,
    onClick: () => (narrow ? setNavSheet(!navSheet) : setNavOpen(!navOpen)),
    "data-slot": "app-shell-toggle",
    className: resolveClassName(toggle, className)(state),
    style: resolveStyle(undefined, style)(state),
    children: children ?? <PanelGlyph open={expanded} />,
  };
  return useRender({ defaultTagName: "button", render, state, props: mergeProps<"button">(props, own) });
}

/** The header's content after the toggle, taking the rest of the row: usually a <Breadcrumb layout="cell" />. */
function AppShellCrumbs({
  render,
  className,
  style,
  ...props
}: PartProps<"div", AppShellPartState>): React.ReactElement {
  const own = {
    "data-slot": "app-shell-crumbs",
    className: resolveClassName(crumbs, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

/**
 * Cells at the header's end. For several commands put a `<Toolbar layout="cell" overflow="menu">` here: it is one
 * Tab stop, and when the header narrows the crumbs give up room first, then the toolbar's last items move into More.
 */
function AppShellActions({
  render,
  className,
  style,
  ...props
}: PartProps<"div", AppShellPartState>): React.ReactElement {
  const own = {
    "data-slot": "app-shell-actions",
    className: resolveClassName(actions, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

type AppShellNavState = { rail: boolean };

/**
 * The sidebar: usually a <Nav layout="cell" />. Wide and medium, a sticky column the toggle shows and hides (or
 * collapses to a rail); narrow, a start sheet the toggle opens, closed by choosing a place. `className`, `style` and
 * `render` reach the column.
 */
function AppShellNav({
  render,
  className,
  style,
  children,
  ref: refProp,
  ...props
}: PartProps<"div", AppShellNavState>): React.ReactElement {
  const { band, navOpen, setNavOpen, navSheet, setNavSheet, rail, navId, navLabel, stickyHeader, headRef, container } =
    useShell("AppShellNav");
  const narrow = band === "narrow";
  const navRef = React.useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(navRef, refProp);
  // the sidebar column reaches the viewport's bottom edge from wherever it starts (it is sticky one gutter
  // from the top), so its footer is always in view; measured, as the shell may not start at the page top
  React.useLayoutEffect(() => {
    const el = navRef.current;
    if (!el || narrow) return;
    let frame = 0;
    const fit = () => {
      frame = 0;
      const g = parseFloat(getComputedStyle(el).top) || 0;
      const top = Math.max(g, el.getBoundingClientRect().top);
      // room left at the bottom: one gutter, or with a sticky header the header's own inset, so the column
      // ends where the page ends and is never pushed up by the end of its row
      const head = stickyHeader ? headRef.current : null;
      const end = head ? parseFloat(getComputedStyle(head).top) || 0 : g;
      // the cap from the viewport; the page column's end is CSS (stretched to the row, size-contained), so
      // nothing observes main, whose height moves whenever a scroll area inside it gains a bar
      // written only when it changes: this runs on every scroll of the page or any scroller in it
      const h = `${Math.max(240, window.innerHeight - top - end)}px`;
      if (el.style.getPropertyValue("--kl-shell-nav-h") !== h) el.style.setProperty("--kl-shell-nav-h", h);
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };
    fit();
    window.addEventListener("scroll", queue, { passive: true, capture: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue, { capture: true });
      window.removeEventListener("resize", queue);
    };
  }, [narrow, navOpen, rail, stickyHeader, headRef]);
  const state: AppShellNavState = { rail };
  const own = {
    id: navId,
    hidden: !navOpen && !rail,
    "data-slot": "app-shell-nav",
    "data-kl-rail": rail ? "" : undefined,
    className: resolveClassName(
      cn(
        nav,
        stickyHeader ? "top-(--kl-shell-cols-top)" : "top-(--kl-gutter)",
        rail && "w-[var(--kl-shell-rail,56px)]",
      ),
      className,
    )(state),
    style: resolveStyle(undefined, style)(state),
    children: (
      <NavRailContext.Provider value={rail}>
        <NavExpandContext.Provider value={rail ? () => setNavOpen(true) : null}>{children}</NavExpandContext.Provider>
      </NavRailContext.Provider>
    ),
  };
  const column = useRender({ defaultTagName: "div", render, ref: setRef, state, props: mergeProps<"div">(props, own) });
  if (!narrow) return column;
  // choosing a place in the narrow sheet closes it: the place is what the user wanted to see
  const closeOnChoose = (e: React.MouseEvent) => {
    // a nested item's disclosure (aria-expanded) opens its list in place: it is not a place
    if ((e.target as Element).closest("[data-kl-item]:not([aria-expanded])")) setNavSheet(false);
  };
  return (
    <Sheet open={navSheet} onOpenChange={setNavSheet}>
      <SheetPopup
        side="start"
        size={300}
        container={container}
        aria-label={navLabel}
        data-kl-shell-sheet="nav"
        className={cn(sheet, navFill)}
        onClick={closeOnChoose}
      >
        {children}
      </SheetPopup>
    </Sheet>
  );
}

/** The page: a <main> landmark in the shell's middle column. */
function AppShellMain({
  render,
  className,
  style,
  ...props
}: PartProps<"main", AppShellPartState>): React.ReactElement {
  useShell("AppShellMain");
  const own = {
    "data-slot": "app-shell-main",
    className: resolveClassName(page, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "main", render, state: PART_STATE, props: mergeProps<"main">(props, own) });
}

type AppShellAsideProps = PartProps<"div", AppShellPartState> & {
  /** Names the aside's sheet on narrow and medium layouts. Default "Details". */
  label?: string;
  /**
   * Where focus goes when the aside's sheet closes (Base UI finalFocus). The sheet is opened by state, not
   * by a trigger, so pass the control that opened it (a ref): WebKit does not focus a button on click, and
   * without this focus would fall back to whatever was focused before.
   */
  finalFocus?: React.ComponentProps<typeof SheetPopup>["finalFocus"];
};

/**
 * A contextual panel at the end (an Inspector), shown while the root's `asideOpen`: beside the page from
 * asideInlineAt, an end sheet below it (focus moves in, Escape and the scrim close it, focus returns).
 * `className`, `style` and `render` reach the column.
 */
function AppShellAside({
  label = "Details",
  finalFocus,
  render,
  className,
  style,
  children,
  ...props
}: AppShellAsideProps): React.ReactElement | null {
  const { band, asideOpen, onAsideOpenChange, setHasAside, stickyHeader, container } = useShell("AppShellAside");
  React.useLayoutEffect(() => {
    setHasAside((n) => n + 1);
    return () => setHasAside((n) => n - 1);
  }, [setHasAside]);
  const own = {
    "data-slot": "app-shell-aside",
    className: resolveClassName(
      cn(
        aside,
        stickyHeader
          ? "top-(--kl-shell-cols-top) max-h-[calc(100dvh_-_2*var(--kl-shell-top,var(--kl-gutter))_-_var(--kl-shell-head-h,0px)_-_var(--kl-gutter))]"
          : "top-(--kl-gutter) max-h-[calc(100dvh_-_2*var(--kl-gutter))]",
      ),
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children,
  };
  const column = useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
  if (band === "wide") return asideOpen ? column : null;
  return (
    <Sheet open={asideOpen} onOpenChange={(o, details) => onAsideOpenChange?.(o, details)}>
      <SheetPopup
        side="end"
        size={400}
        container={container}
        aria-label={label}
        finalFocus={finalFocus}
        data-kl-shell-sheet="aside"
        className={sheet}
      >
        {children}
      </SheetPopup>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ *
 * CONVENIENCE
 * ------------------------------------------------------------------ */

type AppShellProps = Omit<AppShellRootProps, "children" | "render"> & {
  /** The sidebar: usually <Nav layout="cell" …/>. */
  nav: React.ReactNode;
  /** Header content after the toggle cell: usually <Breadcrumb layout="cell" …/>. */
  header?: React.ReactNode;
  /**
   * Cells at the header's end. For several commands pass a `<Toolbar layout="cell" overflow="menu">`: it is
   * one Tab stop, and when the header narrows the crumbs give up room first, then the toolbar's last items
   * move into More.
   */
  actions?: React.ReactNode;
  /** Contextual panel at the end (an Inspector). Shown while `asideOpen`. */
  aside?: React.ReactNode;
  /** Names the aside's sheet on narrow layouts. */
  asideLabel?: string;
  /** Where focus goes when the aside's sheet closes (AppShellAside's finalFocus). */
  asideFinalFocus?: AppShellAsideProps["finalFocus"];
  /** Props for the <main> element (AppShellMain). */
  mainProps?: React.ComponentProps<"main">;
  children?: React.ReactNode;
};

/**
 * The page around a product's screens: a header frame, the sidebar, the page, and an optional aside, built from
 * the parts above (AppShellRoot, AppShellHeader with AppShellToggle, AppShellCrumbs and AppShellActions,
 * AppShellNav, AppShellMain, AppShellAside).
 *
 *   ┌──┬──────────────────────────────────────────────────┬───────┐
 *   │▥ │ Shipments / Rotterdam / SHP-24018                 │ acts  │   header frame: toggle cell · crumbs · actions
 *   └──┴──────────────────────────────────────────────────┴───────┘
 *   ┌────────┐ ┌──────────────────────────────┐ ┌──────────────┐
 *   │ Nav    │ │ main                         │ │ aside        │   one gutter apart (C1)
 *   └────────┘ └──────────────────────────────┘ └──────────────┘
 *
 * Three layouts, by the shell's own width:
 * - wide (≥ asideInlineAt): sidebar, page and aside side by side. The toggle cell shows and hides the
 *   sidebar column (aria-expanded, aria-controls). The sidebar and aside are sticky, one gutter from the top.
 * - medium (≥ narrowAt): the sidebar stays; the aside opens as an end Sheet, so it never crushes the page.
 * - narrow: the sidebar is a start Sheet opened by the same cell and closed by choosing an item; the aside
 *   is an end Sheet bound to `asideOpen` (focus moves in, Escape and the scrim close it, focus returns).
 * - The width is the shell's own, so a shell inside a pane or a preview frame decides for itself. CSS lays the
 *   columns out by it (a container query), so the server's HTML is already right for the width it lands in;
 *   the measurement (ResizeObserver) then decides only which parts become sheets, and moves nothing.
 * - Motion: the sheets unfold from their edge; the wide column toggles without animation (a layout change
 *   that moves the page should be immediate).
 */
function AppShell({
  nav,
  header,
  actions,
  aside,
  asideLabel = "Details",
  asideFinalFocus,
  mainProps,
  children,
  ...props
}: AppShellProps): React.ReactElement {
  return (
    <AppShellRoot {...props}>
      <AppShellHeader>
        <AppShellToggle />
        <AppShellCrumbs>{header}</AppShellCrumbs>
        {actions ? <AppShellActions>{actions}</AppShellActions> : null}
      </AppShellHeader>
      <AppShellNav>{nav}</AppShellNav>
      <AppShellMain {...mainProps}>{children}</AppShellMain>
      {aside ? (
        <AppShellAside label={asideLabel} finalFocus={asideFinalFocus}>
          {aside}
        </AppShellAside>
      ) : null}
    </AppShellRoot>
  );
}

export {
  AppShell,
  AppShellRoot,
  AppShellHeader,
  AppShellToggle,
  AppShellCrumbs,
  AppShellActions,
  AppShellNav,
  AppShellMain,
  AppShellAside,
  type AppShellProps,
  type AppShellRootProps,
  type AppShellAsideProps,
};
