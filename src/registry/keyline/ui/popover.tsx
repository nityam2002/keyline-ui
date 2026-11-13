"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/* Root is Base UI's own part: every prop, controlled and uncontrolled state, handles and event details pass
   through untouched. Parts are named as Base UI names them. */
const PopoverRoot = PopoverPrimitive.Root;
const Popover = PopoverRoot;

/** The element that opens the popover. Rendered as another part (`render={<Button />}`), the element is that
 * part's and carries its data-slot. */
function PopoverTrigger(props: PopoverPrimitive.Trigger.Props): React.ReactElement {
  return <PopoverPrimitive.Trigger {...props} data-slot="popover-trigger" />;
}

function PopoverClose(props: PopoverPrimitive.Close.Props): React.ReactElement {
  return <PopoverPrimitive.Close {...props} data-slot="popover-close" />;
}

const surface = cn(
  "flex max-h-(--available-height) flex-col overflow-auto bg-kl-cell text-kl-ink outline-0 [--kl-dock-w:280px]",
);

/* docked: the shared edge sits on the owner's keyline and takes its weight (--kl-attach); no cut */
const docked = "kl-attached kl-dock kl-dock-min";

/*
 * A detached popover is a control frame of its own, one gutter from the trigger; it keeps the cut and enters from
 * the trigger side. Where the cut is a corner shape (Chromium) it unfolds from that side, as a docked one does.
 * Elsewhere clip-path IS the cut, so it fades instead: a clip-path unfold would replace the cut's polygon and square
 * the corner. A closing popover ignores the pointer.
 */
const detachedFrame = cn(
  "kl-ctl w-[max(280px,var(--anchor-width))] max-w-[calc(100vw-24px)]",
  "transition-opacity duration-(--kl-t-unfold) ease-linear",
  "data-ending-style:pointer-events-none data-ending-style:duration-(--kl-t-fold)",
  "not-supports-[corner-start-start-shape:bevel]:data-starting-style:opacity-0",
  "not-supports-[corner-start-start-shape:bevel]:data-ending-style:opacity-0",
  "supports-[corner-start-start-shape:bevel]:transition-[clip-path] supports-[corner-start-start-shape:bevel]:[clip-path:inset(-8px)]",
  "supports-[corner-start-start-shape:bevel]:ease-(--kl-ease-out) supports-[corner-start-start-shape:bevel]:data-ending-style:ease-(--kl-ease-in)",
  "supports-[corner-start-start-shape:bevel]:[&:is([data-starting-style],[data-ending-style])[data-side=bottom]]:[clip-path:inset(0_0_100%_0)]",
  "supports-[corner-start-start-shape:bevel]:[&:is([data-starting-style],[data-ending-style])[data-side=top]]:[clip-path:inset(100%_0_0_0)]",
  "supports-[corner-start-start-shape:bevel]:[&:is([data-starting-style],[data-ending-style]):is([data-side=right],[data-side=inline-end])]:[clip-path:inset(0_100%_0_0)]",
  "supports-[corner-start-start-shape:bevel]:[&:is([data-starting-style],[data-ending-style]):is([data-side=left],[data-side=inline-start])]:[clip-path:inset(0_0_0_100%)]",
);

type PositionerProps = PopoverPrimitive.Positioner.Props;

type PopoverPopupProps = PopoverPrimitive.Popup.Props &
  Pick<PositionerProps, "anchor" | "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"> & {
    /** Keyline weight of the owner's shared edge: 2 for a standalone control, 1 for a cell (layout="cell"). */
    attachWeight?: 1 | 2 | 3;
    /** Detached: sits one gutter from the trigger as a control-weight frame, for content not about the trigger itself. */
    detached?: boolean;
    /** Where the portal renders (defaults to <body>). */
    container?: PopoverPrimitive.Portal.Props["container"];
    /** Props for Base UI's Popover.Portal. */
    portalProps?: Omit<PopoverPrimitive.Portal.Props, "container" | "children">;
  };

/**
 * Arbitrary content docked to its trigger: Base UI's Portal, Positioner and Popup in one part, with the positioner's
 * placement props lifted. The shared edge sits on the trigger's keyline, it unfolds from that edge, it has no cut (an
 * attached surface continues its owner). It carries the configuration of the place it is written. For lists of
 * commands use Menu; for a single choice use Select.
 */
function PopoverPopup({
  anchor,
  side = "bottom",
  align = "start",
  sideOffset,
  alignOffset,
  collisionPadding = 12,
  attachWeight = 2,
  detached,
  container,
  portalProps,
  className,
  style,
  ...props
}: PopoverPopupProps): React.ReactElement {
  const [marker, scope, probe] = useKeylineScope(false, container);
  return (
    <>
      {marker}
      <PopoverPrimitive.Portal container={container} {...portalProps}>
        {probe}
        <PopoverPrimitive.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset ?? (detached ? 8 : attachWeight === 1 ? 0 : -attachWeight)}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <PopoverPrimitive.Popup
            data-detached={detached ? "" : undefined}
            className={resolveClassName(cn(surface, detached ? detachedFrame : docked), className)}
            style={resolveStyle({ "--kl-attach": `${attachWeight}px` } as React.CSSProperties, style)}
            {...props}
            data-slot="popover-popup"
          />
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </>
  );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Title
      className={resolveClassName("m-0 text-(length:--kl-text-lead)/[1.25] font-(--kl-weight-strong)", className)}
      {...props}
      data-slot="popover-title"
    />
  );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props): React.ReactElement {
  return (
    <PopoverPrimitive.Description
      className={resolveClassName("m-0 text-(length:--kl-text-label) text-kl-ink-2", className)}
      {...props}
      data-slot="popover-description"
    />
  );
}

type PartState = Record<string, never>;
const PART_STATE: PartState = {};

type PopoverHeaderProps = Omit<PartProps<"div", PartState>, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Show the close cell (default true). */
  close?: boolean;
  closeLabel?: string;
};

/** Optional header row: title, description and a close cell, on the popover's own keyline. */
function PopoverHeader({
  title,
  description,
  close = true,
  closeLabel = "Close",
  render,
  className,
  style,
  ...props
}: PopoverHeaderProps): React.ReactElement {
  const own = {
    "data-slot": "popover-header",
    className: resolveClassName("kl-cells flex-none border-b-(length:--kl-k1) border-b-kl-seam", className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
    children: (
      <>
        {/* the cut takes the start corner of a detached popover: the text steps clear of it */}
        <div className="grid min-w-0 flex-1 content-center gap-0.5 py-2.5 ps-[calc(var(--kl-inset)+var(--kl-c,0px)*0.35)] pe-(--kl-inset)">
          <PopoverTitle>{title}</PopoverTitle>
          {description ? <PopoverDescription>{description}</PopoverDescription> : null}
        </div>
        {close ? (
          <PopoverClose className="kl-cell kl-key w-(--kl-row) flex-none justify-center p-0" aria-label={closeLabel}>
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="square"
              aria-hidden
            >
              <path d="m4 4 8 8M12 4l-8 8" />
            </svg>
          </PopoverClose>
        ) : null}
      </>
    ),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

function PopoverBody({ render, className, style, ...props }: PartProps<"div", PartState>): React.ReactElement {
  const own = {
    "data-slot": "popover-body",
    className: resolveClassName("grid min-h-0 content-start gap-(--kl-gutter) p-(--kl-inset)", className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

/** A row of cells on the bottom keyline (Button layout="cell"); the cells share its width equally. */
function PopoverFooter({ render, className, style, ...props }: PartProps<"div", PartState>): React.ReactElement {
  const own = {
    "data-slot": "popover-footer",
    className: resolveClassName(
      "kl-cells flex-none border-t-(length:--kl-k1) border-t-kl-seam *:min-w-0 *:flex-[1_1_0]",
      className,
    )(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "div", render, state: PART_STATE, props: mergeProps<"div">(props, own) });
}

export {
  Popover,
  PopoverRoot,
  PopoverTrigger,
  PopoverClose,
  PopoverPopup,
  PopoverTitle,
  PopoverDescription,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
};
