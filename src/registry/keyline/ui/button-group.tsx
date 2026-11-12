"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

type Orientation = "horizontal" | "vertical";

/** The group's orientation, for its separators (a horizontal row is divided by vertical separators). */
const OrientationContext = React.createContext<Orientation>("horizontal");

const groupVariants = cva(
  [
    "kl-ctl inline-flex w-fit max-w-full bg-kl-cell",
    // a Button cell in the group (layout="cell", or a trigger rendering one): the frame's height inside its k2
    // border, and a roomier label. The group owns these, so they key on the button's slot and layout.
    "[&>[data-slot=button][data-kl-layout=cell]]:flex-none",
    "[&>[data-slot=button][data-kl-layout=cell]]:min-h-[calc(var(--kl-ctl)-2*var(--kl-k2))]",
    "[&>[data-slot=button][data-kl-layout=cell]]:[--kl-button-px:calc(var(--kl-inset)+14px)]",
    // the separator carries the seam; the next cell does not draw its own (C3, one edge, one owner)
    "[&>[data-slot=button-group-separator]+*]:border-s-0 [&>[data-slot=button-group-separator]+*]:border-t-0",
  ],
  {
    variants: {
      orientation: {
        horizontal: "kl-cells",
        vertical: "kl-rows flex-col [&>[data-slot=button][data-kl-layout=cell]]:justify-start",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

type ButtonGroupState = { orientation: Orientation };

type ButtonGroupProps = PartProps<"div", ButtonGroupState> & { orientation?: Orientation };

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
  render,
  className,
  style,
  orientation = "horizontal",
  ...props
}: ButtonGroupProps): React.ReactElement {
  const state: ButtonGroupState = { orientation };
  const own = {
    ...dataAttrs({ orientation }),
    "data-slot": "button-group",
    className: resolveClassName(cn(groupVariants({ orientation })), className)(state),
    style: resolveStyle(undefined, style)(state),
  };
  const element = useRender({
    defaultTagName: "div",
    render,
    state,
    props: mergeProps<"div">({ role: "group" }, props, own),
  });
  return <OrientationContext.Provider value={orientation}>{element}</OrientationContext.Provider>;
}

type ButtonGroupTextState = Record<string, never>;
const TEXT_STATE: ButtonGroupTextState = {};

const text = cn(
  "flex min-h-0 min-w-0 items-center justify-center gap-2 px-(--kl-inset) whitespace-nowrap",
  "text-(length:--kl-text-body) font-(--kl-weight-strong) text-kl-ink-2 tabular-nums",
);

/** A text cell in the group: a value between steppers, a unit, a label ("Page 3"). Not focusable. */
function ButtonGroupText({
  render,
  className,
  style,
  ...props
}: PartProps<"span", ButtonGroupTextState>): React.ReactElement {
  const own = {
    "data-slot": "button-group-text",
    className: resolveClassName(text, className)(TEXT_STATE),
    style: resolveStyle(undefined, style)(TEXT_STATE),
  };
  return useRender({ defaultTagName: "span", render, state: TEXT_STATE, props: mergeProps<"span">(props, own) });
}

const separatorVariants = cva("flex-none", {
  variants: {
    // across the group's direction: a vertical seam in a row, a horizontal one in a column (a control's weight)
    orientation: { vertical: "w-0 border-s-(length:--kl-k2)", horizontal: "h-0 border-t-(length:--kl-k2)" },
  },
});

/** A heavier seam between sub-groups of cells (2px, a control's weight) where a plain seam reads as one run. Base
 * UI's Separator, oriented across the group. */
function ButtonGroupSeparator({ className, orientation: own, ...props }: SeparatorPrimitive.Props): React.ReactElement {
  const group = React.useContext(OrientationContext);
  const orientation = own ?? (group === "vertical" ? "horizontal" : "vertical");
  return (
    <SeparatorPrimitive
      orientation={orientation}
      className={resolveClassName(cn(separatorVariants({ orientation })), className)}
      {...props}
      data-slot="button-group-separator"
    />
  );
}

export { ButtonGroup, ButtonGroupText, ButtonGroupSeparator, type ButtonGroupProps };
