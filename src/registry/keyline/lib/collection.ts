/* Pure helpers for collections shown in pages: the sort cycle of a column header, a locale-aware
   comparator, and the window of page numbers a pagination prints. No React, no DOM. */

export type SortDirection = "ascending" | "descending";
export type Sort<K extends string = string> = { key: K; direction: SortDirection } | null;

/**
 * The next sort when a column header is pressed. A new column starts ascending (or descending when the
 * column's natural first order is high-to-low, e.g. a date or an amount: pass `first: "descending"`).
 * Pressing the sorted column again flips it; a third press clears the sort when `clearable` (default),
 * otherwise it flips back. Headers stay predictable: three presses always return to where you began.
 */
export function nextSort<K extends string>(
  current: Sort<K>,
  key: K,
  { first = "ascending", clearable = true }: { first?: SortDirection; clearable?: boolean } = {},
): Sort<K> {
  if (!current || current.key !== key) return { key, direction: first };
  if (current.direction === first) return { key, direction: first === "ascending" ? "descending" : "ascending" };
  return clearable ? null : { key, direction: first };
}

/** The direction a header shows for `key` (null when the table is sorted by another column, or not at all). */
export const sortOf = <K extends string>(sort: Sort<K>, key: K): SortDirection | null =>
  sort && sort.key === key ? sort.direction : null;

/** A sort over several columns: the first entry orders the rows, each later one breaks the ties left by those before it. */
export type SortList<K extends string = string> = { key: K; direction: SortDirection }[];

/**
 * The next sort list when a column header is pressed.
 * - A plain press is the single-column cycle (nextSort) on the list's first level: the column becomes the
 *   only sort, flips if it was already first, and clears on the third press. Pressing never surprises
 *   someone who doesn't know about multi-sort.
 * - An additive press (Shift + press, or "Then by" in a menu) cycles that column inside the list and keeps
 *   its place: added last at its first direction, flipped, then removed. The other levels are untouched.
 */
export function nextSortList<K extends string>(
  current: SortList<K>,
  key: K,
  {
    first = "ascending",
    additive = false,
    clearable = true,
  }: { first?: SortDirection; additive?: boolean; clearable?: boolean } = {},
): SortList<K> {
  if (!additive) {
    const next = nextSort(current[0] ?? null, key, { first, clearable });
    return next ? [next] : [];
  }
  const i = current.findIndex((s) => s.key === key);
  const cur = current[i];
  if (!cur) return [...current, { key, direction: first }];
  if (cur.direction === first)
    return current.map((s, j) =>
      j === i ? { key, direction: first === "ascending" ? "descending" : "ascending" } : s,
    );
  return clearable
    ? current.filter((_, j) => j !== i)
    : current.map((s, j) => (j === i ? { key, direction: first } : s));
}

/** Where `key` sits in a sort list: its direction and its 1-based priority, or null when it doesn't sort. */
export function sortLevel<K extends string>(
  list: SortList<K>,
  key: K,
): { direction: SortDirection; priority: number } | null {
  const i = list.findIndex((s) => s.key === key);
  const level = list[i];
  return level ? { direction: level.direction, priority: i + 1 } : null;
}

/** A comparator for Array.prototype.sort over a sort list: compareValues level by level until one differs. */
export function compareBy<T, K extends string>(
  list: SortList<K>,
  value: (row: T, key: K) => unknown,
  locale?: string,
): (a: T, b: T) => number {
  return (a, b) => {
    for (const s of list) {
      const r = compareValues(value(a, s.key), value(b, s.key), s.direction, locale);
      if (r !== 0) return r;
    }
    return 0;
  };
}

const collators = new Map<string, Intl.Collator>();
/**
 * Compares two cell values for a sort: numbers and dates numerically, strings with a numeric-aware
 * collator in `locale` ("Box 9" before "Box 10"). null/undefined sort last in both directions.
 */
export function compareValues(a: unknown, b: unknown, direction: SortDirection = "ascending", locale?: string): number {
  const na = a == null || a === "";
  const nb = b == null || b === "";
  if (na || nb) return na === nb ? 0 : na ? 1 : -1;
  let r: number;
  if (typeof a === "number" && typeof b === "number") r = a - b;
  else if (a instanceof Date && b instanceof Date) r = a.getTime() - b.getTime();
  else {
    const id = locale ?? "";
    let c = collators.get(id);
    if (!c) collators.set(id, (c = new Intl.Collator(locale, { numeric: true, sensitivity: "base" })));
    // oxlint-disable-next-line typescript/no-base-to-string -- any other cell value sorts by its string form
    r = c.compare(String(a), String(b));
  }
  return direction === "ascending" ? r : -r;
}

export type PageSlot = number | "gap-start" | "gap-end";

/**
 * The page numbers a pagination prints for `page` (1-based) of `count`: always the first and last page,
 * `siblings` on each side of the current one, and a gap where pages are skipped. Once there are more pages
 * than fit, it always returns 2 × siblings + 5 slots, so the control keeps its width while you page.
 */
export function pageWindow(page: number, count: number, siblings = 1): PageSlot[] {
  if (count <= 0) return [];
  const p = Math.min(Math.max(1, page), count);
  const slots = 2 * siblings + 5;
  if (count <= slots) return Array.from({ length: count }, (_, i) => i + 1);
  const leftGap = p - siblings > 3;
  const rightGap = p + siblings < count - 2;
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  if (!leftGap) return [...range(1, 3 + 2 * siblings), "gap-end", count];
  if (!rightGap) return [1, "gap-start", ...range(count - 2 - 2 * siblings, count)];
  return [1, "gap-start", ...range(p - siblings, p + siblings), "gap-end", count];
}
