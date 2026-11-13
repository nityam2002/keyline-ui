"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
import { ScrollArea } from "./scroll-area";
import { floodHandlers, tokenMs, usePresence } from "../lib/keyline-motion";
import { Checkbox } from "./checkbox";
import { Tabs, TabsList, TabsTab } from "./tabs";
import { Status } from "./status";
import { Empty } from "./empty";
import { ToolbarButton, ToolbarGroup, useInToolbar } from "./toolbar";
import {
  nextSort,
  sortOf,
  compareValues,
  nextSortList,
  sortLevel,
  compareBy,
  type Sort,
  type SortList,
  type SortDirection,
} from "../lib/collection";

/* ------------------------------------------------------------------ *
 * TABLE: presentational parts. Every part renders one element, takes `render`, a `className` and `style` that may
 * be functions of its state, and passes every other prop through; none holds state. The caller (or Data Table,
 * which wraps TanStack Table) owns sorting, selection, expansion and paging, and tells the parts through props
 * that become attributes:
 *   TableRow         data-selected, data-expanded
 *   TableSortHeader  data-sort ("ascending" | "descending"), aria-sort on the first level only
 *   TableHead/Cell   data-align="end" for figures
 * The frame stacks its rows as cells: views, toolbar, bulk bar, the scrolling grid, pager.
 * ------------------------------------------------------------------ */

type Align = "end" | undefined;
type NoState = Record<string, never>;
const NO_STATE: NoState = {};

/** The props useRender takes for a part Keyline renders: the caller's props, then the part's own, its slot last. */
function part<Tag extends keyof React.JSX.IntrinsicElements, State extends object>(
  tag: Tag,
  slot: string,
  base: string,
  state: State,
  { render, className, style, ...props }: PartProps<Tag, State>,
  own: Record<string, unknown> = {},
) {
  return {
    defaultTagName: tag,
    render,
    state,
    props: mergeProps<Tag>(
      props as never,
      {
        ...own,
        className: resolveClassName(base, className)(state),
        style: resolveStyle(undefined, style)(state),
        "data-slot": slot,
      } as never,
    ),
  };
}

/* ------------------------------------------------------------------ *
 * CLASSES
 * ------------------------------------------------------------------ */

/** the narrow TABLE (not a narrow viewport): the frame is its own size container, kl-tf */
const frame = "kl-frame kl-rows flex min-h-0 min-w-0 flex-col @container/kl-tf";

/** a row of the frame never grows or shrinks; the grid's scroller takes the frame's spare height */
const views = cn(
  "kl-cells min-h-[58px] flex-none",
  // the tabs scroll before the toolbar gives up its last cell, so "More" always stays in the row. The row reads its
  // own children and the tabs read --kl-tv-shrink: a :has() on the row's selector for the tabs would restyle the
  // whole document on every DOM change (see item.tsx)
  "[--kl-tv-shrink:0] has-[>[data-slot=table-views-end]>[data-slot=toolbar]]:[--kl-tv-shrink:1]",
);
const viewsEnd = cn(
  "ms-auto flex items-center gap-2.5 px-(--kl-inset)",
  // a cell Toolbar as the row's end: it stretches to the row's height and starts on the row's seam
  "has-[>[data-slot=toolbar]]:flex-[0_1_auto] has-[>[data-slot=toolbar]]:self-stretch",
  "has-[>[data-slot=toolbar]]:min-w-[calc(var(--kl-row)+var(--kl-k1))] has-[>[data-slot=toolbar]]:gap-0",
  "has-[>[data-slot=toolbar]]:border-s-(length:--kl-k1) has-[>[data-slot=toolbar]]:px-0",
  "has-[>[data-slot=toolbar]]:border-s-kl-seam",
  "*:data-[slot=toolbar]:min-h-0 *:data-[slot=toolbar]:self-stretch",
);

/** narrow: the filters stack, one per row, each on a seam (a filter token keeps its width) */
const toolbar = cn(
  "kl-cells min-h-(--kl-row) flex-none",
  "[@container_kl-tf_(max-width:560px)]:flex-wrap",
  "[@container_kl-tf_(max-width:560px)]:[&>:not([data-slot=filter-token])]:flex-[1_1_100%]",
  "[@container_kl-tf_(max-width:560px)]:*:max-w-none [@container_kl-tf_(max-width:560px)]:*:border-s-0",
  "[@container_kl-tf_(max-width:560px)]:[&>*+*]:border-t-(length:--kl-k1)",
  "[@container_kl-tf_(max-width:560px)]:[&>*+*]:border-t-kl-seam",
);

const search = "kl-cell kl-edge flex-[1_1_200px] cursor-text";
const searchInput = cn(
  "h-full min-w-0 flex-1 border-0 bg-transparent leading-[inherit] [font-weight:inherit] [font-style:inherit] outline-0",
  "font-(family-name:--kl-font) text-[15px] text-inherit",
  "placeholder:text-kl-ink-3 placeholder:opacity-100 [&::-webkit-search-cancel-button]:hidden",
);

const tokenWords = "[&_i]:text-kl-ink-2 [&_b]:font-(--kl-weight-display)";

/** narrow: count and scope on the first line, the actions under them on a seam */
const bulk = cn(
  "group/bulk kl-cells min-h-12 flex-none",
  "[:where(&>.kl-cell)]:font-(--kl-weight-strong) [:where(&>.kl-cell)]:whitespace-nowrap",
  "[:where(&>button.kl-cell:disabled,&>[data-disabled])]:cursor-not-allowed",
  "[:where(&>button.kl-cell:disabled,&>[data-disabled])]:text-kl-dis",
  // a cell Toolbar of actions: stretched to the bar, never grown; it ends on the frame's edge, which draws its last
  // item's end (no closing filler), and its measuring slack goes before its first item
  "*:data-[slot=toolbar]:min-h-0 *:data-[slot=toolbar]:grow-0 *:data-[slot=toolbar]:self-stretch",
  "*:data-[slot=toolbar]:last:justify-end",
  "[&>[data-slot=toolbar][data-slot=toolbar][data-slot=toolbar]:last-child]:after:content-none",
  "[@container_kl-tf_(max-width:560px)]:flex-wrap",
  "[@container_kl-tf_(max-width:560px)]:[&>[data-slot=table-bulk-scope]~:not([hidden])]:flex-[1_1_auto]",
  "[@container_kl-tf_(max-width:560px)]:[&>[data-slot=table-bulk-scope]~:not([hidden])]:border-t-(length:--kl-k1)",
  "[@container_kl-tf_(max-width:560px)]:[&>[data-slot=table-bulk-scope]~:not([hidden])]:border-t-kl-seam",
  "[@container_kl-tf_(max-width:560px)]:[&>[data-slot=table-bulk-scope]+:not([hidden])]:border-s-0",
  "[@container_kl-tf_(max-width:560px)]:[&>[data-slot=table-bulk-scope]+[hidden]+*]:border-s-0",
);
const bulkCount = cn(
  "kl-cell kl-flood min-w-[104px] gap-2.5 px-[calc(var(--kl-inset)+2px)]",
  "font-(--kl-weight-strong) whitespace-nowrap group-data-empty/bulk:text-kl-ink-3",
);
const bulkScope = cn(
  "kl-cell flex-1 flex-wrap gap-1.5 gap-y-0 text-[13px] font-(--kl-weight-strong) whitespace-nowrap",
  "[&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:p-0",
  "[&_button]:text-[13px] [&_button]:leading-[inherit] [&_button]:[font-style:inherit]",
  "[&_button]:font-(family-name:--kl-font) [&_button]:font-(--kl-weight-strong) [&_button]:text-kl-cobalt-text",
  "[&_button]:underline [&_button]:decoration-[1.5px] [&_button]:underline-offset-[3px]",
  "[@container_kl-tf_(max-width:560px)]:flex-[1_1_calc(100%-120px)]",
  "[@container_kl-tf_(max-width:560px)]:py-1.5 [@container_kl-tf_(max-width:560px)]:whitespace-normal",
);

/* The grid sits in the flow of a page, so only its inline axis is contained (a sideways swipe at the edge never
   becomes the browser's back gesture), as the Toolbar does. The block axis chains: a wheel or trackpad scroll over
   a table that cannot scroll that way, or has reached its edge, moves the page, and the table never rubber-bands on
   its own. Containing both axes is for overlays (Dialog, Drawer, Select), not for regions in the flow. */
const scroll = "min-h-0 flex-[1_1_auto] *:data-[slot=scroll-area-viewport]:[overscroll-behavior-inline:contain]";

const table = "kl-type w-full border-separate border-spacing-0 text-[14px]";

const row = cn(
  "cursor-default",
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus focus-visible:outline-solid",
  // the expand column is part of the row's tone
  "hover:not-data-selected:[&>:is([data-slot=table-cell],[data-slot=table-expand-cell])]:bg-kl-tint",
  "data-selected:[&>:is([data-slot=table-cell],[data-slot=table-expand-cell])]:bg-kl-yellow-row",
  "data-selected:hover:[&>:is([data-slot=table-cell],[data-slot=table-expand-cell])]:bg-[color-mix(in_oklab,var(--kl-yellow-row),var(--kl-ink)_6%)]",
  "data-expanded:[&>:is([data-slot=table-cell],[data-slot=table-expand-cell])]:border-b-kl-line",
  // useRowMotion: the leading edge of an opening (returning rows) is the keyline the row below carries on its top
  "data-kl-opening:*:[box-shadow:inset_0_var(--kl-k1)_var(--kl-line-soft)]",
  "forced-colors:data-selected:[&>[data-slot=table-cell]:nth-child(2)]:underline",
  "forced-colors:data-selected:[&>[data-slot=table-cell]:nth-child(2)]:decoration-2",
);

/** a header cell: sticky to the scroller's top, on a seam from the header cell before it */
const head = cn(
  "sticky top-0 z-2 h-[34px] border-b-(length:--kl-k1) border-b-kl-line bg-kl-cell px-(--kl-inset) py-0",
  "text-start text-[12px] font-(--kl-weight-strong) whitespace-nowrap text-kl-ink-2",
  "[:is([data-slot=table-head],[data-slot=table-sort-header])+&]:border-s-(length:--kl-k1)",
  "[:is([data-slot=table-head],[data-slot=table-sort-header])+&]:border-s-kl-line-soft",
  "data-[align=end]:text-end data-[align=end]:tabular-nums [&_.kl-code]:ms-1",
);

/* SORTABLE HEADER: the button fills the header cell; the sorted column's header carries an ink band laid on its
   bottom keyline (the border turns ink and an inset shadow thickens it upward, so nothing moves). A later sort
   level keeps the seam weight, so the first level reads as the order. */
const sortHeader = cn(
  head,
  "p-0 data-sort:border-b-kl-inverse data-sort:text-kl-ink",
  "data-sort:shadow-[inset_0_calc(var(--kl-k1)-var(--kl-k2))_0_var(--kl-inverse)]",
  "data-kl-level:not-data-[kl-level=1]:shadow-none",
  "forced-colors:data-sort:border-b-[CanvasText] forced-colors:data-sort:underline",
  "forced-colors:data-sort:decoration-2 forced-colors:data-sort:shadow-none",
);
const sortButton = cn(
  "m-0 box-border flex h-full min-h-[34px] w-full cursor-pointer items-center gap-1.5 border-0 bg-transparent px-(--kl-inset) py-0",
  "[text-align:inherit] leading-[inherit] [font-weight:inherit] text-inherit [font-style:inherit]",
  "hover:bg-kl-tint hover:text-kl-ink active:*:translate-y-px",
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus focus-visible:outline-solid",
  "in-data-[align=end]:flex-row-reverse in-data-[align=end]:justify-start",
);
/* the mark is two triangles: both open when unsorted, one filled when sorted (the other a faint outline), so the
   direction is a shape, not a colour, and the glyph never moves */
const sortMark = "group/sort grid flex-none place-items-center data-[dir=none]:text-kl-ink-3";
const sortPath = cn(
  "fill-none stroke-current [stroke-width:1.25] [stroke-linejoin:miter]",
  "forced-colors:stroke-[CanvasText] forced-colors:[forced-color-adjust:none]",
);
const sortUp = cn(
  sortPath,
  "group-data-[dir=ascending]/sort:fill-current group-data-[dir=descending]/sort:stroke-kl-ink-3",
  "forced-colors:group-data-[dir=ascending]/sort:fill-[CanvasText]",
);
const sortDown = cn(
  sortPath,
  "group-data-[dir=ascending]/sort:stroke-kl-ink-3 group-data-[dir=descending]/sort:fill-current",
  "forced-colors:group-data-[dir=descending]/sort:fill-[CanvasText]",
);

const cell = cn(
  "h-(--kl-row) border-b-(length:--kl-k1) border-b-kl-line-soft px-(--kl-inset) py-0 whitespace-nowrap",
  "[[data-slot=table-cell]+&]:border-s-(length:--kl-k1) [[data-slot=table-cell]+&]:border-s-kl-line-soft",
  "data-[align=end]:text-end data-[align=end]:tabular-nums",
  // a button in a body cell nearly fills the row: an outside ring would cross the row keylines (and the scroller clips it
  // in the last row), so like every cell it takes the inset ring
  "[&_[data-slot=button]:focus-visible]:outline-offset-(--kl-ring-in)",
);

const caption = "caption-top px-(--kl-inset) py-2 text-start text-[13px] text-kl-ink-2";

/** the index column: the ink spine. Its flood owns the selected fill, so the cell's own fill is set only while off. */
const indexCell = cn(
  "group/ix kl-flood w-[72px] border-e-(length:--kl-k1) border-b-(length:--kl-k1) border-e-kl-line",
  "border-b-kl-line-soft p-0 align-top not-data-kl-on:bg-kl-cell",
);
const indexHead = "sticky top-0 z-3 border-b-kl-line align-middle";
/* KEY: pressing anywhere in the cell presses its checkbox (an empty box darkens, a tick travels 1px) */
const indexLabel = cn(
  "flex h-(--kl-row) min-h-[34px] cursor-pointer items-center gap-2.5 px-3",
  "active:[&_[data-slot=checkbox]:not([data-disabled],[data-checked],[data-indeterminate])]:bg-kl-press",
  "active:[&_[data-slot=checkbox]:not([data-disabled])>[data-slot=checkbox-indicator]]:translate-y-px",
);
const indexCode = "kl-code group-data-kl-on/ix:font-(--kl-weight-strong) group-data-kl-on/ix:text-inherit";

const expandCell = cn(
  "w-11 border-b-(length:--kl-k1) border-b-kl-line-soft p-0",
  "[[data-slot=table-cell]+&]:border-s-(length:--kl-k1) [[data-slot=table-cell]+&]:border-s-kl-line-soft",
);
/* the cell's width is only a hint in auto table layout: when the table overflows its scroller the column would
   shrink to the glyph. A minimum on the button is the column's minimum content width, which layout keeps. A button
   nearly filling the row takes the inset ring, so it never crosses the row's keyline. */
const expandButton = cn(
  "group/xp grid h-(--kl-row) w-full min-w-11 cursor-pointer place-items-center border-0 bg-transparent text-kl-ink-2",
  "hover:bg-kl-tint hover:text-kl-ink active:bg-kl-press active:text-kl-ink active:*:translate-y-px",
  "focus-visible:outline-offset-(--kl-ring-in) aria-expanded:text-kl-ink",
);
const expandGlyph = cn(
  "[transition:rotate_var(--kl-t-unfold)_var(--kl-ease-out)] group-aria-expanded/xp:[rotate:90deg]",
  "kl-rtl:[scale:-1_1] kl-rtl:group-aria-expanded/xp:[rotate:-90deg]",
);

const detailCell = "border-b-(length:--kl-k1) border-b-kl-seam bg-kl-paper p-0 whitespace-normal";

const loadingBar = cn(
  "relative block h-2.5 overflow-hidden border-(length:--kl-k1) border-kl-line-soft bg-kl-tint",
  "after:absolute after:inset-y-0 after:left-0 after:w-[30%] after:bg-kl-line-soft after:content-['']",
  "after:animate-[kl-run-30_1100ms_linear_infinite_var(--kl-run-dir,normal)]",
  "in-data-[kl-motion=reduce]:after:hidden in-data-[kl-motion=reduce]:after:animate-none",
  "motion-reduce:after:hidden motion-reduce:after:animate-none",
);

const pager = "kl-cells min-h-12 flex-none [&_.kl-count]:text-[20px]";
const pageButton = "kl-cell kl-key w-11 flex-none justify-center text-[20px]";
const pageGlyph = "inline-block kl-rtl:[scale:-1_1]";

/* ------------------------------------------------------------------ *
 * FRAME
 * ------------------------------------------------------------------ */

/** The table is one region frame. Views, toolbar, bulk bar, the grid and the pager are rows stacked inside it. */
function TableFrame(props: PartProps<"section", NoState>): React.ReactElement {
  return useRender(part("section", "table-frame", frame, NO_STATE, props));
}

type View = { value: string; label: React.ReactNode; count?: React.ReactNode };
type TableViewsProps = Omit<PartProps<"div", NoState>, "onChange"> & {
  views: View[];
  value: string;
  onValueChange: (value: string) => void;
  /** the tab list's name */
  label?: string;
};

/** The table's view tabs (built on Tabs, so keyboard and aria come from Base UI), then an end slot. */
function TableViews({
  views: items,
  value,
  onValueChange,
  label = "Views",
  children,
  ...props
}: TableViewsProps): React.ReactElement {
  const content = (
    <>
      <Tabs
        value={value}
        onValueChange={(v) => onValueChange(v as string)}
        className="flex flex-[0_var(--kl-tv-shrink,0)_auto] gap-0"
      >
        <TabsList
          layout="cell"
          aria-label={label}
          className="bg-transparent [&>[data-orientation][data-orientation]]:min-w-[112px]"
        >
          {items.map((v) => (
            <TabsTab key={v.value} value={v.value} count={v.count}>
              {v.label}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      {children ? (
        <div data-slot="table-views-end" className={viewsEnd}>
          {children}
        </div>
      ) : null}
    </>
  );
  return useRender(part("div", "table-views", views, NO_STATE, { ...props, children: content }));
}

/**
 * The filter row: search and pickers (Multiselect, DateRangePicker) side by side as cells. It is a named group, not
 * a Toolbar, on purpose: a combobox and a picker own their arrow keys (to move in the text, to open and walk the
 * list), so they cannot be items of a one-Tab-stop toolbar. Rows of plain commands and toggles are: the views row's
 * end, the status row and the bulk bar's actions take a cell Toolbar, and a FilterToken inside a Toolbar becomes a
 * pair of toolbar items.
 */
function TableToolbar(props: PartProps<"div", NoState>): React.ReactElement {
  return useRender(part("div", "table-toolbar", toolbar, NO_STATE, props, { role: "group" }));
}

type TableSearchProps = Omit<React.ComponentProps<"input">, "type"> & {
  /** the field's name, read but not shown */
  label?: string;
  /** classes for the cell around the input; `className` goes to the input */
  cellClassName?: string;
};

/** A search field as a cell of the toolbar. `className`, `ref` and the input's props go to the input. */
function TableSearch({ className, cellClassName, label = "Search", ...props }: TableSearchProps): React.ReactElement {
  return (
    <label data-slot="table-search" className={cn(search, cellClassName)}>
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
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3.5 3.5" />
      </svg>
      <span className="kl-sr">{label}</span>
      <input type="search" {...props} className={cn(searchInput, className)} />
    </label>
  );
}

const RemoveGlyph = () => (
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
    <path d="m4.5 4.5 7 7m0-7-7 7" />
  </svg>
);

/** A filter as a token: `field op value`, pressed to edit, with a remove cell. Inside a Toolbar it is a group of two
 *  toolbar items (one Tab stop for the row); elsewhere, two cells. */
function FilterToken({
  field,
  op,
  value,
  onRemove,
  onEdit,
  className,
}: {
  field: string;
  op: string;
  value: React.ReactNode;
  onRemove?: () => void;
  onEdit?: () => void;
  className?: string;
}): React.ReactElement {
  const inToolbar = useInToolbar();
  const editLabel = `Edit filter: ${field} ${op} ${typeof value === "string" ? value : ""}`.trim();
  const words = (
    <>
      <span className="kl-code">{field}</span>
      <i>{op}</i>
      <b>{value}</b>
    </>
  );
  if (inToolbar) {
    return (
      <ToolbarGroup
        keepTogether
        aria-label={`${field} filter`}
        data-kl-token=""
        className={cn(
          tokenWords,
          "[&_[data-kl-tb-item]:not([data-kl-token-x])]:font-normal [&_[data-slot=toolbar-label]]:gap-1.5",
          className,
        )}
      >
        <ToolbarButton onClick={onEdit} aria-label={editLabel}>
          {words}
        </ToolbarButton>
        {onRemove ? (
          <ToolbarButton icon data-kl-token-x="" onClick={onRemove} aria-label={`Remove ${field} filter`}>
            <RemoveGlyph />
          </ToolbarButton>
        ) : null}
      </ToolbarGroup>
    );
  }
  return (
    <div data-slot="filter-token" className={cn("kl-cells flex-none", tokenWords, className)}>
      <button
        type="button"
        className="kl-cell kl-key gap-1.5 whitespace-nowrap"
        onClick={onEdit}
        aria-label={`Edit filter: ${field} ${op} ${typeof value === "string" ? value : ""}`}
      >
        {words}
      </button>
      {onRemove ? (
        <button type="button" className="kl-cell px-2.5" onClick={onRemove} aria-label={`Remove ${field} filter`}>
          <RemoveGlyph />
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * BULK BAR: the working set
 * ------------------------------------------------------------------ */

type TableBulkBarState = { count: number };
type TableBulkBarProps = PartProps<"div", TableBulkBarState> & {
  /** how many rows are selected; 0 empties the bar (its count goes quiet) */
  count: number;
  /** what the selection covers ("3 of 64 on this page"), and the ways to widen or narrow it */
  scope?: React.ReactNode;
};

/** The bulk bar: the selected count (floods yellow while rows are selected), its scope, then the actions. Changes
 *  to it are announced politely. */
function TableBulkBar({ count, scope, children, ...props }: TableBulkBarProps): React.ReactElement {
  const content = (
    <>
      <div data-slot="table-bulk-count" className={bulkCount} data-kl-on={count > 0 ? "" : undefined}>
        <span className="kl-count text-[26px]">{count}</span>
        <span className="kl-code">SELECTED</span>
      </div>
      <div data-slot="table-bulk-scope" className={bulkScope}>
        {scope}
      </div>
      {children}
    </>
  );
  return useRender(
    part(
      "div",
      "table-bulk-bar",
      bulk,
      { count },
      { ...props, children: content },
      { "aria-live": "polite", "data-empty": count === 0 ? "" : undefined },
    ),
  );
}

/* ------------------------------------------------------------------ *
 * GRID
 * ------------------------------------------------------------------ */

/** The grid's scroller: a Keyline Scroll Area with both bars (wide tables scroll sideways inside their frame, never
 *  the page); the header cells stick to its viewport. */
function TableScroll({ className, children, ...props }: React.ComponentProps<typeof ScrollArea>): React.ReactElement {
  return (
    <ScrollArea data-slot="table-scroll" scrollbars="both" className={cn(scroll, className as string)} {...props}>
      {children}
    </ScrollArea>
  );
}

function Table(props: PartProps<"table", NoState>): React.ReactElement {
  return useRender(part("table", "table", table, NO_STATE, props));
}

function TableHeader(props: PartProps<"thead", NoState>): React.ReactElement {
  return useRender(part("thead", "table-header", "", NO_STATE, props));
}

function TableBody(props: PartProps<"tbody", NoState>): React.ReactElement {
  return useRender(part("tbody", "table-body", "", NO_STATE, props));
}

type TableRowState = { selected: boolean; expanded: boolean };
type TableRowProps = PartProps<"tr", TableRowState> & {
  /** writes data-selected: the row's cells take the selected fill */
  selected?: boolean;
  /** writes data-expanded: its detail row is open under it, so its cells end on a full keyline */
  expanded?: boolean;
};

function TableRow({ selected = false, expanded = false, ...props }: TableRowProps): React.ReactElement {
  return useRender(
    part("tr", "table-row", row, { selected, expanded }, props, {
      "data-selected": selected ? "" : undefined,
      "data-expanded": expanded ? "" : undefined,
    }),
  );
}

type TableHeadState = { align: Align };
type TableHeadProps = Omit<PartProps<"th", TableHeadState>, "align"> & {
  /** "end" for a column of figures: the label aligns with the numbers' edge */
  align?: Align;
};

/** A header cell. */
function TableHead({ align, ...props }: TableHeadProps): React.ReactElement {
  return useRender(part("th", "table-head", head, { align }, props, { "data-align": align }));
}

type TableSortHeaderState = { sort: SortDirection | null; priority: number | undefined };
type TableSortHeaderProps = Omit<PartProps<"th", TableSortHeaderState>, "align" | "onClick"> & {
  align?: Align;
  /** the column's direction, or null when it does not sort the table */
  sort: SortDirection | null;
  /** the header was pressed; `additive` is true when Shift was held (add the column as a further level) */
  onSort: (event: { additive: boolean }) => void;
  /** with several sort levels: this column's 1-based place */
  priority?: number;
  /** with several sort levels: how many columns sort */
  levels?: number;
};

/**
 * A sortable column header. The whole header cell is the button; aria-sort sits on the <th>. The direction is a
 * shape (▲ ascending, ▼ descending, both open when unsorted), and the sorted column's header carries an ink band on
 * its bottom keyline. End-aligned (numeric) columns put the mark before the label, so the label stays on the
 * numbers' edge. Use nextSort/sortOf from the collection lib for the cycle (ascending → descending → none).
 *
 * Several columns: pass `priority` (1-based) and `levels`. Each sorted header prints its place; `onSort` gets
 * `{ additive }`, true when Shift was held, for nextSortList. ARIA allows aria-sort on one header at a time, so only
 * the first level carries it; every sorted header's button also says its place ("sort 2 of 2, descending") in text.
 */
function TableSortHeader({
  align,
  sort,
  onSort,
  priority,
  levels,
  children,
  ...props
}: TableSortHeaderProps): React.ReactElement {
  const multi = sort != null && priority != null && (levels ?? 2) > 1;
  const ariaSort = sort == null ? "none" : multi && priority !== 1 ? undefined : sort;
  const content = (
    <button
      type="button"
      data-slot="table-sort-button"
      className={sortButton}
      onClick={(e) => onSort({ additive: e.shiftKey })}
    >
      <span data-slot="table-sort-label" className="min-w-0 overflow-hidden text-ellipsis">
        {children}
      </span>
      <span data-slot="table-sort-mark" className={sortMark} data-dir={sort ?? "none"} aria-hidden>
        <svg viewBox="0 0 12 16" width="10" height="14">
          <path className={sortUp} d="M6 1.5 10.5 7h-9z" />
          <path className={sortDown} d="M6 14.5 1.5 9h9z" />
        </svg>
      </span>
      {multi ? (
        <>
          <span className="kl-code" data-slot="table-sort-level" aria-hidden>
            {priority}
          </span>
          <span className="kl-sr">
            , sort {priority} of {levels ?? priority}, {sort}
          </span>
        </>
      ) : null}
    </button>
  );
  return useRender(
    part(
      "th",
      "table-sort-header",
      sortHeader,
      { sort, priority },
      { ...props, children: content },
      {
        "data-align": align,
        "data-sort": sort ?? undefined,
        "data-kl-level": multi ? priority : undefined,
        "aria-sort": ariaSort,
      },
    ),
  );
}

type TableCellProps = Omit<PartProps<"td", TableHeadState>, "align"> & {
  /** "end" for figures: aligned to the end, with tabular numerals */
  align?: Align;
};

/** A body cell. To make it the row's header, render it as one: `render={<th scope="row" />}`. */
function TableCell({ align, ...props }: TableCellProps): React.ReactElement {
  return useRender(part("td", "table-cell", cell, { align }, props, { "data-align": align }));
}

/** The table's caption: its name, read before its rows. Hide it with `className="kl-sr"` when a heading already
 *  shows the name. */
function TableCaption(props: PartProps<"caption", NoState>): React.ReactElement {
  return useRender(part("caption", "table-caption", caption, NO_STATE, props));
}

/** Index cell: selection checkbox + row code. Floods yellow from the press point when the row is selected. */
function TableIndexCell({
  checked,
  indeterminate,
  onCheckedChange,
  code,
  label,
  header,
  rowSpan,
  className,
}: {
  checked: boolean;
  indeterminate?: boolean;
  /** the new value; `eventDetails` is Base UI's checkbox change details (its `event` carries Shift) */
  onCheckedChange: (checked: boolean, eventDetails: Parameters<NonNullable<CheckboxChange>>[1]) => void;
  code?: React.ReactNode;
  label: string;
  header?: boolean;
  rowSpan?: number;
  className?: string;
}): React.ReactElement {
  const Tag = header ? "th" : "td";
  return (
    <Tag
      rowSpan={rowSpan}
      data-slot="table-index-cell"
      className={cn(indexCell, header && indexHead, className)}
      data-kl-on={checked && !header ? "" : undefined}
      {...floodHandlers}
    >
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- only stops the press reaching the row; the checkbox inside handles keys */}
      <label className={cn(indexLabel, header && "h-[34px]")} onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={(v, details) => onCheckedChange(!!v, details)}
          aria-label={label}
        />
        {code != null ? <span className={indexCode}>{code}</span> : null}
      </label>
    </Tag>
  );
}
type CheckboxChange = React.ComponentProps<typeof Checkbox>["onCheckedChange"];

/** The expand toggle column. `header` renders the column's header cell (labelled, empty); with neither, an empty
 *  cell keeps the column in a row that has no detail. */
function TableExpandCell(
  props:
    | { header: true; label?: string }
    | { header?: false; expanded: boolean; onToggle: () => void; label: string }
    | { header?: false; expanded?: undefined },
): React.ReactElement {
  if (props.header)
    return (
      <th data-slot="table-expand-cell" className={expandCell}>
        <span className="kl-sr">{props.label ?? "Expand"}</span>
      </th>
    );
  if (props.expanded === undefined) return <td data-slot="table-expand-cell" className={expandCell} />;
  const { expanded, onToggle, label } = props;
  return (
    <td data-slot="table-expand-cell" className={expandCell}>
      <button
        type="button"
        className={expandButton}
        aria-expanded={expanded}
        aria-label={label}
        onClick={(e) => (e.stopPropagation(), onToggle())}
      >
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="square"
          className={expandGlyph}
          aria-hidden
        >
          <path d="m6 4 4 4-4 4" />
        </svg>
      </button>
    </td>
  );
}

/**
 * Expanded detail. UNFOLDS from the row's bottom keyline; the row never moves. The parent row's index cell spans
 * this row (rowSpan=2 while `presence.mounted`), so object and detail share one index cell. The caller holds the
 * presence: `const presence = useDetailPresence(open)`.
 */
function TableDetail({
  presence,
  colSpan,
  children,
  id,
}: {
  presence: { mounted: boolean; shown: boolean };
  colSpan: number;
  children: React.ReactNode;
  id?: string;
}): React.ReactElement | null {
  if (!presence.mounted) return null;
  return (
    <tr data-slot="table-detail" id={id}>
      <td colSpan={colSpan} className={detailCell}>
        <div className="kl-unfold" data-open={presence.shown ? "" : undefined}>
          <div>{children}</div>
        </div>
      </td>
    </tr>
  );
}

/**
 * ROWS THAT LEAVE OR COME BACK. Put `ref` on TableBody and call `arm()` just before a change that removes rows or
 * puts them back (a cancellation, its Undo). On the next commit only:
 *   - the rows that stayed slide from where they were, so the gap a removal leaves closes (fold timing) and the room
 *     a returning row needs opens (unfold timing);
 *   - a returning row unfolds from the keyline above it, in step with the rows below it making room;
 *   - rows arriving at the end (from the next page) come up with the rows above them.
 * Nothing else moves: filtering, sorting and paging stay instant, because arm() is never called for them. Rows move
 * inside the table's scroller; the frame, header and pager never move. Reduced motion: instant.
 */
function useRowMotion() {
  const ref = React.useRef<HTMLTableSectionElement>(null);
  const armed = React.useRef<Map<Element, number> | null>(null);
  const arm = React.useCallback(() => {
    const body = ref.current;
    if (!body) return;
    const tops = new Map<Element, number>();
    for (const tr of Array.from(body.children)) tops.set(tr, tr.getBoundingClientRect().top);
    armed.current = tops;
  }, []);
  React.useLayoutEffect(() => {
    const before = armed.current;
    const body = ref.current;
    if (!before || !body) return;
    armed.current = null;
    const open = tokenMs(body, "--kl-t-unfold", 160);
    const close = tokenMs(body, "--kl-t-fold", 120);
    if (!open) return;
    const ease = getComputedStyle(body).getPropertyValue("--kl-ease-out").trim() || "ease-out";
    const rows = Array.from(body.children) as HTMLElement[];
    const boxes = rows.map((r) => r.getBoundingClientRect());
    const slide = (r: HTMLElement, dy: number) =>
      Math.abs(dy) > 0.5 &&
      r.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], {
        duration: dy > 0 ? close : open,
        easing: ease,
      });
    let carry = 0; // where the nearest row above that stayed was, relative to where it is now
    const stayed = (k: number) => {
      const r = rows[k];
      return r !== undefined && before.has(r);
    };
    for (let i = 0; i < rows.length;) {
      const row = rows[i];
      const box = boxes[i];
      if (!row || !box) break;
      const was = before.get(row);
      if (was != null) {
        carry = was - box.top;
        slide(row, carry);
        i++;
        continue;
      }
      // a run of rows that were not there: the room for the whole run opens as one, from the keyline above it
      let j = i;
      while (j < rows.length && !stayed(j)) j++;
      const next = rows[j];
      const runEnd = boxes[j - 1];
      if (next && runEnd) {
        const top = box.top;
        const H = runEnd.bottom - top;
        for (let k = i; k < j; k++) {
          const r = rows[k];
          const b = boxes[k];
          if (!r || !b) continue;
          const h = b.height;
          const o = Math.min(1, (b.top - top) / H);
          const e = Math.min(1, (b.bottom - top) / H);
          // carried with the row above; clipped where the opening has reached (top-anchored, like a fold)
          const at = (t: number, inset: number) => ({
            offset: t,
            transform: `translateY(${carry * (1 - t)}px)`,
            clipPath: `inset(0 0 ${inset}px 0)`,
          });
          r.animate([at(0, h), at(o, h), at(e, 0), at(1, 0)], { duration: open, easing: ease });
        }
        // the opening's leading edge is a keyline: the row below the run carries one on its top while it travels
        next.setAttribute("data-kl-opening", "");
        setTimeout(() => next.removeAttribute("data-kl-opening"), open);
      } else for (const r of rows.slice(i, j)) slide(r, carry); // arrived at the end (from the next page): up with the rows above
      i = j;
    }
  });
  return { ref, arm };
}

/** Presence for a row's detail (TableDetail's `presence`): the row keeps its merged index cell (rowSpan) until the
 *  fold finishes. */
const useDetailPresence = (open: boolean) => usePresence(open);

/* ------------------------------------------------------------------ *
 * STATES
 * ------------------------------------------------------------------ */

/** The table's empty or error row: an Empty (layout="cell") spanning the grid. Errors are announced. */
function TableState({
  kind,
  count,
  title,
  body,
  action,
  colSpan,
}: {
  kind: "empty" | "error";
  count: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  colSpan: number;
}): React.ReactElement {
  return (
    <tr data-slot="table-state">
      <td colSpan={colSpan} className="p-0">
        <Empty
          layout="cell"
          kind={kind}
          count={count}
          title={title}
          description={body}
          actions={action}
          live={kind === "error"}
          className="min-h-[240px] whitespace-normal"
        />
      </td>
    </tr>
  );
}

/** Rows standing in while data loads: hidden from assistive technology (the frame says it is busy). */
function TableLoadingRows({ rows = 8, cols }: { rows?: number; cols: number }): React.ReactElement {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <TableRow key={r} data-slot="table-loading-row" aria-hidden>
          {Array.from({ length: cols }, (_, c) =>
            c === 0 ? (
              <td key={c} className={cn(indexCell, "px-3 align-middle")}>
                <span className="kl-code">{String(r + 1).padStart(2, "0")}</span>
              </td>
            ) : (
              <TableCell key={c}>
                <span
                  data-slot="table-loading-bar"
                  className={loadingBar}
                  style={{ width: `${40 + ((r * 7 + c * 13) % 45)}%` }}
                />
              </TableCell>
            ),
          )}
        </TableRow>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * PAGER
 * ------------------------------------------------------------------ */

/** The pager row: cells for the range, the page and the page buttons. */
function TablePager(props: PartProps<"div", NoState>): React.ReactElement {
  return useRender(part("div", "table-pager", pager, NO_STATE, props));
}

/**
 * Range + previous / page / next as cells of the pager. `page` is 0-based. While data is not ready, pass
 * `total={null}`: the range and page count show "–" and the buttons are disabled (no stale numbers).
 */
function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  noun = "rows",
  children,
  className,
}: {
  page: number;
  pageSize: number;
  total: number | null;
  onPageChange: (page: number) => void;
  noun?: string;
  /** Fills the cell between the range and the buttons, e.g. <ToastDock />. */
  children?: React.ReactNode;
  className?: string;
}): React.ReactElement {
  const pages = total == null ? 0 : Math.max(1, Math.ceil(total / pageSize));
  const from = total ? page * pageSize + 1 : 0;
  const to = total == null ? 0 : Math.min(total, (page + 1) * pageSize);
  return (
    <TablePager className={className}>
      <span data-slot="table-range" className="kl-cell flex-none tabular-nums">
        {total == null ? (
          "–"
        ) : (
          <>
            <bdi>
              {from}–{to}
            </bdi>
            &nbsp;of&nbsp;<b>{total.toLocaleString()}</b>&nbsp;{noun}
          </>
        )}
      </span>
      {children ? (
        <div className="kl-cell flex min-w-0 flex-1 items-stretch p-0 *:flex-1">{children}</div>
      ) : (
        <span className="min-w-0 flex-1 p-0" />
      )}
      <button
        type="button"
        className={pageButton}
        disabled={total == null || page === 0}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <span className={pageGlyph} aria-hidden>
          ‹
        </span>
      </button>
      <span className="kl-cell kl-code flex-none" aria-live="polite">
        {total == null ? "–" : `${page + 1}/${pages}`}
      </span>
      <button
        type="button"
        className={pageButton}
        disabled={total == null || page >= pages - 1}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <span className={pageGlyph} aria-hidden>
          ›
        </span>
      </button>
    </TablePager>
  );
}

export {
  TableFrame,
  TableViews,
  TableToolbar,
  TableSearch,
  FilterToken,
  TableBulkBar,
  TableScroll,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableSortHeader,
  TableCell,
  TableCaption,
  TableIndexCell,
  useRowMotion,
  TableExpandCell,
  TableDetail,
  useDetailPresence,
  TableState,
  TableLoadingRows,
  TablePager,
  TablePagination,
  Status,
  nextSort,
  sortOf,
  compareValues,
  nextSortList,
  sortLevel,
  compareBy,
  type Sort,
  type SortList,
  type SortDirection,
  type TableBulkBarProps,
  type TableRowProps,
  type TableHeadProps,
  type TableSortHeaderProps,
  type TableCellProps,
};
