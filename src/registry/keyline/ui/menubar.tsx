"use client";

import * as React from "react";
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope, useMergedRef } from "../lib/keyline-scope";
import { useScrollEdges } from "../lib/scroll-edges";
import { resolveClassName } from "../lib/keyline-render";
import { MenuSurface } from "./menu";

type Layout = "control" | "cell";
const MenubarLayout = React.createContext<Layout>("control");

/* a control frame of title cells; narrow, the row scrolls sideways and marks the hidden edge (scroll edges) */
const bar = cn(
  "kl-ctl kl-cells flex min-h-(--kl-ctl) w-max max-w-full justify-self-start overflow-x-auto bg-kl-cell",
  "data-[kl-layout=cell]:min-h-(--kl-row) data-[kl-layout=cell]:w-auto",
);

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
 *   MenuGroup(Label) and MenuSubmenuRoot* from ./menu (re-exported here under Menubar names too).
 */
function Menubar({
  className,
  layout = "control",
  ref: refProp,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive> & { layout?: Layout }): React.ReactElement {
  const ref = React.useRef<HTMLDivElement>(null);
  useScrollEdges(ref);
  const setRef = useMergedRef(ref, refProp);
  return (
    <MenubarLayout.Provider value={layout}>
      <MenubarPrimitive
        ref={setRef}
        data-kl-layout={layout}
        // one Tab stop: Firefox makes an overflowing scroller a Tab stop of its own, even around focusable items
        tabIndex={-1}
        className={resolveClassName(bar, className)}
        {...props}
        data-slot="menubar"
      />
    </MenubarLayout.Provider>
  );
}

/** One menu of the bar: Base UI's Menu.Root. */
const MenubarMenu = MenuPrimitive.Root;

/* a title: a key cell; the first clears the frame's cut. Open, it is the inverse cell */
const title = cn(
  "kl-cell kl-key flex flex-none cursor-default items-center gap-1.5 border-y-0 border-e-0 bg-transparent bg-none px-3.5",
  "font-(family-name:--kl-font) text-(length:--kl-text-body) font-(--kl-weight-strong) whitespace-nowrap text-kl-ink outline-0",
  "first:ps-[calc(14px+var(--kl-c,0px)*0.35)]",
  "hover:not-data-popup-open:not-data-disabled:bg-kl-tint",
  "data-popup-open:bg-kl-inverse data-popup-open:text-kl-on-inverse",
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus focus-visible:outline-solid",
  "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
  "forced-colors:data-popup-open:outline-3 forced-colors:data-popup-open:outline-offset-[-4px]",
  "forced-colors:data-popup-open:outline-[Highlight] forced-colors:data-popup-open:outline-solid",
);

/** A menu's title. Rendered as another part, the element is that part's and carries its data-slot. */
function MenubarTrigger({ className, ...props }: MenuPrimitive.Trigger.Props): React.ReactElement {
  return (
    <MenuPrimitive.Trigger className={resolveClassName(title, className)} {...props} data-slot="menubar-trigger" />
  );
}

type PositionerProps = MenuPrimitive.Positioner.Props;

type MenubarPopupProps = React.ComponentProps<typeof MenuSurface> &
  Pick<PositionerProps, "anchor" | "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"> & {
    /** Where the portal renders (defaults to <body>). */
    container?: MenuPrimitive.Portal.Props["container"];
    /** Props for Base UI's Menu.Portal. */
    portalProps?: Omit<MenuPrimitive.Portal.Props, "container" | "children">;
  };

/**
 * A menu of the bar: Base UI's Portal, Positioner and Popup in one part, with the positioner's placement props
 * lifted. It docks under its title: the frame's bottom keyline is the shared edge, and the menu's top border lies on
 * it at the frame's weight. The surface is Menu's (MenuSurface), so it carries `data-slot="menu-popup"`.
 */
function MenubarPopup({
  anchor,
  side = "bottom",
  align = "start",
  sideOffset = 0,
  alignOffset,
  collisionPadding = 12,
  container,
  portalProps,
  className,
  ...props
}: MenubarPopupProps): React.ReactElement {
  const layout = React.useContext(MenubarLayout);
  const [marker, scope, probe] = useKeylineScope(false, container);
  return (
    <>
      {marker}
      <MenuPrimitive.Portal container={container} {...portalProps}>
        {probe}
        <MenuPrimitive.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <MenuSurface
            attachWeight={layout === "cell" ? 1 : 2}
            className={resolveClassName("min-w-[max(220px,var(--anchor-width))]", className)}
            {...props}
          />
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </>
  );
}

export { Menubar, MenubarMenu, MenubarTrigger, MenubarPopup };
/* A submenu's popup is Menu's MenuPopup, which docks beside its row. */
export {
  MenuItem as MenubarItem,
  MenuCheckboxItem as MenubarCheckboxItem,
  MenuRadioGroup as MenubarRadioGroup,
  MenuRadioItem as MenubarRadioItem,
  MenuSeparator as MenubarSeparator,
  MenuGroup as MenubarGroup,
  MenuGroupLabel as MenubarGroupLabel,
  MenuSubmenuRoot as MenubarSubmenuRoot,
  MenuSubmenuTrigger as MenubarSubmenuTrigger,
  MenuPopup as MenubarSubmenuPopup,
} from "./menu";
