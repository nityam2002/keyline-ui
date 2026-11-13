"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/*
 * A key cell in the Code voice: a 1px keyline with a 2px floor (the key's lip). Inline-grid, so it sits on the text
 * baseline of the prose around it, and its 22px box takes only 16px of the line (-3px block margins): a key never
 * opens up the line it sits in. It takes its colour from its context: ink in prose, on-inverse on a highlighted row.
 */
const key = cn(
  "m-0 -my-[3px] box-border inline-grid h-[22px] min-w-[22px] place-items-center px-[5px]",
  "border-(length:--kl-k1) border-b-2 border-current bg-transparent text-inherit",
  "font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/none font-medium tracking-normal not-italic normal-nums",
  "whitespace-nowrap normal-case forced-colors:border-[CanvasText]",
);

/*
 * A chord: one key frame, its keys on seams. The group owns the keys' frame, so its rules key on their slot. Key
 * names are a left-to-right unit in any page direction (Ctrl then K), like a code.
 */
const group = cn(
  "m-0 -my-[3px] box-border inline-flex h-[22px] items-stretch",
  "border-(length:--kl-k1) border-b-2 border-current bg-transparent text-inherit",
  "whitespace-nowrap [direction:ltr] [unicode-bidi:isolate] forced-colors:border-[CanvasText]",
  "*:data-[slot=kbd]:m-0 *:data-[slot=kbd]:h-auto *:data-[slot=kbd]:min-w-[20px] *:data-[slot=kbd]:border-0",
  "*:data-[slot=kbd]:not-first:border-s-(length:--kl-k1) *:data-[slot=kbd]:not-first:border-s-kl-seam",
);

type KbdState = Record<string, never>;
const STATE: KbdState = {};

type KbdProps = PartProps<"kbd", KbdState> & {
  /** Words for a symbol key ("Command" for ⌘, "Shift" for ⇧): the glyph shows, the words are read. */
  label?: string;
};

/**
 * A key, in the Code voice. A small key cell: a 1px keyline with a 2px floor, the key's lip.
 * Used in prose and help text, and by Command, Menu and Tooltip for their shortcuts.
 */
function Kbd({ label, render, className, style, children, ...props }: KbdProps): React.ReactElement {
  const own = {
    "data-slot": "kbd",
    className: resolveClassName(key, className)(STATE),
    style: resolveStyle(undefined, style)(STATE),
    children: label ? (
      <>
        <span aria-hidden>{children}</span>
        <span className="kl-sr">{label}</span>
      </>
    ) : (
      children
    ),
  };
  return useRender({ defaultTagName: "kbd", render, state: STATE, props: mergeProps<"kbd">(props, own) });
}

type KbdGroupProps = PartProps<"kbd", KbdState> & {
  /** Read between keys (the seam shows it): "+" for a chord, "then" for a sequence. */
  separator?: string;
};

/**
 * Keys pressed together (or in order) as cells of one key frame on shared seams (C1), nested <kbd> as
 * HTML specifies for a combination. The separator is read, not drawn: the seam is the join.
 */
function KbdGroup({
  separator = "+",
  render,
  className,
  style,
  children,
  ...props
}: KbdGroupProps): React.ReactElement {
  const keys = React.Children.toArray(children);
  const own = {
    "data-slot": "kbd-group",
    className: resolveClassName(group, className)(STATE),
    style: resolveStyle(undefined, style)(STATE),
    children: keys.map((k, i) => (
      <React.Fragment key={i}>
        {i > 0 ? <span className="kl-sr"> {separator} </span> : null}
        {k}
      </React.Fragment>
    )),
  };
  return useRender({ defaultTagName: "kbd", render, state: STATE, props: mergeProps<"kbd">(props, own) });
}

export { Kbd, KbdGroup, type KbdProps, type KbdGroupProps };
