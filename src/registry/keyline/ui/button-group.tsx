import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Buttons attached in one control frame: cells on shared seams (C1), each button its own Tab stop.
 * Use it for a few related commands that are not a toolbar: Previous · Next, − · 100% · +, Copy · Share. For
 * a row of many commands that should be one Tab stop with arrow keys, use Toolbar; for an action with its
 * menu, SplitButton; for one exclusive choice, Segmented.
 *
 * Children are cells: Button layout="cell", ButtonGroupText, a MenuTrigger rendering a Button cell.
 * `orientation="vertical"` stacks them on horizontal seams. A group inside a group is not drawn (put the
 * groups one gutter apart instead: unrelated parts sit apart).
 */
function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn("kl-ctl kl-button-group", orientation === "vertical" ? "kl-rows" : "kl-cells", className)}
      {...props}
    />
  );
}

/** A text cell in the group: a value between steppers, a unit, a label ("Page 3"). Not focusable. */
function ButtonGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="button-group-text" className={cn("kl-cell kl-button-group-text", className)} {...props} />;
}

/** A heavier seam between sub-groups of cells (2px, a control's weight) where a plain seam reads as one run. */
function ButtonGroupSeparator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      role="separator"
      data-slot="button-group-separator"
      className={cn("kl-button-group-sep", className)}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupText, ButtonGroupSeparator };
