"use client";

import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"

import { cn } from "@/lib/utils"
import { scopeProps, useKeylineScope } from "../lib/keyline-scope"

/**
 * A menu opened on an object (right-click, long-press, the Menu key or Shift+F10 on a focused target).
 * Rows are Menu's rows: build the content from MenuItem, MenuSeparator, MenuGroup / MenuGroupLabel and
 * MenuSubmenu from `./menu`, so a context menu and a menu button read the same.
 *
 * - The area (`ContextMenuTrigger`) marks the object the menu acts on while it is open: an inset ink
 *   keyline on its own edge (the object, not the page, is the subject). Nothing else changes.
 * - The surface opens at the pointer (Base UI's offsets put the pointer 2px inside its top-start corner, so a
 *   release right after opening does not land on the first row); control weight on all sides and no cut, and unfolds away
 *   from the pointer (from the side Base UI placed it on); it carries the configuration of the place
 *   it is written (theme, cut, density, motion, dir).
 * - A context menu is a shortcut, never the only path: put every action somewhere visible too (APG).
 *
 * Opening, positioning at the pointer, long-press on touch, keyboard, typeahead and focus return are
 * Base UI Context Menu's.
 */
const ContextMenu = ContextMenuPrimitive.Root

function ContextMenuTrigger({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" className={cn("kl-ctx-trigger", className)} {...props} />
}

function ContextMenuContent({ className, container, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Popup> & { container?: React.ComponentProps<typeof ContextMenuPrimitive.Portal>["container"] }) {
  const [marker, scope, probe] = useKeylineScope(false, container)
  return (
    <>
      {marker}
      <ContextMenuPrimitive.Portal container={container}>
        {probe}
        <ContextMenuPrimitive.Positioner collisionPadding={8} {...scopeProps(scope, { className: "kl-positioner" })}>
          <ContextMenuPrimitive.Popup data-slot="context-menu" className={cn("kl-attached kl-dock kl-menu kl-ctx-menu", className)} {...props} />
        </ContextMenuPrimitive.Positioner>
      </ContextMenuPrimitive.Portal>
    </>
  )
}

export { ContextMenu, ContextMenuTrigger, ContextMenuContent }

/* The rows are Menu's (Base UI's ContextMenu items are its Menu items). Re-exported under ContextMenu
   names so a context menu imports from one place; importing them from ./menu is equivalent. */
export {
  MenuItem as ContextMenuItem,
  MenuCheckboxItem as ContextMenuCheckboxItem,
  MenuRadioGroup as ContextMenuRadioGroup,
  MenuRadioItem as ContextMenuRadioItem,
  MenuSeparator as ContextMenuSeparator,
  MenuGroup as ContextMenuGroup,
  MenuGroupLabel as ContextMenuGroupLabel,
  MenuSubmenu as ContextMenuSubmenu,
  MenuSubmenuTrigger as ContextMenuSubmenuTrigger,
  MenuSubmenuContent as ContextMenuSubmenuContent,
} from "./menu"
