"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle } from "../lib/keyline-render";

/*
 * A menu is one grid: a code column (as wide as the widest code, so an ID like SH-20482 never wraps), the
 * labels, and the shortcuts. Every row (inside groups too) is a subgrid of it, so the labels share one edge.
 * Rows are separated by soft rules; the cursor is the inverse row; a destructive row is red text that floods
 * red under the cursor. Parts are named as Base UI names them.
 */

/** Rows carry this attribute: a row that follows another row draws the soft rule between them. */
const ROW = { "data-kl-menu-row": "" } as const;

const surface = cn(
  "kl-attached kl-dock grid max-h-(--available-height) min-w-[max(240px,var(--anchor-width))] content-start overflow-auto",
  "bg-kl-cell text-(length:--kl-text-body) text-kl-ink outline-0 *:col-span-full",
  "grid-cols-[minmax(32px,max-content)_minmax(0,1fr)_auto]",
  "[&_[data-kl-menu-row]+[data-kl-menu-row]]:border-t-(length:--kl-k1) [&_[data-kl-menu-row]+[data-kl-menu-row]]:border-t-kl-line-soft",
  // no row carries a code or an indicator: the code column is not drawn (no empty, ruled gutter). The popup reads
  // its own rows and the code cells read --kl-menu-code-e: a :has() on the popup in the code cell's selector would
  // restyle the whole document on every DOM change (see item.tsx)
  "[--kl-menu-code-e:initial]",
  "not-has-[[data-slot=menu-item-code]:not(:empty)]:grid-cols-[0_minmax(0,1fr)_auto]",
  "not-has-[[data-slot=menu-item-code]:not(:empty)]:[--kl-menu-code-e:0px]",
);

type SurfaceProps = MenuPrimitive.Popup.Props & {
  /** Keyline weight of the owner's shared edge: 2 for a standalone control, 1 for a cell. */
  attachWeight?: 1 | 2 | 3;
};

/**
 * The menu's surface: Base UI's Menu.Popup with Keyline's look, without a portal or a positioner. MenuPopup
 * uses it; so do menus positioned their own way (a context menu at the pointer, a menubar or toolbar menu
 * docked to its row). Give it the rows below.
 */
function MenuSurface({ className, style, attachWeight = 2, children, ...props }: SurfaceProps): React.ReactElement {
  return (
    <MenuPrimitive.Popup
      className={resolveClassName(surface, className)}
      style={resolveStyle({ "--kl-attach": `${attachWeight}px` } as React.CSSProperties, style)}
      {...props}
      data-slot="menu-popup"
    >
      {/* a submenu written inside this surface is its own submenu again (MenuSubmenuRoot re-provides it) */}
      <InSubmenu.Provider value={false}>{children}</InSubmenu.Provider>
    </MenuPrimitive.Popup>
  );
}

/** Set by MenuSubmenuRoot: a MenuPopup inside it docks beside the parent row, not under a trigger. */
const InSubmenu = React.createContext(false);

/**
 * A menu written inside a ButtonGroup docks to the group's frame, not to its trigger cell: the cell sits
 * inside the frame's k2 border, so docking to the cell would leave the menu's edges a border-width inside the
 * frame's. The anchor is the trigger cell with every edge that touches the frame moved onto the frame's
 * outer edge (in a row: the top and bottom always, the start/end for the first/last cell).
 */
function useFrameDock() {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [frame, setFrame] = React.useState<HTMLElement | null>(null);
  // Runs after every render on purpose: the frame can change without any prop changing. The setter bails out
  // when the frame is the same, so this settles after one pass.
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- re-reads the DOM each render; see above
  React.useLayoutEffect(() => {
    const next = ref.current?.closest<HTMLElement>('[data-slot="button-group"]') ?? null;
    setFrame((prev) => (prev === next ? prev : next));
  });
  const anchor = React.useMemo(() => {
    if (!frame) return undefined;
    return {
      contextElement: frame,
      getBoundingClientRect() {
        const f = frame.getBoundingClientRect();
        const trigger = Array.from(frame.querySelectorAll<HTMLElement>('[aria-expanded="true"]')).find(
          (el) => el.closest('[data-slot="button-group"]') === frame,
        );
        if (!trigger) return f;
        const t = trigger.getBoundingClientRect();
        const cs = getComputedStyle(frame);
        const near = (gap: number, border: string) => gap <= parseFloat(border) + 0.5;
        const left = near(t.left - f.left, cs.borderLeftWidth) ? f.left : t.left;
        const right = near(f.right - t.right, cs.borderRightWidth) ? f.right : t.right;
        const top = near(t.top - f.top, cs.borderTopWidth) ? f.top : t.top;
        const bottom = near(f.bottom - t.bottom, cs.borderBottomWidth) ? f.bottom : t.bottom;
        return new DOMRect(left, top, right - left, bottom - top);
      },
    };
  }, [frame]);
  return { marker: <span ref={ref} hidden data-kl-dock-probe="" />, anchor };
}

type PositionerProps = MenuPrimitive.Positioner.Props;

type MenuPopupProps = SurfaceProps &
  Pick<PositionerProps, "anchor" | "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"> & {
    /** Where the portal renders (defaults to <body>). */
    container?: MenuPrimitive.Portal.Props["container"];
    /** Props for Base UI's Menu.Portal. */
    portalProps?: Omit<MenuPrimitive.Portal.Props, "container" | "children">;
  };

/**
 * The menu: Base UI's Portal, Positioner and Popup in one part, with the positioner's placement props lifted.
 * A docked surface: its shared edge sits on the owner's keyline, it unfolds from that edge, it has no cut. In
 * a submenu it docks beside its row instead: its start border on the parent's end border, its first row level
 * with the trigger row. It carries the configuration (cut, density, motion, theme, dir) of the place it is
 * written, not of <body>.
 */
function MenuPopup({
  anchor,
  side,
  align = "start",
  sideOffset,
  alignOffset,
  collisionPadding,
  attachWeight = 2,
  container,
  portalProps,
  className,
  ...props
}: MenuPopupProps): React.ReactElement {
  const submenu = React.useContext(InSubmenu);
  const [marker, scope, probe] = useKeylineScope(false, container);
  const frameDock = useFrameDock();
  // Base UI resolves `inline-end` from its DirectionProvider, which the page may not set; a submenu reads the
  // direction its parent menu carries (scope.dir) and picks the physical side itself
  const place = submenu
    ? {
        side: side ?? (scope.dir === "rtl" ? "left" : "right"),
        align,
        sideOffset: sideOffset ?? 0,
        alignOffset: alignOffset ?? -2,
        collisionPadding: collisionPadding ?? 8,
      }
    : {
        anchor: anchor ?? frameDock.anchor,
        side: side ?? "bottom",
        align,
        sideOffset: sideOffset ?? (attachWeight === 1 ? 0 : -attachWeight),
        alignOffset,
        collisionPadding,
      };
  return (
    <>
      {marker}
      {submenu ? null : frameDock.marker}
      <MenuPrimitive.Portal container={container} {...portalProps}>
        {probe}
        <MenuPrimitive.Positioner {...place} {...scopeProps(scope, { className: "kl-positioner" })}>
          <MenuSurface
            attachWeight={attachWeight}
            className={resolveClassName(submenu ? "min-w-[200px]" : "", className)}
            {...props}
          />
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </>
  );
}

/* ------------------------------------------------------------------ rows */

const row = cn(
  "group/menu-item grid min-h-(--kl-row) cursor-default grid-cols-subgrid items-stretch outline-0 select-none",
  "data-highlighted:bg-kl-inverse data-highlighted:text-kl-on-inverse",
  "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
  "forced-colors:data-highlighted:outline-3 forced-colors:data-highlighted:outline-offset-[-4px]",
  "forced-colors:data-highlighted:outline-[Highlight]",
);

/* the leading cell: an index code, or a checkbox or radio indicator */
const codeCell = cn(
  "grid place-items-center border-e-[length:var(--kl-menu-code-e,var(--kl-k1))] border-e-kl-seam px-2 whitespace-nowrap empty:px-0",
  "font-(family-name:--kl-font-mono) text-(length:--kl-text-code) text-kl-ink-2",
  "group-data-highlighted/menu-item:border-e-kl-on-inverse group-data-highlighted/menu-item:text-inherit",
  "group-data-popup-open/menu-item:border-e-kl-on-inverse group-data-popup-open/menu-item:text-inherit",
);

function RowLabel({ children, description }: { children: React.ReactNode; description?: React.ReactNode }) {
  return (
    <span data-slot="menu-item-label" className="grid content-center gap-px px-3 py-1.5">
      <span>{children}</span>
      {description ? (
        <small
          className={cn(
            "text-(length:--kl-text-meta) text-kl-ink-2 group-data-disabled/menu-item:text-kl-ink-2",
            "group-data-highlighted/menu-item:text-inherit group-data-popup-open/menu-item:text-inherit",
          )}
        >
          {description}
        </small>
      ) : null}
    </span>
  );
}

function RowShortcut({ shortcut }: { shortcut?: React.ReactNode }) {
  return shortcut ? (
    <kbd
      data-slot="menu-item-shortcut"
      className={cn(
        "me-2.5 inline-grid h-[22px] min-w-[22px] place-items-center self-center px-[5px]",
        "border-(length:--kl-k1) border-current font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/none font-medium",
      )}
    >
      {shortcut}
    </kbd>
  ) : (
    <span />
  );
}

type MenuItemProps = MenuPrimitive.Item.Props & {
  /** Index code shown in the leading cell; only when a key or a reference uses it. */
  code?: React.ReactNode;
  shortcut?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
};

function MenuItem({
  className,
  code,
  shortcut,
  description,
  variant = "default",
  children,
  ...props
}: MenuItemProps): React.ReactElement {
  return (
    <MenuPrimitive.Item
      data-variant={variant}
      {...ROW}
      className={resolveClassName(
        cn(
          row,
          // a disabled destructive row reads disabled: the red is the action's, and it cannot be taken
          "data-[variant=destructive]:font-(--kl-weight-strong) data-[variant=destructive]:not-data-disabled:text-kl-red-text",
          "data-[variant=destructive]:data-highlighted:bg-kl-red data-[variant=destructive]:data-highlighted:text-kl-on-red",
        ),
        className,
      )}
      {...props}
      data-slot="menu-item"
    >
      <span data-slot="menu-item-code" className={codeCell} aria-hidden={code == null || undefined}>
        {code}
      </span>
      <RowLabel description={description}>{children}</RowLabel>
      <RowShortcut shortcut={shortcut} />
    </MenuPrimitive.Item>
  );
}

/* ------------------------------------------------------------------ *
 * CHECKBOX AND RADIO ITEMS
 * The leading code cell becomes the indicator cell. A checkbox item's box takes a tick; a radio item's
 * box takes a filled square: two shapes, so the kind reads without colour. The box is drawn in the
 * row's text colour, so it inverts with the cursor. Checking an item keeps the menu open (Base UI's
 * default for these items); pass closeOnClick to close it.
 * ------------------------------------------------------------------ */
const box = cn(
  "grid size-3.5 place-items-center border-(length:--kl-k2) border-current text-kl-ink",
  "group-data-disabled/menu-item:text-kl-dis group-data-highlighted/menu-item:text-kl-on-inverse",
  "forced-colors:text-[CanvasText] forced-colors:forced-color-adjust-none",
  "forced-colors:group-data-highlighted/menu-item:text-[CanvasText]",
);

function Indicator({ kind, children }: { kind: "checkbox" | "radio"; children: React.ReactNode }) {
  return (
    <span data-slot="menu-item-code" className={cn(codeCell, "px-0")} aria-hidden>
      <span
        data-slot="menu-item-box"
        data-kind={kind}
        className={cn(box, kind === "checkbox" && "has-[[data-slot=menu-item-indicator]]:bg-current")}
      >
        {children}
      </span>
    </span>
  );
}

type ChoiceProps = { shortcut?: React.ReactNode; description?: React.ReactNode };

function MenuCheckboxItem({
  className,
  shortcut,
  description,
  children,
  ...props
}: MenuPrimitive.CheckboxItem.Props & ChoiceProps): React.ReactElement {
  return (
    <MenuPrimitive.CheckboxItem
      {...ROW}
      className={resolveClassName(row, className)}
      {...props}
      data-slot="menu-checkbox-item"
    >
      <Indicator kind="checkbox">
        <MenuPrimitive.CheckboxItemIndicator
          data-slot="menu-item-indicator"
          className={cn(
            "grid size-full place-items-center text-kl-cell group-data-highlighted/menu-item:text-kl-inverse",
            "forced-colors:text-[Canvas] [&_svg]:block",
          )}
        >
          <svg
            viewBox="0 0 10 10"
            width="10"
            height="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="square"
          >
            <path d="m2 5.25 2 2 4-4.5" />
          </svg>
        </MenuPrimitive.CheckboxItemIndicator>
      </Indicator>
      <RowLabel description={description}>{children}</RowLabel>
      <RowShortcut shortcut={shortcut} />
    </MenuPrimitive.CheckboxItem>
  );
}

/** One exclusive choice among MenuRadioItems; controlled (value, onValueChange) or uncontrolled (defaultValue). */
function MenuRadioGroup({ className, ...props }: MenuPrimitive.RadioGroup.Props): React.ReactElement {
  return (
    <MenuPrimitive.RadioGroup
      className={resolveClassName("grid grid-cols-subgrid *:col-span-full", className)}
      {...props}
      data-slot="menu-radio-group"
    />
  );
}

function MenuRadioItem({
  className,
  shortcut,
  description,
  children,
  ...props
}: MenuPrimitive.RadioItem.Props & ChoiceProps): React.ReactElement {
  return (
    <MenuPrimitive.RadioItem
      {...ROW}
      className={resolveClassName(row, className)}
      {...props}
      data-slot="menu-radio-item"
    >
      <Indicator kind="radio">
        <MenuPrimitive.RadioItemIndicator
          data-slot="menu-item-indicator"
          className="size-1.5 bg-current forced-colors:text-[CanvasText] forced-colors:forced-color-adjust-none"
        />
      </Indicator>
      <RowLabel description={description}>{children}</RowLabel>
      <RowShortcut shortcut={shortcut} />
    </MenuPrimitive.RadioItem>
  );
}

/* ------------------------------------------------------------------ *
 * SUBMENUS
 * <MenuSubmenuRoot><MenuSubmenuTrigger>…</MenuSubmenuTrigger><MenuPopup>…</MenuPopup></MenuSubmenuRoot>
 * The trigger is an ordinary row whose trailing cell is a › that mirrors in RTL; while its submenu is open it
 * keeps the cursor (inverse). The submenu's MenuPopup docks beside the parent and unfolds from that shared
 * edge. Hover intent, Arrow Right/Left, Escape and focus return are Base UI's.
 * ------------------------------------------------------------------ */
function MenuSubmenuRoot(props: MenuPrimitive.SubmenuRoot.Props): React.ReactElement {
  return (
    <InSubmenu.Provider value={true}>
      <MenuPrimitive.SubmenuRoot {...props} />
    </InSubmenu.Provider>
  );
}

type MenuSubmenuTriggerProps = MenuPrimitive.SubmenuTrigger.Props & {
  code?: React.ReactNode;
  description?: React.ReactNode;
};

function MenuSubmenuTrigger({
  className,
  code,
  description,
  children,
  ...props
}: MenuSubmenuTriggerProps): React.ReactElement {
  return (
    <MenuPrimitive.SubmenuTrigger
      {...ROW}
      className={resolveClassName(
        cn(
          row,
          "data-popup-open:bg-kl-inverse data-popup-open:text-kl-on-inverse",
          "forced-colors:data-popup-open:outline-3 forced-colors:data-popup-open:outline-offset-[-4px]",
          "forced-colors:data-popup-open:outline-[Highlight]",
        ),
        className,
      )}
      {...props}
      data-slot="menu-submenu-trigger"
    >
      <span data-slot="menu-item-code" className={codeCell} aria-hidden={code == null || undefined}>
        {code}
      </span>
      <RowLabel description={description}>{children}</RowLabel>
      <span className="grid w-8 place-items-center self-stretch kl-rtl:[&_svg]:-scale-x-100" aria-hidden>
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="square"
        >
          <path d="m6 4 4 4-4 4" />
        </svg>
      </span>
    </MenuPrimitive.SubmenuTrigger>
  );
}

/* ------------------------------------------------------------------ structure */

function MenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props): React.ReactElement {
  return (
    <MenuPrimitive.Separator
      className={resolveClassName("h-0 border-t-(length:--kl-k1) border-t-kl-seam", className)}
      {...props}
      data-slot="menu-separator"
    />
  );
}

function MenuGroup({ className, ...props }: MenuPrimitive.Group.Props): React.ReactElement {
  return (
    <MenuPrimitive.Group
      className={resolveClassName("grid grid-cols-subgrid *:col-span-full", className)}
      {...props}
      data-slot="menu-group"
    />
  );
}

function MenuGroupLabel({ className, ...props }: MenuPrimitive.GroupLabel.Props): React.ReactElement {
  return (
    <MenuPrimitive.GroupLabel
      className={resolveClassName(
        "block px-3 pt-2 pb-1 font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/[1.2] font-medium text-kl-ink-2",
        className,
      )}
      {...props}
      data-slot="menu-group-label"
    />
  );
}

const Menu = MenuPrimitive.Root;

/** The element that opens the menu. Rendered as another part (`render={<Button />}`), the element is that part's
 * and carries its data-slot (each part sets its own after the props it is given). */
function MenuTrigger(props: MenuPrimitive.Trigger.Props): React.ReactElement {
  return <MenuPrimitive.Trigger {...props} data-slot="menu-trigger" />;
}

export {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuSurface,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuGroup,
  MenuGroupLabel,
  MenuSubmenuRoot,
  MenuSubmenuTrigger,
};
