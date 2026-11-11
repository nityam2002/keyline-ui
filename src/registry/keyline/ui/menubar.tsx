"use client";

import * as React from "react"
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"
import { scopeProps, useKeylineScope, useMergedRef } from "../lib/keyline-scope"
import { useScrollEdges } from "../lib/scroll-edges"

type Layout = "control" | "cell"
const MenubarLayout = React.createContext<Layout>("control")

/**
 * A row of menus in one frame: each title is a key cell, each menu docks to the frame's edge under it.
 *
 *   ┌──────┬──────┬───────┬──────┐
 *   │ File │ Edit │ View  │ Help │   title cells (View open: the inverse cell)
 *   └──────┴──────┼───────┴──────┘
 *                 │ ☑ Status    │   the menu: Menu's rows, checkbox and radio items, submenus
 *                 │ ○ 24 rows   │
 *
 * - Behaviour is Base UI Menubar: one Tab stop, Left/Right move between titles (wrapping), Down/Enter/
 *   Space open, and while one menu is open, Left/Right and hover move to the neighbouring menu. Escape
 *   closes and returns focus to the title.
 * - The open title is the inverse cell (Select's open caret); the menu's top border lies on the frame's
 *   bottom keyline at the frame's weight, so the two read as one shape. No cut on the menu.
 * - Narrow: the row scrolls sideways and marks the hidden edge (scroll edges).
 * - The rows are Menu's: import MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSeparator,
 *   MenuGroup(Label) and MenuSubmenu* from ./menu (re-exported here under Menubar names too).
 */
function Menubar({ className, layout = "control", ref: refProp, ...props }: React.ComponentProps<typeof MenubarPrimitive> & { layout?: Layout }) {
  const ref = React.useRef<HTMLDivElement>(null)
  useScrollEdges(ref)
  const setRef = useMergedRef(ref, refProp)
  return (
    <MenubarLayout.Provider value={layout}>
      <MenubarPrimitive ref={setRef} data-slot="menubar" data-kl-layout={layout} className={cn("kl-ctl kl-cells kl-mbar", className)} {...props} />
    </MenubarLayout.Provider>
  )
}

const MenubarMenu = MenuPrimitive.Root

function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Trigger>) {
  return <MenuPrimitive.Trigger data-slot="menubar-trigger" className={cn("kl-cell kl-key kl-mbar-trigger", className)} {...props} />
}

function MenubarContent({ className, container, style, ...props }: React.ComponentProps<typeof MenuPrimitive.Popup> & { container?: React.ComponentProps<typeof MenuPrimitive.Portal>["container"] }) {
  const layout = React.useContext(MenubarLayout)
  const [marker, scope, probe] = useKeylineScope(false, container)
  // the frame's bottom keyline is the shared edge: the menu's top border lies on it at the same weight
  const weight = layout === "cell" ? 1 : 2
  return (
    <>
      {marker}
      <MenuPrimitive.Portal container={container}>
        {probe}
        <MenuPrimitive.Positioner side="bottom" align="start" sideOffset={0} collisionPadding={12} {...scopeProps(scope, { className: "kl-positioner" })}>
          <MenuPrimitive.Popup
            data-slot="menubar-content"
            className={cn("kl-attached kl-dock kl-menu kl-mbar-menu", className)}
            style={(state) => ({ "--kl-attach": `${weight}px`, ...(typeof style === "function" ? style(state) : style) }) as React.CSSProperties}
            {...props}
          />
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </>
  )
}

export { Menubar, MenubarMenu, MenubarTrigger, MenubarContent }
export {
  MenuItem as MenubarItem,
  MenuCheckboxItem as MenubarCheckboxItem,
  MenuRadioGroup as MenubarRadioGroup,
  MenuRadioItem as MenubarRadioItem,
  MenuSeparator as MenubarSeparator,
  MenuGroup as MenubarGroup,
  MenuGroupLabel as MenubarGroupLabel,
  MenuSubmenu as MenubarSubmenu,
  MenuSubmenuTrigger as MenubarSubmenuTrigger,
  MenuSubmenuContent as MenubarSubmenuContent,
} from "./menu"
