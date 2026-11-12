"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName } from "../lib/keyline-render";
import { MenuSurface } from "./menu";

/**
 * A menu opened on an object (right-click, long-press, the Menu key or Shift+F10 on a focused target).
 * Rows are Menu's rows: build the content from MenuItem, MenuSeparator, MenuGroup / MenuGroupLabel and
 * MenuSubmenuRoot from `./menu` (re-exported here under ContextMenu names), so a context menu and a menu button
 * read the same. Parts are named as Base UI names them.
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
const ContextMenuRoot = ContextMenuPrimitive.Root;
const ContextMenu = ContextMenuRoot;

/* the object the open menu acts on: an inset ink keyline on its own edge (no fill: its content stays readable, and
   a selected row keeps its yellow) */
const marked = cn(
  "data-popup-open:outline-(length:--kl-k2) data-popup-open:outline-offset-[calc(-1*var(--kl-k2))]",
  "data-popup-open:outline-kl-inverse data-popup-open:outline-solid forced-colors:data-popup-open:outline-[Highlight]",
);

/** The area the menu opens on. Rendered as another part (`render={<Item />}`), the element is that part's and
 * carries its data-slot; the mark while open is added to it. */
function ContextMenuTrigger({ className, ...props }: ContextMenuPrimitive.Trigger.Props): React.ReactElement {
  return (
    <ContextMenuPrimitive.Trigger
      className={resolveClassName(marked, className)}
      {...props}
      data-slot="context-menu-trigger"
    />
  );
}

type PositionerProps = ContextMenuPrimitive.Positioner.Props;

type ContextMenuPopupProps = React.ComponentProps<typeof MenuSurface> &
  Pick<PositionerProps, "anchor" | "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"> & {
    /** Where the portal renders (defaults to <body>). */
    container?: ContextMenuPrimitive.Portal.Props["container"];
    /** Props for Base UI's ContextMenu.Portal. */
    portalProps?: Omit<ContextMenuPrimitive.Portal.Props, "container" | "children">;
  };

/**
 * The menu: Base UI's Portal, Positioner and Popup in one part, with the positioner's placement props lifted (Base
 * UI places it at the pointer). Not docked to an owner: control weight on every side and a minimum width of its own.
 * The surface is Menu's (MenuSurface), so it carries `data-slot="menu-popup"`.
 */
function ContextMenuPopup({
  anchor,
  side,
  align,
  sideOffset,
  alignOffset,
  collisionPadding = 8,
  container,
  portalProps,
  className,
  ...props
}: ContextMenuPopupProps): React.ReactElement {
  const [marker, scope, probe] = useKeylineScope(false, container);
  return (
    <>
      {marker}
      <ContextMenuPrimitive.Portal container={container} {...portalProps}>
        {probe}
        <ContextMenuPrimitive.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <MenuSurface className={resolveClassName("min-w-[220px]", className)} {...props} />
        </ContextMenuPrimitive.Positioner>
      </ContextMenuPrimitive.Portal>
    </>
  );
}

export { ContextMenu, ContextMenuRoot, ContextMenuTrigger, ContextMenuPopup };

/* The rows are Menu's (Base UI's ContextMenu items are its Menu items). Re-exported under ContextMenu
   names so a context menu imports from one place; importing them from ./menu is equivalent. A submenu's popup is
   Menu's MenuPopup, which docks beside its row. */
export {
  MenuItem as ContextMenuItem,
  MenuCheckboxItem as ContextMenuCheckboxItem,
  MenuRadioGroup as ContextMenuRadioGroup,
  MenuRadioItem as ContextMenuRadioItem,
  MenuSeparator as ContextMenuSeparator,
  MenuGroup as ContextMenuGroup,
  MenuGroupLabel as ContextMenuGroupLabel,
  MenuSubmenuRoot as ContextMenuSubmenuRoot,
  MenuSubmenuTrigger as ContextMenuSubmenuTrigger,
  MenuPopup as ContextMenuSubmenuPopup,
} from "./menu";
