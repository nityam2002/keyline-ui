"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

type StatusKind = "normal" | "waiting" | "attention" | "done" | "none";

/* text on the row's baseline whatever the glyph (centring moved labels 0.4–1.6px between rows) */
const statusVariants = cva("inline-flex items-baseline gap-2", {
  variants: {
    kind: {
      normal: "",
      waiting: "",
      attention: "font-(--kl-weight-display) text-kl-red-text",
      done: "text-kl-ink-2",
      none: "text-kl-ink-2",
    },
  },
});

type StatusState = { kind: StatusKind };

type StatusProps = PartProps<"span", StatusState> & { kind: StatusKind };

/** Status = glyph shape + text. The shape carries meaning in grayscale and forced colours; only attention is red. */
function Status({ kind, render, className, style, children, ...props }: StatusProps): React.ReactElement {
  const state: StatusState = { kind };
  const own = {
    ...dataAttrs({ kind }),
    "data-slot": "status",
    className: resolveClassName(cn(statusVariants({ kind })), className)(state),
    style: resolveStyle(undefined, style)(state),
    children: (
      <>
        <span className="kl-glyph self-center" data-kind={kind} aria-hidden />
        {children}
      </>
    ),
  };
  return useRender({ defaultTagName: "span", render, state, props: mergeProps<"span">(props, own) });
}

type BadgeTone = "plain" | "signal" | "attention";

const badgeVariants = cva(
  [
    "inline-flex h-5 items-center px-1.5 align-middle whitespace-nowrap",
    "border-(length:--kl-k1) border-current text-kl-ink-2",
    "font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/none font-medium not-italic normal-nums",
  ],
  {
    variants: {
      tone: {
        plain: "",
        // the only filled form
        signal: "border-kl-on-yellow bg-kl-yellow text-kl-on-yellow",
        attention: "font-(--kl-weight-strong) text-kl-red-text",
      },
    },
    defaultVariants: { tone: "plain" },
  },
);

type BadgeState = { tone: BadgeTone };

type BadgeProps = PartProps<"span", BadgeState> & { tone?: BadgeTone };

/** A square code badge: mono text in a 1px frame. Never cut, never a pill. `tone="signal"` is the only filled form. */
function Badge({ tone = "plain", render, className, style, ...props }: BadgeProps): React.ReactElement {
  const state: BadgeState = { tone };
  const own = {
    ...dataAttrs({ tone }),
    "data-slot": "badge",
    className: resolveClassName(cn(badgeVariants({ tone })), className)(state),
    style: resolveStyle(undefined, style)(state),
  };
  return useRender({ defaultTagName: "span", render, state, props: mergeProps<"span">(props, own) });
}

export { Status, Badge, type StatusKind, type StatusProps, type BadgeProps, type BadgeTone };
