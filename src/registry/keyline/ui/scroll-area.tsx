"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName } from "../lib/keyline-render";
import { useDomDirection, useMergedRef } from "../lib/keyline-scope";

type ScrollbarVisibility = "system" | "scroll" | "always";
type ScrollAreaTrack = "cell" | "rail";
type ScrollAreaBarsAxis = "vertical" | "horizontal" | "both";
type Orientation = "vertical" | "horizontal";

/* What the root decides and its bars draw: the track, which bars exist, and the resolved reveal mode. Passed through
   context rather than read from the root's attributes, so a scroll area inside another one draws its own bars (an
   ancestor's `track="rail"` never reaches a nested region's bar). */
type ScrollAreaContextValue = { track: ScrollAreaTrack; reveal: "scroll" | "always"; scrollbars: ScrollAreaBarsAxis };
const ScrollAreaContext = React.createContext<ScrollAreaContextValue>({
  track: "cell",
  reveal: "always",
  scrollbars: "vertical",
});
const OrientationContext = React.createContext<Orientation>("vertical");

/* Whether the platform's own scrollbars take space (classic) or overlay content. The browser exposes the
   user's choice only this way: an overflow:scroll box is narrower than its border box when bars are classic.
   Measured once per page; a mouse plugged in later is picked up on the next load. */
let classicBars: boolean | undefined;
function nativeBarsTakeSpace() {
  if (classicBars === undefined) {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:absolute;top:-200px;width:50px;height:50px;overflow:scroll;visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
    classicBars = probe.offsetWidth - probe.clientWidth > 0;
    probe.remove();
  }
  return classicBars;
}
const noSubscribe = () => () => {};
/** "scroll" (thumbs reveal and fade) or "always", resolved from the platform for "system". */
function useScrollbarReveal(visibility: ScrollbarVisibility) {
  const classic = React.useSyncExternalStore(noSubscribe, nativeBarsTakeSpace, () => false);
  return visibility === "system" ? (classic ? "always" : "scroll") : visibility;
}

/*
 * The root: size it (height or max-height); the viewport fills it and scrolls natively. It is the outermost Keyline
 * element of a region that stands alone (kl-type), so its content takes Keyline's type and ink from it.
 * Reveal timing (after macOS overlay scrollbars): the thumb is there within a frame of the first scroll
 * (--kl-t-reveal), holds while the axis is still settling (Base UI keeps data-scrolling 500ms after the last scroll,
 * then --kl-reveal-hold), then fades (--kl-t-conceal): about 0.9s from the last input to the start of the fade, as
 * macOS does. Reduced motion makes reveal and fade immediate; the idle hold is timing, not motion.
 * Focus: the viewport is the focusable element (whenever it overflows). Its ring is drawn by the root, inside the
 * region and ABOVE the bars, so a bar never hides part of it.
 */
const root = cn(
  "kl-type relative isolate flex min-h-0 min-w-0 flex-col overflow-hidden",
  "[--kl-reveal-hold:400ms] [--kl-sb:12px] [--kl-t-conceal:300ms] [--kl-t-grip:120ms] [--kl-t-reveal:90ms]",
  "motion-reduce:[--kl-t-conceal:0ms] motion-reduce:[--kl-t-grip:0ms] motion-reduce:[--kl-t-reveal:0ms]",
  "in-data-[kl-motion=reduce]:[--kl-t-conceal:0ms] in-data-[kl-motion=reduce]:[--kl-t-grip:0ms] in-data-[kl-motion=reduce]:[--kl-t-reveal:0ms]",
  "data-[kl-motion=reduce]:[--kl-t-conceal:0ms] data-[kl-motion=reduce]:[--kl-t-grip:0ms] data-[kl-motion=reduce]:[--kl-t-reveal:0ms]",
  "has-[>:focus-visible]:after:pointer-events-none has-[>:focus-visible]:after:absolute has-[>:focus-visible]:after:inset-0",
  "has-[>:focus-visible]:after:z-2 has-[>:focus-visible]:after:content-['']",
  "has-[>:focus-visible]:after:outline-(length:--kl-ring) has-[>:focus-visible]:after:outline-offset-(--kl-ring-in)",
  "has-[>:focus-visible]:after:outline-kl-focus has-[>:focus-visible]:after:outline-solid",
  "forced-colors:has-[>:focus-visible]:after:outline-[3px] forced-colors:has-[>:focus-visible]:after:-outline-offset-4",
  "forced-colors:has-[>:focus-visible]:after:outline-[Highlight]",
);

/* The viewport gives up the bar's width, but only while that axis overflows and has a bar, so the bar never covers
   content. The room is on the viewport, not the content, so it adds to the content's own padding (a dialog body keeps
   its inset beside the bar, and a focus ring in that inset is not hidden under the bar). */
const viewportVariants = cva("min-h-0 min-w-0 flex-[1_1_auto] outline-0 outline-none", {
  variants: {
    scrollbars: {
      vertical: "data-has-overflow-y:pe-(--kl-sb)",
      horizontal: "data-has-overflow-x:pb-(--kl-sb)",
      both: "data-has-overflow-x:pb-(--kl-sb) data-has-overflow-y:pe-(--kl-sb)",
    },
  },
  defaultVariants: { scrollbars: "vertical" },
});

/*
 * A scrollbar is a cell on the region's edge: it owns the 1px seam to the content; the thumb is a solid block inset
 * 2px. The cell and its seam stay while the axis overflows, so nothing moves when the thumb reveals or fades.
 * The 2px inset at each END of the travel is a margin, not padding. Base UI takes the bar's box as the track and its
 * travel-axis padding as the thumb's inset, but a track press subtracts the padding of BOTH ends where the thumb only
 * sits after the start one (@base-ui/react 1.9.0, ScrollAreaScrollbar onPointerDown): with padding the thumb landed
 * 2px short of the pointer, and WebKit's whole-pixel clientY made that up to 3.05px depending on where the region sat
 * on the page. With a margin the bar's box is exactly the thumb's travel and every Base UI measurement is exact.
 * The cell still runs the full edge: ::after paints it (fill and seam) under the 2px end strips, and a press there
 * is the bar's own (the pseudo-element's hits are its), so it is still a track press.
 * track="rail": a region that is not a frame has no edge for a cell to sit on. The bar keeps its width (content still
 * gives it room) but drops the fill and the seam: a 1px keyline rail runs its length and the thumb is a solid block
 * centred on it (across the bar only; along the bar Base UI positions it).
 */
const scrollbarVariants = cva(
  "group/scroll-area-scrollbar z-1 box-border flex forced-colors:border-[CanvasText] forced-colors:after:border-[CanvasText]",
  {
    variants: {
      track: {
        cell: "bg-kl-cell p-0.5 after:absolute after:-z-1 after:border-0 after:border-solid after:border-kl-seam after:bg-kl-cell after:content-['']",
        rail: cn(
          "items-start justify-center border-0 p-0",
          "before:absolute before:-z-1 before:bg-kl-line-soft before:content-['']",
          "forced-colors:before:bg-[GrayText] forced-colors:before:forced-color-adjust-none",
        ),
      },
      orientation: { vertical: "w-(--kl-sb)", horizontal: "h-(--kl-sb) flex-col" },
    },
    compoundVariants: [
      {
        track: "cell",
        orientation: "vertical",
        className: cn(
          "my-0.5 border-s-(length:--kl-k1) border-s-kl-seam py-0",
          "after:-inset-y-0.5 after:start-[calc(-1*var(--kl-k1))] after:end-0 after:border-s-(length:--kl-k1)",
        ),
      },
      {
        track: "cell",
        orientation: "horizontal",
        className: cn(
          "mx-0.5 border-t-(length:--kl-k1) border-t-kl-seam px-0",
          "after:-inset-x-0.5 after:top-[calc(-1*var(--kl-k1))] after:bottom-0 after:border-t-(length:--kl-k1)",
        ),
      },
      {
        track: "rail",
        orientation: "vertical",
        className: "before:inset-y-0 before:start-[calc(50%-var(--kl-k1)/2)] before:w-(--kl-k1)",
      },
      {
        track: "rail",
        orientation: "horizontal",
        className: "before:inset-x-0 before:top-[calc(50%-var(--kl-k1)/2)] before:h-(--kl-k1)",
      },
    ],
    defaultVariants: { track: "cell", orientation: "vertical" },
  },
);

/*
 * The thumb. Tone says state: rest ink-3, pointer over the bar ink-2, held ink (all >= 3:1 against the cell in both
 * themes). A forgiving grip: ::after reaches 6px beyond either end of the thumb (a press there takes the thumb where
 * it is, no jump) and across the bar covers the cell's inset. Pseudo-element hits are the thumb's own.
 * REVEAL (reveal="scroll"; "always" keeps the bar shown). Hidden, the thumb is transparent and slim (4 of its 7px in a
 * cell, half on a rail) but still hit-tested, so a press that lands on it a moment after it faded grabs it in place.
 * Shown while its axis scrolls (wheel, trackpad, touch, keys, a drag), while held, while the pointer is on the bar
 * (the cell is the activation zone: the region's own edge, so nearby links keep theirs) and while a jump the reader
 * asked for travels (data-kl-travel on the root, set by MessageScroller). Showing is near-immediate and never delayed;
 * a renewed reveal retargets from the current opacity. On the bar it widens to the cell; held, it stays wide.
 * More contrast and forced colours always show it, full width.
 */
const shown =
  "group-data-scrolling/scroll-area-scrollbar:opacity-100 group-data-scrolling/scroll-area-scrollbar:[transition-duration:var(--kl-t-reveal),var(--kl-t-grip),var(--kl-t-grip)] group-data-scrolling/scroll-area-scrollbar:[transition-delay:0s] " +
  "group-active/scroll-area-scrollbar:opacity-100 group-active/scroll-area-scrollbar:[scale:1] group-active/scroll-area-scrollbar:[transition-duration:var(--kl-t-reveal),var(--kl-t-grip),var(--kl-t-grip)] group-active/scroll-area-scrollbar:[transition-delay:0s] " +
  "group-hover/scroll-area-scrollbar:opacity-100 group-hover/scroll-area-scrollbar:[scale:1] group-hover/scroll-area-scrollbar:[transition-duration:var(--kl-t-reveal),var(--kl-t-grip),var(--kl-t-grip)] group-hover/scroll-area-scrollbar:[transition-delay:0s] " +
  "contrast-more:opacity-100! contrast-more:[scale:none]! contrast-more:[transition:background-color_var(--kl-t-grip)_linear]";
const thumbVariants = cva(
  cn(
    "relative origin-center bg-kl-ink-3 after:absolute after:content-['']",
    "[transition:opacity_var(--kl-t-conceal)_linear_var(--kl-reveal-hold),scale_var(--kl-t-grip)_var(--kl-ease-out),background-color_var(--kl-t-grip)_linear]",
    "group-hover/scroll-area-scrollbar:bg-kl-ink-2 group-active/scroll-area-scrollbar:bg-kl-ink",
    "forced-colors:[scale:none]! forced-colors:bg-[CanvasText]! forced-colors:opacity-100! forced-colors:transition-none",
    "forced-colors:forced-color-adjust-none",
  ),
  {
    variants: {
      track: { cell: "flex-[1_1_auto]", rail: "flex-none" },
      orientation: { vertical: "", horizontal: "" },
      reveal: { scroll: "opacity-0", always: "" },
    },
    compoundVariants: [
      { track: "cell", orientation: "vertical", className: "after:-inset-x-0.5 after:-inset-y-1.5" },
      { track: "cell", orientation: "horizontal", className: "after:-inset-x-1.5 after:-inset-y-0.5" },
      { track: "rail", orientation: "vertical", className: "w-1.5 after:-inset-x-[3px] after:-inset-y-1.5" },
      { track: "rail", orientation: "horizontal", className: "h-1.5 after:-inset-x-1.5 after:-inset-y-[3px]" },
      { reveal: "scroll", className: shown },
      { reveal: "scroll", track: "cell", orientation: "vertical", className: "[scale:calc(4/7)_1]" },
      { reveal: "scroll", track: "cell", orientation: "horizontal", className: "[scale:1_calc(4/7)]" },
      { reveal: "scroll", track: "rail", orientation: "vertical", className: "[scale:0.5_1]" },
      { reveal: "scroll", track: "rail", orientation: "horizontal", className: "[scale:1_0.5]" },
      {
        reveal: "scroll",
        orientation: "vertical",
        className:
          "[[data-kl-travel]>[data-orientation=vertical]>&]:opacity-100 [[data-kl-travel]>[data-orientation=vertical]>&]:[transition-delay:0s] [[data-kl-travel]>[data-orientation=vertical]>&]:[transition-duration:var(--kl-t-reveal),var(--kl-t-grip),var(--kl-t-grip)]",
      },
    ],
    defaultVariants: { track: "cell", orientation: "vertical", reveal: "always" },
  },
);

/* both bars: the corner cell closes the L-junction of their two seams; on a rail there is no junction to close */
const cornerVariants = cva("z-1 box-border forced-colors:border-[CanvasText]", {
  variants: {
    track: {
      cell: "border-s-(length:--kl-k1) border-t-(length:--kl-k1) border-kl-seam bg-kl-cell",
      rail: "border-0 bg-transparent",
    },
  },
  defaultVariants: { track: "cell" },
});

type ScrollAreaRootProps = ScrollAreaPrimitive.Root.Props & {
  /** Which scrollbars the region has (ScrollAreaScrollbar parts to render). Default: vertical. */
  scrollbars?: ScrollAreaBarsAxis;
  /**
   * How a bar meets the region (declared, never inferred from ancestors).
   * cell (default): the region is a frame or sits inside one; each bar is a cell on its edge with a 1px seam.
   * rail: the region is not a frame (a page or a pane on the page background); a bar has no cell to belong
   * to, so it is a 1px keyline rail with the solid thumb centred on it.
   */
  track?: ScrollAreaTrack;
  /**
   * When a thumb shows (the bar's cell and seam are always there while its axis overflows).
   * system (default): follow the platform. Where native scrollbars overlay content (macOS "Automatically",
   * iOS, Android), the thumb shows while that axis scrolls, while the pointer is over the bar, and while
   * it is held, then fades. Where native scrollbars take space (macOS "Always", Windows, a mouse on
   * "Automatically"), it always shows.
   * scroll: always behave like an overlay platform. always: always show.
   * Forced colours and a request for more contrast always show it.
   */
  scrollbarVisibility?: ScrollbarVisibility;
};

/* A component built on the scroll area (Dialog's body, Table's scroller, MessageScroller) names the element it renders
   with its own `data-slot`; anywhere else the part's slot names it. */
const slotOf = (props: object, slot: string) => (props as { "data-slot"?: string })["data-slot"] ?? slot;

/** The root (Base UI ScrollArea.Root): direction, construction attributes and the resolved reveal mode. */
function ScrollAreaRoot({
  className,
  scrollbars = "vertical",
  track = "cell",
  scrollbarVisibility = "system",
  ref: outerRef,
  ...props
}: ScrollAreaRootProps): React.ReactElement {
  const ref = React.useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(ref, outerRef);
  const [dir] = useDomDirection(ref);
  const reveal = useScrollbarReveal(scrollbarVisibility);
  const context = React.useMemo(() => ({ track, reveal, scrollbars }), [track, reveal, scrollbars]);
  return (
    <ScrollAreaContext.Provider value={context}>
      <DirectionProvider direction={dir}>
        <ScrollAreaPrimitive.Root
          ref={setRef}
          {...dataAttrs({ "kl-bars": scrollbars, "kl-track": track, "kl-reveal": reveal })}
          className={resolveClassName(root, className)}
          {...props}
          data-slot={slotOf(props, "scroll-area")}
        />
      </DirectionProvider>
    </ScrollAreaContext.Provider>
  );
}

/** The viewport (Base UI ScrollArea.Viewport): the native scroller, focusable while it overflows. */
function ScrollAreaViewport({ className, ...props }: ScrollAreaPrimitive.Viewport.Props): React.ReactElement {
  const { scrollbars } = React.useContext(ScrollAreaContext);
  return (
    <ScrollAreaPrimitive.Viewport
      className={resolveClassName(cn(viewportVariants({ scrollbars })), className)}
      {...props}
      data-slot={slotOf(props, "scroll-area-viewport")}
    />
  );
}

/** The content (Base UI ScrollArea.Content): what scrolls. Lay it out with `className`. */
function ScrollAreaContent({ className, ...props }: ScrollAreaPrimitive.Content.Props): React.ReactElement {
  return (
    <ScrollAreaPrimitive.Content
      className={resolveClassName("", className)}
      {...props}
      data-slot="scroll-area-content"
    />
  );
}

/** A scrollbar (Base UI ScrollArea.Scrollbar): a cell on the region's edge, or a rail. Renders only while its axis
 *  overflows. */
function ScrollAreaScrollbar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props): React.ReactElement {
  const { track } = React.useContext(ScrollAreaContext);
  return (
    <OrientationContext.Provider value={orientation}>
      <ScrollAreaPrimitive.Scrollbar
        orientation={orientation}
        {...dataAttrs({ "kl-track": track })}
        className={resolveClassName(cn(scrollbarVariants({ track, orientation })), className)}
        {...props}
        data-slot="scroll-area-scrollbar"
      />
    </OrientationContext.Provider>
  );
}

/** The thumb (Base UI ScrollArea.Thumb). */
function ScrollAreaThumb({ className, ...props }: ScrollAreaPrimitive.Thumb.Props): React.ReactElement {
  const { track, reveal } = React.useContext(ScrollAreaContext);
  const orientation = React.useContext(OrientationContext);
  return (
    <ScrollAreaPrimitive.Thumb
      {...dataAttrs({ "kl-track": track, "kl-reveal": reveal })}
      className={resolveClassName(cn(thumbVariants({ track, orientation, reveal })), className)}
      {...props}
      data-slot="scroll-area-thumb"
    />
  );
}

/** The corner (Base UI ScrollArea.Corner), where two bars meet. */
function ScrollAreaCorner({ className, ...props }: ScrollAreaPrimitive.Corner.Props): React.ReactElement {
  const { track } = React.useContext(ScrollAreaContext);
  return (
    <ScrollAreaPrimitive.Corner
      className={resolveClassName(cn(cornerVariants({ track })), className)}
      {...props}
      data-slot="scroll-area-corner"
    />
  );
}

/** The bars, thumbs and corner of a scroll area, as its root's `scrollbars` asks. Shared by ScrollArea and
 *  MessageScroller. */
function ScrollAreaBars({ scrollbars: axes }: { scrollbars?: ScrollAreaBarsAxis }): React.ReactElement {
  const fromRoot = React.useContext(ScrollAreaContext).scrollbars;
  const scrollbars = axes ?? fromRoot;
  const v = scrollbars !== "horizontal";
  const h = scrollbars !== "vertical";
  return (
    <>
      {v ? (
        <ScrollAreaScrollbar orientation="vertical">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      ) : null}
      {h ? (
        <ScrollAreaScrollbar orientation="horizontal">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      ) : null}
      {v && h ? <ScrollAreaCorner /> : null}
    </>
  );
}

type ScrollAreaProps = Omit<ScrollAreaRootProps, "children"> & {
  children?: React.ReactNode;
  /**
   * Names the scrollable region. The viewport is focusable whenever it overflows (Base UI), so keyboard
   * users can scroll content that has no focusable children; a name tells them what they are in.
   * Give it when the region is not already labelled by its surroundings.
   */
  label?: string;
  viewportClassName?: string;
  contentClassName?: string;
};

/**
 * A native scroll container with Keyline scrollbars (Base UI Scroll Area), built from the parts above. Scrolling
 * itself is the browser's: wheel, trackpad, touch momentum, keyboard and find-in-page all behave natively; Base UI
 * hides the native bar and drives the thumb from the real scroll position.
 *
 * Construction: a scrollbar is a cell on the region's inline-end (or block-end) edge. It owns the 1px
 * seam that divides it from the content; its thumb is a solid block inset 2px. Content is padded by
 * the bar's width only while that axis overflows, so the bar never covers text. With both bars, the
 * corner cell closes the L-junction. Bars render only while their axis overflows.
 *
 * Behaviour (after macOS overlay scrollbars): the cell stays, the thumb reveals inside it.
 * Scrolling an axis shows its thumb slim at once; the pointer on the bar widens it to the cell and darkens
 * it; holding it inks it. A short idle after the last of these, it fades; new input brings it back from
 * wherever the fade is. Pressing the track lands the thumb under the pointer and keeps dragging.
 */
function ScrollArea({
  children,
  scrollbars = "vertical",
  label,
  viewportClassName,
  contentClassName,
  ...props
}: ScrollAreaProps): React.ReactElement {
  return (
    <ScrollAreaRoot scrollbars={scrollbars} {...props}>
      <ScrollAreaViewport className={viewportClassName} role={label ? "region" : undefined} aria-label={label}>
        <ScrollAreaContent className={contentClassName}>{children}</ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaBars />
    </ScrollAreaRoot>
  );
}

export {
  ScrollArea,
  ScrollAreaRoot,
  ScrollAreaViewport,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
  ScrollAreaBars,
  type ScrollAreaProps,
  type ScrollAreaRootProps,
  type ScrollbarVisibility,
};
