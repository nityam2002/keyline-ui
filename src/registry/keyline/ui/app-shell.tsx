"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { NavExpandContext, NavRailContext } from "./nav";
import { Sheet, SheetContent } from "./sheet";

type AppShellProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The sidebar: usually <Nav layout="cell" …/>. */
  nav: React.ReactNode;
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
  asideOpen?: boolean;
  onAsideOpenChange?: (open: boolean) => void;
  /** Names the aside's sheet on narrow layouts. */
  asideLabel?: string;
  /**
   * Where focus goes when the aside's sheet closes (Base UI finalFocus). The sheet is opened by state, not
   * by a trigger, so pass the control that opened it (a ref): WebKit does not focus a button on click, and
   * without this focus would fall back to whatever was focused before.
   */
  asideFinalFocus?: React.ComponentProps<typeof SheetContent>["finalFocus"];
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
  container?: React.ComponentProps<typeof SheetContent>["container"];
  /** Props for the <main> element. */
  mainProps?: React.ComponentProps<"main">;
  children?: React.ReactNode;
};

/** The breakpoints app-shell.css carries; any others bring their own rules (see shellRules). */
const DEFAULT_AT = "960-1400";

/** app-shell.css's container rules for other breakpoints: a container condition cannot read a custom property. */
const shellRules = (at: string, narrowAt: number, inlineAt: number) => {
  const s = `.kl-shell[data-kl-at="${at}"]`;
  return `@layer components{@container kl-shell (width < ${narrowAt}px){${s}>:is(.kl-shell-nav,.kl-shell-aside){display:none}${s}>.kl-shell-main{grid-column:1/-1}}@container kl-shell (${narrowAt}px <= width < ${inlineAt}px){${s}>.kl-shell-aside{display:none}${s}>.kl-shell-main{grid-column-end:-1}}}`;
};

const PanelGlyph = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <rect x="1.5" y="2.5" width="13" height="11" />
    <path d="M6 2.5v11" />
    {open ? <path d="M3.25 5.5h1M3.25 8h1" strokeWidth="1.5" /> : null}
  </svg>
);

/**
 * The page around a product's screens: a header frame, the sidebar, the page, and an optional aside.
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
  navLabel = "Navigation",
  navOpen: navOpenProp,
  defaultNavOpen = true,
  onNavOpenChange,
  collapse = "hide",
  stickyHeader = false,
  header,
  actions,
  aside,
  asideOpen = false,
  onAsideOpenChange,
  asideLabel = "Details",
  asideFinalFocus,
  narrowAt = 960,
  asideInlineAt,
  container,
  mainProps,
  navSize,
  asideSize,
  className,
  style,
  children,
  ...props
}: AppShellProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const navId = React.useId();
  // the shell re-renders only when its width crosses a breakpoint (narrow, aside inline), not on every
  // pixel: a scrollbar appearing as the inspector opens must not re-render the page under a measuring toast
  const inlineAt = asideInlineAt ?? narrowAt + 440;
  const at = `${narrowAt}-${inlineAt}`;
  // until it is measured (and on the server) the shell renders every column; its CSS hides what the width has no room for
  const [band, setBand] = React.useState<"narrow" | "mid" | "wide">("wide");
  const narrow = band === "narrow";
  const asideInline = band === "wide";
  const [navInner, setNavInner] = React.useState(defaultNavOpen);
  const navOpen = navOpenProp ?? navInner;
  const setNavOpen = (o: boolean) => {
    if (navOpenProp === undefined) setNavInner(o);
    onNavOpenChange?.(o);
  };
  const [navSheet, setNavSheet] = React.useState(false);

  // the width is read from a zero-height sentinel spanning the shell: observing the shell itself would also
  // report its height, which changes while Base UI's ScrollArea measures the inspector, and WebKit reports
  // that as a ResizeObserver loop
  const widthRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const el = widthRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setBand(w < narrowAt ? "narrow" : w >= inlineAt ? "wide" : "mid");
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
  // a sticky header: its height places the columns below it (it can grow, e.g. a wrapped title)
  const headRef = React.useRef<HTMLElement>(null);
  React.useLayoutEffect(() => {
    const h = headRef.current;
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
  }, [stickyHeader]);
  // the sidebar column reaches the viewport's bottom edge from wherever it starts (it is sticky one gutter
  // from the top), so its footer is always in view; measured, as the shell may not start at the page top
  const navRef = React.useRef<HTMLDivElement>(null);
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
  }, [narrow, navOpen, rail, stickyHeader]);
  const expanded = narrow ? navSheet : navOpen;
  const toggle = () => (narrow ? setNavSheet(!navSheet) : setNavOpen(!navOpen));
  // choosing a place in the narrow sheet closes it: the place is what the user wanted to see
  const closeOnChoose = (e: React.MouseEvent) => {
    // a nested item's disclosure (aria-expanded) opens its list in place: it is not a place
    if ((e.target as Element).closest("[data-kl-item]:not([aria-expanded])")) setNavSheet(false);
  };

  return (
    <div
      ref={ref}
      data-slot="app-shell"
      data-kl-shell={narrow ? "narrow" : asideInline ? "wide" : "medium"}
      data-kl-nav={!narrow && navOpen ? "open" : rail ? "rail" : "closed"}
      data-kl-aside={asideInline && asideOpen && aside ? "open" : "closed"}
      data-kl-sticky-head={stickyHeader ? "" : undefined}
      data-kl-at={at}
      className={cn("kl-shell", className)}
      style={
        {
          ...(navSize != null ? { "--kl-shell-nav": typeof navSize === "number" ? `${navSize}px` : navSize } : null),
          ...(asideSize != null
            ? { "--kl-shell-aside": typeof asideSize === "number" ? `${asideSize}px` : asideSize }
            : null),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {at === DEFAULT_AT ? null : <style>{shellRules(at, narrowAt, inlineAt)}</style>}
      <div ref={widthRef} className="kl-shell-w" aria-hidden />
      <header ref={headRef} className="kl-frame kl-cells kl-shell-h">
        <button
          type="button"
          className="kl-cell kl-key kl-shell-toggle"
          aria-expanded={expanded}
          aria-controls={narrow ? undefined : navId}
          aria-label={`${expanded ? (collapse === "rail" && !narrow ? "Collapse" : "Hide") : collapse === "rail" && !narrow ? "Expand" : "Show"} ${navLabel.toLowerCase()}`}
          onClick={toggle}
        >
          <PanelGlyph open={expanded} />
        </button>
        <div className="kl-shell-crumbs">{header}</div>
        {actions ? <div className="kl-cells kl-shell-actions">{actions}</div> : null}
      </header>
      {narrow ? null : (
        <div
          ref={navRef}
          id={navId}
          className="kl-frame kl-shell-nav"
          data-kl-rail={rail ? "" : undefined}
          hidden={!navOpen && !rail}
        >
          <NavRailContext.Provider value={rail}>
            <NavExpandContext.Provider value={rail ? () => setNavOpen(true) : null}>{nav}</NavExpandContext.Provider>
          </NavRailContext.Provider>
        </div>
      )}
      <main {...mainProps} className={cn("kl-shell-main", mainProps?.className)}>
        {children}
      </main>
      {asideInline && asideOpen && aside ? <div className="kl-shell-aside">{aside}</div> : null}

      {narrow ? (
        <Sheet open={navSheet} onOpenChange={setNavSheet}>
          <SheetContent
            side="start"
            size={300}
            container={container}
            aria-label={navLabel}
            className="kl-shell-sheet"
            onClick={closeOnChoose}
          >
            {nav}
          </SheetContent>
        </Sheet>
      ) : null}
      {!asideInline && aside ? (
        <Sheet open={asideOpen} onOpenChange={(o) => onAsideOpenChange?.(o)}>
          <SheetContent
            side="end"
            size={400}
            container={container}
            aria-label={asideLabel}
            finalFocus={asideFinalFocus}
            className="kl-shell-sheet"
          >
            {aside}
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}

export { AppShell, type AppShellProps };
