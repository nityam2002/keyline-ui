"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName } from "../lib/keyline-render";

/** Wrap a region once to share the open delay between neighbouring tooltips (optional). */
const TooltipProvider = TooltipPrimitive.Provider;
/* Root is Base UI's own part: open state, handles and event details pass through untouched. */
const TooltipRoot = TooltipPrimitive.Root;

/** The element the tooltip names. Rendered as another part (`render={<Button />}`), the element is that part's and
 * carries its data-slot. */
function TooltipTrigger(props: TooltipPrimitive.Trigger.Props): React.ReactElement {
  return <TooltipPrimitive.Trigger {...props} data-slot="tooltip-trigger" />;
}

const popup = cn(
  "flex max-w-[min(320px,calc(100vw-16px))] items-stretch bg-kl-inverse text-kl-on-inverse",
  "text-(length:--kl-text-label)/[1.3] font-(--kl-weight-strong)",
  // with a shortcut the popup is a row of cells; the keyline between them is drawn in the label's colour
  "[&.kl-cells>:not(:first-child)]:border-s-kl-on-inverse",
  "opacity-100 transition-opacity duration-(--kl-t-unfold) ease-linear",
  "data-ending-style:opacity-0 data-ending-style:duration-(--kl-t-fold) data-starting-style:opacity-0",
  "data-instant:transition-none",
  "forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]",
);

type PositionerProps = TooltipPrimitive.Positioner.Props;

type TooltipPopupProps = TooltipPrimitive.Popup.Props &
  Pick<PositionerProps, "anchor" | "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"> & {
    /** Shortcut shown in its own cell, e.g. "⌘K". */
    shortcut?: React.ReactNode;
    /** Where the portal renders (defaults to <body>). */
    container?: TooltipPrimitive.Portal.Props["container"];
    /** Props for Base UI's Tooltip.Portal. */
    portalProps?: Omit<TooltipPrimitive.Portal.Props, "container" | "children">;
  };

/**
 * The label: Base UI's Portal, Positioner and Popup in one part, with the positioner's placement props lifted. An
 * ink label docked to the trigger's FOCUS RING, not its box: the gap equals the ring (2px + 2px offset), so keyboard
 * and pointer show the same geometry. Never cut, never a surface of its own. It carries the configuration of the
 * place it is written.
 */
function TooltipPopup({
  shortcut,
  anchor,
  side = "top",
  align,
  sideOffset = 4,
  alignOffset,
  collisionPadding,
  container,
  portalProps,
  className,
  children,
  ...props
}: TooltipPopupProps): React.ReactElement {
  const [marker, scope, probe] = useKeylineScope(false, container);
  return (
    <>
      {marker}
      <TooltipPrimitive.Portal container={container} {...portalProps}>
        {probe}
        <TooltipPrimitive.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <TooltipPrimitive.Popup
            className={resolveClassName(cn(popup, shortcut != null && "kl-cells"), className)}
            {...props}
            data-slot="tooltip-popup"
          >
            <span data-slot="tooltip-label" className="px-2.5 py-1.5">
              {children}
            </span>
            {shortcut != null ? (
              <kbd
                data-slot="tooltip-shortcut"
                className={cn(
                  "grid place-items-center px-2 font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/none",
                  "font-medium not-italic normal-nums",
                )}
              >
                {shortcut}
              </kbd>
            ) : null}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </>
  );
}

type TooltipProps = {
  /** The trigger. Must be a focusable element that accepts a ref (a Button, a link, an icon button). */
  children: React.ReactElement;
  content: React.ReactNode;
  /** Shortcut shown in its own cell, e.g. "⌘K". */
  shortcut?: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  delay?: number;
};

/**
 * The usual tooltip, built from the parts: it names or explains its trigger; it never holds the only copy of
 * information needed to act.
 */
function Tooltip({ children, content, shortcut, side = "top", delay = 500 }: TooltipProps): React.ReactElement {
  return (
    <TooltipRoot>
      <TooltipTrigger delay={delay} render={children} />
      <TooltipPopup side={side} shortcut={shortcut}>
        {content}
      </TooltipPopup>
    </TooltipRoot>
  );
}

export { Tooltip, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipPopup };
