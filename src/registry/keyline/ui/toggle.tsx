"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";

import { cn } from "@/lib/utils";
import { floodHandlers } from "../lib/keyline-motion";

/** The inside of a toggle cell: the lamp (the state's shape), the label, an optional count. Shared with
 *  ToggleGroupItem so a toggle reads the same alone and in a group. */
function ToggleLabel({
  children,
  count,
  icon,
}: {
  children?: React.ReactNode;
  count?: React.ReactNode;
  icon?: boolean;
}) {
  return (
    <span className="kl-toggle-label">
      {icon ? null : <span className="kl-lamp" aria-hidden />}
      {children}
      {count != null ? <span className="kl-toggle-count">{count}</span> : null}
    </span>
  );
}

type ToggleProps = React.ComponentProps<typeof TogglePrimitive> & {
  /** control: its own frame. cell: a cell of an enclosing frame (a panel header, a field frame). */
  layout?: "control" | "cell";
  /** Icon only: a square cell; pass `aria-label`. Pressed shows a floor keyline instead of the lamp. */
  icon?: boolean;
  count?: React.ReactNode;
};

/**
 * Toggle: one on/off button on Base UI Toggle (`aria-pressed`). Pressed FLOODS yellow from the
 * press point (the working set) and fills the lamp, so the state has a shape as well as a colour; the
 * label never changes with the state. Controlled (`pressed` + `onPressedChange`) or uncontrolled
 * (`defaultPressed`). For several related toggles use ToggleGroup; for one of many use Segmented.
 */
function Toggle({ className, layout = "control", icon, count, children, ...props }: ToggleProps) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      data-kl-layout={layout}
      data-kl-icon={icon || undefined}
      className={cn(layout === "control" && "kl-ctl", "kl-flood kl-key kl-toggle kl-toggle-solo", className)}
      {...floodHandlers}
      {...props}
    >
      <ToggleLabel icon={icon} count={count}>
        {children}
      </ToggleLabel>
    </TogglePrimitive>
  );
}

export { Toggle, ToggleLabel, type ToggleProps };
