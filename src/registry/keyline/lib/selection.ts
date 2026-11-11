"use client";

import * as React from "react"

/* ------------------------------------------------------------------ *
 * SELECTION SCOPE
 * Records are selected by id, so a selection survives filtering, paging and sorting. The scope text
 * must always say how many selected records are NOT in the current results (they are still acted on).
 * Pure functions first (tested in isolation), then a small hook that wires them to React state.
 * ------------------------------------------------------------------ */

export type Id = string

export function toggle(sel: ReadonlySet<Id>, id: Id, on: boolean): Set<Id> {
  const n = new Set(sel)
  if (on) n.add(id)
  else n.delete(id)
  return n
}

export function setMany(sel: ReadonlySet<Id>, ids: Iterable<Id>, on: boolean): Set<Id> {
  const n = new Set(sel)
  for (const id of ids) on ? n.add(id) : n.delete(id)
  return n
}

/** Keep only selected ids that are in `ids` ("act on visible only"). */
export function restrictTo(sel: ReadonlySet<Id>, ids: Iterable<Id>): Set<Id> {
  const keep = new Set(ids)
  return new Set([...sel].filter((id) => keep.has(id)))
}

export type Scope = {
  /** selected, in total */
  count: number
  /** selected and in the current results */
  visible: number
  /** selected but filtered out of the current results */
  hidden: number
  /** every record on the page is selected / some are */
  page: "all" | "some" | "none"
  /** every record in the results is selected */
  allMatching: boolean
}

export function scopeOf(sel: ReadonlySet<Id>, matchingIds: readonly Id[], pageIds: readonly Id[]): Scope {
  const matching = new Set(matchingIds)
  let visible = 0
  for (const id of sel) if (matching.has(id)) visible++
  const onPage = pageIds.filter((id) => sel.has(id)).length
  return {
    count: sel.size,
    visible,
    hidden: sel.size - visible,
    page: pageIds.length && onPage === pageIds.length ? "all" : onPage ? "some" : "none",
    allMatching: matchingIds.length > 0 && visible === matchingIds.length,
  }
}

/** React state + derived scope. `matchingIds` = all filtered results; `pageIds` = the rows shown now. */
export function useSelection(matchingIds: readonly Id[], pageIds: readonly Id[], initial: Iterable<Id> = []) {
  const [selected, setSelected] = React.useState<Set<Id>>(() => new Set(initial))
  const scope = React.useMemo(() => scopeOf(selected, matchingIds, pageIds), [selected, matchingIds, pageIds])
  const actions = React.useMemo(
    () => ({
      toggle: (id: Id, on: boolean) => setSelected((s) => toggle(s, id, on)),
      setPage: (on: boolean) => setSelected((s) => setMany(s, pageIds, on)),
      selectAllMatching: () => setSelected((s) => setMany(s, matchingIds, true)),
      keepVisibleOnly: () => setSelected((s) => restrictTo(s, matchingIds)),
      clear: () => setSelected(new Set()),
      replace: (ids: Iterable<Id>) => setSelected(new Set(ids)),
    }),
    [pageIds, matchingIds],
  )
  return { selected, scope, ...actions }
}

/* ------------------------------------------------------------------ *
 * UNDO BY SNAPSHOT
 * Undo restores each record's OWN previous value (not one shared value), and reinserts removed
 * records at their original positions.
 * ------------------------------------------------------------------ */

/** Apply `patch` to the records in `ids`; returns the new list and an undo function over a later list. */
export function patchWithUndo<T extends { id: Id }>(rows: readonly T[], ids: ReadonlySet<Id>, patch: (r: T) => T) {
  const before = new Map(rows.filter((r) => ids.has(r.id)).map((r) => [r.id, r]))
  const next = rows.map((r) => (before.has(r.id) ? patch(r) : r))
  const undo = (current: readonly T[]) => current.map((r) => before.get(r.id) ?? r)
  return { next, undo, count: before.size }
}

/**
 * Remove the records in `ids`; undo puts each back after its nearest ORIGINAL predecessor that is still
 * in the list (not at a raw index), so other rows removed or added in the meantime don't shift it.
 */
export function removeWithUndo<T extends { id: Id }>(rows: readonly T[], ids: ReadonlySet<Id>) {
  const order = rows.map((r) => r.id)
  const removed: { row: T; index: number }[] = []
  rows.forEach((row, index) => ids.has(row.id) && removed.push({ row, index }))
  const next = rows.filter((r) => !ids.has(r.id))
  const undo = (current: readonly T[]) => {
    const out = current.filter((r) => !ids.has(r.id))
    for (const { row, index } of removed) {
      let at = 0
      for (let i = index - 1; i >= 0; i--) {
        const k = out.findIndex((r) => r.id === order[i])
        if (k >= 0) { at = k + 1; break }
      }
      out.splice(at, 0, row)
    }
    return out
  }
  return { next, undo, removed }
}
