"use client";

import * as React from "react";
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";

/* Root is Base UI's PreviewCard.Root: controlled or uncontrolled `open`, `onOpenChange`, `actionsRef`,
   `handle` (one card for many triggers) and the payload render function all pass through untouched. */
const HoverCard = PreviewCardPrimitive.Root;
/** A handle shares one card between many triggers (a column of names): `HoverCard.createHandle()` in Base UI. */
const createHoverCardHandle = PreviewCardPrimitive.createHandle;

type HoverCardTriggerProps = React.ComponentProps<typeof PreviewCardPrimitive.Trigger>;

/**
 * The link being previewed. It stays an ordinary link: a press goes to `href` (the place with everything
 * the card shows), keyboard focus also opens the card, and on touch the card never opens. While the open
 * delay runs, its underline draws along the keyline from the reading start, so the wait reads as "a preview
 * is coming", not as lag; leaving early retracts it. Open, the underline is a full ink 2px keyline.
 */
function HoverCardTrigger({ className, delay = 600, closeDelay = 300, style, ...props }: HoverCardTriggerProps) {
  return (
    <PreviewCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      delay={delay}
      closeDelay={closeDelay}
      className={cn("kl-hc-trigger", className as string)}
      style={{ "--kl-hc-delay": `${delay}ms`, ...(style as React.CSSProperties) } as React.CSSProperties}
      {...props}
    />
  );
}

type HoverCardContentProps = React.ComponentProps<typeof PreviewCardPrimitive.Popup> & {
  side?: React.ComponentProps<typeof PreviewCardPrimitive.Positioner>["side"];
  align?: React.ComponentProps<typeof PreviewCardPrimitive.Positioner>["align"];
  container?: React.ComponentProps<typeof PreviewCardPrimitive.Portal>["container"];
  positionerProps?: Omit<React.ComponentProps<typeof PreviewCardPrimitive.Positioner>, "className" | "style">;
};

/**
 * The preview: a control frame one gutter from the link (a card about a word in running text is not docked
 * to it; a frame cannot share an edge with an underline). It unfolds from the side that faces the link,
 * carries the configuration of the place it is written, and lifts to the overlay surface.
 * Supplementary only: Base UI keeps it out of the keyboard and screen-reader order, so put nothing in it
 * that isn't also at the link's destination, and no controls.
 */
function HoverCardContent({
  className,
  side = "bottom",
  align = "start",
  container,
  positionerProps,
  ...props
}: HoverCardContentProps) {
  const [marker, scope, probe] = useKeylineScope(false, container);
  return (
    <>
      {marker}
      <PreviewCardPrimitive.Portal container={container}>
        {probe}
        <PreviewCardPrimitive.Positioner
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
          {...positionerProps}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <PreviewCardPrimitive.Popup
            data-slot="hover-card"
            className={cn("kl-ctl kl-hc", className as string)}
            {...props}
          />
        </PreviewCardPrimitive.Positioner>
      </PreviewCardPrimitive.Portal>
    </>
  );
}

type HoverCardHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** A square leading cell: an Avatar with layout="cell", a logo, a 16px glyph or a code. */
  media?: React.ReactNode;
  title: React.ReactNode;
  /** One line under the title in the UI voice: a role, a place. */
  description?: React.ReactNode;
  /** A trailing cell in the Code voice: the record's ID, a handle. */
  code?: React.ReactNode;
};

/** The card's top row of cells: media · title and description · code. Long titles wrap; the code cell keeps its width. */
function HoverCardHeader({ media, title, description, code, className, ...props }: HoverCardHeaderProps) {
  return (
    <div data-slot="hover-card-header" className={cn("kl-cells kl-hc-h", className)} {...props}>
      {media != null ? <span className="kl-hc-m">{media}</span> : null}
      <span className="kl-hc-t">
        <span className="kl-hc-title">{title}</span>
        {description != null ? <span className="kl-hc-desc">{description}</span> : null}
      </span>
      {code != null ? <span className="kl-code kl-hc-code">{code}</span> : null}
    </div>
  );
}

type HoverCardFactsProps = Omit<React.ComponentProps<"dl">, "children"> & {
  /** [term, value] pairs, two to a row on shared seams; an odd last fact spans the row. */
  facts: ReadonlyArray<readonly [React.ReactNode, React.ReactNode]>;
};

/** Key facts as a grid of cells (a description list): the term small, the value in the UI voice. */
function HoverCardFacts({ facts, className, ...props }: HoverCardFactsProps) {
  return (
    <dl data-slot="hover-card-facts" className={cn("kl-hc-facts", className)} {...props}>
      {facts.map(([k, v], i) => (
        <div key={i} className="kl-hc-fact">
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Free content (a sentence, a Status, a Meter) in its own cell row. */
function HoverCardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="hover-card-body" className={cn("kl-hc-b", className)} {...props} />;
}

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardHeader,
  HoverCardFacts,
  HoverCardBody,
  createHoverCardHandle,
};
