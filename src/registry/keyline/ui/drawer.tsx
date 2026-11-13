"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope, type KeylineScope } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle } from "../lib/keyline-render";
import { releaseEasing, velocityTracker } from "../lib/keyline-motion";
import { DialogFooter, DialogHeader } from "./dialog";

/* A drawer is a sheet you can swipe away, on Base UI Drawer (as the reference): the swipe, its velocity,
   snap points, nested drawers, focus trap, Escape, scroll lock and the keyboard inset are the library's.
   Keyline adds the construction (the page-facing edge at region weight, no radius, a grip cell on that
   edge), logical sides (end and start mirror in RTL) and motion on the system's timings (reduced motion
   lands at once; a swipe still follows the finger). Use Sheet when nothing should be swiped. */

type Side = "bottom" | "end" | "start";
const DrawerSide = React.createContext<{ side: Side; scope: KeylineScope; snap: boolean; probe: React.ReactNode }>({
  side: "bottom",
  scope: {},
  snap: false,
  probe: null,
});

const physical = (side: Side, rtl: boolean): React.ComponentProps<typeof DrawerPrimitive.Root>["swipeDirection"] =>
  side === "bottom" ? "down" : (side === "end") !== rtl ? "right" : "left";

type DrawerProps = Omit<React.ComponentProps<typeof DrawerPrimitive.Root>, "swipeDirection"> & {
  /** bottom (default) · end (the inline end; right in LTR, left in RTL) · start. The drawer swipes away toward its side. */
  side?: Side;
};

/** The drawer's root: Base UI's Drawer.Root with a logical `side` in place of the physical `swipeDirection`. */
function Drawer({ side = "bottom", children, ...props }: DrawerProps): React.ReactElement {
  // read only while the drawer is mounted (the probe sits in its portal); a closed drawer costs nothing
  const [marker, scope, probe] = useKeylineScope(false);
  return (
    <DrawerSide.Provider value={{ side, scope, snap: !!props.snapPoints?.length, probe }}>
      {marker}
      <DrawerPrimitive.Root swipeDirection={physical(side, scope.dir === "rtl")} {...props}>
        {children}
      </DrawerPrimitive.Root>
    </DrawerSide.Provider>
  );
}

/** The element that opens the drawer. Rendered as another part (`render={<Button />}`), the element is that part's
 * and carries its data-slot. */
function DrawerTrigger(props: DrawerPrimitive.Trigger.Props): React.ReactElement {
  return <DrawerPrimitive.Trigger {...props} data-slot="drawer-trigger" />;
}

function DrawerClose(props: DrawerPrimitive.Close.Props): React.ReactElement {
  return <DrawerPrimitive.Close {...props} data-slot="drawer-close" />;
}

/* the scrim fades as the drawer is swiped away; with snap points a lower snap is a resting state, not a dismissal,
   so the scrim keeps half its strength there */
const backdrop = cn(
  "fixed inset-0 z-(--kl-z-overlay) bg-kl-scrim",
  "opacity-[max(var(--kl-scrim-min,0),calc(1_-_var(--drawer-swipe-progress,0)))]",
  "transition-opacity duration-[calc(var(--kl-t-unfold)*1.5)] ease-linear data-swiping:duration-0",
  "data-ending-style:opacity-0 data-ending-style:duration-(--kl-t-fold) data-starting-style:opacity-0",
  "data-kl-snap:[--kl-scrim-min:0.5] data-kl-snap:data-ending-style:[--kl-scrim-min:0] data-kl-snap:data-starting-style:[--kl-scrim-min:0]",
);

/*
 * The drawer: edge-attached, the page-facing edge at region weight (as Sheet); it follows the finger
 * (--drawer-swipe-movement-*) and slides from its side on the system's unfold timing. A sheet-sized travel gets 1.25×
 * the unfold (200ms), inside the 220ms everyday cap; it leaves on the fold. Released by the hand, the curve starts at
 * the release velocity (useReleaseFromHand).
 */
const popup = cn(
  "group/drawer kl-frame pointer-events-auto fixed flex flex-col border-0 bg-kl-cell text-kl-ink outline-0",
  "[--kl-cell:var(--kl-raised)] [--kl-move:calc(var(--kl-t-unfold)*1.25)]",
  "transition-[transform] duration-(--kl-move) ease-(--kl-ease-out) will-change-transform",
  "data-swiping:duration-0 data-swiping:select-none",
  "data-ending-style:ease-(--kl-ease-in) data-ending-style:[--kl-move:calc(var(--kl-t-fold)*1.25)]",
  "data-kl-released:not-data-swiping:ease-[var(--kl-release-back,var(--kl-ease-out))]",
  "data-kl-released:data-ending-style:ease-[var(--kl-release-out,var(--kl-ease-out))]",
  // bottom: full width, its top edge faces the page; the cut on its top-start corner
  "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0",
  "data-[swipe-direction=down]:h-[var(--kl-drawer-size,auto)] data-[swipe-direction=down]:max-h-[calc(100dvh-48px)]",
  "data-[swipe-direction=down]:border-t-(length:--kl-k3)",
  "data-[swipe-direction=down]:[transform:translateY(calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px)))]",
  "data-[swipe-direction=down]:data-ending-style:[transform:translateY(100%)] data-[swipe-direction=down]:data-starting-style:[transform:translateY(100%)]",
  // after a grip, the header sits closer to the edge
  "data-[swipe-direction=down]:[&>[data-slot=drawer-grip]+[data-slot=dialog-header]]:pt-1",
  // end/start: full height; the page-facing edge is the inline one; no cut (its corner is the screen's)
  "[&:is([data-swipe-direction=right],[data-swipe-direction=left])]:inset-y-0",
  "[&:is([data-swipe-direction=right],[data-swipe-direction=left])]:w-[min(var(--kl-drawer-size,400px),calc(100vw-40px))]",
  "[&:is([data-swipe-direction=right],[data-swipe-direction=left])]:[--kl-cut-size:0px]",
  "[&:is([data-swipe-direction=right],[data-swipe-direction=left])]:[transform:translateX(var(--drawer-swipe-movement-x,0px))]",
  "data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:border-l-(length:--kl-k3)",
  "data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:border-r-(length:--kl-k3)",
  "data-[swipe-direction=right]:data-ending-style:[transform:translateX(100%)] data-[swipe-direction=right]:data-starting-style:[transform:translateX(100%)]",
  "data-[swipe-direction=left]:data-ending-style:[transform:translateX(-100%)] data-[swipe-direction=left]:data-starting-style:[transform:translateX(-100%)]",
);

/* the grip: a short ink bar on the page-facing edge (decorative: Escape and Close always work) */
const grip = cn(
  "grid h-[18px] flex-none cursor-grab touch-none place-items-center",
  "before:h-[3px] before:w-10 before:bg-kl-ink-3 forced-colors:before:bg-[CanvasText]",
  "group-data-swiping/drawer:cursor-grabbing group-data-swiping/drawer:before:bg-kl-ink",
  "group-data-[swipe-direction=right]/drawer:absolute group-data-[swipe-direction=right]/drawer:inset-y-0 group-data-[swipe-direction=right]/drawer:left-0",
  "group-data-[swipe-direction=left]/drawer:absolute group-data-[swipe-direction=left]/drawer:inset-y-0 group-data-[swipe-direction=left]/drawer:right-0",
  "group-data-[swipe-direction=right]/drawer:z-1 group-data-[swipe-direction=right]/drawer:h-auto group-data-[swipe-direction=right]/drawer:w-[18px]",
  "group-data-[swipe-direction=left]/drawer:z-1 group-data-[swipe-direction=left]/drawer:h-auto group-data-[swipe-direction=left]/drawer:w-[18px]",
  "group-data-[swipe-direction=right]/drawer:before:h-10 group-data-[swipe-direction=right]/drawer:before:w-[3px]",
  "group-data-[swipe-direction=left]/drawer:before:h-10 group-data-[swipe-direction=left]/drawer:before:w-[3px]",
);

type DrawerPopupProps = DrawerPrimitive.Popup.Props & {
  /** Height (bottom) or width (end/start), px or any CSS length. */
  size?: number | string;
  /** Hide the grip cell (it is decorative: the swipe works anywhere on the drawer, Escape and Close always do). */
  hideGrip?: boolean;
  /** Where the portal renders (defaults to <body>). */
  container?: DrawerPrimitive.Portal.Props["container"];
  /** Props for Base UI's Drawer.Portal. */
  portalProps?: Omit<DrawerPrimitive.Portal.Props, "container" | "children">;
};

/**
 * The drawer: Base UI's Portal, Backdrop, Viewport and Popup in one part. It carries the configuration of the place
 * the Drawer is written (read by Drawer, which needs the direction to pick the swipe side).
 */
function DrawerPopup({
  className,
  style,
  size,
  hideGrip,
  container,
  portalProps,
  children,
  ref: refProp,
  ...props
}: DrawerPopupProps): React.ReactElement {
  const { side, scope, snap, probe } = React.useContext(DrawerSide);
  const len = typeof size === "number" ? `${size}px` : size;
  const ref = useReleaseFromHand(refProp);
  return (
    <DrawerPrimitive.Portal container={container} {...portalProps}>
      {probe}
      <DrawerPrimitive.Backdrop
        data-kl-snap={snap ? "" : undefined}
        {...scopeProps(scope, { className: backdrop })}
        data-slot="drawer-backdrop"
      />
      <DrawerPrimitive.Viewport
        {...scopeProps(scope, { className: "pointer-events-none fixed inset-0 z-(--kl-z-overlay)" })}
        data-slot="drawer-viewport"
      >
        <DrawerPrimitive.Popup
          data-side={side}
          ref={ref}
          className={resolveClassName(popup, className)}
          style={resolveStyle(len ? ({ "--kl-drawer-size": len } as React.CSSProperties) : undefined, style)}
          {...props}
          data-slot="drawer-popup"
        >
          {hideGrip ? null : <span data-slot="drawer-grip" className={grip} aria-hidden />}
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}

/**
 * RELEASE: a released drawer starts at the speed the hand let go at, both ways. Base UI decides
 * whether the swipe dismisses or springs back; at release Keyline writes one curve for each outcome
 * (--kl-release-back, --kl-release-out) whose first slope matches the pointer's velocity, so a fling leaves
 * without the stall an ease-in gave it (it nearly stopped, then accelerated away), and a drag that came to rest
 * returns from rest instead of jumping 20px in its first frame.
 */
function useReleaseFromHand(forward?: React.Ref<HTMLDivElement>) {
  const cleanup = React.useRef<() => void>(undefined);
  const fwd = React.useRef(forward);
  fwd.current = forward;
  return React.useCallback((el: HTMLDivElement | null) => {
    const f = fwd.current;
    if (typeof f === "function") f(el);
    else if (f) (f as React.RefObject<HTMLDivElement | null>).current = el;
    cleanup.current?.();
    cleanup.current = undefined;
    if (!el) return;
    const vt = velocityTracker();
    let clear: ReturnType<typeof setTimeout> | undefined;
    const move = (e: PointerEvent) => {
      if (el.hasAttribute("data-swiping")) vt.push(e);
    };
    const down = () => vt.reset();
    const up = (e: PointerEvent) => {
      if (!el.hasAttribute("data-swiping")) return;
      const dir = el.getAttribute("data-swipe-direction");
      const y = dir === "down";
      const cs = getComputedStyle(el);
      const moved = Math.abs(
        parseFloat(cs.getPropertyValue(y ? "--drawer-swipe-movement-y" : "--drawer-swipe-movement-x")) || 0,
      );
      const size = y ? el.offsetHeight : el.offsetWidth;
      const v = vt.get(e.timeStamp);
      const out = dir === "down" ? v.y : dir === "right" ? v.x : dir === "left" ? -v.x : 0; // toward dismissal
      const ms = (name: string, k: number) => (parseFloat(cs.getPropertyValue(name)) || 0) * k;
      el.style.setProperty("--kl-release-back", releaseEasing(-out, moved, ms("--kl-t-unfold", 1.25)));
      el.style.setProperty("--kl-release-out", releaseEasing(out, size - moved, ms("--kl-t-fold", 1.25)));
      el.setAttribute("data-kl-released", "");
      clearTimeout(clear);
      clear = setTimeout(() => el.removeAttribute("data-kl-released"), ms("--kl-t-unfold", 1.25) + 80);
    };
    el.addEventListener("pointerdown", down, true);
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", up, true);
    cleanup.current = () => {
      clearTimeout(clear);
      el.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
    };
  }, []);
}

/** The scrolling body (Base UI's Drawer.Content). A swipe that starts here scrolls first and dismisses only from the
 * scroll edge. */
function DrawerBody({ className, ...props }: DrawerPrimitive.Content.Props): React.ReactElement {
  return (
    <DrawerPrimitive.Content
      className={resolveClassName(
        "grid min-h-0 flex-[1_1_auto] content-start gap-4 overflow-y-auto overscroll-contain p-[18px]",
        className,
      )}
      {...props}
      data-slot="drawer-body"
    />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props): React.ReactElement {
  return (
    <DrawerPrimitive.Title
      className={resolveClassName("m-0 text-(length:--kl-text-title)/[1.2] font-(--kl-weight-strong)", className)}
      {...props}
      data-slot="drawer-title"
    />
  );
}

function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props): React.ReactElement {
  return (
    <DrawerPrimitive.Description
      className={resolveClassName("m-0 text-kl-ink-2", className)}
      {...props}
      data-slot="drawer-description"
    />
  );
}

const DrawerRoot = Drawer;
const DrawerHeader = DialogHeader;
const DrawerFooter = DialogFooter;

export {
  Drawer,
  DrawerRoot,
  DrawerTrigger,
  DrawerClose,
  DrawerPopup,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
