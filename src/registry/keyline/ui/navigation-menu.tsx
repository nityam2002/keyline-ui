"use client";

import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { scopeProps, useDomDirection, useKeylineScope, useMergedRef } from "../lib/keyline-scope";
import { useScrollEdges } from "../lib/scroll-edges";
import { useStretch } from "../lib/keyline-motion";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/**
 * Navigation menu: site navigation whose sections open a panel of links (Base UI Navigation
 * Menu). For an application's own commands use Menubar; for an app's sections, Nav.
 *
 *   ┌──────────┬────────────┬─────────┬──────────┐
 *   │ Services▾│ Terminals ▾│ Pricing │ Contact  │   a control frame of cells: section triggers and links;
 *   └──────────┴────────────┼─────────┴──────────┘   the open trigger is the inverse cell, the current
 *   ┌───────────────────────┴──┬───────────────────┐  page's link is cobalt (location)
 *   │ Ocean freight     OCN    │ Customs     CUS   │   the panel docks to the frame's bottom keyline at its
 *   │ Door to door by sea      │ Filing, permits   │   weight, cells of links on shared seams (title, a
 *   ├──────────────────────────┼───────────────────┤   description, an optional code)
 *
 * - Behaviour is Base UI's: Tab moves between top-level items, Enter, Space or Down opens a section and
 *   moves into its panel; hover opens after a short delay; Escape closes and returns to the trigger.
 *   Left/Right follow the reading direction (the DOM `dir` is passed to Base UI).
 * - The panel never animates its size between sections (frames don't move); it unfolds from the frame's
 *   keyline when it opens (Unfold) and is instant under reduced motion. Moving from one open section to the
 *   next, the inverse cell stretches across to the new trigger (Stretch): the panel swaps in
 *   place, so the band is what says which section it now belongs to. Opening and closing do not stretch.
 * - Narrow: the frame scrolls sideways and marks its hidden edge; the panel is one column.
 *
 * Parts are named as Base UI names them. `NavigationMenu` is the root with its popup already in place;
 * `NavigationMenuRoot` and `NavigationMenuPopup` compose the same by hand.
 */
type Frame = {
  /** The list (the control frame) the panel docks to; set by NavigationMenuList. */
  frame: HTMLElement | null;
  setFrame: React.Dispatch<React.SetStateAction<HTMLElement | null>> | null;
};
const FrameContext = React.createContext<Frame>({ frame: null, setFrame: null });

/** The root: Base UI's NavigationMenu.Root, told the DOM's reading direction. */
function NavigationMenuRoot({
  className,
  ref: refProp,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>): React.ReactElement {
  const ref = React.useRef<HTMLElement | null>(null);
  const [frame, setFrame] = React.useState<HTMLElement | null>(null);
  const [dir] = useDomDirection(ref);
  const setRef = useMergedRef(ref, refProp);
  const value = React.useMemo(() => ({ frame, setFrame }), [frame]);
  return (
    <DirectionProvider direction={dir}>
      <FrameContext.Provider value={value}>
        <NavigationMenuPrimitive.Root
          ref={setRef}
          className={resolveClassName(
            "grid min-w-0 max-w-full grid-cols-[minmax(0,1fr)] justify-items-start",
            className,
          )}
          {...props}
          data-slot="navigation-menu"
        />
      </FrameContext.Provider>
    </DirectionProvider>
  );
}

/** The root with its popup in place: the list goes inside, the panel docks under it. */
function NavigationMenu({ children, ...props }: React.ComponentProps<typeof NavigationMenuRoot>): React.ReactElement {
  return (
    <NavigationMenuRoot {...props}>
      {children}
      <NavigationMenuPopup />
    </NavigationMenuRoot>
  );
}

/* the control frame. The band is its first child (the stretch engine's copy keeps it there as a placeholder, without
   its attributes, so these rules count children rather than read the band's markers): the first cell after it
   draws no divider, and its label clears the frame's cut. */
const list = cn(
  "kl-ctl kl-cells relative isolate m-0 min-h-(--kl-ctl) w-max max-w-full list-none overflow-x-auto bg-kl-cell p-0",
  "[&>:nth-child(2)]:border-s-0 [&>li:nth-child(2)>:is(a,button)]:ps-[calc(14px+var(--kl-c,0px)*0.35)]",
);

function NavigationMenuList({
  className,
  children,
  ref: refProp,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>): React.ReactElement {
  const ref = React.useRef<HTMLUListElement | null>(null);
  useScrollEdges(ref as React.RefObject<HTMLElement | null>);
  // the open trigger, as an index among the list's cells; Base UI owns the state, the band follows its attribute
  const [open, setOpen] = React.useState(-1);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // moving between sections, Base UI may close the old one a few ms before opening the next (WebKit):
    // a close is held briefly, so a section that opens within the grace makes the band travel instead of snap
    let grace = 0;
    const read = () => {
      const items = Array.from(el.querySelectorAll<HTMLElement>("[data-kl-item]"));
      const i = items.findIndex((it) => it.hasAttribute("data-popup-open"));
      clearTimeout(grace);
      if (i >= 0) setOpen(i);
      else grace = window.setTimeout(() => setOpen(-1), 80);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { subtree: true, childList: true, attributeFilter: ["data-popup-open"] });
    return () => {
      mo.disconnect();
      clearTimeout(grace);
    };
  }, []);
  useStretch(ref as React.RefObject<HTMLElement | null>, open);
  const { setFrame } = React.useContext(FrameContext);
  React.useLayoutEffect(() => {
    if (!setFrame) return;
    setFrame(ref.current);
    return () => setFrame(null);
  }, [setFrame]);
  const setRef = useMergedRef(ref, refProp);
  return (
    <NavigationMenuPrimitive.List
      ref={setRef}
      data-kl-stretch=""
      className={resolveClassName(list, className)}
      {...props}
      data-slot="navigation-menu-list"
    >
      {/* Stretch: the open trigger's inverse cell is a band that travels between sections (a presentational list
          item: a <ul> may only contain <li>) */}
      <li
        data-kl-band=""
        role="presentation"
        className="pointer-events-none absolute -z-1 list-none bg-kl-inverse forced-colors:hidden"
        aria-hidden
        hidden
      />
      {children}
    </NavigationMenuPrimitive.List>
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Item
      className={resolveClassName("flex flex-none", className)}
      {...props}
      data-slot="navigation-menu-item"
    />
  );
}

/* a top-level cell, trigger or link. The band paints the open cell; the label flips with the band's cover, so it is
   legible all the way across */
const cell = cn(
  "kl-key m-0 box-border flex min-h-full cursor-pointer items-center gap-1.5 border-0 bg-transparent bg-none px-3.5",
  "font-(family-name:--kl-font) text-(length:--kl-text-body) font-(--kl-weight-strong) whitespace-nowrap text-kl-ink no-underline outline-0",
  "hover:[&:not([data-popup-open],[data-kl-covered],[aria-current],[data-disabled])]:bg-kl-tint",
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus focus-visible:outline-solid",
  "forced-colors:data-kl-covered:text-inherit",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Trigger
      data-kl-item=""
      className={resolveClassName(
        cn(
          cell,
          "group/navigation-menu-trigger pe-2.5 data-kl-covered:text-kl-on-inverse",
          "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
          "forced-colors:data-popup-open:outline-3 forced-colors:data-popup-open:outline-offset-[-4px]",
          "forced-colors:data-popup-open:outline-[Highlight] forced-colors:data-popup-open:outline-solid",
        ),
        className,
      )}
      {...props}
      data-slot="navigation-menu-trigger"
    >
      <span>{children}</span>
      <NavigationMenuPrimitive.Icon
        data-slot="navigation-menu-icon"
        className="flex flex-none group-data-popup-open/navigation-menu-trigger:rotate-180"
      >
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="square"
          aria-hidden
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  );
}

/* the current page: the cobalt cell (location) */
const current = cn(
  "aria-[current=page]:bg-kl-cobalt aria-[current=page]:text-kl-on-cobalt aria-[current=page]:focus-visible:outline-kl-on-cobalt",
  "forced-colors:aria-[current=page]:bg-[Highlight] forced-colors:aria-[current=page]:text-[HighlightText]",
  "forced-colors:aria-[current=page]:forced-color-adjust-none",
);

/** A top-level link cell (no panel). `active` marks the current page (aria-current="page", cobalt). */
function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Link
      data-kl-item=""
      className={resolveClassName(
        cn(
          cell,
          current,
          "active:[&:not([data-kl-covered],[aria-current],[data-disabled])]:bg-kl-press",
          "[&[data-kl-covered]:not([aria-current])]:text-kl-on-inverse",
        ),
        className,
      )}
      {...props}
      data-slot="navigation-menu-link"
    />
  );
}

/** A section's panel content; it swaps in place inside the popup. */
function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Content
      className={resolveClassName(
        "@container box-border w-[min(600px,calc(100vw-24px-4px))] data-ending-style:opacity-0",
        className,
      )}
      {...props}
      data-slot="navigation-menu-content"
    />
  );
}

type PositionerProps = NavigationMenuPrimitive.Positioner.Props;

type NavigationMenuPopupProps = NavigationMenuPrimitive.Popup.Props &
  Pick<PositionerProps, "anchor" | "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"> & {
    /** Where the portal renders (defaults to <body>). */
    container?: NavigationMenuPrimitive.Portal.Props["container"];
    /** Props for Base UI's NavigationMenu.Portal. */
    portalProps?: Omit<NavigationMenuPrimitive.Portal.Props, "container" | "children">;
  };

/**
 * The panel: Base UI's Portal, Positioner, Popup and Viewport in one part, with the positioner's placement props
 * lifted. Docked to the frame (the list), not the open trigger: the trigger sits inside the frame's k2 border, so a
 * trigger-anchored panel ran k2 inside the frame's edge. On the frame, the panel's top border lies on the frame's
 * bottom border (sideOffset -k2) and their outer start edges coincide; the panel stays put between sections and never
 * animates its size. It carries the configuration of the place it is written.
 */
function NavigationMenuPopup({
  anchor,
  side = "bottom",
  align = "start",
  sideOffset = -2,
  alignOffset,
  collisionPadding = 12,
  container,
  portalProps,
  className,
  style,
  children,
  ...props
}: NavigationMenuPopupProps): React.ReactElement {
  const { frame } = React.useContext(FrameContext);
  const [marker, scope, probe] = useKeylineScope(false, container);
  return (
    <>
      {marker}
      <NavigationMenuPrimitive.Portal container={container} {...portalProps}>
        {probe}
        <NavigationMenuPrimitive.Positioner
          anchor={anchor ?? frame ?? undefined}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <NavigationMenuPrimitive.Popup
            className={resolveClassName(
              "kl-attached kl-dock box-border h-[var(--popup-height,auto)] max-h-none w-[var(--popup-width,auto)] overflow-visible bg-kl-cell",
              className,
            )}
            style={resolveStyle({ "--kl-attach": "2px" } as React.CSSProperties, style)}
            {...props}
            data-slot="navigation-menu-popup"
          >
            <NavigationMenuPrimitive.Viewport
              className="relative size-full overflow-hidden"
              data-slot="navigation-menu-viewport"
            />
            {children}
          </NavigationMenuPrimitive.Popup>
        </NavigationMenuPrimitive.Positioner>
      </NavigationMenuPrimitive.Portal>
    </>
  );
}

type PartState = Record<string, never>;
const PART_STATE: PartState = {};

/** The panel's links as cells on shared seams: two columns where there is room, one where there is not. Each cell
 * draws its end and bottom keylines; the grid's negative end and bottom margins hide the last ones. */
function NavigationMenuGrid({ render, className, style, children, ...props }: PartProps<"ul", PartState>) {
  const own = {
    "data-slot": "navigation-menu-grid",
    className: resolveClassName(
      cn(
        "m-0 -me-px -mb-px grid list-none grid-cols-[repeat(2,minmax(0,1fr))] p-0",
        "[@container_(max-width:420px)]:grid-cols-[minmax(0,1fr)]",
      ),
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: React.Children.map(children, (c) =>
      c == null || c === false ? null : (
        <li
          data-slot="navigation-menu-grid-item"
          className="flex border-e-(length:--kl-k1) border-b-(length:--kl-k1) border-e-kl-seam border-b-kl-seam"
        >
          {c}
        </li>
      ),
    ),
  };
  return useRender({ defaultTagName: "ul", render, state: PART_STATE, props: mergeProps<"ul">(props, own) });
}

type CardProps = Omit<React.ComponentProps<typeof NavigationMenuPrimitive.Link>, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** A Code-voice identifier at the cell's end (a service code, a terminal code). */
  code?: React.ReactNode;
};

/** A link cell in a panel: title, description, code. `active` marks the current page. */
function NavigationMenuCard({ className, title, description, code, ...props }: CardProps): React.ReactElement {
  return (
    <NavigationMenuPrimitive.Link
      className={resolveClassName(
        cn(
          "group/navigation-menu-card grid min-h-16 flex-1 grid-cols-[minmax(0,1fr)_auto] content-start gap-x-3 gap-y-0.5",
          "px-(--kl-inset) pt-2.5 pb-3 text-kl-ink no-underline outline-0",
          "hover:[&:not([aria-current])]:bg-kl-tint",
          "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus focus-visible:outline-solid",
          current,
        ),
        className,
      )}
      {...props}
      data-slot="navigation-menu-card"
    >
      <span data-slot="navigation-menu-card-title" className="text-(length:--kl-text-body) font-(--kl-weight-strong)">
        {title}
      </span>
      {code != null ? (
        <span
          data-slot="navigation-menu-card-code"
          className={cn(
            "font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/[1.6] font-medium not-italic normal-nums",
            "text-kl-ink-2 group-aria-[current=page]/navigation-menu-card:text-inherit",
          )}
        >
          {code}
        </span>
      ) : null}
      {description != null ? (
        <span
          data-slot="navigation-menu-card-description"
          className="col-span-full text-(length:--kl-text-label)/[1.4] text-kl-ink-2 group-aria-[current=page]/navigation-menu-card:text-inherit"
        >
          {description}
        </span>
      ) : null}
    </NavigationMenuPrimitive.Link>
  );
}

export {
  NavigationMenu,
  NavigationMenuRoot,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuPopup,
  NavigationMenuGrid,
  NavigationMenuCard,
};
