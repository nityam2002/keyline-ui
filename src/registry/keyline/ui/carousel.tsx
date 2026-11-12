"use client";

import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { domDir } from "../lib/keyline-scope";
import { useStretch } from "../lib/keyline-motion";

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

type CarouselProps = Omit<React.ComponentProps<"section">, "dir"> & {
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
  className,
  children,
  onKeyDown,
  ...props
}: CarouselProps) {
  const root = React.useRef<HTMLElement>(null);
  // first guess from the page, so an RTL page does not initialise embla twice
  const [rtl, setRtl] = React.useState(() => typeof document !== "undefined" && document.documentElement.dir === "rtl");
  React.useLayoutEffect(() => {
    if (root.current) setRtl(domDir(root.current) === "rtl");
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
  const scrollPrev = React.useCallback(() => api?.scrollPrev(still(root.current)), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(still(root.current)), [api]);
  // Arrow keys step only from the region itself, a slide, or the control row, in the bubble phase: anything inside a
  // slide that owns its arrows (a radio group, a link list, a field) acts first, and focus is never on content that
  // the step makes inert. (capturing on the whole region stole arrows from slide content and dropped focus
  // to the page when the focused slide went inert.)
  const onKey = (e: React.KeyboardEvent<HTMLElement>) => {
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
  return (
    <CarouselContext.Provider value={{ carouselRef, api, orientation, scrollPrev, scrollNext, ...s }}>
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- arrow keys bubble from the slides and controls inside; the section is not itself a control */}
      <section
        ref={root}
        aria-roledescription="carousel"
        data-slot="carousel"
        data-orientation={orientation}
        className={cn("kl-frame kl-carousel", className)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          onKey(e);
        }}
        {...props}
      >
        {children}
        <span className="kl-sr" aria-live="polite" aria-atomic="true">
          {said ? `Slide ${said}` : ""}
        </span>
      </section>
    </CarouselContext.Provider>
  );
}

/** The viewport and track. */
function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="kl-carousel-vp" data-slot="carousel-content">
      <div className={cn("kl-carousel-track", className)} data-orientation={orientation} {...props} />
    </div>
  );
}

/**
 * One slide: a group named "n of N". `basis` is the share of the viewport it takes ("50%" shows two).
 * Slides out of view are inert.
 */
function CarouselItem({ className, style, basis, ...props }: React.ComponentProps<"div"> & { basis?: string }) {
  const { inView, api } = useCarousel();
  const ref = React.useRef<HTMLDivElement>(null);
  const nodes = api?.slideNodes() ?? [];
  const index = ref.current ? nodes.indexOf(ref.current) : -1;
  const total = nodes.length;
  const hidden = index >= 0 && !inView.includes(index);
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={index >= 0 ? `${index + 1} of ${total}` : undefined}
      data-slot="carousel-item"
      data-in-view={hidden ? undefined : ""}
      inert={hidden || undefined}
      className={cn("kl-carousel-slide", className)}
      style={{ ...(basis ? { flexBasis: basis } : null), ...style }}
      {...props}
    />
  );
}

const Chevron = ({ back }: { back?: boolean }) => (
  <svg
    className="kl-carousel-chev"
    data-back={back ? "" : undefined}
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

/** Previous / next: cells of the control row. At an end they stay focusable and say why they do nothing. */
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
      className={cn("kl-carousel-step", className)}
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
      className={cn("kl-carousel-step", className)}
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
 * motion places it at once.
 */
function CarouselPosition({ className }: { className?: string }) {
  const { index, count, api } = useCarousel();
  const ticks = React.useRef<HTMLSpanElement>(null);
  // inset 4: the band is the 16x8 mark itself (its ::before spans it), so a move clips it exactly at both ends
  useStretch(ticks, count ? index : -1, { press: false, inset: 4 });
  return (
    <div className={cn("kl-cell kl-carousel-pos", className)}>
      <span className="kl-code kl-carousel-n" dir="ltr" aria-hidden>
        {count ? index + 1 : 0} / {count}
      </span>
      <span ref={ticks} data-kl-stretch="" className="kl-carousel-ticks">
        <span data-kl-band="" className="kl-carousel-band" aria-hidden hidden />
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            data-kl-item=""
            type="button"
            className="kl-carousel-tick"
            aria-label={`Go to ${i + 1} of ${count}`}
            aria-current={i === index ? "true" : undefined}
            onClick={(e) => api?.scrollTo(i, still(e.currentTarget))}
          />
        ))}
      </span>
    </div>
  );
}

/** The control row: previous, position, next. Compose your own from the same parts if needed. */
function CarouselBar({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("kl-cells kl-carousel-bar", className)} data-slot="carousel-bar" {...props}>
      {children ?? (
        <>
          <CarouselPrevious />
          <CarouselPosition />
          <CarouselNext />
        </>
      )}
    </div>
  );
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
