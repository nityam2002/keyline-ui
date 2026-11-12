"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";
import { scopeProps, useKeylineScope } from "../lib/keyline-scope";

/* Root, Trigger and Close are Base UI's own parts: every prop, the `render` composition model, controlled
   and uncontrolled state and event details pass through untouched. */
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverClose = PopoverPrimitive.Close;

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Popup> & {
  side?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["side"];
  align?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["align"];
  /** Element to dock to (defaults to the trigger). */
  anchor?: React.ComponentProps<typeof PopoverPrimitive.Positioner>["anchor"];
  /** Keyline weight of the owner's shared edge: 2 for a standalone control, 1 for a cell (layout="cell"). */
  attachWeight?: 1 | 2 | 3;
  /** Detached: sits one gutter from the trigger as a control-weight frame, for content not about the trigger itself. */
  detached?: boolean;
  container?: React.ComponentProps<typeof PopoverPrimitive.Portal>["container"];
  positionerProps?: Omit<React.ComponentProps<typeof PopoverPrimitive.Positioner>, "className" | "style">;
};

/**
 * Arbitrary content docked to its trigger: the shared edge sits on the trigger's keyline, it unfolds from
 * that edge, it has no cut (an attached surface continues its owner). It carries the configuration of the
 * place it is written. For lists of commands use Menu; for a single choice use Select.
 */
function PopoverContent({
  className,
  side = "bottom",
  align = "start",
  anchor,
  attachWeight = 2,
  detached,
  container,
  positionerProps,
  style,
  ...props
}: PopoverContentProps) {
  const [marker, scope, probe] = useKeylineScope(false, container);
  return (
    <>
      {marker}
      <PopoverPrimitive.Portal container={container}>
        {probe}
        <PopoverPrimitive.Positioner
          side={side}
          align={align}
          anchor={anchor}
          sideOffset={detached ? 8 : attachWeight === 1 ? 0 : -attachWeight}
          collisionPadding={12}
          {...positionerProps}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <PopoverPrimitive.Popup
            data-slot="popover"
            data-detached={detached ? "" : undefined}
            className={cn(
              "kl-popover",
              detached ? "kl-ctl kl-popover-float" : "kl-dock kl-attached kl-dock-min",
              className,
            )}
            style={(state) =>
              ({
                "--kl-attach": `${attachWeight}px`,
                ...(typeof style === "function" ? style(state) : style),
              }) as React.CSSProperties
            }
            {...props}
          />
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </>
  );
}

/** Optional header row: title, description and a close cell, on the popover's own keyline. */
function PopoverHeader({
  title,
  description,
  close = true,
  closeLabel = "Close",
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  close?: boolean;
  closeLabel?: string;
  className?: string;
}) {
  return (
    <div data-slot="popover-header" className={cn("kl-cells kl-popover-h", className)}>
      <div className="kl-popover-t">
        <PopoverPrimitive.Title className="kl-popover-title">{title}</PopoverPrimitive.Title>
        {description ? (
          <PopoverPrimitive.Description className="kl-popover-desc">{description}</PopoverPrimitive.Description>
        ) : null}
      </div>
      {close ? (
        <PopoverPrimitive.Close className="kl-cell kl-key kl-popover-x" aria-label={closeLabel}>
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
        </PopoverPrimitive.Close>
      ) : null}
    </div>
  );
}

function PopoverBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-body" className={cn("kl-popover-b", className)} {...props} />;
}

/** A row of cells on the bottom keyline (Button layout="cell"). */
function PopoverFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-footer" className={cn("kl-cells kl-popover-f", className)} {...props} />;
}

export { Popover, PopoverTrigger, PopoverClose, PopoverContent, PopoverHeader, PopoverBody, PopoverFooter };
