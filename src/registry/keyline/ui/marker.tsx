"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

type MarkerVariant = "default" | "separator" | "border";

const markerVariants = cva(
  [
    "group/marker relative flex min-h-6 min-w-0 items-center gap-2.5",
    "[--kl-marker-run:initial] not-has-data-[slot=marker-icon]:[--kl-marker-run:0px]",
    "font-(family-name:--kl-font-mono) text-(length:--kl-text-meta)/[1.35] text-kl-ink-2",
  ],
  {
    variants: {
      variant: {
        default: "",
        // a seam either side of the words: each pseudo-element is a flexible run of keyline
        separator: [
          "before:min-w-3 before:flex-[1_1_0] before:border-t-(length:--kl-k1) before:border-t-kl-line-soft before:content-['']",
          "after:min-w-3 after:flex-[1_1_0] after:border-t-(length:--kl-k1) after:border-t-kl-line-soft after:content-['']",
          "**:data-[slot=marker-content]:max-w-[70%] **:data-[slot=marker-content]:flex-none",
          "**:data-[slot=marker-content]:text-center",
        ],
        border: "border-b-(length:--kl-k1) border-b-kl-line pb-2",
      },
      // the pending segment runs along the marker's bottom edge, under the words
      pending: { true: "pb-1", false: "" },
    },
    defaultVariants: { variant: "default", pending: false },
  },
);

/* the running segment starts under the words: past the glyph cell and its gap when there is one */
// (the marker reads its own glyph and hands the start over: a group-has-* rule restyles the whole document on any DOM
// change)
const run = "kl-pending start-[var(--kl-marker-run,34px)] [--kl-bw:2px]";

type MarkerState = { variant: MarkerVariant; pending: boolean };

type MarkerProps = PartProps<"div", MarkerState> & {
  variant?: MarkerVariant;
  /** Work in progress: the pending segment runs under the words and the marker is a polite status. */
  pending?: boolean;
};

/**
 * A step in a conversation or activity timeline: "Searched the web", "Assigned to DHL Freight",
 * "Yesterday". Not a message: it sits between messages in the Code voice.
 *
 * - default: a glyph cell (MarkerIcon) then the words.
 * - `variant="separator"`: the words between two seams (a day or "New messages" divider).
 * - `variant="border"`: a keyline under the words (the head of a run of steps).
 * - `pending`: work in progress ("Thinking…"): the pending segment runs under the words, never a spinner, and
 *   the marker becomes a polite status so the change is announced. Drop `pending` when the step is done.
 */
function Marker({
  variant = "default",
  pending = false,
  render,
  className,
  style,
  children,
  ...props
}: MarkerProps): React.ReactElement {
  const state: MarkerState = { variant, pending };
  const own = {
    ...dataAttrs({ variant, pending: pending ? "" : undefined }),
    "data-slot": "marker",
    className: resolveClassName(cn(markerVariants({ variant, pending })), className)(state),
    style: resolveStyle(undefined, style)(state),
    children: (
      <>
        {children}
        {pending ? <span className={run} data-slot="marker-run" aria-hidden /> : null}
      </>
    ),
  };
  const defaults = {
    role: variant === "separator" ? "separator" : pending ? "status" : undefined,
    "aria-busy": pending || undefined,
  };
  return useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(defaults, props, own) });
}

type MarkerPartState = Record<string, never>;
const PART_STATE: MarkerPartState = {};

const icon = cn(
  "grid size-6 flex-none place-items-center border-(length:--kl-k1) border-kl-line-soft text-kl-ink",
  "[&_svg]:block [&_svg]:size-3.5",
);

/** A 16px glyph cell (authored SVG or a Status glyph), hidden from assistive tech. */
function MarkerIcon({ render, className, style, ...props }: PartProps<"span", MarkerPartState>): React.ReactElement {
  const own = {
    "data-slot": "marker-icon",
    className: resolveClassName(icon, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({
    defaultTagName: "span",
    render,
    state: PART_STATE,
    props: mergeProps<"span">({ "aria-hidden": true }, props, own),
  });
}

const content = "min-w-0 wrap-anywhere [&_a]:text-inherit [&_a]:underline-offset-[3px]";

/** The words of the step. */
function MarkerContent({ render, className, style, ...props }: PartProps<"span", MarkerPartState>): React.ReactElement {
  const own = {
    "data-slot": "marker-content",
    className: resolveClassName(content, className)(PART_STATE),
    style: resolveStyle(undefined, style)(PART_STATE),
  };
  return useRender({ defaultTagName: "span", render, state: PART_STATE, props: mergeProps<"span">(props, own) });
}

export { Marker, MarkerIcon, MarkerContent, type MarkerProps, type MarkerVariant };
