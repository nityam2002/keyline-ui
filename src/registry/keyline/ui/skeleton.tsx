"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

type SkeletonShape = "line" | "block" | "value" | "control";

/*
 * The table's loading cell outside the table: a k1 soft keyline box on the tint, and a running segment (line-soft)
 * while it waits: kl-run-30 (theme), 1100ms linear, the same rhythm as the table, reversed in RTL through
 * --kl-run-dir. Reduced motion (the system's, or data-kl-motion="reduce") and forced colours show the static box
 * alone. Heights follow the content they stand in for.
 */
const skeletonVariants = cva(
  [
    "relative box-border block h-2.5 max-w-full overflow-hidden",
    "border-(length:--kl-k1) border-kl-line-soft bg-kl-tint",
    "after:absolute after:inset-y-0 after:left-0 after:w-[30%] after:bg-kl-line-soft after:content-['']",
    "after:animate-[kl-run-30_1100ms_linear_infinite_var(--kl-run-dir,normal)]",
    "in-data-[kl-motion=reduce]:after:hidden motion-reduce:after:hidden",
    "forced-colors:border-[GrayText] forced-colors:bg-[Canvas] forced-colors:after:hidden",
  ],
  {
    variants: {
      shape: {
        line: "my-1 w-full",
        // sized by the type it stands in for: put it where the number goes (inside kl-count, a stat value)
        value: "inline-block h-[0.8em] w-[4ch] align-baseline",
        control: "h-(--kl-ctl) w-full border-(length:--kl-k2)",
        block: "h-24 w-full",
      },
    },
    defaultVariants: { shape: "line" },
  },
);

const linesClass = "grid min-w-0 gap-1.5";

type SkeletonState = { shape: SkeletonShape | "lines" };

type SkeletonProps = Omit<PartProps<"span", SkeletonState>, "children"> & {
  /**
   * line: a run of text; `lines` stacks several, the last one shorter. block: an area (a chart, media, a
   * paragraph you won't line out). value: a number in the count voice. control: the footprint of a
   * control frame (the real control replaces it without moving anything).
   */
  shape?: SkeletonShape;
  lines?: number;
  /** Any CSS length. Defaults: line 100%, value 4ch, control 100%, block 100%. */
  width?: React.CSSProperties["width"];
  /** block only. Default 96px. */
  height?: React.CSSProperties["height"];
};

/* a fixed pattern, so the same skeleton renders the same way on every load (no random widths) */
const LINE_WIDTHS = ["100%", "94%", "86%", "97%", "90%"];

/**
 * A placeholder for content that is on its way. It is the Table's loading cell outside the table: a
 * keyline box on the tint, with a running segment while it waits.
 *
 *   ┌──────────────────────────────┐
 *   │░░░░░░▓▓▓▓░░░░░░░░░░░░░░░░░░░░│   line (k1 soft keyline, tint fill, running segment)
 *   └──────────────────────────────┘
 *
 * - Always aria-hidden. Wrap the loading region in SkeletonGroup, which marks it busy and says what is
 *   loading once; a page of skeletons never reads as a list of blanks.
 * - Size it to the real content (lines of the same count, a control of the same frame) so nothing moves
 *   when the content lands.
 * - Motion: the segment runs 1100ms linear, the same rhythm as the table. Reduced motion: no segment,
 *   the static box alone.
 */
function Skeleton({
  shape = "line",
  lines = 1,
  width,
  height,
  render,
  className,
  style,
  ...props
}: SkeletonProps): React.ReactElement {
  const stacked = shape === "line" && lines > 1;
  const state: SkeletonState = { shape: stacked ? "lines" : shape };
  const own = stacked
    ? {
        ...dataAttrs({ shape: "lines" }),
        "data-slot": "skeleton",
        className: resolveClassName(linesClass, className)(state),
        style: resolveStyle({ width }, style)(state),
        children: Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            data-slot="skeleton-line"
            data-shape="line"
            className={cn(skeletonVariants({ shape: "line" }), "my-0")}
            style={{ width: i === lines - 1 ? "58%" : LINE_WIDTHS[i % LINE_WIDTHS.length] }}
          />
        )),
      }
    : {
        ...dataAttrs({ shape }),
        "data-slot": "skeleton",
        className: resolveClassName(cn(skeletonVariants({ shape })), className)(state),
        style: resolveStyle({ width, height: shape === "block" ? height : undefined }, style)(state),
      };
  return useRender({
    defaultTagName: "span",
    render,
    state,
    props: mergeProps<"span">({ "aria-hidden": true }, props, own),
  });
}

type SkeletonGroupState = { busy: boolean };

type SkeletonGroupProps = PartProps<"div", SkeletonGroupState> & {
  /** What is loading, said once while busy ("Loading carrier details"). */
  label: string;
  busy?: boolean;
};

/**
 * The region that is loading. `aria-busy` while `busy`, and one polite status naming what is on its
 * way ("Loading carrier details"); when it lands, the status clears and the content replaces the
 * skeletons in place.
 */
function SkeletonGroup({
  label,
  busy = true,
  render,
  className,
  style,
  children,
  ...props
}: SkeletonGroupProps): React.ReactElement {
  const state: SkeletonGroupState = { busy };
  const own = {
    "data-slot": "skeleton-group",
    "aria-busy": busy || undefined,
    className: resolveClassName("min-w-0", className)(state),
    style: resolveStyle(undefined, style)(state),
    children: (
      <>
        <span role="status" className="kl-sr">
          {busy ? label : ""}
        </span>
        {children}
      </>
    ),
  };
  return useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(props, own) });
}

export { Skeleton, SkeletonGroup, type SkeletonProps, type SkeletonGroupProps, type SkeletonShape };
