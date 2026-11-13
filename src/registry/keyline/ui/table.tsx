"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
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

/* ---------------- frame ---------------- */

/** The table is one region frame. Tabs, toolbar, bulk bar, grid and pager are cells stacked inside it. */
function TableFrame({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="table-frame" className={cn("kl-frame kl-rows kl-tf", className)} {...props} />;
}

/* ---------------- view tabs: location → cobalt band that stretches ---------------- */

type View = { value: string; label: React.ReactNode; count?: React.ReactNode };
/** The table's view tabs (built on Tabs, so keyboard and aria come from Base UI) plus an end slot. */
function TableViews({
  views,
  value,
  onValueChange,
  label = "Views",
  className,
  children,
}: {
  views: View[];
  value: string;
  onValueChange: (v: string) => void;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("kl-cells kl-tf-views", className)}>
      <Tabs value={value} onValueChange={(v) => onValueChange(v as string)} className="kl-tf-tabs-root">
        <TabsList layout="cell" aria-label={label} className="kl-tf-tabs">
          {views.map((v) => (
            <TabsTab key={v.value} value={v.value} count={v.count}>
              {v.label}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      {children ? <div className="kl-tf-views-end">{children}</div> : null}
    </div>
  );
}

/* ---------------- toolbar ---------------- */

/**
 * The filter row: search and pickers (Multiselect, DateRangePicker) side by side as cells. It is a named
 * group, not a Toolbar, on purpose: a combobox and a picker own their arrow keys (to move in the text, to
 * open and walk the list), so they cannot be items of a one-Tab-stop toolbar. Rows of plain commands and
 * toggles are: the views row's end, the status row and the bulk bar's actions take a cell Toolbar
 *, and a FilterToken inside a Toolbar becomes a pair of toolbar items.
 */
function TableToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="group" data-slot="table-toolbar" className={cn("kl-cells kl-tf-tools", className)} {...props} />;
}

function TableSearch({ className, label = "Search", ...props }: React.ComponentProps<"input"> & { label?: string }) {
  return (
    <label className={cn("kl-cell kl-edge kl-tf-search", className)}>
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
      <input type="search" {...props} />
    </label>
  );
}

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
}) {
  const inToolbar = useInToolbar();
  const editLabel = `Edit filter: ${field} ${op} ${typeof value === "string" ? value : ""}`.trim();
  if (inToolbar) {
    // in a Toolbar the token is a group of two items in the row's arrow-key order (one Tab stop)
    return (
      <ToolbarGroup keepTogether aria-label={`${field} filter`} className={cn("kl-tf-token kl-tf-token-tb", className)}>
        <ToolbarButton onClick={onEdit} aria-label={editLabel}>
          <span className="kl-code">{field}</span>
          <i>{op}</i>
          <b>{value}</b>
        </ToolbarButton>
        {onRemove ? (
          <ToolbarButton icon className="kl-tf-token-x" onClick={onRemove} aria-label={`Remove ${field} filter`}>
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
          </ToolbarButton>
        ) : null}
      </ToolbarGroup>
    );
  }
  return (
    <div className={cn("kl-cells kl-tf-token", className)}>
      <button
        type="button"
        className="kl-cell kl-key"
        onClick={onEdit}
        aria-label={`Edit filter: ${field} ${op} ${typeof value === "string" ? value : ""}`}
      >
        <span className="kl-code">{field}</span>
        <i>{op}</i>
        <b>{value}</b>
      </button>
      {onRemove ? (
        <button
          type="button"
          className="kl-cell kl-tf-token-x"
          onClick={onRemove}
          aria-label={`Remove ${field} filter`}
        >
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
        </button>
      ) : null}
    </div>
  );
}

/* ---------------- bulk bar: the working set ---------------- */

function TableBulkBar({
  count,
  scope,
  children,
  className,
}: {
  count: number;
  scope?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="table-bulk"
      data-empty={count === 0 || undefined}
      className={cn("kl-cells kl-tf-bulk", className)}
      aria-live="polite"
    >
      <div className="kl-cell kl-flood kl-tf-bulk-n" data-kl-on={count > 0 ? "" : undefined}>
        <span className="kl-count">{count}</span>
        <span className="kl-code">SELECTED</span>
      </div>
      <div className="kl-cell kl-tf-scope">{scope}</div>
      {children}
    </div>
  );
}

/* ---------------- grid ---------------- */

/** The grid's scroller: a Keyline Scroll Area with both bars (wide tables scroll sideways inside their
 *  frame, never the page); the sticky header sticks to its viewport. */
function TableScroll({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <ScrollArea
      data-slot="table-scroll"
      scrollbars="both"
      className={cn("kl-tf-scroll", className)}
      {...(props as object)}
    >
      {children}
    </ScrollArea>
  );
}
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <table data-slot="table" className={cn("kl-table", className)} {...props} />;
}
function TableHead(props: React.ComponentProps<"thead">) {
  return <thead {...props} />;
}
function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody {...props} />;
}
function TableRow({
  className,
  selected,
  expanded,
  ...props
}: React.ComponentProps<"tr"> & { selected?: boolean; expanded?: boolean }) {
  return (
    <tr
      data-selected={selected || undefined}
      data-expanded={expanded || undefined}
      className={cn("kl-tr", className)}
      {...props}
    />
  );
}
function TableHeaderCell({
  className,
  align,
  ...props
}: Omit<React.ComponentProps<"th">, "align"> & { align?: "end" }) {
  return <th data-align={align} className={cn("kl-th", className)} {...props} />;
}
/**
 * A sortable column header. The whole header cell is the button; aria-sort sits on the <th>.
 * The direction is a shape (▲ ascending, ▼ descending, an open ↕ when unsorted), and the sorted column's
 * header carries an ink band on its bottom keyline: the table's current order, a chosen state. End-aligned
 * (numeric) columns put the mark before the label, so the label stays on the numbers' edge. Use
 * nextSort/sortOf from the collection lib for the cycle (ascending → descending → none).
 *
 * Several columns: pass `priority` (1-based) and `levels` (how many columns sort). Each sorted
 * header prints its index; `onSort` gets `{ additive }`, true when Shift was held, for nextSortList.
 * ARIA allows aria-sort on one header at a time, so only the first level carries it; every sorted header's
 * button also says its place ("sort 2 of 2, descending") in text for assistive technology.
 */
function TableSortHeader({
  className,
  align,
  sort,
  onSort,
  priority,
  levels,
  children,
  ...props
}: Omit<React.ComponentProps<"th">, "align" | "onClick"> & {
  align?: "end";
  sort: SortDirection | null;
  onSort: (event: { additive: boolean }) => void;
  priority?: number;
  levels?: number;
}) {
  const multi = sort != null && priority != null && (levels ?? 2) > 1;
  const ariaSort = sort == null ? "none" : multi && priority !== 1 ? undefined : sort;
  return (
    <th
      data-align={align}
      data-sort={sort ?? undefined}
      data-kl-level={multi ? priority : undefined}
      aria-sort={ariaSort}
      className={cn("kl-th kl-th-sort", className)}
      {...props}
    >
      <button type="button" className="kl-th-btn" onClick={(e) => onSort({ additive: e.shiftKey })}>
        <span className="kl-th-label">{children}</span>
        <span className="kl-sort" data-dir={sort ?? "none"} aria-hidden>
          <svg viewBox="0 0 12 16" width="10" height="14">
            <path className="kl-sort-up" d="M6 1.5 10.5 7h-9z" />
            <path className="kl-sort-down" d="M6 14.5 1.5 9h9z" />
          </svg>
        </span>
        {multi ? (
          <>
            <span className="kl-code kl-sort-n" aria-hidden>
              {priority}
            </span>
            <span className="kl-sr">
              , sort {priority} of {levels ?? priority}, {sort}
            </span>
          </>
        ) : null}
      </button>
    </th>
  );
}

function TableCell({ className, align, ...props }: Omit<React.ComponentProps<"td">, "align"> & { align?: "end" }) {
  return <td data-align={align} className={cn("kl-td", className)} {...props} />;
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
  onCheckedChange: (v: boolean) => void;
  code?: React.ReactNode;
  label: string;
  header?: boolean;
  rowSpan?: number;
  className?: string;
}) {
  const Tag = header ? "th" : "td";
  return (
    <Tag
      rowSpan={rowSpan}
      className={cn("kl-ix kl-flood", className)}
      data-kl-on={checked && !header ? "" : undefined}
      {...floodHandlers}
    >
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- only stops the press reaching the row; the checkbox inside handles keys */}
      <label className="kl-ix-in" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={(v) => onCheckedChange(!!v)}
          aria-label={label}
        />
        {code != null ? <span className="kl-code">{code}</span> : null}
      </label>
    </Tag>
  );
}

/** The expand toggle column. `header` renders the column's header cell (labelled, empty). */
function TableExpandCell(
  props: { header: true; label?: string } | { header?: false; expanded: boolean; onToggle: () => void; label: string },
) {
  if (props.header) return <th className="kl-xp" aria-label={props.label ?? "Expand"} />;
  const { expanded, onToggle, label } = props;
  return (
    <td className="kl-xp">
      <button
        type="button"
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
          aria-hidden
        >
          <path d="m6 4 4 4-4 4" />
        </svg>
      </button>
    </td>
  );
}

/**
 * Expanded detail. UNFOLDS from the row's bottom keyline; the row never moves.
 * The parent row's index cell spans this row (rowSpan=2), so object and detail share one index cell.
 */
function TableDetail({
  open,
  presence,
  colSpan,
  children,
  id,
}: {
  open: boolean;
  presence?: { mounted: boolean; shown: boolean };
  colSpan: number;
  children: React.ReactNode;
  id?: string;
}) {
  const ref = React.useRef<HTMLTableRowElement>(null);
  const own = usePresence(open, ref);
  // Pass `presence` (from useDetailPresence) when the parent row must know the detail is still mounted, e.g. to keep rowSpan=2 while it folds back.
  const { mounted, shown } = presence ?? own;
  if (!mounted) return null;
  return (
    <tr ref={ref} className="kl-tr-detail" id={id}>
      <td colSpan={colSpan}>
        <div className="kl-unfold" data-open={shown ? "" : undefined}>
          <div>{children}</div>
        </div>
      </td>
    </tr>
  );
}

/**
 * ROWS THAT LEAVE OR COME BACK. Put `ref` on TableBody and call `arm()` just before a change that
 * removes rows or puts them back (a cancellation, its Undo). On the next commit only:
 *   - the rows that stayed slide from where they were, so the gap a removal leaves closes (fold timing) and
 *     the room a returning row needs opens (unfold timing);
 *   - a returning row unfolds from the keyline above it, in step with the rows below it making room;
 *   - rows arriving at the end (from the next page) come up with the rows above them.
 * Nothing else moves: filtering, sorting and paging stay instant, because arm() is never called for them.
 * Rows move inside the table's scroller; the frame, header and pager never move. Reduced motion: instant.
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

/** Presence for a row's detail, so the row can keep its merged index cell (rowSpan) until the fold finishes. */
const useDetailPresence = (open: boolean) => usePresence(open);

/* ---------------- states ---------------- */

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
}) {
  return (
    <tr className="kl-tr-state">
      <td colSpan={colSpan}>
        <Empty
          layout="cell"
          kind={kind}
          count={count}
          title={title}
          description={body}
          actions={action}
          live={kind === "error"}
          className="kl-tf-state"
        />
      </td>
    </tr>
  );
}

function TableLoadingRows({ rows = 8, cols }: { rows?: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="kl-tr kl-tr-skel" aria-hidden>
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className={c === 0 ? "kl-ix" : "kl-td"}>
              {c === 0 ? (
                <span className="kl-code">{String(r + 1).padStart(2, "0")}</span>
              ) : (
                <span className="kl-skel" style={{ width: `${40 + ((r * 7 + c * 13) % 45)}%` }} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ---------------- pager ---------------- */

function TablePager({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="table-pager" className={cn("kl-cells kl-tf-pager", className)} {...props} />;
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
  /** Fills the cell between the range and the buttons, e.g. <ToastDock />. */ children?: React.ReactNode;
  className?: string;
}) {
  const pages = total == null ? 0 : Math.max(1, Math.ceil(total / pageSize));
  const from = total ? page * pageSize + 1 : 0;
  const to = total == null ? 0 : Math.min(total, (page + 1) * pageSize);
  return (
    <TablePager className={className}>
      <span className="kl-cell kl-tf-range">
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
      {children ? <div className="kl-cell kl-tf-dock">{children}</div> : <span className="kl-tf-gap" />}
      <button
        type="button"
        className="kl-cell kl-key kl-tf-pg"
        disabled={total == null || page === 0}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <span aria-hidden>‹</span>
      </button>
      <span className="kl-cell kl-code kl-tf-pgn" aria-live="polite">
        {total == null ? "–" : `${page + 1}/${pages}`}
      </span>
      <button
        type="button"
        className="kl-cell kl-key kl-tf-pg"
        disabled={total == null || page >= pages - 1}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <span aria-hidden>›</span>
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
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableSortHeader,
  TableCell,
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
};
