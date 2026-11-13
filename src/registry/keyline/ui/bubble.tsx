"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/* A bubble is one message: a control-weight frame (2px, no radius; the control cut only on the first of a run)
   holding a column of cells, the text and then any files (Attachment layout="cell").
   - consecutive bubbles of a run are attached: the later one lies on the earlier's bottom keyline and the
     shared edge is a 1px seam, so a run reads as one stack of messages, not a pile of boxes;
   - an attachment-only message is a bubble holding only file cells; the file glyph sits on the text edge;
   - tone by role, never decoration: plain (the other party, the cell surface), tint (the reader's own, one
     step off it), attention (not sent: the attention frame, and a ! cell inserted before the text);
   - pending: the message is on its way; the Signal segment runs inside the bottom keyline until it lands.
   Reactions sit on the bottom keyline as a small frame of their own. */

type Tone = "plain" | "tint" | "attention";

/* ------------------------------------------------------------------ *
 * CLASSES
 * ------------------------------------------------------------------ */

const group = "kl-type flex min-w-0 max-w-full flex-col items-[inherit]";

/** the frame: as wide as its words (short replies stay compact), at most the column */
const frame = cn(
  "kl-ctl group/bubble flex w-fit max-w-full min-w-0 flex-col overflow-visible bg-kl-cell text-kl-ink",
  "[--kl-bubble-x:var(--kl-msg-x,var(--kl-inset))]",
  "data-[tone=tint]:bg-kl-tint",
  // an attention bubble paints its whole red frame over the shared line
  "data-[tone=attention]:z-1 data-[tone=attention]:border-kl-red",
  // ATTACHED: the next bubble of a run lies on this one's bottom keyline, so the two share one 2px line (as a docked
  // surface takes its owner's weight on the shared edge). Where widths differ the line runs on as the wider bubble's
  // own edge: a clean T-junction, never a doubled or thinned line. Only the first of a run has the cut.
  "[[data-slot=bubble]+&]:-mt-(--kl-k2) [[data-slot=bubble]+&]:[--kl-cut-size:0px]",
  // reactions hang over the bottom keyline
  "has-[>[data-slot=bubble-reactions]]:mb-3",
  // a bubble after an attention bubble, or after reactions, stands apart: the gap is set on the bubble before (a :has()
  // on the bubble itself; one tested from the next bubble's selector restyles the whole document on any DOM change).
  // The next bubble keeps its attached -2px, so each margin here adds it back: attention + gap, reactions 12 + 14px.
  "data-[tone=attention]:not-has-[>[data-slot=bubble-reactions]]:has-[+[data-slot=bubble]]:mb-[calc(var(--kl-msg-gap,6px)+var(--kl-k2))]",
  "has-[>[data-slot=bubble-reactions]]:has-[+[data-slot=bubble]]:mb-[calc(26px+var(--kl-k2))]",
  // files inside the bubble are cells: a seam between each (zero specificity on the file, so its states restyle it)
  "[&>:where([data-slot=attachment])]:border-t-(length:--kl-k1) [&>:where([data-slot=attachment])]:border-t-kl-seam",
  "[&>:where([data-slot=attachment]:first-child)]:border-t-0",
);

/** the text cell; one that acts (a button or link) presses like a key */
const content = cn(
  "flex min-w-0 items-stretch text-start text-inherit",
  "font-(family-name:--kl-font) text-(length:--kl-fs)/[1.45]",
  "[:is(button,a)&]:cursor-pointer [:is(button,a)&]:no-underline",
  "[:is(button,a)&]:hover:bg-kl-press group-data-[tone=plain]/bubble:[:is(button,a)&]:hover:bg-kl-tint",
  "focus-visible:outline-(length:--kl-ring) focus-visible:-outline-offset-(--kl-ring) focus-visible:outline-kl-focus focus-visible:outline-solid",
);

const text = cn(
  "block min-w-0 flex-auto px-(--kl-bubble-x) pt-[7px] pb-2 wrap-anywhere whitespace-pre-wrap",
  "[:is(button,a):active>&]:translate-y-px",
  "[&_a]:wrap-anywhere [&_a]:text-kl-cobalt-text [&_a]:underline [&_a]:underline-offset-2",
  "[&_a:focus-visible]:outline-(length:--kl-ring) [&_a:focus-visible]:outline-offset-1 [&_a:focus-visible]:outline-kl-focus [&_a:focus-visible]:outline-solid",
);

/** the ! cell: inserted (Signal: failed) on an attention bubble, as on fields and buttons */
const bang = cn(
  "kl-slot",
  "group-data-[tone=attention]/bubble:grid-cols-[1fr]",
  "group-data-[tone=attention]/bubble:[transition:grid-template-columns_var(--kl-t-unfold)_var(--kl-ease-out)]",
);
const bangCell = cn(
  "grid w-7 place-items-center bg-kl-red font-(--kl-weight-display) text-kl-on-red",
  "forced-colors:bg-[Mark] forced-colors:text-[MarkText] forced-colors:forced-color-adjust-none",
);

/** reactions: a small frame on the bubble's bottom keyline, toward the inline end */
const reactions = cn(
  "kl-cells absolute end-2.5 -bottom-3 z-1 h-[22px] border-(length:--kl-k1) border-kl-line bg-kl-raised text-[12px]/none",
  "*:inline-flex *:items-center *:gap-1 *:px-1.5",
  "[&>button]:cursor-pointer [&>button:not([aria-pressed=true])]:hover:bg-kl-tint",
  "[&>button[aria-pressed=true]]:bg-kl-inverse [&>button[aria-pressed=true]]:text-kl-on-inverse",
  "[&>button]:focus-visible:outline-(length:--kl-ring) [&>button]:focus-visible:-outline-offset-(--kl-ring)",
  "[&>button]:focus-visible:outline-kl-focus [&>button]:focus-visible:outline-solid",
  "[&_.kl-code]:text-inherit",
);

/* ------------------------------------------------------------------ *
 * PARTS
 * ------------------------------------------------------------------ */

type BubbleState = { tone: Tone; pending: boolean };
type BubblePartState = Record<string, never>;
const PART_STATE: BubblePartState = {};

/** A column of bubbles outside a Message (a Message's content is already one). */
function BubbleGroup({ render, className, style, ...props }: PartProps<"div", BubblePartState>): React.ReactElement {
  return useRender({
    defaultTagName: "div",
    render,
    state: PART_STATE,
    props: mergeProps<"div">(props, {
      className: resolveClassName(group, className)(PART_STATE),
      style: resolveStyle(undefined, style)(PART_STATE),
      "data-slot": "bubble-group",
    } as React.ComponentProps<"div">),
  });
}

type BubbleProps = PartProps<"div", BubbleState> & {
  tone?: Tone;
  /** Sending: the pending segment runs along the bottom keyline (a static hatch under reduced motion). */
  pending?: boolean;
};

function Bubble({
  tone = "plain",
  pending = false,
  render,
  className,
  style,
  children,
  ...props
}: BubbleProps): React.ReactElement {
  const state: BubbleState = { tone, pending };
  return useRender({
    defaultTagName: "div",
    render,
    state,
    props: mergeProps<"div">(props, {
      "data-tone": tone,
      "data-pending": pending ? "" : undefined,
      "aria-busy": pending || undefined,
      className: resolveClassName(frame, className)(state),
      style: resolveStyle(undefined, style)(state),
      children: (
        <>
          {children}
          {pending ? <span className="kl-pending [--kl-bw:3px]" aria-hidden /> : null}
        </>
      ),
      "data-slot": "bubble",
    } as React.ComponentProps<"div">),
  });
}

/** The text cell. Render it as a button or link (`render`) when the message itself acts (open a thread). */
function BubbleContent({
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"div", BubblePartState>): React.ReactElement {
  return useRender({
    defaultTagName: "div",
    render,
    state: PART_STATE,
    props: mergeProps<"div">(props, {
      className: resolveClassName(content, className)(PART_STATE),
      style: resolveStyle(undefined, style)(PART_STATE),
      children: (
        <>
          {/* the ! cell is inserted (0 → its width) when a message turns out not to be sent */}
          <span data-slot="bubble-bang" className={bang} aria-hidden>
            <span className="flex">
              <span className={bangCell}>!</span>
            </span>
          </span>
          {/* people write in their own language: the text takes its direction from its first strong letter */}
          <span data-slot="bubble-text" className={text} dir="auto">
            {children}
          </span>
        </>
      ),
      "data-slot": "bubble-content",
    } as React.ComponentProps<"div">),
  });
}

/** Reactions on the bubble's bottom keyline: a row of small cells ("👍 2"). Buttons inside are fine. */
function BubbleReactions({
  render,
  className,
  style,
  ...props
}: PartProps<"div", BubblePartState>): React.ReactElement {
  return useRender({
    defaultTagName: "div",
    render,
    state: PART_STATE,
    props: mergeProps<"div">(props, {
      className: resolveClassName(reactions, className)(PART_STATE),
      style: resolveStyle(undefined, style)(PART_STATE),
      "data-slot": "bubble-reactions",
    } as React.ComponentProps<"div">),
  });
}

export { BubbleGroup, Bubble, BubbleContent, BubbleReactions };
export type { BubbleProps, BubbleState };
