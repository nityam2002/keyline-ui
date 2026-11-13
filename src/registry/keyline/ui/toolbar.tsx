"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { floodHandlers, useStretch } from "../lib/keyline-motion";
import { scopeProps, useDomDirection, useKeylineScope, useMergedRef } from "../lib/keyline-scope";
import { useScrollEdges } from "../lib/scroll-edges";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
import { fitStep, fold, isGroup, kindOf, splits, type Blocked, type RowItem } from "../lib/toolbar-overflow";
import {
  Menu,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuGroup,
  MenuGroupLabel,
  MenuSubmenuRoot,
  MenuSubmenuTrigger,
  MenuPopup,
  MenuSurface,
} from "./menu";

type Layout = "control" | "cell";
type Orientation = "horizontal" | "vertical";
const ToolbarCtx = React.createContext<{ layout: Layout; orientation: Orientation; inToolbar: boolean }>({
  layout: "control",
  orientation: "horizontal",
  inToolbar: false,
});
/** True inside a Toolbar: parts written for a plain row (a filter token) render as toolbar items there. */
const useInToolbar = () => React.useContext(ToolbarCtx).inToolbar;

type Signal = "idle" | "pending" | "done" | "failed";

/* ------------------------------------------------------------------ *
 * CLASSES
 * The row is one control frame of item cells. Every rule over the row's children keys on data-slot and sits on
 * the root, so a wrapped or custom item (a Tooltip's trigger, a caller's component rendering a ToolbarGroup) is
 * drawn like any other. --kl-tb-h is the inner height, so glyph-only items are square at every density.
 * ------------------------------------------------------------------ */

const rootVariants = cva(
  [
    "kl-ctl group/toolbar flex min-h-(--kl-ctl) w-max max-w-full min-w-0 items-stretch overflow-x-auto overflow-y-hidden text-kl-ink",
    "[--kl-tb-h:calc(var(--kl-ctl)-2*var(--kl-k2))] [overscroll-behavior-inline:contain]",
    "[scrollbar-width:thin] [scrollbar-color:var(--kl-ink-3)_transparent]",
    // with a spacer the toolbar spans its container
    "has-[>[data-slot=toolbar-spacer]]:w-auto",
    // seams: every item after the first draws its start edge, 1px; after a group (in the row) the edge is the
    // group's, 2px; a separator owns its own 2px edge and the item after it draws none. Folded items stay in the
    // DOM (hidden), so a hidden group is not a neighbour.
    "data-[orientation=horizontal]:[&>:not([data-slot=toolbar-separator])+:not([data-slot=toolbar-separator])]:border-s-(length:--kl-k1)",
    "data-[orientation=horizontal]:[&>:not([data-slot=toolbar-separator])+:not([data-slot=toolbar-separator])]:border-s-kl-seam",
    "data-[orientation=horizontal]:[&>:is([data-slot=toolbar-group],[data-slot=toolbar-toggle-group]):not([hidden])+:not([data-slot=toolbar-separator])]:border-s-(length:--kl-k2)",
    "data-[orientation=horizontal]:[&>:is([data-slot=toolbar-group],[data-slot=toolbar-toggle-group]):not([hidden])+:not([data-slot=toolbar-separator])]:border-s-kl-line",
    "data-[orientation=vertical]:[&>:not([data-slot=toolbar-separator])+:not([data-slot=toolbar-separator])]:border-t-(length:--kl-k1)",
    "data-[orientation=vertical]:[&>:not([data-slot=toolbar-separator])+:not([data-slot=toolbar-separator])]:border-t-kl-seam",
    "data-[orientation=vertical]:[&>:is([data-slot=toolbar-group],[data-slot=toolbar-toggle-group]):not([hidden])+:not([data-slot=toolbar-separator])]:border-t-(length:--kl-k2)",
    "data-[orientation=vertical]:[&>:is([data-slot=toolbar-group],[data-slot=toolbar-toggle-group]):not([hidden])+:not([data-slot=toolbar-separator])]:border-t-kl-line",
    // the first item (of the row, and of each group in it) clears the cut's corner: it never collapses into the bevel
    "data-[kl-layout=control]:data-[orientation=horizontal]:[&>:nth-child(1_of_[data-kl-tb-item]),&>:is([data-slot=toolbar-group],[data-slot=toolbar-toggle-group])>:nth-child(1_of_[data-kl-tb-item])]:ps-[calc(var(--kl-c,0px)*0.35)]",
    "data-[kl-layout=control]:data-[orientation=vertical]:[&>:nth-child(1_of_[data-kl-tb-item]),&>:is([data-slot=toolbar-group],[data-slot=toolbar-toggle-group])>:nth-child(1_of_[data-kl-tb-item])]:pt-[calc(var(--kl-c,0px)*0.35)]",
    // a cell toolbar, or one with overflow="menu", that doesn't fill its line closes its last item with an empty
    // cell, so the item's end edge is drawn (by the filler's seam) and the frame's own edge is never doubled. The
    // seam lies over the last item's end pixel, so a filler squeezed to nothing never stacks it on the frame.
    "[&:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:relative",
    "[&:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:flex-[1_0_0]",
    "[&:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:content-['']",
    "[&:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:border-s-(length:--kl-k1)",
    "[&:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:border-s-kl-seam",
    "[&:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:-ms-(--kl-k1)",
    // in a palette the filler sits below the last item: its seam is the block-start edge, never a side
    "[&[data-orientation=vertical]:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:border-s-0",
    "[&[data-orientation=vertical]:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:ms-0",
    "[&[data-orientation=vertical]:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:border-t-(length:--kl-k1)",
    "[&[data-orientation=vertical]:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:border-t-kl-seam",
    "[&[data-orientation=vertical]:is([data-kl-layout=cell],[data-kl-overflow=menu]):not(:has(>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:-mt-(--kl-k1)",
    // a palette holding every tool is sized by them: its filler is only the fit's 2px headroom, not a cell, so it
    // draws no seam (a seam 2px inside the frame reads as a doubled bottom edge). With More it is a real cell.
    "[&[data-orientation=vertical][data-kl-overflow=menu][data-kl-overflow=menu]:not(:has(>[data-slot=toolbar-more],>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:border-t-0",
    "[&[data-orientation=vertical][data-kl-overflow=menu][data-kl-overflow=menu]:not(:has(>[data-slot=toolbar-more],>[data-slot=toolbar-spacer])):not([data-kl-more])]:after:mt-0",
  ],
  {
    variants: {
      /** control: its own frame. cell: a row of an enclosing frame; the foundation's layout="cell" drops the frame and
       * the background. */
      layout: {
        control: "bg-kl-cell",
        cell: "min-h-(--kl-row) w-auto flex-auto [--kl-tb-h:var(--kl-row)]",
      },
      /** vertical: a column of cells (a tool palette). */
      orientation: { horizontal: "", vertical: "w-max flex-col overflow-x-hidden overflow-y-auto" },
      /** menu: the toolbar spans its line (the space it may use is measured), never scrolls unless even the kept
       * items don't fit; a palette takes the height its container gives it (min 0 so a flex column can shrink it). */
      overflow: { scroll: "", menu: "" },
    },
    compoundVariants: [
      { overflow: "menu", orientation: "horizontal", className: "w-auto" },
      { overflow: "menu", orientation: "vertical", className: "max-h-full min-h-0 overflow-y-hidden" },
    ],
    defaultVariants: { layout: "control", orientation: "horizontal", overflow: "scroll" },
  },
);

/*
 * An item cell. It holds no padding of its own: the label carries it, so the signal cells sit on its edges. Its
 * hover tint gives way to any state that fills it (pressed, an open menu, covered by the band, the primary), and a
 * press outranks the hover. An open tooltip is not a held state: only an open menu (aria-expanded) fills the cell.
 */
const itemVariants = cva(
  [
    "group/toolbar-item relative box-border flex flex-none cursor-pointer appearance-none items-stretch no-underline select-none",
    "font-(family-name:--kl-font) text-[14px]/[1.2] font-(--kl-weight-strong) whitespace-nowrap",
    "[-webkit-tap-highlight-color:transparent] [&_svg]:flex-none",
    "hover:[&:not([data-pressed],[aria-expanded=true],[data-disabled],[data-kl-covered],[data-kl-primary])]:bg-kl-tint",
    "active:not-data-disabled:not-data-pressed:not-data-kl-covered:bg-kl-press",
    "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus focus-visible:outline-solid",
    // busy is not out of service: a pending item keeps its look and runs the segment
    "aria-busy:cursor-progress",
    "data-disabled:not-aria-busy:cursor-not-allowed data-disabled:not-aria-busy:bg-(image:--kl-hatch) data-disabled:not-aria-busy:text-kl-dis",
    // a menu title, open: the inverse cell (Select's open caret, Menubar's open title)
    "aria-expanded:bg-kl-inverse aria-expanded:text-kl-on-inverse aria-expanded:focus-visible:outline-current",
    "forced-colors:data-pressed:outline-3 forced-colors:data-pressed:outline-offset-[-4px] forced-colors:data-pressed:outline-[Highlight] forced-colors:data-pressed:outline-solid",
    "forced-colors:aria-expanded:outline-3 forced-colors:aria-expanded:outline-offset-[-4px] forced-colors:aria-expanded:outline-[Highlight] forced-colors:aria-expanded:outline-solid",
  ],
  {
    variants: {
      orientation: { horizontal: "", vertical: "min-h-(--kl-tb-h)" },
      icon: { true: "min-w-(--kl-tb-h)", false: "" },
      /** the row's one commit action: the cobalt cell. Pressed it goes deeper cobalt, as Button does; disabled it is
       * out of service like any item (the dis label on the hatch). */
      primary: {
        true: [
          "bg-kl-cobalt text-kl-on-cobalt hover:not-data-disabled:bg-kl-cobalt-hi",
          "active:not-data-disabled:not-data-pressed:not-data-kl-covered:bg-kl-cobalt-lo",
          "focus-visible:outline-current",
          "data-disabled:not-aria-busy:bg-kl-cell data-disabled:not-aria-busy:text-kl-dis",
          "forced-colors:bg-[ButtonText] forced-colors:text-[ButtonFace] forced-colors:forced-color-adjust-none",
        ],
        false: "",
      },
    },
    defaultVariants: { orientation: "horizontal", icon: false, primary: false },
  },
);

/* A toggle on its own or in a multiple group floods (its own state); in an exclusive group it is a choice the ink band
 * covers. A flood owns its filled state: the ring on the fill takes the fill's text colour. */
const floodToggle = "kl-flood data-pressed:focus-visible:outline-(color:--kl-fg)";
const choiceToggle = cn(
  "data-kl-covered:text-kl-on-inverse data-kl-covered:focus-visible:outline-current",
  "forced-colors:data-kl-covered:text-[HighlightText] forced-colors:data-kl-covered:forced-color-adjust-none",
);

const labelVariants = cva("flex min-w-0 flex-1 items-center justify-center gap-2 px-[calc(var(--kl-inset)+2px)]", {
  variants: {
    orientation: { horizontal: "", vertical: "justify-start" },
    icon: { true: "justify-center px-0", false: "" },
    // a menu title: the caret sits close to the label it follows, never across a divider
    caret: { true: "pe-[6px]", false: "" },
    link: { true: "underline decoration-1 underline-offset-4 group-hover/toolbar-item:decoration-2", false: "" },
  },
  defaultVariants: { orientation: "horizontal", icon: false, caret: false, link: false },
});

/* affix: a count or a shortcut, divided inside the item as ButtonAffix is. On a filled cell (open, primary) its divider
 * takes the cell's text colour, so it stays visible; a key (kbd) or a code is mono, in the item's colour. */
const affixVariants = cva(
  [
    "flex min-w-(--kl-tb-h) items-center justify-center px-2 font-(--kl-weight-display) tabular-nums",
    "border-s-(length:--kl-k1) border-s-kl-seam",
    "group-aria-expanded/toolbar-item:border-s-current group-data-kl-primary/toolbar-item:border-s-current",
    "has-[kbd]:font-(family-name:--kl-font-mono) has-[kbd]:text-[11px] has-[kbd]:font-medium has-[kbd]:text-inherit",
    "[&_.kl-code]:text-inherit [&_kbd]:[font:inherit]",
  ],
  {
    variants: {
      // in a menu title the affix (a count) sits close to the caret
      caret: { true: "min-w-0 ps-[calc(var(--kl-inset)-2px)] pe-[6px]", false: "" },
    },
    defaultVariants: { caret: false },
  },
);

/* signal cells (Button's): done inserts a ✓ cell at the end, failed a ! cell at the start; both unfold (kl-slot) */
const signalCell = cn(
  "grid h-full w-(--kl-tb-h) place-items-center",
  "forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:forced-color-adjust-none",
);

/* ---------------- overflow registration ---------------- */

type RowData =
  | { type: "button"; label: React.ReactNode; affix: React.ReactNode; disabled: boolean }
  | { type: "toggle"; label: React.ReactNode; affix: React.ReactNode; disabled: boolean; pressed: boolean }
  | {
      type: "link";
      label: React.ReactNode;
      disabled: boolean;
      href?: string | undefined;
      target?: string | undefined;
      rel?: string | undefined;
      onClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined;
    }
  | { type: "menu"; label: React.ReactNode; disabled: boolean }
  | { type: "group"; label: string | null }
  | { type: "toggle-group"; label: string | null; multiple: boolean; value: string[]; disabled: boolean }
  | { type: "option"; value: string; label: React.ReactNode; affix: React.ReactNode; disabled: boolean }
  | { type: "separator" };

type Entry = { el: HTMLElement | null; slot: number; row: RowData };
type MenuContentEntry = { anchor: HTMLElement | null; children: React.ReactNode; container: unknown };

/**
 * The toolbar's items, registered by the parts themselves (with the element they render, the top-level child they are
 * in, and what they become as a row of More). The fit reads the DOM; the registry gives each element its row.
 */
class Registry {
  entries = new Map<string, Entry>();
  contents = new Map<string, MenuContentEntry>();
  private version = 0;
  private listeners = new Set<() => void>();
  /** structure changed: an item came, went, or moved (the fit re-measures) */
  onStructure: (() => void) | null = null;
  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => void this.listeners.delete(l);
  };
  getVersion = () => this.version;
  private emit() {
    this.version++;
    this.listeners.forEach((l) => l());
  }
  set(id: string, e: Entry) {
    const prev = this.entries.get(id);
    this.entries.set(id, e);
    if (!prev || prev.el !== e.el || prev.slot !== e.slot) this.onStructure?.();
    if (!prev || !sameRow(prev.row, e.row)) this.emit();
  }
  delete(id: string) {
    if (this.entries.delete(id)) {
      this.onStructure?.();
      this.emit();
    }
  }
  setContent(id: string, c: MenuContentEntry) {
    const prev = this.contents.get(id);
    this.contents.set(id, c);
    if (!prev || prev.anchor !== c.anchor || prev.children !== c.children || prev.container !== c.container)
      this.emit();
  }
  deleteContent(id: string) {
    if (this.contents.delete(id)) this.emit();
  }
  byEl(el: Element): [string, Entry] | undefined {
    for (const kv of this.entries) if (kv[1].el === el) return kv;
    return undefined;
  }
}

const sameRow = (a: RowData, b: RowData) => {
  const ka = Object.keys(a) as (keyof RowData)[];
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => {
    const x = a[k] as unknown;
    const y = b[k] as unknown;
    return Array.isArray(x) && Array.isArray(y) ? x.length === y.length && x.every((v, i) => v === y[i]) : x === y;
  });
};

type FoldState = { registry: Registry; folded: ReadonlySet<string> };
/** Present inside a Toolbar with overflow="menu" (and not inside its More menu). */
const FoldCtx = React.createContext<FoldState | null>(null);
/** The index of the toolbar's top-level child an item renders in: where More goes is a position among them. */
const SlotCtx = React.createContext(-1);

/** Registers an item (when its toolbar folds), and says whether it is folded: then it stays mounted, hidden. */
function useFoldItem(row: RowData): { ref: React.RefObject<HTMLElement | null>; hidden: boolean } {
  const ctx = React.useContext(FoldCtx);
  const slot = React.useContext(SlotCtx);
  const id = React.useId();
  const ref = React.useRef<HTMLElement | null>(null);
  React.useLayoutEffect(() => {
    ctx?.registry.set(id, { el: ref.current, slot, row });
  });
  const registry = ctx?.registry;
  React.useLayoutEffect(() => () => registry?.delete(id), [registry, id]);
  return { ref, hidden: !!ctx?.folded.has(id) };
}

type El = React.ReactElement<Record<string, unknown>>;
const isEl = (c: unknown): c is El => React.isValidElement(c);
const textOf = (n: unknown): string =>
  typeof n === "string" || typeof n === "number"
    ? String(n)
    : Array.isArray(n)
      ? n.map(textOf).join("")
      : isEl(n)
        ? textOf(n.props["children"])
        : "";

/** The name an item carries into the More menu: overflowLabel, else aria-label (glyph items), else its text. */
function labelOf(p: {
  overflowLabel?: React.ReactNode;
  icon?: boolean | undefined;
  children?: React.ReactNode;
  "aria-label"?: string | undefined;
}): React.ReactNode {
  if (p.overflowLabel != null) return p.overflowLabel;
  if (p.icon || p.children == null || textOf(p.children).trim() === "") return p["aria-label"] ?? p.children;
  return p.children;
}

/** An affix in the menu: a key (a <kbd>) goes in the shortcut cell; a count or a code follows the label. */
const isKey = (a: unknown) =>
  isEl(a) &&
  (a.type === "kbd" ||
    React.Children.toArray(a.props["children"] as React.ReactNode).some((c) => isEl(c) && c.type === "kbd"));
function withAffix(label: React.ReactNode, affix: unknown): { label: React.ReactNode; shortcut?: React.ReactNode } {
  if (affix == null || affix === false) return { label };
  if (isKey(affix)) return { label, shortcut: affix as React.ReactNode };
  return {
    label: (
      <>
        {label}
        <span
          data-slot="toolbar-menu-count"
          className="ms-2 font-(family-name:--kl-font-mono) text-[12px] text-kl-ink-2 tabular-nums group-data-highlighted/menu-item:text-inherit"
        >
          {affix as React.ReactNode}
        </span>
      </>
    ),
  };
}

/* ---------------- Toolbar (Root) ---------------- */

type ToolbarProps = ToolbarPrimitive.Root.Props & {
  /** control (default): its own 2px frame and the cut. cell: a row of an enclosing frame (a panel's top cell, a shell header). */
  layout?: Layout;
  /**
   * What a toolbar does when its items don't fit. scroll (default): it scrolls inside its frame and fades
   * the hidden edge. menu: items that don't fit leave, last first, and a "More" item takes their place; its
   * menu holds them as rows (a button is an item, a toggle a checkbox item, an exclusive group radio items,
   * a menu a submenu), with their state. A ToolbarGroup gives up its items one at a time (they appear under
   * its label); `keepTogether` makes it leave whole. Horizontal, the toolbar then spans its line; vertical
   * (a palette), it takes the height its container gives it and More sits at its foot, opening to the side.
   */
  overflow?: "scroll" | "menu";
  /** Accessible name of the overflow item ("More"); its menu says how many items it holds. */
  overflowLabel?: string;
  /** icon (default): the overflow item is a square ⋯ cell named by overflowLabel. label: it shows overflowLabel as text with a caret, for a row whose items may all move into it. */
  overflowTrigger?: "icon" | "label";
};

/**
 * A row of commands that is ONE Tab stop (Base UI Toolbar): arrow keys move between items and wrap at the
 * ends (`loopFocus`, default true). Home and End are left to the focused item, as Base UI 1.9 does (the APG
 * lists them as optional for toolbars), so a text input cell keeps them. Every item is a cell of one frame.
 *
 *   ┌──────┬──────┲━━━━┳━━━━┳━━━━┱─────────────────┬──────────┬────┐
 *   │ Undo │ Redo ┃ B  │ I  │ U  ┃                 │ Insert ▾ │ ⋯  │
 *   └──────┴──────┺━━━━┻━━━━┻━━━━┹─────────────────┴──────────┴────┘
 *   items share 1px seams · a group meets its neighbours on a 2px keyline · a spacer is an empty cell
 *
 * - Give it `aria-label` (or `aria-labelledby`): a toolbar is a named landmark of controls.
 * - Groups (ToolbarGroup, ToolbarToggleGroup) are units: their outer edges are control weight (2px), so
 *   a group reads as one control inside the row without a gap (C1). ToolbarSeparator draws the same 2px
 *   keyline between ungrouped items and is announced as a separator.
 * - Disabled items stay focusable (Base UI's default), so a keyboard user still finds them and hears why.
 * - Narrow: a horizontal toolbar scrolls inside its frame and fades the edge where items are hidden
 *   (scroll edges); focus scrolls the focused item into view. With overflow="menu" the items that don't
 *   fit move into a "More" menu instead (the primary item and text inputs never move), in either
 *   orientation. Items are found by their data-slot, so an item wrapped in a Tooltip, or rendered by a
 *   component of yours, moves like any other; a folded item stays mounted (hidden), so its state stays.
 * - Arrow keys follow the DOM `dir` (an RTL subtree reverses Left/Right), not only a DirectionProvider.
 */
function Toolbar({
  className,
  layout = "control",
  orientation = "horizontal",
  overflow = "scroll",
  overflowLabel = "More",
  overflowTrigger = "icon",
  ref: refProp,
  children,
  ...props
}: ToolbarProps): React.ReactElement {
  const ref = React.useRef<HTMLDivElement>(null);
  useScrollEdges(ref);
  const [dir, refreshDir] = useDomDirection(ref);
  const setRef = useMergedRef(ref, refProp);
  const ctx = React.useMemo(() => ({ layout, orientation, inToolbar: true }), [layout, orientation]);
  const menuMode = overflow === "menu";
  const content = useOverflow(ref, menuMode, orientation === "vertical", children, overflowLabel, overflowTrigger);
  useKeepFocus(ref);
  return (
    <ToolbarCtx.Provider value={ctx}>
      <DirectionProvider direction={dir}>
        <ToolbarPrimitive.Root
          ref={setRef}
          data-kl-layout={layout}
          data-kl-overflow={menuMode ? "menu" : undefined}
          orientation={orientation}
          onFocusCapture={refreshDir}
          className={resolveClassName(cn(rootVariants({ layout, orientation, overflow })), className)}
          {...props}
          data-slot="toolbar"
        >
          {content}
        </ToolbarPrimitive.Root>
      </DirectionProvider>
    </ToolbarCtx.Provider>
  );
}

/**
 * Removing the focused item (a filter token's ×, a command that disables itself away) must not drop focus
 * to the page: when the item that had focus leaves the DOM, focus goes to the item now in its place, or
 * the one before it.
 */
function useKeepFocus(ref: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof MutationObserver === "undefined") return;
    const items = () =>
      Array.from(el.querySelectorAll<HTMLElement>("button, a[href], input")).filter((x) => !x.closest("[hidden]"));
    let last: { node: HTMLElement; index: number } | null = null;
    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      last = { node: t, index: items().indexOf(t) };
    };
    const mo = new MutationObserver(() => {
      if (!last || last.node.isConnected) return;
      const a = document.activeElement;
      if (a && a !== document.body && a !== document.documentElement) return;
      const list = items();
      const next = list[Math.min(last.index, list.length - 1)];
      last = null;
      next?.focus();
    });
    el.addEventListener("focusin", onFocus);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      el.removeEventListener("focusin", onFocus);
      mo.disconnect();
    };
  }, [ref]);
}

/* ---------------- overflow ("More") ---------------- */

type Placed = { folded: ReadonlySet<string>; more: { slot: number; after: boolean } | null; count: number };
const NONE: Placed = { folded: new Set(), more: null, count: 0 };

/** The row's elements the fit works with: in flow (not the edge fades or Base UI's focus guards), not More. */
const inFlow = (c: Element): c is HTMLElement => {
  if (!(c instanceof HTMLElement)) return false;
  const pos = getComputedStyle(c).position;
  return pos !== "fixed" && pos !== "absolute";
};

/**
 * Fits a toolbar's items to its size along its axis: folds units from the end while the row overflows, and brings
 * the next one back when the free space (empty fill, slack in the spacer and input cells) holds its last measured
 * size. The arithmetic and the rules are lib/toolbar-overflow; this measures and renders. Runs in layout effects,
 * so nothing paints in between.
 */
function useOverflow(
  ref: React.RefObject<HTMLDivElement | null>,
  on: boolean,
  vertical: boolean,
  children: React.ReactNode,
  label: string,
  trigger: "icon" | "label",
): React.ReactNode {
  // the axis the items run along: width in a row, height in a column (a tool palette)
  const size = (e: Element) => (vertical ? e.getBoundingClientRect().height : e.getBoundingClientRect().width);
  const inner = (e: HTMLElement) => (vertical ? e.clientHeight : e.clientWidth);
  const outer = (e: HTMLElement) => (vertical ? e.offsetHeight : e.offsetWidth);
  const minOf = (cs: CSSStyleDeclaration) => parseFloat(vertical ? cs.minHeight : cs.minWidth) || 0;
  const [registry] = React.useState(() => new Registry());
  const [placed, setPlaced] = React.useState<Placed>(NONE);
  const widths = React.useRef(new Map<Element, number>());
  const blocked = React.useRef<Blocked | null>(null);
  const refocus = React.useRef(false);
  const moreRef = React.useRef<HTMLButtonElement>(null);
  const [, remeasure] = React.useReducer((x: number) => x + 1, 0);
  const foldState = React.useMemo<FoldState>(() => ({ registry, folded: placed.folded }), [registry, placed.folded]);

  // Measures after every render on purpose: items, fonts and the parent can all change the fit without a prop
  // changing. Each pass moves the folded count one step toward the fit and `blocked` stops a step that would
  // undo the last, so the passes settle.
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- re-measures each render; see above
  React.useLayoutEffect(() => {
    if (!on) return;
    const el = ref.current;
    if (!el) return;
    // the row as the lib sees it: each element classified by its data-slot (registered items only: an element
    // that no part registered has no row to become, so it stays)
    const registered = (c: Element) => !!registry.byEl(c);
    const kindIn = (c: Element) => (registered(c) ? kindOf(c) : "keep");
    const kids = Array.from(el.children).filter(inFlow);
    const items: RowItem<HTMLElement>[] = kids
      .filter((c) => c !== moreRef.current)
      .map((c) => {
        const kind = kindIn(c);
        if (kind !== "unit" || !isGroup(c)) return { el: c, kind, members: null };
        const members = Array.from(c.children).filter(
          (m): m is HTMLElement =>
            inFlow(m) && !m.hasAttribute("data-kl-band") && !m.hasAttribute("data-kl-scope") && registered(m),
        );
        const all = Array.from(c.children).filter(
          (m) => inFlow(m) && !m.hasAttribute("data-kl-band") && !m.hasAttribute("data-kl-scope"),
        );
        return { el: c, kind, members: members.length === all.length && splits(c, members) ? members : null };
      });
    const place = (count: number): Placed => {
      const f = fold(items, count);
      const ids = new Set<string>();
      f.folded.forEach((e) => {
        const hit = registry.byEl(e);
        if (hit) ids.add(hit[0]);
      });
      let more: Placed["more"] = null;
      if (f.more) {
        const at = "before" in f.more ? f.more.before : f.more.after;
        const slot = registry.byEl(at)?.[1].slot ?? -1;
        more = slot < 0 ? null : { slot, after: "after" in f.more };
      }
      return { folded: ids, more, count: Math.min(count, f.units.length) };
    };
    const samePlace = (a: Placed, b: Placed) =>
      a.count === b.count &&
      a.folded.size === b.folded.size &&
      [...a.folded].every((x) => b.folded.has(x)) &&
      a.more?.slot === b.more?.slot &&
      a.more?.after === b.more?.after;
    // the rendered row must be the fold of the current count (an item came or went since): render that first
    const now = place(placed.count);
    if (!samePlace(now, placed)) {
      setPlaced(now);
      return;
    }
    const f = fold(items, placed.count);
    const units = f.units;
    const count = now.count;
    // remember each unit's size while it is in the row
    for (const u of units) if (!f.folded.has(u) && !u.hidden) widths.current.set(u, size(u));
    // the size the row asks for with every item in it: its flex basis, so a toolbar sized by its content (in a flex
    // row) shrinks under pressure, and grows back, instead of fitting its current items forever
    let full = outer(el) - inner(el) + 2;
    for (const k of kids) {
      if (k === moreRef.current || k.hidden) continue;
      const cs = getComputedStyle(k);
      const flexible = parseFloat(cs.flexGrow) > 0 || parseFloat(cs.flexShrink) > 0;
      full += flexible ? minOf(cs) : size(k);
    }
    units.slice(units.length - count).forEach((u) => (full += widths.current.get(u) ?? 0));
    // only a parent laid out along the same axis sizes it by its basis (a row for a row, a column for a palette)
    const ps = el.parentElement ? getComputedStyle(el.parentElement) : null;
    const inRow = !!ps && ps.display.includes("flex") && ps.flexDirection.startsWith("column") === vertical;
    const basis = inRow ? `${Math.ceil(full)}px` : "";
    if (el.style.flexBasis !== basis) el.style.flexBasis = basis;
    // fractional sizes on both sides (lib: overflows): the content box from the rect, less the integer borders
    const available = size(el) - (outer(el) - inner(el));
    // overflow is the items' own extent (the scroll size also counts the edge-fade overlays)
    const extent = kids.reduce((sum, k) => sum + size(k), 0);
    let used = 0;
    let slack = 0;
    for (const k of kids) {
      const r = size(k);
      used += r;
      const cs = getComputedStyle(k);
      if (parseFloat(cs.flexGrow) > 0 || parseFloat(cs.flexShrink) > 0) slack += Math.max(0, r - minOf(cs));
    }
    const next = units[units.length - count];
    // the first item back into a group that had left whole brings the group's own 2px edges with it
    const group = next?.parentElement;
    const edges = next && group && group !== el && f.folded.has(group) ? 4 : 0;
    const need =
      next === undefined
        ? Infinity
        : (widths.current.get(next) ?? Infinity) + edges - (count === 1 && moreRef.current ? size(moreRef.current) : 0);
    const step = fitStep({
      count,
      total: units.length,
      available,
      extent,
      free: available - used + slack,
      need,
      blocked: blocked.current,
    });
    blocked.current = step.blocked;
    if (step.count !== count) {
      if (step.count > count && el.contains(document.activeElement) && document.activeElement !== moreRef.current)
        refocus.current = true;
      setPlaced(place(step.count));
      return;
    }
    if (refocus.current) {
      refocus.current = false;
      const a = document.activeElement as HTMLElement | null;
      if (!a || !el.contains(a) || a.closest("[hidden]")) moreRef.current?.focus({ preventScroll: true });
    }
  });

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!on || !el || typeof ResizeObserver === "undefined") return;
    const inner = (e: HTMLElement) => (vertical ? e.clientHeight : e.clientWidth);
    let last = inner(el);
    let raf = 0;
    const refit = () => {
      blocked.current = null;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => flushSync(remeasure));
    };
    // the fit runs in the next frame, not inside the observer's callback: fitting changes the toolbar's own
    // size (its flex basis), which inside the callback is a ResizeObserver loop error (seen in WebKit)
    const ro = new ResizeObserver(() => {
      if (inner(el) === last) return;
      last = inner(el);
      refit();
    });
    ro.observe(el);
    // a web font arriving changes every item's width while the toolbar, held at its old basis, may keep its
    // size: the basis measured with the fallback font would stay (a stray filler, or items left in More)
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    fonts?.addEventListener("loadingdone", refit);
    // an item added, removed or moved (a filter token appearing) changes the fit without a toolbar render
    registry.onStructure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => flushSync(remeasure));
    };
    return () => {
      ro.disconnect();
      fonts?.removeEventListener("loadingdone", refit);
      cancelAnimationFrame(raf);
      registry.onStructure = null;
    };
  }, [on, ref, vertical, registry]);

  if (!on) return children;

  const more = (
    <FoldCtx.Provider value={null} key="kl-tb-more">
      <Menu>
        <MenuTitle
          ref={moreRef}
          icon={trigger === "icon"}
          aria-label={trigger === "icon" ? label : undefined}
          data-kl-count={placed.count}
          data-slot="toolbar-more"
          caret={trigger === "label"}
        >
          {trigger === "label" ? (
            label
          ) : (
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
              <rect x="2" y="7" width="2.5" height="2.5" />
              <rect x="6.75" y="7" width="2.5" height="2.5" />
              <rect x="11.5" y="7" width="2.5" height="2.5" />
            </svg>
          )}
        </MenuTitle>
        <ToolbarMenuContent
          align="end"
          aria-label={`${label}: ${placed.count} ${placed.count === 1 ? "item" : "items"}`}
        >
          <OverflowRows registry={registry} folded={placed.folded} />
        </ToolbarMenuContent>
      </Menu>
    </FoldCtx.Provider>
  );
  const out: React.ReactNode[] = [];
  React.Children.toArray(children).forEach((c, i) => {
    const at = placed.more && placed.count > 0 && placed.more.slot === i ? placed.more : null;
    if (at && !at.after) out.push(more);
    out.push(
      <SlotCtx.Provider key={isEl(c) && c.key != null ? c.key : i} value={i}>
        {c}
      </SlotCtx.Provider>,
    );
    if (at && at.after) out.push(more);
  });
  return <FoldCtx.Provider value={foldState}>{out}</FoldCtx.Provider>;
}

/** The More menu's rows: the folded items, in the row's order, with their current state (from the registry). */
function OverflowRows({ registry, folded }: { registry: Registry; folded: ReadonlySet<string> }) {
  React.useSyncExternalStore(registry.subscribe, registry.getVersion, registry.getVersion);
  const all = [...registry.entries].filter(([, e]) => e.el?.isConnected);
  const order = (a: [string, Entry], b: [string, Entry]) =>
    a[1].el!.compareDocumentPosition(b[1].el!) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  all.sort(order);
  const within = (g: HTMLElement) => all.filter(([, e]) => e.el !== g && e.el!.parentElement === g);
  // a folded menu's content: the ToolbarMenuContent whose scope marker follows its trigger (they share a Menu root)
  const contentOf = (trigger: HTMLElement) => {
    let best: MenuContentEntry | null = null;
    for (const c of registry.contents.values()) {
      if (!c.anchor || !(trigger.compareDocumentPosition(c.anchor) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
      const between = all.some(
        ([, e]) =>
          e.row.type === "menu" &&
          e.el !== trigger &&
          trigger.compareDocumentPosition(e.el!) & Node.DOCUMENT_POSITION_FOLLOWING &&
          c.anchor!.compareDocumentPosition(e.el!) & Node.DOCUMENT_POSITION_PRECEDING,
      );
      if (between) continue;
      if (!best || c.anchor.compareDocumentPosition(best.anchor!) & Node.DOCUMENT_POSITION_FOLLOWING) best = c;
    }
    return best;
  };
  const click = (el: HTMLElement | null) => () => el?.click();

  const rowOf = (id: string, e: Entry, only?: Set<string>): React.ReactNode => {
    const r = e.row;
    switch (r.type) {
      case "button": {
        const a = withAffix(r.label, r.affix);
        return (
          <MenuItem key={id} disabled={r.disabled} onClick={click(e.el)} shortcut={a.shortcut}>
            {a.label}
          </MenuItem>
        );
      }
      case "link":
        return (
          <MenuItem
            key={id}
            disabled={r.disabled}
            render={<a href={r.href} target={r.target} rel={r.rel} />}
            onClick={r.onClick as never}
          >
            {r.label}
          </MenuItem>
        );
      case "toggle": {
        const a = withAffix(r.label, r.affix);
        return (
          <MenuCheckboxItem
            key={id}
            disabled={r.disabled}
            checked={r.pressed}
            onCheckedChange={click(e.el)}
            shortcut={a.shortcut}
          >
            {a.label}
          </MenuCheckboxItem>
        );
      }
      case "toggle-group": {
        const opts = within(e.el!).filter(([, o]) => o.row.type === "option");
        const opt = (o: Entry) => o.row as Extract<RowData, { type: "option" }>;
        return (
          <MenuGroup key={id}>
            {r.label ? <MenuGroupLabel>{r.label}</MenuGroupLabel> : null}
            {!r.multiple ? (
              <MenuRadioGroup
                value={r.value[0] ?? null}
                onValueChange={(v) => opts.find(([, o]) => opt(o).value === v)?.[1].el?.click()}
                disabled={r.disabled}
              >
                {opts.map(([oid, o]) => {
                  const a = withAffix(opt(o).label, opt(o).affix);
                  return (
                    <MenuRadioItem key={oid} value={opt(o).value} disabled={opt(o).disabled} shortcut={a.shortcut}>
                      {a.label}
                    </MenuRadioItem>
                  );
                })}
              </MenuRadioGroup>
            ) : (
              opts.map(([oid, o]) => {
                const a = withAffix(opt(o).label, opt(o).affix);
                return (
                  <MenuCheckboxItem
                    key={oid}
                    disabled={r.disabled || opt(o).disabled}
                    checked={r.value.includes(opt(o).value)}
                    onCheckedChange={click(o.el)}
                    shortcut={a.shortcut}
                  >
                    {a.label}
                  </MenuCheckboxItem>
                );
              })
            )}
          </MenuGroup>
        );
      }
      case "group":
        return (
          <MenuGroup key={id}>
            {r.label ? <MenuGroupLabel>{r.label}</MenuGroupLabel> : null}
            {within(e.el!)
              .filter(([mid]) => !only || only.has(mid))
              .map(([mid, m]) => rowOf(mid, m))}
          </MenuGroup>
        );
      case "menu": {
        const content = contentOf(e.el!);
        if (!content) return null;
        return (
          <MenuSubmenuRoot key={id}>
            <MenuSubmenuTrigger disabled={r.disabled}>{r.label}</MenuSubmenuTrigger>
            <MenuPopup container={content.container as never}>{content.children}</MenuPopup>
          </MenuSubmenuRoot>
        );
      }
      default:
        return null;
    }
  };

  // the row's top-level folded items (and a group folded in part, with only its folded items), in order
  const rows: React.ReactNode[] = [];
  let prevGroup = false;
  for (const [id, e] of all) {
    const top = e.el!.parentElement?.getAttribute("data-slot") === "toolbar";
    if (!top || e.row.type === "separator") continue;
    const groupish = e.row.type === "group" || e.row.type === "toggle-group";
    let only: Set<string> | undefined;
    if (!folded.has(id)) {
      if (e.row.type !== "group") continue;
      only = new Set(within(e.el!).flatMap(([mid]) => (folded.has(mid) ? [mid] : [])));
      if (!only.size) continue;
    }
    if (rows.length && (groupish || prevGroup)) rows.push(<MenuSeparator key={`s${id}`} />);
    rows.push(rowOf(id, e, only));
    prevGroup = groupish;
  }
  return <>{rows}</>;
}

/* ---------------- items ---------------- */

/* The signal slots exist only on an item that takes a signal (so they can unfold); others carry just the label. */
function ItemLabel({
  affix,
  signal,
  icon,
  caret,
  link,
  children,
}: {
  affix?: React.ReactNode;
  signal?: Signal | undefined;
  icon?: boolean | undefined;
  caret?: boolean;
  link?: boolean;
  children?: React.ReactNode;
}) {
  const { orientation } = React.useContext(ToolbarCtx);
  const label = (
    <span
      data-slot="toolbar-label"
      className={cn(
        labelVariants({ orientation, icon: !!icon, caret: !!caret && affix == null && signal == null, link: !!link }),
      )}
    >
      {children}
    </span>
  );
  const affixCell =
    affix != null ? (
      <span data-slot="toolbar-affix" className={cn(affixVariants({ caret: !!caret && signal !== "pending" }))}>
        {affix}
      </span>
    ) : null;
  if (signal == null) {
    return (
      <>
        {label}
        {affixCell}
      </>
    );
  }
  return (
    <>
      <span className="kl-slot" data-open={signal === "failed" ? "" : undefined} data-slot="toolbar-fail" aria-hidden>
        <span className="flex h-full">
          <span
            className={cn(
              signalCell,
              "border-e-(length:--kl-k1) border-e-kl-seam bg-kl-red text-[15px] font-(--kl-weight-display) text-kl-on-red",
            )}
          >
            !
          </span>
        </span>
      </span>
      {label}
      {affixCell}
      <span className="kl-slot" data-open={signal === "done" ? "" : undefined} data-slot="toolbar-done" aria-hidden>
        <span className="flex h-full">
          <span
            className={cn(
              signalCell,
              "border-s-(length:--kl-k1) border-s-current bg-kl-yellow text-kl-on-yellow",
              "group-data-kl-primary/toolbar-item:border-s-kl-on-cobalt",
            )}
          >
            <svg
              className="kl-tick"
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="square"
            >
              <path pathLength={1} d="m3.5 8.5 3 3 6-7" />
            </svg>
          </span>
        </span>
      </span>
      {signal === "pending" ? <span className="kl-pending bottom-0 [--kl-bw:3px]" aria-hidden /> : null}
    </>
  );
}

type ToolbarButtonProps = ToolbarPrimitive.Button.Props & {
  /** A trailing cell inside the item: a count or a shortcut (mono when it is a <kbd> or a code). */
  affix?: React.ReactNode;
  /** Square cell for a glyph-only item. Give it aria-label; pair with a Tooltip for sighted users. */
  icon?: boolean;
  /** The one primary action of the row: the cobalt cell (commit signal). At most one per toolbar. It never moves into the overflow menu. */
  primary?: boolean;
  /** Button's signal: pending runs a segment along the bottom keyline (busy, still focusable); done inserts a ✓ cell; failed a ! cell at the start. */
  signal?: Signal;
  /** The item's name as a row of the overflow menu, when its text is not enough (a glyph item uses aria-label). */
  overflowLabel?: React.ReactNode;
};

/** A command cell (Base UI Toolbar.Button). Contents travel 1px on press (Key); the cell never floods: an action holds no state. */
function ToolbarButton({
  className,
  affix,
  icon,
  primary,
  signal,
  overflowLabel,
  disabled,
  hidden,
  children,
  ref: refProp,
  ...props
}: ToolbarButtonProps): React.ReactElement {
  const { orientation } = React.useContext(ToolbarCtx);
  const pending = signal === "pending";
  const fold = useFoldItem({
    type: "button",
    label: labelOf({ overflowLabel, icon, children, "aria-label": props["aria-label"] }),
    affix,
    disabled: !!disabled || pending,
  });
  const setRef = useMergedRef(fold.ref as React.RefObject<HTMLButtonElement | null>, refProp);
  return (
    <ToolbarPrimitive.Button
      ref={setRef}
      data-kl-tb-item=""
      data-kl-icon={icon ? "" : undefined}
      data-kl-primary={primary ? "" : undefined}
      data-signal={signal == null || signal === "idle" ? undefined : signal}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      hidden={fold.hidden || hidden}
      className={resolveClassName(
        cn("kl-key", itemVariants({ orientation, icon: !!icon, primary: !!primary })),
        className,
      )}
      {...props}
      data-slot="toolbar-button"
    >
      <ItemLabel affix={affix} signal={signal} icon={icon}>
        {children}
      </ItemLabel>
    </ToolbarPrimitive.Button>
  );
}

/** In a toggle group: whether it is exclusive (a choice the band covers) or multiple (independent toggles). */
const ToggleGroupCtx = React.createContext<{ exclusive: boolean } | null>(null);

type ToolbarToggleProps = Toggle.Props & {
  icon?: boolean;
  affix?: React.ReactNode;
  disabled?: boolean;
  /** The toggle's name as a checkbox row of the overflow menu, when its text is not enough. */
  overflowLabel?: React.ReactNode;
};

/**
 * A toggle cell: Base UI Toggle rendered as a toolbar item, so it joins the row's arrow-key order.
 * On its own or in a multiple ToolbarToggleGroup it is independent state: it floods yellow from the press
 * point and carries a lamp (as ToggleGroup's cells do). In an exclusive group (multiple={false}) it is a
 * choice among options: no lamp, and the group's ink band stretches to it (as Segmented's does).
 */
function ToolbarToggle({
  className,
  icon,
  affix,
  children,
  disabled,
  overflowLabel,
  pressed: pressedProp,
  defaultPressed,
  onPressedChange,
  hidden,
  render,
  ref: refProp,
  ...props
}: ToolbarToggleProps): React.ReactElement {
  const { orientation } = React.useContext(ToolbarCtx);
  const group = React.useContext(ToggleGroupCtx);
  const exclusive = !!group?.exclusive;
  // on its own, its state is kept here (controlled or not), so the overflow menu's checkbox row can show it
  const [own, setOwn] = React.useState(!!defaultPressed);
  const pressed = pressedProp ?? own;
  const label = labelOf({ overflowLabel, icon, children, "aria-label": props["aria-label"] });
  const fold = useFoldItem(
    group
      ? { type: "option", value: String(props.value ?? ""), label, affix, disabled: !!disabled }
      : { type: "toggle", label, affix, disabled: !!disabled, pressed },
  );
  const setRef = useMergedRef(fold.ref as React.RefObject<HTMLButtonElement | null>, refProp);
  const own_ = group
    ? {}
    : {
        pressed,
        onPressedChange: (v: boolean, d: Toggle.ChangeEventDetails) => {
          setOwn(v);
          onPressedChange?.(v, d);
        },
      };
  return (
    <ToolbarPrimitive.Button
      disabled={disabled}
      render={
        <Toggle
          ref={setRef}
          render={render}
          data-kl-tb-item=""
          data-kl-icon={icon ? "" : undefined}
          data-kl-item={exclusive ? "" : undefined}
          hidden={fold.hidden || hidden}
          className={resolveClassName(
            cn("kl-key", itemVariants({ orientation, icon: !!icon }), exclusive ? choiceToggle : floodToggle),
            className,
          )}
          {...(exclusive ? null : floodHandlers)}
          {...(group ? { onPressedChange } : null)}
          {...own_}
          {...props}
          data-slot="toolbar-toggle"
        />
      }
    >
      {exclusive ? (
        <ItemLabel affix={affix} icon={icon}>
          {children}
        </ItemLabel>
      ) : (
        <ItemLabel affix={affix} icon={icon}>
          {icon ? null : (
            <span
              className="kl-lamp group-data-pressed/toolbar-item:border-[5px]"
              data-slot="toolbar-lamp"
              aria-hidden
            />
          )}
          {children}
        </ItemLabel>
      )}
    </ToolbarPrimitive.Button>
  );
}

type ToolbarToggleGroupProps = Omit<ToggleGroupPrimitive.Props, "value" | "defaultValue" | "onValueChange"> & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[], eventDetails: ToggleGroupPrimitive.ChangeEventDetails) => void;
};

/**
 * Toggles that belong together (Base UI ToggleGroup inside the toolbar's focus order). `multiple` (default
 * true): independent toggles, each floods. multiple={false}: an exclusive choice (alignment, view), the ink
 * band stretches between cells, leading edge first, zero bounce.
 */
function ToolbarToggleGroup({
  className,
  multiple = true,
  value,
  defaultValue,
  onValueChange,
  children,
  disabled,
  hidden,
  ref: refProp,
  ...props
}: ToolbarToggleGroupProps): React.ReactElement {
  const { orientation } = React.useContext(ToolbarCtx);
  const ref = React.useRef<HTMLDivElement>(null);
  const [inner, setInner] = React.useState<string[]>(defaultValue ?? []);
  const current = value ?? inner;
  const fold = useFoldItem({
    type: "toggle-group",
    label: props["aria-label"] ?? null,
    multiple,
    value: current,
    disabled: !!disabled,
  });
  const setRef = useMergedRef(ref, refProp);
  const setBoth = React.useCallback(
    (n: HTMLDivElement | null) => {
      setRef(n);
      fold.ref.current = n;
    },
    [setRef, fold.ref],
  );
  const values = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((c) => (c.props as { value?: string }).value);
  useStretch(ref, multiple ? -1 : values.indexOf(current[0]), { axis: orientation === "vertical" ? "y" : "x" });
  const groupCtx = React.useMemo(() => ({ exclusive: !multiple }), [multiple]);
  return (
    <ToggleGroupCtx.Provider value={groupCtx}>
      <ToggleGroupPrimitive
        ref={setBoth}
        data-kl-stretch={multiple ? undefined : ""}
        multiple={multiple}
        value={current}
        disabled={disabled}
        hidden={fold.hidden || hidden}
        onValueChange={(v, d) => {
          setInner(v as string[]);
          onValueChange?.(v as string[], d);
        }}
        className={resolveClassName(cn(groupVariants({ orientation }), !multiple && "relative isolate"), className)}
        {...props}
        data-slot="toolbar-toggle-group"
      >
        {multiple ? null : (
          <span
            data-kl-band=""
            data-slot="toolbar-band"
            className="pointer-events-none absolute -z-1 bg-kl-inverse forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none"
            aria-hidden
            hidden
          />
        )}
        {children}
      </ToggleGroupPrimitive>
    </ToggleGroupCtx.Provider>
  );
}

/* A group: one control in the row (its outer edges are the row's 2px seams); its items share 1px seams. */
const groupVariants = cva("flex min-w-0 flex-none items-stretch", {
  variants: {
    orientation: {
      horizontal: "[&>:not([data-kl-band])+*]:border-s-(length:--kl-k1) [&>:not([data-kl-band])+*]:border-s-kl-seam",
      vertical:
        "flex-col [&>:not([data-kl-band])+*]:border-t-(length:--kl-k1) [&>:not([data-kl-band])+*]:border-t-kl-seam",
    },
  },
  defaultVariants: { orientation: "horizontal" },
});

/**
 * Items that belong together, drawn as one control (2px outer edges). With overflow="menu" its items move
 * into More one at a time, from the end, and appear there under the group's label; `keepTogether` moves
 * the group only as a whole (an alignment set, a pair that means nothing apart).
 */
function ToolbarGroup({
  className,
  keepTogether,
  hidden,
  ref: refProp,
  ...props
}: ToolbarPrimitive.Group.Props & { keepTogether?: boolean }): React.ReactElement {
  const { orientation } = React.useContext(ToolbarCtx);
  const fold = useFoldItem({ type: "group", label: props["aria-label"] ?? null });
  const setRef = useMergedRef(fold.ref as React.RefObject<HTMLDivElement | null>, refProp);
  return (
    <ToolbarPrimitive.Group
      ref={setRef}
      data-kl-keep-together={keepTogether ? "" : undefined}
      hidden={fold.hidden || hidden}
      className={resolveClassName(cn(groupVariants({ orientation })), className)}
      {...props}
      data-slot="toolbar-group"
    />
  );
}

/** A 2px keyline between items, announced as a separator. Not needed between groups (they draw their own). */
function ToolbarSeparator({
  className,
  hidden,
  ref: refProp,
  ...props
}: ToolbarPrimitive.Separator.Props): React.ReactElement {
  const { orientation } = React.useContext(ToolbarCtx);
  const fold = useFoldItem({ type: "separator" });
  const setRef = useMergedRef(fold.ref as React.RefObject<HTMLDivElement | null>, refProp);
  return (
    <ToolbarPrimitive.Separator
      ref={setRef}
      orientation={orientation === "vertical" ? "horizontal" : "vertical"}
      hidden={fold.hidden || hidden}
      className={resolveClassName(
        orientation === "vertical"
          ? "h-0 flex-none self-stretch border-t-(length:--kl-k2) border-t-kl-line"
          : "w-0 flex-none self-stretch border-s-(length:--kl-k2) border-s-kl-line",
        className,
      )}
      {...props}
      data-slot="toolbar-separator"
    />
  );
}

/** An empty cell that takes the free space, pushing what follows to the end. Not focusable, not announced. */
function ToolbarSpacer({ render, className, style, ...props }: PartProps<"div", Record<string, never>>) {
  const state = {};
  return useRender({
    defaultTagName: "div",
    render,
    state,
    props: mergeProps<"div">(
      { "aria-hidden": true, className: resolveClassName("min-w-(--kl-gutter) flex-[1_1_0]", className)(state) },
      { style: resolveStyle(undefined, style)(state) },
      props,
      { "data-slot": "toolbar-spacer" } as React.ComponentProps<"div">,
    ),
  });
}

/** A link cell (Base UI Toolbar.Link): navigation, not a command. Underlined like a quiet button. */
function ToolbarLink({
  className,
  children,
  overflowLabel,
  hidden,
  ref: refProp,
  ...props
}: ToolbarPrimitive.Link.Props & { overflowLabel?: React.ReactNode }): React.ReactElement {
  const { orientation } = React.useContext(ToolbarCtx);
  const fold = useFoldItem({
    type: "link",
    label: labelOf({ overflowLabel, children, "aria-label": props["aria-label"] }),
    disabled: false,
    href: props.href,
    target: props.target,
    rel: props.rel,
    onClick: props.onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined,
  });
  const setRef = useMergedRef(fold.ref as React.RefObject<HTMLAnchorElement | null>, refProp);
  return (
    <ToolbarPrimitive.Link
      ref={setRef}
      data-kl-tb-item=""
      hidden={fold.hidden || hidden}
      className={resolveClassName(cn(itemVariants({ orientation })), className)}
      {...props}
      data-slot="toolbar-link"
    >
      <ItemLabel link>{children}</ItemLabel>
    </ToolbarPrimitive.Link>
  );
}

type ToolbarInputProps = ToolbarPrimitive.Input.Props & {
  /** Names the input for assistive technology. */
  label: string;
  /** A glyph leading the cell. */
  glyph?: React.ReactNode;
  /** Classes for the cell (the label element that holds the glyph and the input). `className`, `style` and `render`
   * are the input's (Base UI Toolbar.Input), as for every part. */
  cellClassName?: string;
};

/**
 * A text input cell (Base UI Toolbar.Input). Arrow keys move the caret; they leave the input for the
 * neighbouring item only at the text's ends. Its edge is the cell's (`kl-edge`, a 2px band on the
 * keylines), as the table search's is. `label` names it for assistive technology; `glyph` leads it.
 */
function ToolbarInput({ className, cellClassName, label, glyph, ...props }: ToolbarInputProps) {
  return (
    <label
      data-slot="toolbar-input-cell"
      className={cn(
        "kl-cell kl-edge min-h-0 min-w-32 flex-[1_1_12rem] text-kl-ink-2",
        "has-[input:disabled]:bg-(image:--kl-hatch) has-[input:disabled]:text-kl-dis",
        cellClassName,
      )}
    >
      {glyph ?? null}
      <span className="kl-sr">{label}</span>
      <ToolbarPrimitive.Input
        className={resolveClassName(
          cn(
            "m-0 min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 text-kl-ink [outline:0]",
            "font-(family-name:--kl-font) text-[14px] placeholder:text-kl-ink-3",
          ),
          className,
        )}
        {...props}
        data-slot="toolbar-input"
      />
    </label>
  );
}

type MenuTitleProps = MenuPrimitive.Trigger.Props & {
  icon?: boolean;
  affix?: React.ReactNode;
  primary?: boolean;
  signal?: Signal;
  caret?: boolean;
  "data-slot"?: string;
};

/* A menu title in the row (ToolbarMenuTrigger, and the More item): Base UI Menu.Trigger as a toolbar item. */
function MenuTitle({
  className,
  children,
  icon,
  disabled,
  affix,
  primary,
  signal,
  caret = !icon,
  "data-slot": slot = "toolbar-menu-trigger",
  render,
  ...props
}: MenuTitleProps) {
  const { orientation } = React.useContext(ToolbarCtx);
  const pending = signal === "pending";
  return (
    <ToolbarPrimitive.Button
      disabled={disabled || pending}
      render={
        <MenuPrimitive.Trigger
          render={render}
          data-kl-tb-item=""
          data-kl-icon={icon ? "" : undefined}
          data-kl-primary={primary ? "" : undefined}
          data-signal={signal == null || signal === "idle" ? undefined : signal}
          aria-busy={pending || undefined}
          className={resolveClassName(
            cn("kl-key", itemVariants({ orientation, icon: !!icon, primary: !!primary })),
            className,
          )}
          {...props}
          data-slot={slot}
        />
      }
    >
      <ItemLabel affix={affix} signal={signal} icon={icon} caret={caret}>
        {children}
      </ItemLabel>
      {caret ? (
        <span data-slot="toolbar-caret" className="flex items-center pe-[calc(var(--kl-inset)-2px)]" aria-hidden>
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      ) : null}
    </ToolbarPrimitive.Button>
  );
}

/**
 * A menu title in the row: Base UI Menu.Trigger rendered as a toolbar item, with a caret cell. Open, it is
 * the inverse cell; its menu docks to the toolbar's keyline under it (ToolbarMenuContent).
 * The toolbar's own Menu root is Base UI's: <ToolbarMenu><ToolbarMenuTrigger>…</ToolbarMenuTrigger><ToolbarMenuContent>…
 */
function ToolbarMenuTrigger({
  overflowLabel,
  hidden,
  ref: refProp,
  ...props
}: Omit<MenuTitleProps, "caret" | "data-slot"> & {
  /** A trailing cell before the caret: a count ("7/7") or a shortcut. */
  affix?: React.ReactNode;
  /** The row's one commit action opens a menu (Assign ▾): the cobalt cell. It never moves into the overflow menu. */
  primary?: boolean;
  overflowLabel?: React.ReactNode;
}): React.ReactElement {
  const fold = useFoldItem({
    type: "menu",
    label: labelOf({ overflowLabel, icon: props.icon, children: props.children, "aria-label": props["aria-label"] }),
    disabled: !!props.disabled,
  });
  const setRef = useMergedRef(fold.ref as React.RefObject<HTMLButtonElement | null>, refProp);
  return <MenuTitle ref={setRef} hidden={fold.hidden || hidden} {...props} />;
}

/**
 * The menu of a ToolbarMenuTrigger. Menu's surface and rows (MenuItem, MenuCheckboxItem, MenuRadioItem,
 * submenus from ./menu); its top border lies on the toolbar's bottom keyline at the toolbar's weight (2px
 * framed, 1px as a cell), so trigger and menu read as one shape. No cut. Carries the configuration of the
 * place it is written (cut, theme, density, motion, dir) into the portal.
 */
function ToolbarMenuContent({
  className,
  container,
  style,
  align = "start",
  children,
  ...props
}: React.ComponentProps<typeof MenuSurface> & {
  container?: MenuPrimitive.Portal.Props["container"];
  align?: "start" | "end";
}): React.ReactElement {
  const { layout, orientation } = React.useContext(ToolbarCtx);
  const [marker, scope, probe] = useKeylineScope(false, container);
  const weight = layout === "cell" ? 1 : 2;
  // in a folding toolbar the content registers what it holds, so a folded menu becomes a submenu of More. Its
  // scope marker sits beside the trigger in the row: that is how the two are paired.
  const ctx = React.useContext(FoldCtx);
  const id = React.useId();
  const anchor = React.useRef<HTMLSpanElement | null>(null);
  const markerRef = (marker.props as { ref: React.RefObject<HTMLSpanElement | null> }).ref;
  const setMarker = useMergedRef(anchor, markerRef);
  React.useLayoutEffect(() => {
    ctx?.registry.setContent(id, { anchor: anchor.current, children, container });
  });
  const registry = ctx?.registry;
  React.useLayoutEffect(() => () => registry?.deleteContent(id), [registry, id]);
  return (
    <>
      {React.cloneElement(marker as React.ReactElement<{ ref: React.Ref<HTMLSpanElement> }>, { ref: setMarker })}
      <MenuPrimitive.Portal container={container}>
        {probe}
        <MenuPrimitive.Positioner
          side={orientation === "vertical" ? (scope.dir === "rtl" ? "left" : "right") : "bottom"}
          align={align}
          sideOffset={0}
          collisionPadding={12}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <MenuSurface
            attachWeight={weight}
            className={resolveClassName("min-w-[max(13rem,var(--anchor-width))]", className)}
            style={style}
            {...props}
          >
            {children}
          </MenuSurface>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </>
  );
}

/** Base UI's part names: the toolbar is its Root. */
const ToolbarRoot = Toolbar;

export {
  Toolbar,
  ToolbarRoot,
  ToolbarButton,
  ToolbarToggle,
  ToolbarToggleGroup,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarSpacer,
  ToolbarLink,
  ToolbarInput,
  ToolbarMenuTrigger,
  ToolbarMenuContent,
  useInToolbar,
  type ToolbarProps,
  type ToolbarButtonProps,
  type ToolbarToggleProps,
  type ToolbarToggleGroupProps,
  type ToolbarInputProps,
};
// A toolbar menu is a Menu (its root, and its rows): re-exported so one import covers the toolbar's menus
export {
  Menu as ToolbarMenu,
  MenuItem as ToolbarMenuItem,
  MenuCheckboxItem as ToolbarMenuCheckboxItem,
  MenuRadioGroup as ToolbarMenuRadioGroup,
  MenuRadioItem as ToolbarMenuRadioItem,
  MenuSeparator as ToolbarMenuSeparator,
  MenuGroup as ToolbarMenuGroup,
  MenuGroupLabel as ToolbarMenuGroupLabel,
} from "./menu";
