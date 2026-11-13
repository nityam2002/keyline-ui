"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/* A message is one sender's run in the conversation: consecutive messages from the same person, close in time.
   A run hangs from its own side of the log as one stack (the bubbles share keylines):
   - align="start": the other party, at the start of the log, with an avatar in the gutter, level with the
     first bubble's top keyline. The header, every bubble and the receipt line up on the start edge;
   - align="end": the reader's own run, at the end of the log (the left in RTL). It needs no avatar. Every
     bubble is flush to the end edge, and the header and receipt sit over the bubbles' end text inset.
   Put every consecutive message of the run in one Message: Header, then Bubbles (attachments go inside the
   bubble), then a Footer for the delivery state of the bubble right above it.

   Each run hangs from its own side of the log. --kl-msg-x is the text inset; the header and footer sit one frame
   border plus that inset in from the run's outer edge: the start edge for theirs (where a bubble's text begins),
   the end edge for yours (bubbles flush to the end, the header and receipt over their end inset). A narrow log (the
   kl-log container, MessageScrollerContent) gets a smaller face and a little more of the row for the words. */

type Align = "start" | "end";

/* ------------------------------------------------------------------ *
 * CLASSES
 * ------------------------------------------------------------------ */

const group = "kl-type flex min-w-0 flex-col gap-[calc(var(--kl-gutter)+8px)]";

const root = cn(
  "kl-type group/message flex w-full min-w-0 gap-(--kl-gutter) data-[align=end]:flex-row-reverse",
  "[--kl-msg-av:32px] [--kl-msg-gap:6px] [--kl-msg-head:18px] [--kl-msg-x:var(--kl-inset)]",
  // the row reads its own parts (a :has() on the row itself) and hands the avatar's drop and the column's measure to
  // them: a :has() outside a rule's subject restyles the whole document on any DOM change
  "[--kl-msg-av-mt:initial] [--kl-msg-measure:initial]",
  "has-[>[data-slot=message-content]>[data-slot=message-header]:first-child]:[--kl-msg-av-mt:calc(var(--kl-msg-head)+var(--kl-msg-gap))]",
  "not-has-[>[data-slot=message-avatar]]:[--kl-msg-measure:min(82%,36rem)]",
  "[@container_kl-log_(max-width:420px)]:not-has-[>[data-slot=message-avatar]]:[--kl-msg-measure:88%]",
  "[@container_kl-log_(max-width:420px)]:[--kl-msg-av:24px]",
  "[@container_kl-log_(max-width:420px)]:[--kl-msg-x:max(8px,var(--kl-inset)_-_2px)]",
);

/** the gutter: level with the first bubble's top keyline, so the face and the first frame read as one row. It sizes
 *  its avatar (one attribute more specific than the avatar's own size classes). */
const avatar = cn(
  "flex w-(--kl-msg-av) flex-none self-start empty:h-0",
  "mt-[var(--kl-msg-av-mt,0px)]",
  "*:data-[slot=avatar]:[--kl-av:var(--kl-msg-av)]",
  "[@container_kl-log_(max-width:420px)]:*:data-[slot=avatar]:[--kl-av-fs:10px]",
);

/** the column: as wide as its widest bubble, never wider than most of the row, so each side keeps its side */
const content = cn(
  "flex min-w-0 flex-[0_1_auto] flex-col items-start *:max-w-full group-data-[align=end]/message:items-end",
  "max-w-[var(--kl-msg-measure,min(100%_-_var(--kl-msg-av)_-_var(--kl-gutter),36rem))]",
);

const edge = cn(
  "min-w-0 ps-[calc(var(--kl-k2)+var(--kl-msg-x))]",
  "group-data-[align=end]/message:justify-end group-data-[align=end]/message:ps-0",
  "group-data-[align=end]/message:pe-[calc(var(--kl-k2)+var(--kl-msg-x))]",
);

/** the name in the UI voice; the time (and any code) in the Code voice, never squeezed */
const header = cn(
  edge,
  "mb-(--kl-msg-gap) flex h-(--kl-msg-head) items-baseline gap-2 whitespace-nowrap",
  "text-[13px]/[var(--kl-msg-head)] font-(--kl-weight-strong)",
  "[&>:not(time,.kl-code)]:min-w-0 [&>:not(time,.kl-code)]:overflow-hidden [&>:not(time,.kl-code)]:text-ellipsis",
  "[&_:is(time,.kl-code)]:flex-none [&_:is(time,.kl-code)]:font-(family-name:--kl-font-mono)",
  "[&_:is(time,.kl-code)]:text-[11px]/none [&_:is(time,.kl-code)]:font-medium [&_:is(time,.kl-code)]:not-italic",
  "[&_:is(time,.kl-code)]:text-kl-ink-2 [&_:is(time,.kl-code)]:tabular-nums",
);

/** the receipt belongs to the bubble right above it */
const footer = cn(
  edge,
  "mt-(--kl-msg-gap) flex flex-wrap items-baseline gap-x-2",
  "font-(family-name:--kl-font-mono) text-[11px]/[16px] font-medium text-kl-ink-2 not-italic tabular-nums",
  "data-[tone=attention]:text-kl-red-text",
  "[&+:not([data-slot=message-footer])]:mt-[calc(var(--kl-msg-gap)*2)]",
  "[&>button]:cursor-pointer [&>button]:font-(family-name:--kl-font) [&>button]:text-[12px]",
  "[&>button]:font-(--kl-weight-strong) [&>button]:text-kl-cobalt-text",
  "[&>button]:underline [&>button]:underline-offset-2",
  "[&>button]:focus-visible:outline-(length:--kl-ring) [&>button]:focus-visible:outline-offset-2",
  "[&>button]:focus-visible:outline-kl-focus [&>button]:focus-visible:outline-solid",
  "[&>button:active>*]:translate-y-px",
);

/* ------------------------------------------------------------------ *
 * PARTS
 * ------------------------------------------------------------------ */

type MessageState = { align: Align };
type MessagePartState = Record<string, never>;
type MessageFooterState = { tone: "attention" | undefined };
const PART_STATE: MessagePartState = {};

function part<State extends object>(
  slot: string,
  base: string,
  state: State,
  { render, className, style, ...props }: PartProps<"div", State>,
  own: React.ComponentProps<"div"> & Record<`data-${string}`, unknown> = {},
) {
  return {
    defaultTagName: "div" as const,
    render,
    state,
    props: mergeProps<"div">(props, {
      ...own,
      className: resolveClassName(base, className)(state),
      style: resolveStyle(undefined, style)(state),
      "data-slot": slot,
    } as React.ComponentProps<"div">),
  };
}

/** Runs one after another, one gutter and a half apart (a log's content is already one). */
function MessageGroup(props: PartProps<"div", MessagePartState>): React.ReactElement {
  return useRender(part("message-group", group, PART_STATE, props));
}

type MessageProps = PartProps<"div", MessageState> & {
  /** start: the other party. end: the reader's own messages. */
  align?: Align;
};

function Message({ align = "start", ...props }: MessageProps): React.ReactElement {
  return useRender(part("message", root, { align }, props, { "data-align": align }));
}

/** The avatar gutter. Put a size="md" Avatar in it (decorative when the header prints the name). The reader's own run leaves it out. */
function MessageAvatar(props: PartProps<"div", MessagePartState>): React.ReactElement {
  return useRender(part("message-avatar", avatar, PART_STATE, props));
}

/** The run's column: header, bubbles, footers. It is as wide as its widest bubble, and everything in it hangs from the run's outer edge (start for theirs, end for yours). */
function MessageContent(props: PartProps<"div", MessagePartState>): React.ReactElement {
  return useRender(part("message-content", content, PART_STATE, props));
}

/** Sender and time, over the bubbles' text inset on the run's outer edge: the name in the UI voice, the time in the Code voice (pass a <time>). */
function MessageHeader(props: PartProps<"div", MessagePartState>): React.ReactElement {
  return useRender(part("message-header", header, PART_STATE, props));
}

type MessageFooterProps = PartProps<"div", MessageFooterState> & {
  /** attention: the bubble above was not sent (the reason, then a Retry button). */
  tone?: "attention";
};

/** Delivery state of the bubble right above it ("Sent", "Read 14:22", "Not sent: no signal." + a Retry button), on the run's outer edge, in the Code voice. */
function MessageFooter({ tone, ...props }: MessageFooterProps): React.ReactElement {
  return useRender(part("message-footer", footer, { tone }, props, { "data-tone": tone, "aria-live": "polite" }));
}

export { MessageGroup, Message, MessageAvatar, MessageContent, MessageHeader, MessageFooter };
export type { MessageProps, MessageFooterProps, MessageState };
