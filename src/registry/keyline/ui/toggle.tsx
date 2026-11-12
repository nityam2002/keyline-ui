"use client";

import * as React from "react";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { floodHandlers } from "../lib/keyline-motion";
import { resolveClassName } from "../lib/keyline-render";

/*
 * A toggle is a key cell that FLOODS yellow when pressed (kl-flood, the foundation's flood) and carries a lamp, the
 * state's shape. The flood paints the pressed cell's fill and text from the foundation, so this file sets the
 * cell's own background and colour only while it is off (`not-data-pressed:`): a utility would beat the flood.
 * ToggleGroupItem uses the same cell (toggleVariants with no layout) and the same contents (toggleContents).
 */
const toggleVariants = cva(
  [
    "kl-flood kl-key group/toggle inline-flex cursor-pointer items-stretch p-0 whitespace-nowrap",
    "text-(length:--kl-text-body) font-(--kl-weight-strong)",
    "not-data-pressed:bg-transparent not-data-pressed:text-kl-ink",
    "hover:not-data-pressed:not-data-disabled:bg-kl-tint focus-visible:outline-offset-(--kl-ring-in)",
    "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:not-data-pressed:text-kl-dis",
    // disabled and on: the state keeps its shape (a full lamp) but the flood goes out of service
    "data-disabled:data-pressed:[--kl-fc:var(--kl-press)] data-disabled:data-pressed:[--kl-fg:var(--kl-dis)]",
  ],
  {
    variants: {
      /** Toggle alone: control is its own frame (kl-ctl: border, cut), cell fills a cell of an enclosing frame.
       * Unset: a cell of a ToggleGroup, whose frame and background are the group's. */
      layout: {
        control: [
          "kl-ctl box-border min-h-(--kl-ctl) align-middle not-data-pressed:bg-kl-cell",
          "data-disabled:border-kl-dis-line data-disabled:[--kl-cut-line:var(--kl-dis-line)]",
        ],
        cell: "box-border min-h-(--kl-row) align-middle not-data-pressed:bg-kl-cell",
      },
      /** Icon only: a square cell; pressed draws a floor keyline in the flood's ink (the lamp's job). */
      icon: {
        true: [
          "min-w-(--kl-ctl) justify-center [&_svg]:size-4 [&_svg]:flex-none",
          "data-pressed:shadow-[inset_0_-3px_0_currentColor]",
          "forced-colors:data-pressed:shadow-none forced-colors:data-pressed:outline-3 forced-colors:data-pressed:outline-solid",
          "forced-colors:data-pressed:outline-offset-[-4px] forced-colors:data-pressed:outline-[Highlight]",
        ],
        false: "",
      },
    },
    defaultVariants: { icon: false },
  },
);

const labelVariants = cva("inline-flex items-center gap-2 px-3", {
  variants: {
    layout: { control: "", cell: "" },
    icon: { true: "flex-1 justify-center px-0", false: "" },
  },
  compoundVariants: [
    // a control's label clears the cut in its top-start corner
    { layout: "control", icon: false, className: "ps-[calc(12px+var(--kl-c,0px)*0.35)]" },
  ],
  defaultVariants: { icon: false },
});

/** The inside of a toggle cell: the lamp (the state's shape), the label, an optional count. Shared with
 *  ToggleGroupItem, so a toggle reads the same alone and in a group. */
function toggleContents(
  children: React.ReactNode,
  { count, icon, layout }: { count?: React.ReactNode; icon?: boolean; layout?: "control" | "cell" },
): React.ReactElement {
  return (
    <span data-slot="toggle-label" className={cn(labelVariants({ layout, icon: !!icon }))}>
      {/* the lamp sits in the label, so the theme's direct-child rule never reaches it */}
      {icon ? null : (
        <span data-slot="toggle-lamp" className="kl-lamp group-data-pressed/toggle:border-[5px]" aria-hidden />
      )}
      {children}
      {count != null ? (
        <span
          data-slot="toggle-count"
          className="font-medium text-kl-ink-2 tabular-nums group-data-pressed/toggle:text-inherit"
        >
          {count}
        </span>
      ) : null}
    </span>
  );
}

type ToggleProps = TogglePrimitive.Props & {
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
function Toggle({
  className,
  layout = "control",
  icon = false,
  count,
  children,
  ...props
}: ToggleProps): React.ReactElement {
  return (
    <TogglePrimitive
      data-kl-layout={layout}
      data-kl-icon={icon || undefined}
      className={resolveClassName(cn(toggleVariants({ layout, icon })), className)}
      {...floodHandlers}
      {...props}
      data-slot="toggle"
    >
      {toggleContents(children, { count, icon, layout })}
    </TogglePrimitive>
  );
}

export { Toggle, toggleVariants, toggleContents, type ToggleProps };
