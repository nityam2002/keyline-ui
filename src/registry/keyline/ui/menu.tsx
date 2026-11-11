"use client";

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"
import { scopeProps, useKeylineScope } from "../lib/keyline-scope"

const Menu = MenuPrimitive.Root
const MenuTrigger = MenuPrimitive.Trigger

type MenuContentProps = React.ComponentProps<typeof MenuPrimitive.Popup> & {
  /** Element the menu docks to (defaults to the trigger). */
  anchor?: React.ComponentProps<typeof MenuPrimitive.Positioner>["anchor"]
  side?: "bottom" | "top"
  align?: "start" | "end"
  /** Keyline weight of the owner's shared edge: 2 for a standalone control, 1 for a cell (layout="cell"). */
  attachWeight?: 1 | 2 | 3
  container?: React.ComponentProps<typeof MenuPrimitive.Portal>["container"]
}

/**
 * A menu written inside a ButtonGroup docks to the group's frame, not to its trigger cell: the cell sits
 * inside the frame's k2 border, so docking to the cell would leave the menu's edges a border-width inside the
 * frame's. The anchor is the trigger cell with every edge that touches the frame moved onto the frame's
 * outer edge (in a row: the top and bottom always, the start/end for the first/last cell).
 */
function useFrameDock() {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [frame, setFrame] = React.useState<HTMLElement | null>(null)
  React.useLayoutEffect(() => {
    const next = ref.current?.closest<HTMLElement>('[data-slot="button-group"]') ?? null
    setFrame((prev) => (prev === next ? prev : next))
  })
  const anchor = React.useMemo(() => {
    if (!frame) return undefined
    return {
      contextElement: frame,
      getBoundingClientRect() {
        const f = frame.getBoundingClientRect()
        const trigger = Array.from(frame.querySelectorAll<HTMLElement>('[aria-expanded="true"]')).find((el) => el.closest('[data-slot="button-group"]') === frame)
        if (!trigger) return f
        const t = trigger.getBoundingClientRect()
        const cs = getComputedStyle(frame)
        const near = (gap: number, border: string) => gap <= parseFloat(border) + 0.5
        const left = near(t.left - f.left, cs.borderLeftWidth) ? f.left : t.left
        const right = near(f.right - t.right, cs.borderRightWidth) ? f.right : t.right
        const top = near(t.top - f.top, cs.borderTopWidth) ? f.top : t.top
        const bottom = near(f.bottom - t.bottom, cs.borderBottomWidth) ? f.bottom : t.bottom
        return new DOMRect(left, top, right - left, bottom - top)
      },
    }
  }, [frame])
  return { marker: <span ref={ref} hidden data-kl-dock-probe="" />, anchor }
}

/**
 * A docked surface: its shared edge sits on the owner's keyline, it unfolds from that edge, it has no cut.
 * It carries the configuration (cut, density, motion, theme, dir) of the place it is written, not of <body>.
 */
function MenuContent({ className, anchor, side = "bottom", align = "start", attachWeight = 2, container, style, ...props }: MenuContentProps) {
  const [marker, scope, probe] = useKeylineScope(false, container)
  const frameDock = useFrameDock()
  return (
    <>
      {marker}
      {frameDock.marker}
      <MenuPrimitive.Portal container={container}>
        {probe}
        <MenuPrimitive.Positioner anchor={anchor ?? frameDock.anchor} side={side} align={align} sideOffset={attachWeight === 1 ? 0 : -attachWeight} {...scopeProps(scope, { className: "kl-positioner" })}>
          <MenuPrimitive.Popup
            data-slot="menu"
            className={cn("kl-attached kl-dock kl-menu", className)}
            style={(state) => ({ "--kl-attach": `${attachWeight}px`, ...(typeof style === "function" ? style(state) : style) }) as React.CSSProperties}
            {...props}
          />
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </>
  )
}

type MenuItemProps = React.ComponentProps<typeof MenuPrimitive.Item> & {
  /** Index code shown in the leading cell; only when a key or a reference uses it. */
  code?: React.ReactNode
  shortcut?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
}

function MenuItem({ className, code, shortcut, description, variant = "default", children, ...props }: MenuItemProps) {
  return (
    <MenuPrimitive.Item data-slot="menu-item" data-variant={variant} className={cn("kl-menu-item", className)} {...props}>
      <span className="kl-menu-code" aria-hidden={code == null || undefined}>{code}</span>
      <span className="kl-menu-label">
        <span>{children}</span>
        {description ? <small>{description}</small> : null}
      </span>
      {shortcut ? <kbd className="kl-menu-key">{shortcut}</kbd> : <span />}
    </MenuPrimitive.Item>
  )
}

/* ------------------------------------------------------------------ *
 * CHECKBOX AND RADIO ITEMS
 * The leading code cell becomes the indicator cell. A checkbox item's box takes a tick; a radio item's
 * box takes a filled square: two shapes, so the kind reads without colour. The box is drawn in the
 * row's text colour, so it inverts with the cursor. Checking an item keeps the menu open (Base UI's
 * default for these items); pass closeOnClick to close it.
 * ------------------------------------------------------------------ */
type MenuCheckboxItemProps = React.ComponentProps<typeof MenuPrimitive.CheckboxItem> & { shortcut?: React.ReactNode; description?: React.ReactNode }

function MenuCheckboxItem({ className, shortcut, description, children, ...props }: MenuCheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem data-slot="menu-checkbox-item" className={cn("kl-menu-item kl-menu-choice", className)} {...props}>
      <span className="kl-menu-code kl-menu-ind" aria-hidden>
        <span className="kl-menu-box" data-kind="checkbox">
          <MenuPrimitive.CheckboxItemIndicator className="kl-menu-mark">
            <svg viewBox="0 0 10 10" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
              <path d="m2 5.25 2 2 4-4.5" />
            </svg>
          </MenuPrimitive.CheckboxItemIndicator>
        </span>
      </span>
      <span className="kl-menu-label">
        <span>{children}</span>
        {description ? <small>{description}</small> : null}
      </span>
      {shortcut ? <kbd className="kl-menu-key">{shortcut}</kbd> : <span />}
    </MenuPrimitive.CheckboxItem>
  )
}

/** One exclusive choice among MenuRadioItems; controlled (value, onValueChange) or uncontrolled (defaultValue). */
function MenuRadioGroup(props: React.ComponentProps<typeof MenuPrimitive.RadioGroup>) {
  return <MenuPrimitive.RadioGroup data-slot="menu-radio-group" {...props} />
}

function MenuRadioItem({ className, shortcut, description, children, ...props }: React.ComponentProps<typeof MenuPrimitive.RadioItem> & { shortcut?: React.ReactNode; description?: React.ReactNode }) {
  return (
    <MenuPrimitive.RadioItem data-slot="menu-radio-item" className={cn("kl-menu-item kl-menu-choice", className)} {...props}>
      <span className="kl-menu-code kl-menu-ind" aria-hidden>
        <span className="kl-menu-box" data-kind="radio">
          <MenuPrimitive.RadioItemIndicator className="kl-menu-mark kl-menu-dot" />
        </span>
      </span>
      <span className="kl-menu-label">
        <span>{children}</span>
        {description ? <small>{description}</small> : null}
      </span>
      {shortcut ? <kbd className="kl-menu-key">{shortcut}</kbd> : <span />}
    </MenuPrimitive.RadioItem>
  )
}

/* ------------------------------------------------------------------ *
 * SUBMENUS
 * The trigger is an ordinary row whose trailing cell is a › that mirrors in RTL; while its submenu is
 * open it keeps the cursor (inverse). The submenu docks beside the parent: its start border lies on the
 * parent's end border (one 2px line), its first row level with the trigger row, and it unfolds from
 * that shared edge. Hover intent, Arrow Right/Left, Escape and focus return are Base UI's.
 * ------------------------------------------------------------------ */
const MenuSubmenu = MenuPrimitive.SubmenuRoot

type MenuSubmenuTriggerProps = React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger> & {
  code?: React.ReactNode
  description?: React.ReactNode
}

function MenuSubmenuTrigger({ className, code, description, children, ...props }: MenuSubmenuTriggerProps) {
  return (
    <MenuPrimitive.SubmenuTrigger data-slot="menu-submenu-trigger" className={cn("kl-menu-item kl-menu-sub", className)} {...props}>
      <span className="kl-menu-code" aria-hidden={code == null || undefined}>{code}</span>
      <span className="kl-menu-label">
        <span>{children}</span>
        {description ? <small>{description}</small> : null}
      </span>
      <span className="kl-menu-more" aria-hidden>
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <path d="m6 4 4 4-4 4" />
        </svg>
      </span>
    </MenuPrimitive.SubmenuTrigger>
  )
}

/* Base UI resolves `inline-end` from its DirectionProvider, which the page may not set; the submenu
   reads the direction its parent menu carries (scope.dir) and picks the physical side itself. */
function MenuSubmenuContent({ className, container, style, ...props }: React.ComponentProps<typeof MenuPrimitive.Popup> & { container?: React.ComponentProps<typeof MenuPrimitive.Portal>["container"] }) {
  const [marker, scope, probe] = useKeylineScope(false, container)
  return (
    <>
      {marker}
      <MenuPrimitive.Portal container={container}>
        {probe}
        <MenuPrimitive.Positioner side={scope.dir === "rtl" ? "left" : "right"} align="start" sideOffset={0} alignOffset={-2} collisionPadding={8} {...scopeProps(scope, { className: "kl-positioner" })}>
          <MenuPrimitive.Popup data-slot="menu-submenu" className={cn("kl-attached kl-dock kl-menu kl-menu-subpanel", className)} style={style} {...props} />
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </>
  )
}

function MenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return <MenuPrimitive.Separator className={cn("kl-menu-sep", className)} {...props} />
}

function MenuGroup(props: React.ComponentProps<typeof MenuPrimitive.Group>) {
  return <MenuPrimitive.Group {...props} />
}

function MenuGroupLabel({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.GroupLabel>) {
  return <MenuPrimitive.GroupLabel className={cn("kl-menu-group", className)} {...props} />
}

export { Menu, MenuTrigger, MenuContent, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuGroup, MenuGroupLabel, MenuSubmenu, MenuSubmenuTrigger, MenuSubmenuContent }
