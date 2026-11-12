"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Tone = "info" | "done" | "attention" | "neutral";

type NoticeProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** info: cobalt, "i" · done: the working-set yellow, ✓ · attention: red, ! · neutral: ink rule, no fill */
  tone?: Tone;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Actions: Buttons with layout="cell". They share the notice's keylines and wrap below on narrow widths. */
  actions?: React.ReactNode;
  /** control: its own 2px frame. cell: a row of an enclosing frame (top of a panel, above a table). */
  layout?: "control" | "cell";
  /** false folds the notice back to its top keyline (and makes it inert); true unfolds it. */
  open?: boolean;
  /** Renders a close cell. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Announce when it appears. Use for results of something the user just did, not for page furniture. */
  live?: boolean;
};

const GLYPH: Record<Tone, React.ReactNode> = {
  info: "i",
  attention: "!",
  neutral: <span className="kl-glyph" data-kind="none" />,
  done: <span className="kl-glyph" data-kind="done" />,
};

/**
 * An inline message about the place it sits in. One frame: a signal cell carrying the tone's glyph
 * (shape, not only colour), the message, and its actions as cells. It never floats: a toast is a record
 * of something that happened; a notice describes a condition that is still true.
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
  className,
  ...props
}: NoticeProps) {
  const role = live ? (tone === "attention" ? "alert" : "status") : undefined;
  return (
    <div
      data-slot="notice-root"
      className="kl-unfold kl-notice-fold"
      data-open={open ? "" : undefined}
      inert={!open || undefined}
    >
      <div>
        <div
          data-slot="notice"
          data-tone={tone}
          data-kl-layout={layout}
          role={role}
          className={cn("kl-ctl kl-notice", className)}
          {...props}
        >
          <span className="kl-notice-sig" aria-hidden>
            {GLYPH[tone]}
          </span>
          <div className="kl-notice-body">
            <p className="kl-notice-title">{title}</p>
            {description ? <div className="kl-notice-desc">{description}</div> : null}
          </div>
          {actions ? <div className="kl-cells kl-notice-actions">{actions}</div> : null}
          {onDismiss ? (
            <button type="button" className="kl-cell kl-key kl-notice-x" aria-label={dismissLabel} onClick={onDismiss}>
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
        </div>
      </div>
    </div>
  );
}

export { Notice, type Tone as NoticeTone };
