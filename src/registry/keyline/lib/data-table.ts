/* ------------------------------------------------------------------ *
 * DATA TABLE: the pure half of `ui/data-table`. Column helpers between TanStack Table's state and Keyline's table
 * parts, and the filter model. Nothing here imports React or TanStack: the shapes are structural, so these run (and
 * are tested) in plain Node.
 * ------------------------------------------------------------------ */

import { nextSortList, type SortDirection, type SortList } from "./collection";

/* ---------------- sorting ---------------- */

/** One level of a TanStack sorting state: `{ id, desc }`. */
export type ColumnSort = { id: string; desc: boolean };

/** TanStack's sorting state as Keyline's sort list (`{ key, direction }`), level for level. */
export function toSortList(sorting: readonly ColumnSort[]): SortList {
  return sorting.map((s) => ({ key: s.id, direction: s.desc ? "descending" : "ascending" }));
}

/** Keyline's sort list as TanStack's sorting state. */
export function fromSortList(list: SortList): ColumnSort[] {
  return list.map((s) => ({ id: s.key, desc: s.direction === "descending" }));
}

/**
 * The sorting after a header press, in Keyline's cycle (nextSortList): a plain press makes the column the only sort
 * and runs first direction → the other → none; an additive press (Shift) adds it as a further level, flips it, then
 * drops it, keeping the other levels. `first` is "descending" for a column that reads high-to-low first (TanStack's
 * `sortDescFirst`).
 */
export function nextSorting(
  sorting: readonly ColumnSort[],
  id: string,
  { first = "ascending", additive = false }: { first?: SortDirection; additive?: boolean } = {},
): ColumnSort[] {
  return fromSortList(nextSortList(toSortList(sorting), id, { first, additive }));
}

/** What a sort header shows for column `id`: its direction, its 1-based place, and how many levels sort. */
export type SortLevel = { direction: SortDirection; priority: number; levels: number };

export function sortLevelOf(sorting: readonly ColumnSort[], id: string): SortLevel | null {
  const i = sorting.findIndex((s) => s.id === id);
  const level = sorting[i];
  return level ? { direction: level.desc ? "descending" : "ascending", priority: i + 1, levels: sorting.length } : null;
}

/**
 * The header's `aria-sort`. ARIA allows it on one header at a time, so only the first level carries a direction; a
 * later level has none (its button says its place in text, "sort 2 of 2"), and an unsorted column is "none".
 */
export function ariaSortOf(
  sorting: readonly ColumnSort[],
  id: string,
): "ascending" | "descending" | "none" | undefined {
  const level = sortLevelOf(sorting, id);
  if (!level) return "none";
  return level.priority === 1 ? level.direction : undefined;
}

/* ---------------- columns ---------------- */

/** What a column tells the Keyline parts, on TanStack's `columnDef.meta`. */
export type DataTableColumnMeta = {
  /** "end" for figures: the cell and its header align to the end, with tabular numerals. */
  align?: "end" | undefined;
};

/** The column's alignment from its meta (anything but "end" is the start). */
export function columnAlign(meta: unknown): "end" | undefined {
  return meta && typeof meta === "object" && (meta as DataTableColumnMeta).align === "end" ? "end" : undefined;
}

/* ---------------- pager ---------------- */

export type PageRange = {
  /** 1-based first row on the page; 0 when there are no rows */
  from: number;
  /** 1-based last row on the page */
  to: number;
  /** page count, at least 1 */
  pages: number;
  /** 0-based page, clamped into range */
  page: number;
};

/** The pager's range ("11–20 of 64") for a 0-based `pageIndex`, clamped to the last page. */
export function pageRange({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }, total: number): PageRange {
  const size = Math.max(1, pageSize);
  const pages = Math.max(1, Math.ceil(total / size));
  const page = Math.min(Math.max(0, pageIndex), pages - 1);
  return { from: total ? page * size + 1 : 0, to: Math.min(total, (page + 1) * size), pages, page };
}

/** The 2-digit row code the index column prints: the row's place across pages, from 01. */
export function rowCode(pageIndex: number, pageSize: number, index: number): string {
  return String(pageIndex * pageSize + index + 1).padStart(2, "0");
}

/* ---------------- selection ---------------- */

/** How many rows are selected, and how many of them the current filter hides (selection survives filtering). */
export function selectionScope(
  selection: Readonly<Record<string, boolean>>,
  visibleIds: readonly string[],
): { count: number; hidden: number } {
  const visible = new Set(visibleIds);
  let count = 0;
  let hidden = 0;
  for (const [id, on] of Object.entries(selection)) {
    if (!on) continue;
    count++;
    if (!visible.has(id)) hidden++;
  }
  return { count, hidden };
}

/* ---------------- filter model ---------------- */

/**
 * A column's filter value. One shape per kind of control:
 *   text   a search box: the value contains the text (case- and accent-insensitive)
 *   set    a multiselect or toggle group: the value is one of `values`
 *   range  a date range or a number range: the value is between `from` and `to`, both inclusive, either open
 */
export type DataTableFilter =
  | { kind: "text"; value: string }
  | { kind: "set"; values: readonly string[] }
  | { kind: "range"; from?: number | Date | null | undefined; to?: number | Date | null | undefined };

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase();

const comparable = (v: unknown): number | null =>
  v instanceof Date ? v.getTime() : typeof v === "number" && !Number.isNaN(v) ? v : null;

/** False when the filter filters nothing (empty text, an empty set, an open range), so it can be removed. */
export function isFilterActive(filter: DataTableFilter | null | undefined): filter is DataTableFilter {
  if (!filter) return false;
  if (filter.kind === "text") return filter.value.trim() !== "";
  if (filter.kind === "set") return filter.values.length > 0;
  return filter.from != null || filter.to != null;
}

/** A cell value's text for matching: strings, numbers, booleans and dates have one; null and objects do not. */
function textOf(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
  if (value instanceof Date) return value.toISOString();
  return null;
}

/** Whether a cell value passes its column's filter. An inactive filter passes everything. */
export function matchesFilter(value: unknown, filter: DataTableFilter | null | undefined): boolean {
  if (!isFilterActive(filter)) return true;
  const text = textOf(value);
  if (filter.kind === "text") return text != null && fold(text).includes(fold(filter.value.trim()));
  if (filter.kind === "set") return text != null && filter.values.includes(text);
  const v = comparable(value);
  if (v == null) return false;
  const from = comparable(filter.from);
  const to = comparable(filter.to);
  return (from == null || v >= from) && (to == null || v <= to);
}

/** The table's search box: some value of the row contains the text. An empty search passes every row. */
export function matchesSearch(values: readonly unknown[], search: string): boolean {
  const needle = fold(search.trim());
  if (!needle) return true;
  return values.some((v) => {
    const text = textOf(v);
    return text != null && fold(text).includes(needle);
  });
}

/**
 * A filter as a token's words (`field op value`): "Carrier is DHL", "Carrier is 3 carriers", "Text has lyon",
 * "ETA in 12–16 Nov". `formatValue` prints one set member or a range end (a carrier's label, a date); `noun` names
 * several set members. Null for an inactive filter, which shows no token.
 */
export function describeFilter(
  filter: DataTableFilter | null | undefined,
  {
    formatValue = String,
    noun = ["value", "values"],
  }: { formatValue?: (v: unknown) => string; noun?: readonly [string, string] } = {},
): { op: string; value: string } | null {
  if (!isFilterActive(filter)) return null;
  if (filter.kind === "text") return { op: "has", value: filter.value.trim() };
  if (filter.kind === "set") {
    const [only] = filter.values;
    return filter.values.length === 1 && only != null
      ? { op: "is", value: formatValue(only) }
      : { op: "is", value: `${filter.values.length} ${noun[1]}` };
  }
  if (filter.from != null && filter.to != null)
    return { op: "in", value: `${formatValue(filter.from)}–${formatValue(filter.to)}` };
  return filter.from != null
    ? { op: "from", value: formatValue(filter.from) }
    : { op: "to", value: formatValue(filter.to) };
}
