/* ------------------------------------------------------------------ *
 * TOOLBAR OVERFLOW
 * The logic behind Toolbar's overflow="menu": which elements of the row are items that can move into "More",
 * which of them leave for a given count, where More goes, and one step of the fit toward the row's size.
 *
 * Items are identified by their data-slot, read from the DOM, never by their React element type: an item wrapped
 * in a Tooltip, or rendered by a component of the caller's (a filter token that renders a ToolbarGroup), is still
 * the element with that slot, so it folds like any other. Everything here is pure: it takes elements (anything
 * with getAttribute) and measurements, and returns decisions. The hook that measures lives in ui/toolbar.tsx.
 * ------------------------------------------------------------------ */

/** What an element of the row does when the row is too narrow. unit: it can move into More. separator: it
 * leaves with the item after it. keep: it stays (the primary action, a text input, a spacer, anything that is
 * not a toolbar item). */
export type ItemKind = "unit" | "separator" | "keep";

/** The part of an element the classification reads. */
export interface SlotElement {
  getAttribute(name: string): string | null;
}

/** The slots of the parts that can move into More, as rows of its menu. */
export const FOLDING_SLOTS: ReadonlySet<string> = new Set([
  "toolbar-button",
  "toolbar-toggle",
  "toolbar-link",
  "toolbar-menu-trigger",
  "toolbar-group",
  "toolbar-toggle-group",
]);

const GROUP_SLOTS: ReadonlySet<string> = new Set(["toolbar-group", "toolbar-toggle-group"]);

/** Classifies an element of the row by its data-slot. The primary action (data-kl-primary) never moves. */
export function kindOf(el: SlotElement | null | undefined): ItemKind {
  const slot = el?.getAttribute("data-slot");
  if (slot === "toolbar-separator") return "separator";
  if (!el || !slot || !FOLDING_SLOTS.has(slot)) return "keep";
  return el.getAttribute("data-kl-primary") != null ? "keep" : "unit";
}

/** True for a group of items (ToolbarGroup, ToolbarToggleGroup). */
export function isGroup(el: SlotElement | null | undefined): boolean {
  const slot = el?.getAttribute("data-slot");
  return !!slot && GROUP_SLOTS.has(slot);
}

/**
 * Whether a group gives up its items one at a time. A ToolbarGroup does, unless it is keepTogether
 * (data-kl-keep-together) or holds anything that can't move on its own (a primary action, a text input, another
 * group, an element that is not an item). A toggle group never does: an exclusive choice is not split between
 * the row and the menu. `members` are the group's elements, in order.
 */
export function splits(group: SlotElement, members: readonly SlotElement[]): boolean {
  if (group.getAttribute("data-slot") !== "toolbar-group") return false;
  if (group.getAttribute("data-kl-keep-together") != null) return false;
  return members.length > 1 && members.every((m) => kindOf(m) === "unit" && !isGroup(m));
}

/** An element of the row, classified. `members` lists a splitting group's items (null otherwise). */
export interface RowItem<T> {
  el: T;
  kind: ItemKind;
  members: readonly T[] | null;
}

/** Where the More item goes: before the first element that left, or after a group that left in part. */
export type MorePlace<T> = { before: T } | { after: T };

export interface Fold<T> {
  /** The units in the order they leave from the end: a splitting group's items, or the item itself. */
  units: T[];
  /** Every element that is out of the row: units, groups whose items all left, and separators going with them. */
  folded: Set<T>;
  /** A splitting group with some of its items in the menu, or null. */
  partial: T | null;
  /** Where More goes, or null when nothing left. */
  more: MorePlace<T> | null;
}

/** The row with the last `count` units moved out (a unit is an item, or one item of a splitting group). */
export function fold<T>(items: readonly RowItem<T>[], count: number): Fold<T> {
  const units = items.flatMap((it) => (it.kind !== "unit" ? [] : it.members ? [...it.members] : [it.el]));
  const n = Math.max(0, Math.min(count, units.length));
  const out = new Set(units.slice(units.length - n));
  const folded = new Set<T>(out);
  let partial: T | null = null;
  for (const it of items) {
    if (it.kind !== "unit" || !it.members) continue;
    const gone = it.members.filter((m) => out.has(m)).length;
    if (gone === it.members.length) folded.add(it.el);
    else if (gone > 0) partial = it.el;
  }
  // a separator goes with the item after it
  for (let i = items.length - 2; i >= 0; i--) {
    const it = items[i]!;
    if (it.kind === "separator" && folded.has(items[i + 1]!.el)) folded.add(it.el);
  }
  let more: MorePlace<T> | null = null;
  if (n > 0) {
    const first = items.find((it) => folded.has(it.el));
    more = partial !== null ? { after: partial } : first ? { before: first.el } : null;
  }
  return { units, folded, partial, more };
}

/**
 * The rule for "too wide": the items stand out of the row by at least one layout unit (1/64px, the precision
 * browsers lay out in). Both sizes are fractional CSS pixels: the row's content box from its bounding rect, the
 * items as the sum of their rects. An overflow of half a pixel is real: the row would clip it and scroll by it (a
 * WebKit row measured 344.53px of items in a 344px row), so the last item leaves. Less than a layout unit is the
 * rounding of summing rects, not overflow. Integer sizes (clientWidth) are never compared with fractional ones:
 * clientWidth rounds the row, which is what once hid half a pixel of overflow or invented it.
 */
export const LAYOUT_UNIT = 1 / 64;

export function overflows(extent: number, available: number): boolean {
  return extent - available >= LAYOUT_UNIT;
}

/** Whether `need` pixels fit in `free`, by the same rule: a unit comes back only if it then doesn't overflow. */
export function fitsIn(need: number, free: number): boolean {
  return !overflows(need, free);
}

/** The step a fit last took toward more folded units, so the next pass doesn't undo it at the same size. */
export interface Blocked {
  count: number;
  available: number;
}

export interface FitInput {
  /** Units out of the row now. */
  count: number;
  /** Units in all. */
  total: number;
  /** The row's content size along its axis (fractional). */
  available: number;
  /** The items' total size along the axis (fractional). */
  extent: number;
  /** The free space: the row's size, less the items', plus what flexible items (an input) can still give up. */
  free: number;
  /** The space the next unit needs to come back (its last measured size, plus a group's edges, less More's size
   * when it is the last unit out); Infinity when it was never measured. */
  need: number;
  blocked: Blocked | null;
}

export interface FitStep {
  count: number;
  blocked: Blocked | null;
}

/**
 * One step of the fit: one more unit out while the items overflow, one back when the free space holds the next
 * one. A fold remembers the size it happened at (`blocked`), and no unit comes back until the row is wider than
 * that, so two passes can't alternate between the counts on either side of the fit.
 */
export function fitStep({ count, total, available, extent, free, need, blocked }: FitInput): FitStep {
  if (overflows(extent, available)) {
    return count < total ? { count: count + 1, blocked: { count, available } } : { count, blocked };
  }
  if (count === 0) return { count, blocked };
  if (blocked && blocked.count === count - 1 && available <= blocked.available) return { count, blocked };
  return fitsIn(need, free) ? { count: count - 1, blocked } : { count, blocked };
}
