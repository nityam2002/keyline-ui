"use client";

import * as React from "react";
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/* Root is Base UI's PreviewCard.Root: controlled or uncontrolled `open`, `onOpenChange`, `actionsRef`,
   `handle` (one card for many triggers) and the payload render function all pass through untouched. */
const HoverCardRoot = PreviewCardPrimitive.Root;
const HoverCard = HoverCardRoot;
/** A handle shares one card between many triggers (a column of names): `PreviewCard.createHandle()` in Base UI. */
const createHoverCardHandle = PreviewCardPrimitive.createHandle;

/*
 * The trigger is a link whose underline is a keyline: 1px at rest, and while the open delay runs a 2px ink keyline
 * draws over it from the reading start, timed to the delay (linear, so its position IS the time left). Leaving early
 * retracts it quickly. Open, it stays drawn. Reduced motion: no drawing (--kl-hc-draw is 0%), it appears with the card.
 */
const trigger = cn(
  "cursor-pointer box-decoration-clone pb-0.5 font-(--kl-weight-strong) text-inherit no-underline",
  "bg-[linear-gradient(currentColor,currentColor),linear-gradient(var(--kl-ink-3),var(--kl-ink-3))] bg-no-repeat",
  "[background-position:0_100%,0_100%] kl-rtl:[background-position:100%_100%,100%_100%]",
  "[background-size:0%_2px,100%_1px] transition-[background-size] duration-(--kl-t-fold) ease-(--kl-ease-in)",
  "hover:duration-[var(--kl-hc-delay,600ms)] hover:ease-linear hover:not-data-popup-open:[background-size:var(--kl-hc-draw,100%)_2px,100%_1px]",
  "focus-visible:duration-[var(--kl-hc-delay,600ms)] focus-visible:ease-linear focus-visible:not-data-popup-open:[background-size:var(--kl-hc-draw,100%)_2px,100%_1px]",
  "data-popup-open:[background-size:100%_2px,100%_1px] data-popup-open:transition-none",
  "motion-reduce:transition-none motion-reduce:[--kl-hc-draw:0%]",
  "in-data-[kl-motion=reduce]:transition-none in-data-[kl-motion=reduce]:[--kl-hc-draw:0%]",
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-2 focus-visible:outline-kl-focus focus-visible:outline-solid",
  "forced-colors:bg-none forced-colors:underline",
);

/**
 * The link being previewed. It stays an ordinary link: a press goes to `href` (the place with everything
 * the card shows), keyboard focus also opens the card, and on touch the card never opens. While the open
 * delay runs, its underline draws along the keyline from the reading start, so the wait reads as "a preview
 * is coming", not as lag; leaving early retracts it. Open, the underline is a full ink 2px keyline.
 */
function HoverCardTrigger({
  className,
  delay = 600,
  closeDelay = 300,
  style,
  ...props
}: PreviewCardPrimitive.Trigger.Props): React.ReactElement {
  return (
    <PreviewCardPrimitive.Trigger
      delay={delay}
      closeDelay={closeDelay}
      className={resolveClassName(trigger, className)}
      style={resolveStyle({ "--kl-hc-delay": `${delay}ms` } as React.CSSProperties, style)}
      {...props}
      data-slot="hover-card-trigger"
    />
  );
}

/*
 * THE CARD: a control frame (2px, the control cut) with rows of cells on seams, and the size container of its facts.
 * ENTRY: where the cut is a corner shape (Chromium) the card unfolds from the edge that faces the link (clip-path,
 * the Unfold behaviour). Elsewhere clip-path IS the cut, so the card fades instead; a clip-path transition there would
 * erase the corner. A closing card ignores the pointer.
 */
const card = cn(
  "kl-ctl @container flex max-h-(--available-height) w-[min(320px,calc(100vw-24px))] flex-col overflow-auto",
  "bg-kl-cell font-(family-name:--kl-font) text-(length:--kl-text-body) text-kl-ink outline-0",
  "[&>*+*]:border-t-(length:--kl-k1) [&>*+*]:border-t-kl-seam",
  "transition-opacity duration-(--kl-t-unfold) ease-linear",
  "data-ending-style:pointer-events-none data-ending-style:duration-(--kl-t-fold)",
  "not-supports-[corner-start-start-shape:bevel]:data-starting-style:opacity-0",
  "not-supports-[corner-start-start-shape:bevel]:data-ending-style:opacity-0",
  "supports-[corner-start-start-shape:bevel]:transition-[clip-path] supports-[corner-start-start-shape:bevel]:[clip-path:inset(-4px)]",
  "supports-[corner-start-start-shape:bevel]:ease-(--kl-ease-out) supports-[corner-start-start-shape:bevel]:data-ending-style:ease-(--kl-ease-in)",
  "supports-[corner-start-start-shape:bevel]:[&:is([data-starting-style],[data-ending-style])[data-side=bottom]]:[clip-path:inset(0_0_100%_0)]",
  "supports-[corner-start-start-shape:bevel]:[&:is([data-starting-style],[data-ending-style])[data-side=top]]:[clip-path:inset(100%_0_0_0)]",
  "supports-[corner-start-start-shape:bevel]:[&:is([data-starting-style],[data-ending-style]):is([data-side=right],[data-side=inline-end])]:[clip-path:inset(0_100%_0_0)]",
  "supports-[corner-start-start-shape:bevel]:[&:is([data-starting-style],[data-ending-style]):is([data-side=left],[data-side=inline-start])]:[clip-path:inset(0_0_0_100%)]",
);

type PositionerProps = PreviewCardPrimitive.Positioner.Props;

type HoverCardPopupProps = PreviewCardPrimitive.Popup.Props &
  Pick<PositionerProps, "anchor" | "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"> & {
    /** Where the portal renders (defaults to <body>). */
    container?: PreviewCardPrimitive.Portal.Props["container"];
    /** Props for Base UI's PreviewCard.Portal. */
    portalProps?: Omit<PreviewCardPrimitive.Portal.Props, "container" | "children">;
  };

/**
 * The preview: Base UI's Portal, Positioner and Popup in one part, with the positioner's placement props lifted. A
 * control frame one gutter from the link (a card about a word in running text is not docked to it; a frame cannot
 * share an edge with an underline). It unfolds from the side that faces the link, carries the configuration of the
 * place it is written, and lifts to the overlay surface. Supplementary only: Base UI keeps it out of the keyboard and
 * screen-reader order, so put nothing in it that isn't also at the link's destination, and no controls.
 */
function HoverCardPopup({
  anchor,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  alignOffset,
  collisionPadding = 12,
  container,
  portalProps,
  className,
  ...props
}: HoverCardPopupProps): React.ReactElement {
  const [marker, scope, probe] = useKeylineScope(false, container);
  return (
    <>
      {marker}
      <PreviewCardPrimitive.Portal container={container} {...portalProps}>
        {probe}
        <PreviewCardPrimitive.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <PreviewCardPrimitive.Popup
            className={resolveClassName(card, className)}
            {...props}
            data-slot="hover-card-popup"
          />
        </PreviewCardPrimitive.Positioner>
      </PreviewCardPrimitive.Portal>
    </>
  );
}

type PartState = Record<string, never>;
const PART_STATE: PartState = {};

type HoverCardHeaderProps = Omit<PartProps<"div", PartState>, "title"> & {
  /** A square leading cell: an Avatar with layout="cell", a logo, a 16px glyph or a code. */
  media?: React.ReactNode;
  title: React.ReactNode;
  /** One line under the title in the UI voice: a role, a place. */
  description?: React.ReactNode;
  /** A trailing cell in the Code voice: the record's ID, a handle. */
  code?: React.ReactNode;
};

/** The card's top row of cells: media · title and description · code. Long titles wrap; the code cell keeps its width. */
function HoverCardHeader({
  media,
  title,
  description,
  code,
  render,
  className,
  style,
  ...props
}: HoverCardHeaderProps): React.ReactElement {
  const own = {
    "data-slot": "hover-card-header",
    className: resolveClassName(
      cn(
        "kl-cells min-h-14 flex-none [&>:not(:first-child)]:border-s-kl-seam",
        // the cut takes the corner: the first cell steps clear of it (like Popover's header); a media cell widens instead
        "[&>:first-child:not([data-slot=hover-card-media])]:ms-[calc(var(--kl-c,0px)*0.35)]",
      ),
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: (
      <>
        {media != null ? (
          <span
            data-slot="hover-card-media"
            className={cn(
              "box-border grid min-h-14 w-[calc(56px+var(--kl-c,0px)*0.35)] flex-none place-items-center ps-[calc(var(--kl-c,0px)*0.35)]",
              "font-(family-name:--kl-font-mono) text-(length:--kl-text-label)/none font-(--kl-weight-strong) text-kl-ink-2 not-italic normal-nums",
            )}
          >
            {media}
          </span>
        ) : null}
        <span className="grid min-w-0 flex-[1_1_auto] content-center gap-0.5 px-(--kl-inset) py-2">
          <span
            data-slot="hover-card-title"
            className="text-(length:--kl-text-lead)/[1.25] font-(--kl-weight-strong) wrap-anywhere"
          >
            {title}
          </span>
          {description != null ? (
            <span
              data-slot="hover-card-description"
              className="text-(length:--kl-text-label)/[1.3] wrap-anywhere text-kl-ink-2"
            >
              {description}
            </span>
          ) : null}
        </span>
        {code != null ? (
          <span data-slot="hover-card-code" className="kl-code grid flex-none place-items-center px-2.5">
            {code}
          </span>
        ) : null}
      </>
    ),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

type HoverCardFactsProps = Omit<PartProps<"dl", PartState>, "children"> & {
  /** [term, value] pairs, two to a row on shared seams; an odd last fact spans the row. */
  facts: ReadonlyArray<readonly [React.ReactNode, React.ReactNode]>;
};

/** Key facts as a grid of cells (a description list): the term small, the value in the UI voice. A narrow card
 * (long words in a small viewport) sets them in one column. */
function HoverCardFacts({ facts, render, className, style, ...props }: HoverCardFactsProps): React.ReactElement {
  const own = {
    "data-slot": "hover-card-facts",
    className: resolveClassName(
      "m-0 grid grid-cols-[repeat(2,minmax(0,1fr))] [@container_(max-width:240px)]:grid-cols-[minmax(0,1fr)]",
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: facts.map(([k, v], i) => (
      <div
        key={i}
        data-slot="hover-card-fact"
        className={cn(
          "grid min-w-0 content-start gap-0.5 px-(--kl-inset) py-2",
          "even:border-s-(length:--kl-k1) even:border-s-kl-seam nth-[n+3]:border-t-(length:--kl-k1) nth-[n+3]:border-t-kl-seam",
          "last:odd:col-span-full",
        )}
      >
        <dt className="text-(length:--kl-text-meta) text-kl-ink-2">{k}</dt>
        <dd className="m-0 font-(--kl-weight-strong) wrap-anywhere tabular-nums">{v}</dd>
      </div>
    )),
  };
  return useRender({ defaultTagName: "dl", render, state: PART_STATE, props: mergeProps<"dl">(props, own) });
}

/** Free content (a sentence, a Status, a Meter) in its own cell row. */
function HoverCardBody({ render, className, style, ...props }: PartProps<"div", PartState>): React.ReactElement {
  const own = {
    "data-slot": "hover-card-body",
    className: resolveClassName(
      "px-(--kl-inset) py-2.5 text-(length:--kl-text-label)/[1.45] text-kl-ink-2",
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

export {
  HoverCard,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPopup,
  HoverCardHeader,
  HoverCardFacts,
  HoverCardBody,
  createHoverCardHandle,
};
