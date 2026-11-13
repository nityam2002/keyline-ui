"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { domDir } from "../lib/keyline-scope";
import { useStretch } from "../lib/keyline-motion";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/* Behaviour is Embla (as in shadcn and neobrutalism.dev): dragging, snapping, loop, alignment, slides per
   view, plugins. Keyline adds the APG carousel pattern without rotation (there is no autoplay, so no
   rotation control): a named region, slides as groups labelled "n of N", polite announcements of the
   slide that comes into view, arrow keys on the region (mirrored in RTL), slides out of view made inert
   so Tab never lands on a hidden link, and instant steps under reduced motion. */

type CarouselApi = UseEmblaCarouselType[1];
type Opts = Parameters<typeof useEmblaCarousel>[0];
type Plugins = Parameters<typeof useEmblaCarousel>[1];

type Ctx = {
  carouselRef: UseEmblaCarouselType[0];
  api: CarouselApi;
  orientation: "horizontal" | "vertical";
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  index: number;
  count: number;
  inView: number[];
};
const CarouselContext = React.createContext<Ctx | null>(null);

function useCarousel() {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) throw new Error("useCarousel must be used within a <Carousel />");
  return ctx;
}

const still = (el: Element | null) =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!el?.closest('[data-kl-motion="reduce"]');

/* ------------------------------------------------------------------ *
 * CLASSES
 * The position ticks are a stretch row: the engine clones it for a move and drops the clone's data-slot, so the
 * ticks and the band carry their own classes. What the orientation decides is chosen here from context; the root
 * mirrors it as data-orientation.
 * ------------------------------------------------------------------ */

/** the frame: a viewport of slides on 1px seams, the control row as its foot */
const root = "kl-frame flex min-w-0 flex-col bg-kl-cell";
const viewport = "min-w-0 overflow-hidden active:cursor-grabbing";
/* seams travel with the slides: each slide after the first draws the one it shares with its neighbour */
const track = cn(
  "flex touch-pan-y touch-pinch-zoom",
  "[&>[data-slot=carousel-item]+[data-slot=carousel-item]]:border-s-(length:--kl-k1)",
  "[&>[data-slot=carousel-item]+[data-slot=carousel-item]]:border-s-kl-seam",
);
const trackVertical = cn(
  "flex h-[var(--kl-carousel-h,320px)] touch-pan-x touch-pinch-zoom flex-col",
  "[&>[data-slot=carousel-item]+[data-slot=carousel-item]]:border-t-(length:--kl-k1)",
  "[&>[data-slot=carousel-item]+[data-slot=carousel-item]]:border-t-kl-seam",
);
const slide = "min-h-0 min-w-0 flex-[0_0_100%]";

const bar = cn(
  "kl-cells min-h-(--kl-ctl) border-t-(length:--kl-k1) border-t-kl-line",
  "[&>[data-slot=carousel-position]]:min-h-0 [&>[data-slot=carousel-position]]:flex-auto",
  "[&>[data-slot=carousel-position]]:justify-center [&>[data-slot=carousel-position]]:gap-3",
);

/* position ticks: a 24px target, an 8px square mark; the current one is the band (Stretch), not the tick */
const tick = cn(
  "box-border grid size-6 cursor-pointer appearance-none place-items-center bg-transparent p-0",
  "before:size-2 before:border-(length:--kl-k1) before:border-kl-line before:bg-transparent before:content-['']",
  "hover:[&:not([aria-current])]:before:bg-kl-tint",
  "active:[&:not([aria-current])]:before:border-kl-ink active:[&:not([aria-current])]:before:bg-kl-press",
  // the tick under the band gives up its outline, so the band reads as one solid mark at rest
  "[&[aria-current]]:before:border-transparent",
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus focus-visible:outline-solid",
  "forced-colors:[&:not([aria-current])]:before:border-[CanvasText]",
);
/* one ink mark 16x8, centred on its 24px tick (the band is inset 4px from the tick's box, so the mark is the band's
   full length) */
const band = cn(
  "pointer-events-none absolute -z-1",
  "before:absolute before:inset-x-0 before:top-1/2 before:h-2 before:-translate-y-1/2 before:bg-kl-ink before:content-['']",
  "forced-colors:before:bg-[Highlight] forced-colors:before:[forced-color-adjust:none]",
);

type CarouselState = { orientation: "horizontal" | "vertical" };
type CarouselPartState = Record<string, never>;
const PART_STATE: CarouselPartState = {};

type CarouselProps = Omit<PartProps<"section", CarouselState>, "dir"> & {
  /** Names the region ("Dock photos"). Required: a carousel is a landmark-like region. */
  "aria-label": string;
  opts?: Opts;
  plugins?: Plugins;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

/**
 * The frame. Slides sit side by side on 1px seams inside it; the control row (CarouselBar) is its foot.
 * Direction follows the page: in RTL the first slide is at the inline start and the arrows mirror.
 */
function Carousel({
  orientation = "horizontal",
  opts,
  plugins,
  setApi,
  render,
  className,
  style,
  children,
  ...props
}: CarouselProps): React.ReactElement {
  const ref = React.useRef<HTMLElement>(null);
  // first guess from the page, so an RTL page does not initialise embla twice
  const [rtl, setRtl] = React.useState(() => typeof document !== "undefined" && document.documentElement.dir === "rtl");
  React.useLayoutEffect(() => {
    if (ref.current) setRtl(domDir(ref.current) === "rtl");
  }, []);
  const [carouselRef, api] = useEmblaCarousel(
    { inViewThreshold: 0.5, ...opts, axis: orientation === "horizontal" ? "x" : "y", direction: rtl ? "rtl" : "ltr" },
    plugins,
  );
  const [s, setS] = React.useState({
    canScrollPrev: false,
    canScrollNext: false,
    index: 0,
    count: 0,
    inView: [] as number[],
  });
  const [said, say] = React.useState("");
  const sync = React.useCallback((a: CarouselApi) => {
    if (!a) return;
    setS({
      canScrollPrev: a.canScrollPrev(),
      canScrollNext: a.canScrollNext(),
      index: a.selectedScrollSnap(),
      count: a.scrollSnapList().length,
      inView: a.slidesInView(),
    });
  }, []);
  React.useEffect(() => {
    if (!api) return;
    setApi?.(api);
    sync(api);
    // a move is announced once it settles (never on load: nothing moved): the first slide now in view
    const onSettle = (a: CarouselApi) => {
      if (!a) return;
      const node = a.slideNodes()[Math.min(...a.slidesInView())];
      say(node?.getAttribute("aria-label") ?? "");
    };
    api.on("reInit", sync).on("select", sync).on("slidesInView", sync).on("settle", onSettle);
    return () => {
      api.off("reInit", sync).off("select", sync).off("slidesInView", sync).off("settle", onSettle);
    };
  }, [api, setApi, sync]);
  const scrollPrev = React.useCallback(() => api?.scrollPrev(still(ref.current)), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(still(ref.current)), [api]);
  // Arrow keys step only from the region itself, a slide, or the control row, in the bubble phase: anything inside a
  // slide that owns its arrows (a radio group, a link list, a field) acts first, and focus is never on content that
  // the step makes inert. (capturing on the whole region stole arrows from slide content and dropped focus
  // to the page when the focused slide went inert.)
  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const t = e.target as HTMLElement;
    const own =
      t === e.currentTarget || t.matches('[data-slot="carousel-item"]') || !!t.closest('[data-slot="carousel-bar"]');
    if (
      e.defaultPrevented ||
      !own ||
      t.closest("input, textarea, select, [contenteditable], [role=slider], [role=spinbutton]")
    )
      return;
    const [back, fwd] =
      orientation === "vertical"
        ? ["ArrowUp", "ArrowDown"]
        : rtl
          ? ["ArrowRight", "ArrowLeft"]
          : ["ArrowLeft", "ArrowRight"];
    if (e.key === back) {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === fwd) {
      e.preventDefault();
      scrollNext();
    }
  };
  const state: CarouselState = { orientation };
  const own = {
    "aria-roledescription": "carousel",
    "data-slot": "carousel",
    "data-orientation": orientation,
    className: resolveClassName(root, className)(state),
    style: resolveStyle(undefined, style)(state),
    children: (
      <>
        {children}
        <span className="kl-sr" aria-live="polite" aria-atomic="true">
          {said ? `Slide ${said}` : ""}
        </span>
      </>
    ),
  };
  const el = useRender({
    defaultTagName: "section",
    render,
    ref,
    state,
    // mergeProps calls handlers right to left: the consumer's onKeyDown runs first, so it can preventDefault a step
    props: mergeProps<"section">({ onKeyDown }, props, own),
  });
  return (
    <CarouselContext.Provider value={{ carouselRef, api, orientation, scrollPrev, scrollNext, ...s }}>
      {el}
    </CarouselContext.Provider>
  );
}

/**
 * The viewport, which clips the slides; the track inside it moves. `className`, `style` and `render` are the
 * viewport's; `trackClassName` styles the track.
 */
function CarouselContent({
  render,
  className,
  style,
  trackClassName,
  children,
  ...props
}: PartProps<"div", CarouselPartState> & { trackClassName?: string }): React.ReactElement {
  const { carouselRef, orientation } = useCarousel();
  const own = {
    "data-slot": "carousel-content",
    className: resolveClassName(viewport, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: (
      <div
        data-slot="carousel-track"
        data-orientation={orientation}
        className={cn(orientation === "vertical" ? trackVertical : track, trackClassName)}
      >
        {children}
      </div>
    ),
  };
  return useRender({
    defaultTagName: "div",
    render,
    ref: carouselRef,
    state: PART_STATE,
    props: mergeProps<"div">(props, own),
  });
}

/**
 * One slide: a group named "n of N". `basis` is the share of the viewport it takes ("50%" shows two).
 * Slides out of view are inert.
 */
function CarouselItem({
  render,
  className,
  style,
  basis,
  ...props
}: PartProps<"div", CarouselPartState> & { basis?: string }): React.ReactElement {
  const { inView, api } = useCarousel();
  const ref = React.useRef<HTMLDivElement>(null);
  const nodes = api?.slideNodes() ?? [];
  const index = ref.current ? nodes.indexOf(ref.current) : -1;
  const total = nodes.length;
  const hidden = index >= 0 && !inView.includes(index);
  const own = {
    role: "group",
    "aria-roledescription": "slide",
    "aria-label": index >= 0 ? `${index + 1} of ${total}` : undefined,
    "data-slot": "carousel-item",
    "data-in-view": hidden ? undefined : "",
    inert: hidden || undefined,
    className: resolveClassName(slide, className)(PART_STATE),
    style: resolveStyle(basis ? { flexBasis: basis } : undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, ref, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

/* in RTL the arrows mirror; vertical, they turn a quarter (and no longer mirror) */
function Chevron({ back }: { back?: boolean }) {
  const { orientation } = useCarousel();
  const turn =
    orientation === "vertical"
      ? back
        ? "[transform:rotate(-90deg)]"
        : "[transform:rotate(90deg)]"
      : back
        ? "[transform:scaleX(-1)] kl-rtl:[transform:none]"
        : "kl-rtl:[transform:scaleX(-1)]";
  return (
    <svg
      data-slot="carousel-chevron"
      className={cn("block", turn)}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      aria-hidden
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

/** Previous / next: cells of the control row, rendered by Button. At an end they stay focusable and say why they do
 *  nothing. */
function CarouselPrevious({ className, children, ...props }: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev, orientation } = useCarousel();
  return (
    <Button
      layout="cell"
      size="icon"
      aria-label="Previous slide"
      disabled={!canScrollPrev}
      focusableWhenDisabled
      data-orientation={orientation}
      className={resolveClassName("flex-none", className)}
      onClick={scrollPrev}
      {...props}
    >
      {children ?? <Chevron back />}
    </Button>
  );
}

function CarouselNext({ className, children, ...props }: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollNext, orientation } = useCarousel();
  return (
    <Button
      layout="cell"
      size="icon"
      aria-label="Next slide"
      disabled={!canScrollNext}
      focusableWhenDisabled
      data-orientation={orientation}
      className={resolveClassName("flex-none", className)}
      onClick={scrollNext}
      {...props}
    >
      {children ?? <Chevron />}
    </Button>
  );
}

/**
 * Where you are: "2 / 5" in the Code voice and a row of position ticks you can press. The current position is one
 * ink band that STRETCHES between ticks: its leading edge reaches the new tick first and the trailing edge
 * follows, so a step or a jump shows its direction and distance, the way the slides travel. Zero bounce; reduced
 * motion places it at once. With many slides (12 or more) the ticks give way to the count alone.
 */
function CarouselPosition({
  render,
  className,
  style,
  ...props
}: PartProps<"div", CarouselPartState>): React.ReactElement {
  const { index, count, api } = useCarousel();
  const ticks = React.useRef<HTMLSpanElement>(null);
  // inset 4: the band is the 16x8 mark itself (its ::before spans it), so a move clips it exactly at both ends
  useStretch(ticks, count ? index : -1, { press: false, inset: 4 });
  const own = {
    "data-slot": "carousel-position",
    className: resolveClassName("kl-cell", className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: (
      <>
        <span
          data-slot="carousel-count"
          className="kl-code min-w-[4.5ch] text-center text-kl-ink-2"
          dir="ltr"
          aria-hidden
        >
          {count ? index + 1 : 0} / {count}
        </span>
        <span
          ref={ticks}
          data-kl-stretch=""
          data-slot="carousel-ticks"
          className={cn("relative isolate flex items-center", count >= 12 && "hidden")}
        >
          <span data-kl-band="" className={band} aria-hidden hidden />
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              data-kl-item=""
              data-slot="carousel-tick"
              type="button"
              className={tick}
              aria-label={`Go to ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
              onClick={(e) => api?.scrollTo(i, still(e.currentTarget))}
            />
          ))}
        </span>
      </>
    ),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

/** The control row: previous, position, next. Compose your own from the same parts if needed. */
function CarouselBar({
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"div", CarouselPartState>): React.ReactElement {
  const own = {
    "data-slot": "carousel-bar",
    className: resolveClassName(bar, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: children ?? (
      <>
        <CarouselPrevious />
        <CarouselPosition />
        <CarouselNext />
      </>
    ),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselPosition,
  CarouselBar,
  useCarousel,
  type CarouselApi,
};
