"use client";

import * as React from "react"
import { flushSync } from "react-dom"
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"
import { Toggle } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { DirectionProvider } from "@base-ui/react/direction-provider"

import { cn } from "@/lib/utils"
import { floodHandlers, useStretch } from "../lib/keyline-motion"
import { scopeProps, useDomDirection, useKeylineScope, useMergedRef } from "../lib/keyline-scope"
import { useScrollEdges } from "../lib/scroll-edges"
import { Menu, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuGroup, MenuGroupLabel, MenuSubmenu, MenuSubmenuTrigger, MenuSubmenuContent } from "./menu"

type Layout = "control" | "cell"
type Orientation = "horizontal" | "vertical"
const ToolbarCtx = React.createContext<{ layout: Layout; orientation: Orientation; inToolbar: boolean }>({ layout: "control", orientation: "horizontal", inToolbar: false })
/** True inside a Toolbar: parts written for a plain row (a filter token) render as toolbar items there. */
const useInToolbar = () => React.useContext(ToolbarCtx).inToolbar

type Signal = "idle" | "pending" | "done" | "failed"

type ToolbarProps = React.ComponentProps<typeof ToolbarPrimitive.Root> & {
  /** control (default): its own 2px frame and the cut. cell: a row of an enclosing frame (a panel's top cell, a shell header). */
  layout?: Layout
  /**
   * What a toolbar does when its items don't fit. scroll (default): it scrolls inside its frame and fades
   * the hidden edge. menu: items that don't fit leave, last first, and a "More" item takes their place; its
   * menu holds them as rows (a button is an item, a toggle a checkbox item, an exclusive group radio items,
   * a menu a submenu), with their state. A ToolbarGroup gives up its items one at a time (they appear under
   * its label); `keepTogether` makes it leave whole. Horizontal, the toolbar then spans its line; vertical
   * (a palette), it takes the height its container gives it and More sits at its foot, opening to the side.
   */
  overflow?: "scroll" | "menu"
  /** Accessible name of the overflow item ("More"); its menu says how many items it holds. */
  overflowLabel?: string
  /** icon (default): the overflow item is a square ⋯ cell named by overflowLabel. label: it shows overflowLabel as text with a caret, for a row whose items may all move into it. */
  overflowTrigger?: "icon" | "label"
}

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
 *   orientation.
 * - Arrow keys follow the DOM `dir` (an RTL subtree reverses Left/Right), not only a DirectionProvider.
 * - Overflow needs the toolbar's direct children to be its items (ToolbarButton, ToolbarToggle, groups,
 *   ToolbarLink, a ToolbarMenu with its trigger and content); anything else stays in the row.
 */
function Toolbar({ className, layout = "control", orientation = "horizontal", overflow = "scroll", overflowLabel = "More", overflowTrigger = "icon", ref: refProp, children, ...props }: ToolbarProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  useScrollEdges(ref)
  const [dir, refreshDir] = useDomDirection(ref)
  const setRef = useMergedRef(ref, refProp)
  const ctx = React.useMemo(() => ({ layout, orientation, inToolbar: true }), [layout, orientation])
  const menuMode = overflow === "menu"
  const fit = useOverflow(ref, menuMode, orientation === "vertical", children, overflowLabel, overflowTrigger)
  useKeepFocus(ref)
  return (
    <ToolbarCtx.Provider value={ctx}>
      <DirectionProvider direction={dir}>
        <ToolbarPrimitive.Root
          ref={setRef}
          data-slot="toolbar"
          data-kl-layout={layout}
          data-kl-overflow={menuMode ? "menu" : undefined}
          orientation={orientation}
          onFocusCapture={refreshDir}
          className={cn("kl-ctl kl-tb", className)}
          {...props}
        >
          {menuMode ? fit : children}
        </ToolbarPrimitive.Root>
      </DirectionProvider>
    </ToolbarCtx.Provider>
  )
}

/**
 * Removing the focused item (a filter token's ×, a command that disables itself away) must not drop focus
 * to the page: when the item that had focus leaves the DOM, focus goes to the item now in its place, or
 * the one before it.
 */
function useKeepFocus(ref: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof MutationObserver === "undefined") return
    const items = () => Array.from(el.querySelectorAll<HTMLElement>("button, a[href], input")).filter((x) => !x.closest("[hidden]"))
    let last: { node: HTMLElement; index: number } | null = null
    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement
      last = { node: t, index: items().indexOf(t) }
    }
    const mo = new MutationObserver(() => {
      if (!last || last.node.isConnected) return
      const a = document.activeElement
      if (a && a !== document.body && a !== document.documentElement) return
      const list = items()
      const next = list[Math.min(last.index, list.length - 1)]
      last = null
      next?.focus()
    })
    el.addEventListener("focusin", onFocus)
    mo.observe(el, { childList: true, subtree: true })
    return () => {
      el.removeEventListener("focusin", onFocus)
      mo.disconnect()
    }
  }, [ref])
}

/* ---------------- overflow ("More") ---------------- */

type El = React.ReactElement<Record<string, unknown>>
const isEl = (c: unknown): c is El => React.isValidElement(c)
const textOf = (n: unknown): string =>
  typeof n === "string" || typeof n === "number" ? String(n) : Array.isArray(n) ? n.map(textOf).join("") : isEl(n) ? textOf(n.props.children) : ""

/** The name an item carries into the More menu: overflowLabel, else aria-label (glyph items), else its text. */
function labelOf(p: Record<string, unknown>): React.ReactNode {
  if (p.overflowLabel != null) return p.overflowLabel as React.ReactNode
  if (p.icon || p.children == null || textOf(p.children).trim() === "") return (p["aria-label"] as string) ?? (p.children as React.ReactNode)
  return p.children as React.ReactNode
}

/** An affix in the menu: a key (a <kbd>) goes in the shortcut cell; a count or a code follows the label. */
const isKey = (a: unknown) => isEl(a) && (a.type === "kbd" || React.Children.toArray(a.props.children as React.ReactNode).some((c) => isEl(c) && c.type === "kbd"))
function withAffix(label: React.ReactNode, affix: unknown): { label: React.ReactNode; shortcut?: React.ReactNode } {
  if (affix == null || affix === false) return { label }
  if (isKey(affix)) return { label, shortcut: affix as React.ReactNode }
  return { label: <>{label}<span className="kl-tb-menu-count">{affix as React.ReactNode}</span></> }
}

type Kind = "unit" | "sep" | "keep"
function kindOf(el: El): Kind {
  if (el.type === ToolbarSeparator) return "sep"
  if (el.type === ToolbarButton || el.type === ToolbarToggle) return el.props.primary ? "keep" : "unit"
  if (el.type === ToolbarLink || el.type === ToolbarGroup || el.type === ToolbarToggleGroup) return "unit"
  if (el.type === Menu) return el.props.children != null && React.Children.toArray(el.props.children as React.ReactNode).some((c) => isEl(c) && c.type === ToolbarMenuTrigger && !c.props.primary) ? "unit" : "keep"
  return "keep"
}

/** A ToolbarGroup whose children are all plain items gives them up one at a time (not with keepTogether). */
function splits(el: unknown): boolean {
  if (!isEl(el) || el.type !== ToolbarGroup || el.props.keepTogether) return false
  const kids = React.Children.toArray(el.props.children as React.ReactNode)
  return kids.length > 1 && kids.every((k) => isEl(k) && kindOf(k) === "unit" && k.type !== ToolbarGroup && k.type !== ToolbarToggleGroup)
}

/**
 * Uncontrolled toggles and toggle groups are given their state here, keyed by the element's key, so an
 * item keeps it when it moves into the menu (where it is unmounted from the row) and back.
 */
function adopt(el: El, key: string, own: Record<string, unknown>, set: React.Dispatch<React.SetStateAction<Record<string, unknown>>>): El {
  const p = el.props
  if (el.type === ToolbarToggle && p.pressed === undefined) {
    const pressed = (own[key] as boolean | undefined) ?? (p.defaultPressed as boolean | undefined) ?? false
    return React.cloneElement(el, {
      pressed,
      defaultPressed: undefined,
      onPressedChange: (v: boolean, d: unknown) => {
        set((o) => ({ ...o, [key]: v }))
        ;(p.onPressedChange as ((v: boolean, d: unknown) => void) | undefined)?.(v, d)
      },
    })
  }
  if (el.type === ToolbarToggleGroup && p.value === undefined) {
    const value = (own[key] as string[] | undefined) ?? (p.defaultValue as string[] | undefined) ?? []
    return React.cloneElement(el, {
      value,
      defaultValue: undefined,
      onValueChange: (v: string[]) => {
        set((o) => ({ ...o, [key]: v }))
        ;(p.onValueChange as ((v: string[]) => void) | undefined)?.(v)
      },
    })
  }
  if (el.type === ToolbarGroup) {
    const kids = React.Children.toArray(p.children as React.ReactNode).map((c, i) => (isEl(c) ? adopt(c, `${key}/${c.key ?? i}`, own, set) : c))
    return React.cloneElement(el, undefined, ...kids)
  }
  return el
}

/** An item as rows of the More menu. */
function toMenu(el: El, key: React.Key): React.ReactNode {
  const p = el.props as Record<string, never>
  if (el.type === ToolbarButton) {
    return (
      <MenuItem key={key} disabled={p.disabled} onClick={p.onClick} shortcut={withAffix(labelOf(p), p.affix).shortcut}>
        {withAffix(labelOf(p), p.affix).label}
      </MenuItem>
    )
  }
  if (el.type === ToolbarLink) {
    return (
      <MenuItem key={key} disabled={p.disabled} render={<a href={p.href} target={p.target} rel={p.rel} />} onClick={p.onClick}>
        {labelOf(p)}
      </MenuItem>
    )
  }
  if (el.type === ToolbarToggle) {
    return (
      <MenuCheckboxItem key={key} disabled={p.disabled} checked={!!p.pressed} onCheckedChange={(v, d) => (p.onPressedChange as ((v: boolean, d: unknown) => void) | undefined)?.(v, d)} shortcut={withAffix(labelOf(p), p.affix).shortcut}>
        {withAffix(labelOf(p), p.affix).label}
      </MenuCheckboxItem>
    )
  }
  if (el.type === ToolbarToggleGroup) {
    const value = (p.value as string[] | undefined) ?? []
    const change = p.onValueChange as ((v: string[]) => void) | undefined
    const opts = React.Children.toArray(p.children as React.ReactNode).filter(isEl)
    const label = (p["aria-label"] as string | undefined) ?? null
    if (p.multiple === false) {
      return (
        <MenuGroup key={key}>
          {label ? <MenuGroupLabel>{label}</MenuGroupLabel> : null}
          <MenuRadioGroup value={value[0] ?? null} onValueChange={(v) => change?.([v as string])} disabled={p.disabled}>
            {opts.map((o, i) => (
              <MenuRadioItem key={o.key ?? i} value={o.props.value as string} disabled={o.props.disabled as boolean | undefined} shortcut={withAffix(labelOf(o.props), o.props.affix).shortcut}>
                {withAffix(labelOf(o.props), o.props.affix).label}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuGroup>
      )
    }
    return (
      <MenuGroup key={key}>
        {label ? <MenuGroupLabel>{label}</MenuGroupLabel> : null}
        {opts.map((o, i) => {
          const v = o.props.value as string
          return (
            <MenuCheckboxItem
              key={o.key ?? i}
              disabled={(p.disabled || o.props.disabled) as boolean | undefined}
              checked={value.includes(v)}
              onCheckedChange={(on) => change?.(on ? [...value, v] : value.filter((x) => x !== v))}
              shortcut={withAffix(labelOf(o.props), o.props.affix).shortcut}
            >
              {withAffix(labelOf(o.props), o.props.affix).label}
            </MenuCheckboxItem>
          )
        })}
      </MenuGroup>
    )
  }
  if (el.type === ToolbarGroup) {
    const label = (p["aria-label"] as string | undefined) ?? null
    return (
      <MenuGroup key={key}>
        {label ? <MenuGroupLabel>{label}</MenuGroupLabel> : null}
        {React.Children.toArray(p.children as React.ReactNode).map((c, i) => (isEl(c) ? toMenu(c, c.key ?? i) : null))}
      </MenuGroup>
    )
  }
  if (el.type === Menu) {
    const kids = React.Children.toArray(p.children as React.ReactNode).filter(isEl)
    const trigger = kids.find((c) => c.type === ToolbarMenuTrigger)
    const content = kids.find((c) => c.type === ToolbarMenuContent)
    if (!trigger || !content) return null
    return (
      <MenuSubmenu key={key}>
        <MenuSubmenuTrigger disabled={trigger.props.disabled as boolean | undefined}>{labelOf(trigger.props)}</MenuSubmenuTrigger>
        <MenuSubmenuContent container={content.props.container as never}>{content.props.children as React.ReactNode}</MenuSubmenuContent>
      </MenuSubmenu>
    )
  }
  return null
}

/**
 * Fits a horizontal toolbar's items to its width: hides units from the end (`n` of them) while the row
 * overflows, and brings the next one back when the free space (empty fill, slack in the spacer and input
 * cells) holds its last measured width. Runs in layout effects, so nothing paints in between.
 */
function useOverflow(ref: React.RefObject<HTMLDivElement | null>, on: boolean, vertical: boolean, children: React.ReactNode, label: string, trigger: "icon" | "label"): React.ReactNode {
  // the axis the items run along: width in a row, height in a column (a tool palette)
  const size = (e: Element) => (vertical ? e.getBoundingClientRect().height : e.getBoundingClientRect().width)
  const inner = (e: HTMLElement) => (vertical ? e.clientHeight : e.clientWidth)
  const outer = (e: HTMLElement) => (vertical ? e.offsetHeight : e.offsetWidth)
  const minOf = (cs: CSSStyleDeclaration) => parseFloat(vertical ? cs.minHeight : cs.minWidth) || 0
  const [n, setN] = React.useState(0)
  const [own, setOwn] = React.useState<Record<string, unknown>>({})
  const widths = React.useRef(new Map<string, number>())
  const blocked = React.useRef<{ n: number; w: number } | null>(null)
  const refocus = React.useRef(false)
  const moreRef = React.useRef<HTMLButtonElement>(null)
  const [, remeasure] = React.useReducer((x: number) => x + 1, 0)

  const items = React.Children.toArray(children)
  const els = items.map((c, i) => (isEl(c) ? adopt(c, String(c.key ?? i), own, setOwn) : c))
  const kinds = els.map((c) => (isEl(c) ? kindOf(c) : "keep"))
  // a ToolbarGroup of plain items gives them up one at a time ("i/k"), unless keepTogether; anything else is
  // one unit ("i"). A toggle group stays whole: an exclusive choice is not split between row and menu.
  const parts = els.map((c, i) => (kinds[i] === "unit" && splits(c) ? React.Children.toArray((c as El).props.children as React.ReactNode) : null))
  const units = kinds.flatMap((k, i) => (k !== "unit" ? [] : parts[i] ? parts[i]!.map((_, k2) => `${i}/${k2}`) : [String(i)]))
  const count = Math.min(n, units.length)
  const gone = new Set(units.slice(units.length - count))
  // an element leaves the row when all of it has; a split group may be partly in the menu
  const hidden = new Set<number>()
  let partial = -1
  els.forEach((_, i) => {
    if (kinds[i] !== "unit") return
    const ids = parts[i] ? parts[i]!.map((_, k2) => `${i}/${k2}`) : [String(i)]
    const out = ids.filter((id) => gone.has(id)).length
    if (out === ids.length) hidden.add(i)
    else if (out) partial = i
  })
  // a separator goes with the item after it
  for (let i = els.length - 1; i >= 0; i--) if (kinds[i] === "sep" && hidden.has(i + 1)) hidden.add(i)
  const first = Math.min(...hidden)
  // the More item follows a partly hidden group, otherwise it takes the first hidden item's place
  const moreAt = partial >= 0 ? partial + 1 : first

  React.useLayoutEffect(() => {
    if (!on) return
    const el = ref.current
    if (!el) return
    // in-flow children only: the edge fades and the focus guards Base UI inserts beside an open menu's
    // trigger (1px, position: fixed) are overlays, not items
    const kids = Array.from(el.children).filter((c): c is HTMLElement => {
      if (!(c instanceof HTMLElement)) return false
      const pos = getComputedStyle(c).position
      return pos !== "fixed" && pos !== "absolute"
    })
    el.querySelectorAll<HTMLElement>("[data-kl-unit]").forEach((k) => widths.current.set(k.dataset.klUnit!, size(k)))
    // the width the row asks for with every item in it: its flex basis, so a toolbar sized by its content
    // (in a flex row) shrinks under pressure, and grows back, instead of fitting its current items forever
    let full = outer(el) - inner(el) + 2
    for (const k of kids) {
      if (k === moreRef.current) continue
      const cs = getComputedStyle(k)
      const flexible = parseFloat(cs.flexGrow) > 0 || parseFloat(cs.flexShrink) > 0
      full += flexible ? minOf(cs) : size(k)
    }
    gone.forEach((id) => (full += widths.current.get(id) ?? 0))
    // only a parent laid out along the same axis sizes it by its basis (a row for a row, a column for a palette)
    const ps = el.parentElement ? getComputedStyle(el.parentElement) : null
    const inRow = !!ps && ps.display.includes("flex") && ps.flexDirection.startsWith("column") === vertical
    const basis = inRow ? `${Math.ceil(full)}px` : ""
    if (el.style.flexBasis !== basis) el.style.flexBasis = basis
    const w = inner(el)
    // overflow is the items' own extent (the scroll size also counts the edge-fade overlays)
    const extent = kids.reduce((sum, k) => sum + size(k), 0)
    if (extent > w + 1) {
      if (count < units.length) {
        if (el.contains(document.activeElement) && document.activeElement !== moreRef.current) refocus.current = true
        blocked.current = { n: count, w }
        setN(count + 1)
      }
      return
    }
    if (refocus.current) {
      refocus.current = false
      if (!el.contains(document.activeElement)) moreRef.current?.focus({ preventScroll: true })
    }
    if (count === 0) return
    if (blocked.current && blocked.current.n === count - 1 && w <= blocked.current.w) return
    let used = 0
    let slack = 0
    for (const k of kids) {
      const r = size(k)
      used += r
      const cs = getComputedStyle(k)
      if (parseFloat(cs.flexGrow) > 0 || parseFloat(cs.flexShrink) > 0) slack += Math.max(0, r - minOf(cs))
    }
    const free = w - used + slack
    const next = units[units.length - count]
    // the first item back into a group that had left whole brings the group's own 2px edges with it
    const edges = next.includes("/") && hidden.has(Number(next.split("/")[0])) ? 4 : 0
    const need = (widths.current.get(next) ?? Infinity) + 2 + edges - (count === 1 && moreRef.current ? size(moreRef.current) : 0)
    if (free >= need) setN(count - 1)
  })

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!on || !el || typeof ResizeObserver === "undefined") return
    const inner = (e: HTMLElement) => (vertical ? e.clientHeight : e.clientWidth)
    let last = inner(el)
    let raf = 0
    const refit = () => {
      blocked.current = null
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => flushSync(remeasure))
    }
    // the fit runs in the next frame, not inside the observer's callback: fitting changes the toolbar's own
    // size (its flex basis), which inside the callback is a ResizeObserver loop error (seen in WebKit)
    const ro = new ResizeObserver(() => {
      if (inner(el) === last) return
      last = inner(el)
      refit()
    })
    ro.observe(el)
    // a web font arriving changes every item's width while the toolbar, held at its old basis, may keep its
    // size: the basis measured with the fallback font would stay (a stray filler, or items left in More)
    const fonts = typeof document !== "undefined" ? document.fonts : undefined
    fonts?.addEventListener("loadingdone", refit)
    return () => {
      ro.disconnect()
      fonts?.removeEventListener("loadingdone", refit)
      cancelAnimationFrame(raf)
    }
  }, [on, ref, vertical])

  if (!on) return children

  const out: React.ReactNode[] = []
  const more = () => {
      const rows: React.ReactNode[] = []
      let prevGroup = false
      els.forEach((h, j) => {
        if (!isEl(h) || kinds[j] !== "unit" || !(hidden.has(j) || j === partial)) return
        // a partly hidden group brings only its hidden items, under its own label
        const m = j === partial ? React.cloneElement(h, undefined, ...parts[j]!.filter((_, k2) => gone.has(`${j}/${k2}`))) : h
        const group = h.type === ToolbarGroup || h.type === ToolbarToggleGroup
        if (rows.length && (group || prevGroup)) rows.push(<MenuSeparator key={`s${j}`} />)
        rows.push(toMenu(m, `m${j}`))
        prevGroup = group
      })
      const total = count
      return (
        <Menu key="kl-tb-overflow">
          {trigger === "label" ? (
            <ToolbarMenuTrigger ref={moreRef} className="kl-tb-overflow" data-kl-count={total}>
              {label}
            </ToolbarMenuTrigger>
          ) : (
            <ToolbarMenuTrigger ref={moreRef} icon aria-label={label} className="kl-tb-overflow" data-kl-count={total}>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
                <rect x="2" y="7" width="2.5" height="2.5" />
                <rect x="6.75" y="7" width="2.5" height="2.5" />
                <rect x="11.5" y="7" width="2.5" height="2.5" />
              </svg>
            </ToolbarMenuTrigger>
          )}
          <ToolbarMenuContent align="end" aria-label={`${label}: ${total} ${total === 1 ? "item" : "items"}`}>
            {rows}
          </ToolbarMenuContent>
        </Menu>
      )
  }
  els.forEach((c, i) => {
    if (i === moreAt && count > 0) out.push(more())
    if (hidden.has(i)) return
    if (isEl(c) && kinds[i] === "unit") {
      if (parts[i]) {
        // a split group: its items are the units, each tagged; the hidden ones are left out
        const kids = parts[i]!.flatMap((k, k2) => (gone.has(`${i}/${k2}`) ? [] : [isEl(k) ? tag(k, `${i}/${k2}`) : k]))
        out.push(React.cloneElement(c, undefined, ...kids))
      } else out.push(tag(c, String(i)))
    } else out.push(c)
  })
  if (moreAt >= els.length && count > 0) out.push(more())
  return out
}

/** Marks a unit's row element (data-kl-unit) so its width can be measured while it is in the row. */
function tag(el: El, id: string): El {
  if (el.type === Menu) {
    const kids = React.Children.toArray(el.props.children as React.ReactNode).map((c) => (isEl(c) && c.type === ToolbarMenuTrigger ? React.cloneElement(c, { "data-kl-unit": id }) : c))
    return React.cloneElement(el, undefined, ...kids)
  }
  return React.cloneElement(el, { "data-kl-unit": id })
}

type ToolbarButtonProps = React.ComponentProps<typeof ToolbarPrimitive.Button> & {
  /** A trailing cell inside the item: a count or a shortcut (mono when it is a <kbd> or a code). */
  affix?: React.ReactNode
  /** Square cell for a glyph-only item. Give it aria-label; pair with a Tooltip for sighted users. */
  icon?: boolean
  /** The one primary action of the row: the cobalt cell (commit signal). At most one per toolbar. It never moves into the overflow menu. */
  primary?: boolean
  /** Button's signal: pending runs a segment along the bottom keyline (busy, still focusable); done inserts a ✓ cell; failed a ! cell at the start. */
  signal?: Signal
  /** The item's name as a row of the overflow menu, when its text is not enough (a glyph item uses aria-label). */
  overflowLabel?: React.ReactNode
}

/** A command cell. Contents travel 1px on press (Key); the cell never floods: an action holds no state. */
function ToolbarButton({ className, affix, icon, primary, signal, overflowLabel: _o, disabled, children, ...props }: ToolbarButtonProps) {
  const pending = signal === "pending"
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      data-kl-icon={icon ? "" : undefined}
      data-kl-primary={primary ? "" : undefined}
      data-signal={signal == null || signal === "idle" ? undefined : signal}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      className={cn("kl-key kl-tb-item kl-tb-btn", className)}
      {...props}
    >
      <ItemLabel affix={affix} signal={signal}>{children}</ItemLabel>
    </ToolbarPrimitive.Button>
  )
}

/* The signal slots exist only on an item that takes a signal (so they can unfold); others carry just the label. */
function ItemLabel({ affix, signal, children }: { affix?: React.ReactNode; signal?: Signal; children?: React.ReactNode }) {
  if (signal == null) {
    return (
      <>
        <span className="kl-tb-label">{children}</span>
        {affix != null ? <span className="kl-tb-affix">{affix}</span> : null}
      </>
    )
  }
  return (
    <>
      <span className="kl-slot kl-tb-fail" data-open={signal === "failed" ? "" : undefined} aria-hidden>
        <span>
          <span>!</span>
        </span>
      </span>
      <span className="kl-tb-label">{children}</span>
      {affix != null ? <span className="kl-tb-affix">{affix}</span> : null}
      <span className="kl-slot kl-tb-done" data-open={signal === "done" ? "" : undefined} aria-hidden>
        <span>
          <span>
            <svg className="kl-tick" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square">
              <path pathLength={1} d="m3.5 8.5 3 3 6-7" />
            </svg>
          </span>
        </span>
      </span>
      {signal === "pending" ? <span className="kl-pending" aria-hidden /> : null}
    </>
  )
}

const ExclusiveCtx = React.createContext(false)

type ToolbarToggleProps = Omit<React.ComponentProps<typeof Toggle>, "render"> & {
  icon?: boolean
  affix?: React.ReactNode
  disabled?: boolean
  /** The toggle's name as a checkbox row of the overflow menu, when its text is not enough. */
  overflowLabel?: React.ReactNode
}

/**
 * A toggle cell: Base UI Toggle rendered as a toolbar item, so it joins the row's arrow-key order.
 * On its own or in a multiple ToolbarToggleGroup it is independent state: it floods yellow from the press
 * point and carries a lamp (as ToggleGroup's cells do). In an exclusive group (multiple={false}) it is a
 * choice among options: no lamp, and the group's ink band stretches to it (as Segmented's does).
 */
function ToolbarToggle({ className, icon, affix, children, disabled, overflowLabel: _o, ...props }: ToolbarToggleProps) {
  const exclusive = React.useContext(ExclusiveCtx)
  return (
    <ToolbarPrimitive.Button
      disabled={disabled}
      render={
        <Toggle
          data-slot="toolbar-toggle"
          data-kl-icon={icon ? "" : undefined}
          data-kl-item={exclusive ? "" : undefined}
          className={cn("kl-key kl-tb-item kl-tb-toggle", exclusive ? "kl-tb-choice" : "kl-flood", className)}
          {...(exclusive ? null : floodHandlers)}
          {...props}
        />
      }
    >
      {exclusive ? (
        <ItemLabel affix={affix}>{children}</ItemLabel>
      ) : (
        <ItemLabel affix={affix}>
          {icon ? null : <span className="kl-lamp" aria-hidden />}
          {children}
        </ItemLabel>
      )}
    </ToolbarPrimitive.Button>
  )
}

type ToolbarToggleGroupProps = Omit<React.ComponentProps<typeof ToggleGroupPrimitive>, "value" | "defaultValue" | "onValueChange"> & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

/**
 * Toggles that belong together (Base UI ToggleGroup inside the toolbar's focus order). `multiple` (default
 * true): independent toggles, each floods. multiple={false}: an exclusive choice (alignment, view), the ink
 * band stretches between cells, leading edge first, zero bounce.
 */
function ToolbarToggleGroup({ className, multiple = true, value, defaultValue, onValueChange, children, ref: refProp, ...props }: ToolbarToggleGroupProps) {
  const { orientation } = React.useContext(ToolbarCtx)
  const ref = React.useRef<HTMLDivElement>(null)
  const setRef = useMergedRef(ref, refProp)
  const [inner, setInner] = React.useState<string[]>(defaultValue ?? [])
  const current = value ?? inner
  const values = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((c) => (c.props as { value?: string }).value)
  useStretch(ref, multiple ? -1 : values.indexOf(current[0]), { axis: orientation === "vertical" ? "y" : "x" })
  return (
    <ExclusiveCtx.Provider value={!multiple}>
      <ToggleGroupPrimitive
        ref={setRef}
        data-slot="toolbar-toggle-group"
        data-kl-stretch={multiple ? undefined : ""}
        multiple={multiple}
        value={current}
        onValueChange={(v) => {
          setInner(v as string[])
          onValueChange?.(v as string[])
        }}
        className={cn("kl-tb-group", !multiple && "kl-tb-exclusive", className)}
        {...props}
      >
        {multiple ? null : <span data-kl-band="" className="kl-tb-band" aria-hidden hidden />}
        {children}
      </ToggleGroupPrimitive>
    </ExclusiveCtx.Provider>
  )
}

/** Items that act on the same thing (history, text style). Its outer edges are a 2px keyline. */
/**
 * Items that belong together, drawn as one control (2px outer edges). With overflow="menu" its items move
 * into More one at a time, from the end, and appear there under the group's label; `keepTogether` moves
 * the group only as a whole (an alignment set, a pair that means nothing apart).
 */
function ToolbarGroup({ className, keepTogether: _k, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Group> & { keepTogether?: boolean }) {
  return <ToolbarPrimitive.Group data-slot="toolbar-group" className={cn("kl-tb-group", className)} {...props} />
}

/** A 2px keyline between items, announced as a separator. Not needed between groups (they draw their own). */
function ToolbarSeparator({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  const { orientation } = React.useContext(ToolbarCtx)
  return <ToolbarPrimitive.Separator data-slot="toolbar-separator" orientation={orientation === "vertical" ? "horizontal" : "vertical"} className={cn("kl-tb-sep", className)} {...props} />
}

/** An empty cell that takes the free space, pushing what follows to the end. Not focusable, not announced. */
function ToolbarSpacer({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-hidden data-slot="toolbar-spacer" className={cn("kl-tb-spacer", className)} {...props} />
}

/** A link cell (Base UI Toolbar.Link): navigation, not a command. Underlined like a quiet button. */
function ToolbarLink({ className, children, overflowLabel: _o, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Link> & { overflowLabel?: React.ReactNode }) {
  return (
    <ToolbarPrimitive.Link data-slot="toolbar-link" className={cn("kl-tb-item kl-tb-link", className)} {...props}>
      <span className="kl-tb-label">{children}</span>
    </ToolbarPrimitive.Link>
  )
}

/**
 * A text input cell (Base UI Toolbar.Input). Arrow keys move the caret; they leave the input for the
 * neighbouring item only at the text's ends. Its edge is the cell's (`kl-edge`, a 2px band on the
 * keylines), as the table search's is. `label` names it for assistive technology; `glyph` leads it.
 */
function ToolbarInput({ className, label, glyph, style, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Input> & { label: string; glyph?: React.ReactNode }) {
  return (
    <label className={cn("kl-cell kl-edge kl-tb-input", className)} style={style as React.CSSProperties}>
      {glyph ?? null}
      <span className="kl-sr">{label}</span>
      <ToolbarPrimitive.Input data-slot="toolbar-input" {...props} />
    </label>
  )
}

/**
 * A menu title in the row: Base UI Menu.Trigger rendered as a toolbar item, with a caret cell. Open, it is
 * the inverse cell; its menu docks to the toolbar's keyline under it (ToolbarMenuContent).
 * The toolbar's own Menu root is Base UI's: <Menu><ToolbarMenuTrigger>…</ToolbarMenuTrigger><ToolbarMenuContent>…
 */
function ToolbarMenuTrigger({
  className, children, icon, disabled, affix, primary, signal, overflowLabel: _o, ...props
}: Omit<React.ComponentProps<typeof MenuPrimitive.Trigger>, "render"> & {
  icon?: boolean
  /** A trailing cell before the caret: a count ("7/7") or a shortcut. */
  affix?: React.ReactNode
  /** The row's one commit action opens a menu (Assign ▾): the cobalt cell. It never moves into the overflow menu. */
  primary?: boolean
  signal?: Signal
  overflowLabel?: React.ReactNode
}) {
  const pending = signal === "pending"
  return (
    <ToolbarPrimitive.Button
      disabled={disabled || pending}
      render={
        <MenuPrimitive.Trigger
          data-slot="toolbar-menu-trigger"
          data-kl-icon={icon ? "" : undefined}
          data-kl-primary={primary ? "" : undefined}
          data-signal={signal == null || signal === "idle" ? undefined : signal}
          aria-busy={pending || undefined}
          className={cn("kl-key kl-tb-item kl-tb-btn kl-tb-menu", className)}
          {...props}
        />
      }
    >
      <ItemLabel affix={affix} signal={signal}>{children}</ItemLabel>
      {icon ? null : (
        <span className="kl-tb-caret" aria-hidden>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      )}
    </ToolbarPrimitive.Button>
  )
}

/**
 * The menu of a ToolbarMenuTrigger. Menu's surface and rows (MenuItem, MenuCheckboxItem, MenuRadioItem,
 * submenus from ./menu); its top border lies on the toolbar's bottom keyline at the toolbar's weight (2px
 * framed, 1px as a cell), so trigger and menu read as one shape. No cut. Carries the configuration of the
 * place it is written (cut, theme, density, motion, dir) into the portal.
 */
function ToolbarMenuContent({ className, container, style, align = "start", ...props }: React.ComponentProps<typeof MenuPrimitive.Popup> & { container?: React.ComponentProps<typeof MenuPrimitive.Portal>["container"]; align?: "start" | "end" }) {
  const { layout, orientation } = React.useContext(ToolbarCtx)
  const [marker, scope, probe] = useKeylineScope(false, container)
  const weight = layout === "cell" ? 1 : 2
  return (
    <>
      {marker}
      <MenuPrimitive.Portal container={container}>
        {probe}
        <MenuPrimitive.Positioner side={orientation === "vertical" ? (scope.dir === "rtl" ? "left" : "right") : "bottom"} align={align} sideOffset={0} collisionPadding={12} {...scopeProps(scope, { className: "kl-positioner" })}>
          <MenuPrimitive.Popup
            data-slot="toolbar-menu"
            className={cn("kl-attached kl-dock kl-menu kl-tb-menu-panel", className)}
            style={(state) => ({ "--kl-attach": `${weight}px`, ...(typeof style === "function" ? style(state) : style) }) as React.CSSProperties}
            {...props}
          />
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </>
  )
}

export {
  Toolbar,
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
}
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
} from "./menu"
