"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

type Tone = "info" | "done" | "attention" | "neutral";
type NoticeLayout = "control" | "cell";

/*
 * The notice is a size container (kl-notice): at 520px and under its actions drop to their own row of cells, under
 * the message. Every narrow rule is written in full ([@container_kl-notice_(max-width:520px)]:…).
 */
const noticeVariants = cva(
  [
    "kl-ctl @container/kl-notice grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-stretch",
    "bg-kl-cell text-kl-ink",
  ],
  {
    variants: {
      tone: { info: "", done: "", attention: "border-kl-red", neutral: "" },
    },
  },
);

/* the signal cell: the tone's fill and glyph. A cut frame's first cell keeps its glyph clear of the diagonal. The
   font shorthand it replaces also reset numerals and style, so they are set back here. */
const signalVariants = cva(
  [
    "grid min-h-(--kl-row) w-[calc(40px+var(--kl-c,0px)*0.35)] place-items-center ps-[calc(var(--kl-c,0px)*0.35)]",
    "border-e-(length:--kl-k1) border-e-kl-seam",
    "font-(family-name:--kl-font) text-[16px]/none font-(--kl-weight-display) not-italic normal-nums",
    "forced-colors:bg-[Mark] forced-colors:text-[MarkText] forced-colors:forced-color-adjust-none",
  ],
  {
    variants: {
      tone: {
        info: "bg-kl-cobalt text-kl-on-cobalt",
        done: "bg-kl-yellow text-kl-on-yellow",
        attention: "bg-kl-red text-kl-on-red",
        neutral: "",
      },
    },
  },
);

const actionsClass = cn(
  "kl-cells border-s-(length:--kl-k1) border-s-kl-seam *:min-w-max",
  "[@container_kl-notice_(max-width:520px)]:col-span-full [@container_kl-notice_(max-width:520px)]:row-2",
  "[@container_kl-notice_(max-width:520px)]:border-s-0 [@container_kl-notice_(max-width:520px)]:border-t-(length:--kl-k1)",
  "[@container_kl-notice_(max-width:520px)]:border-t-kl-seam",
  "[@container_kl-notice_(max-width:520px)]:*:min-w-0 [@container_kl-notice_(max-width:520px)]:*:flex-[1_1_0]",
);

const GLYPH: Record<Tone, React.ReactNode> = {
  info: "i",
  attention: "!",
  neutral: <span className="kl-glyph" data-kind="none" />,
  done: <span className="kl-glyph" data-kind="done" />,
};

type NoticeState = { tone: Tone; layout: NoticeLayout; open: boolean };

type NoticeProps = Omit<PartProps<"div", NoticeState>, "title" | "children"> & {
  /** info: cobalt, "i" · done: the working-set yellow, ✓ · attention: red, ! · neutral: ink rule, no fill */
  tone?: Tone;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Actions: Buttons with layout="cell". They share the notice's keylines and wrap below on narrow widths. */
  actions?: React.ReactNode;
  /** control: its own 2px frame. cell: a row of an enclosing frame (top of a panel, above a table). */
  layout?: NoticeLayout;
  /** false folds the notice back to its top keyline (and makes it inert); true unfolds it. */
  open?: boolean;
  /** Renders a close cell. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Announce when it appears. Use for results of something the user just did, not for page furniture. */
  live?: boolean;
};

/**
 * An inline message about the place it sits in. One frame: a signal cell carrying the tone's glyph
 * (shape, not only colour), the message, and its actions as cells. It never floats: a toast is a record
 * of something that happened; a notice describes a condition that is still true.
 *
 * The frame (data-slot="notice") takes the props; it sits in a fold (data-slot="notice-root") that `open`
 * unfolds from the top keyline.
 */
function Notice({
  tone = "info",
  title,
  description,
  actions,
  layout = "control",
  open = true,
  onDismiss,
  dismissLabel = "Dismiss",
  live,
  render,
  className,
  style,
  ...props
}: NoticeProps): React.ReactElement {
  const state: NoticeState = { tone, layout, open };
  const own = {
    ...dataAttrs({ tone, "kl-layout": layout }),
    "data-slot": "notice",
    className: resolveClassName(cn(noticeVariants({ tone })), className)(state),
    style: resolveStyle(undefined, style)(state),
    children: (
      <>
        <span data-slot="notice-signal" className={cn(signalVariants({ tone }))} aria-hidden>
          {GLYPH[tone]}
        </span>
        <div data-slot="notice-content" className="grid min-w-0 content-center gap-0.5 px-(--kl-inset) py-[9px]">
          <p
            data-slot="notice-title"
            className={cn(
              "m-0 leading-[1.3] font-(--kl-weight-strong) wrap-anywhere",
              tone === "attention" && "text-kl-red-text",
            )}
          >
            {title}
          </p>
          {description ? (
            <div
              data-slot="notice-description"
              className="text-(length:--kl-text-label)/[1.4] wrap-anywhere text-kl-ink-2 [&>:is(p,ul)]:m-0"
            >
              {description}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div data-slot="notice-actions" className={actionsClass}>
            {actions}
          </div>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            data-slot="notice-dismiss"
            className="kl-cell kl-key w-(--kl-row) justify-center border-s-(length:--kl-k1) border-s-kl-seam p-0"
            aria-label={dismissLabel}
            onClick={onDismiss}
          >
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
          </button>
        ) : null}
      </>
    ),
  };
  const frame = useRender({
    defaultTagName: "div",
    render,
    state,
    props: mergeProps<"div">({ role: live ? (tone === "attention" ? "alert" : "status") : undefined }, props, own),
  });
  return (
    <div
      data-slot="notice-root"
      className="kl-unfold min-w-0"
      data-open={open ? "" : undefined}
      inert={!open || undefined}
    >
      <div>{frame}</div>
    </div>
  );
}

export { Notice, type NoticeProps, type Tone as NoticeTone };
