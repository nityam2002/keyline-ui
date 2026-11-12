"use client";

import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { dataAttrs, resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";

/*
 * The frame and its look. The button has no padding of its own, so its signal cells (! and the done mark) sit
 * on its edges; a container that wants a roomier button widens the label with --kl-button-px, never the
 * button's padding. Sizes use the (--kl-…) forms, which cn() recognises, so a consumer's h-10 or text-sm
 * replaces Keyline's instead of fighting it in the cascade.
 */
const buttonVariants = cva(
  [
    "kl-key group/button inline-flex max-w-full cursor-pointer items-stretch p-0 select-none",
    "bg-kl-cell text-kl-ink [-webkit-tap-highlight-color:transparent]",
    "font-(family-name:--kl-font) text-(length:--kl-text-body)/none font-(--kl-weight-strong)",
    "hover:bg-kl-tint active:not-data-disabled:bg-kl-press [&_svg]:flex-none",
    // KEY, refined: the frame and every cell in it stay put; only ink travels 1px. The theme's Key moves each
    // child, and a button's children are cells that paint (the ! and done cells, the affix through the label's
    // padding): moving them opened a hairline under the frame's top edge on every press. The label's text moves
    // by its padding, and each cell moves its own glyph (theme: KEY), so no edge or seam moves.
    "[&:is(:active,[data-kl-pressed]):not(:disabled,[data-disabled])>*]:translate-none",
    "aria-busy:cursor-progress",
    "data-disabled:not-aria-busy:cursor-not-allowed data-disabled:not-aria-busy:bg-kl-cell",
    "data-disabled:not-aria-busy:bg-(image:--kl-hatch) data-disabled:not-aria-busy:text-kl-dis",
  ],
  {
    variants: {
      /** control: its own 2px frame. cell: fills a cell of an enclosing frame (no frame, no cut). A cell sets no
       * border at all: its edges are the seams the enclosing row draws (one edge, one owner), and a border utility
       * here would beat them. */
      layout: {
        control: [
          "kl-ctl min-h-(--kl-ctl)",
          "data-disabled:not-aria-busy:border-kl-dis-line data-disabled:not-aria-busy:[--kl-cut-line:var(--kl-dis-line)]",
          // failed turns the frame red; a cell has no frame of its own, so its ! cell alone says it
          "data-[signal=failed]:data-[kl-layout=control]:border-kl-red",
          "data-[signal=failed]:data-[kl-layout=control]:[--kl-cut-line:var(--kl-red)]",
        ],
        cell: "relative min-h-[48px] justify-center [--kl-bw:0px] focus-visible:outline-offset-(--kl-ring-in)",
      },
      variant: {
        secondary: "",
        primary: [
          "bg-kl-cobalt text-kl-on-cobalt hover:bg-kl-cobalt-hi",
          // pressed: the same colour, deeper (it turned ink, so a press read as a different button)
          "active:not-data-disabled:bg-kl-cobalt-lo",
        ],
        destructive: "bg-kl-red text-kl-on-red hover:bg-kl-red-hi active:not-data-disabled:bg-kl-red-lo",
        quiet: "bg-transparent data-disabled:not-aria-busy:bg-transparent data-disabled:not-aria-busy:bg-none",
      },
      size: {
        default: "",
        compact:
          "min-h-[28px] text-(length:--kl-text-label)/none [--kl-button-px:10px] [--kl-cut-size:var(--kl-cut-nested)]",
        icon: "w-(--kl-ctl)",
      },
    },
    compoundVariants: [
      // the frame takes the fill's colour (control only: a cell's edges belong to its row)
      {
        layout: "control",
        variant: "primary",
        className: [
          "border-kl-cobalt [--kl-cut-line:var(--kl-cobalt)] hover:border-kl-cobalt-hi",
          "active:not-data-disabled:border-kl-cobalt-lo forced-colors:border-[ButtonText]",
        ],
      },
      {
        layout: "control",
        variant: "destructive",
        className: [
          "border-kl-red [--kl-cut-line:var(--kl-red)] hover:border-kl-red-hi",
          "active:not-data-disabled:border-kl-red-lo forced-colors:border-[ButtonText]",
        ],
      },
      {
        layout: "control",
        variant: "quiet",
        className: "border-transparent [--kl-cut-line:transparent] data-disabled:not-aria-busy:border-transparent",
      },
      { layout: "cell", variant: ["primary", "destructive"], className: "focus-visible:outline-current" },
    ],
    defaultVariants: { layout: "control", variant: "secondary", size: "default" },
  },
);

/* The label cell: the text, centred, with the key travel in its padding. */
const labelVariants = cva(
  [
    "inline-flex min-w-0 flex-1 items-center justify-center gap-2 leading-[1.2] whitespace-nowrap",
    "px-(--kl-button-px,14px) pt-[calc(6px+var(--kl-key-y))] pb-[calc(6px-var(--kl-key-y))]",
  ],
  {
    variants: {
      // a label longer than its container wraps inside the frame; the affix cell keeps the full height
      layout: { control: "text-start text-balance whitespace-normal", cell: "" },
      variant: {
        secondary: "",
        primary: "",
        destructive: "",
        quiet: "underline decoration-1 underline-offset-4 group-hover/button:decoration-2",
      },
      size: { default: "", compact: "", icon: "p-0" },
    },
    defaultVariants: { layout: "control", variant: "secondary", size: "default" },
  },
);

/* a signal cell: the ! or the done mark, inserted at an edge of the frame (it unfolds through kl-slot) */
const signalCell = cn(
  "grid h-full w-[calc(var(--kl-ctl)-2*var(--kl-bw))] place-items-center",
  "forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:forced-color-adjust-none",
);

type Signal = "idle" | "pending" | "done" | "failed";

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** pending: a segment runs along the bottom keyline and the button is busy.
     *  done: a ✓ cell is inserted for a moment. failed: a ! cell is inserted at the start. */
    signal?: Signal;
  };

function Button({
  className,
  layout = "control",
  variant = "secondary",
  size = "default",
  signal = "idle",
  children,
  disabled,
  ...props
}: ButtonProps): React.ReactElement {
  const pending = signal === "pending";
  return (
    <ButtonPrimitive
      data-kl-layout={layout ?? "control"}
      {...dataAttrs({ variant, size, signal: signal === "idle" ? undefined : signal })}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      focusableWhenDisabled={pending}
      className={resolveClassName(buttonVariants({ layout, variant, size }), className)}
      {...props}
      // after the props: rendered through another part (a trigger's render={<Button />}), the element is still a
      // button, and its styles and its container's rules key on this slot
      data-slot="button"
    >
      <span className="kl-slot" data-slot="button-fail" data-open={signal === "failed" ? "" : undefined} aria-hidden>
        <span className="flex">
          <span
            className={cn(
              signalCell,
              "border-e-(length:--kl-k1) border-e-kl-seam bg-kl-red text-[15px] font-(--kl-weight-display) text-kl-on-red",
            )}
          >
            !
          </span>
        </span>
      </span>
      <span className={cn(labelVariants({ layout, variant, size }))} data-slot="button-label">
        {children}
      </span>
      <span className="kl-slot" data-slot="button-done" data-open={signal === "done" ? "" : undefined} aria-hidden>
        <span className="flex">
          <span
            className={cn(
              signalCell,
              "border-s-(length:--kl-k1) bg-kl-yellow text-kl-on-yellow",
              variant === "primary" ? "border-s-kl-on-cobalt" : "border-s-current",
            )}
          >
            <svg
              className="kl-tick"
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="square"
            >
              <path pathLength={1} d="m3.5 8.5 3 3 6-7" />
            </svg>
          </span>
        </span>
      </span>
      {pending ? (
        <span className={cn("kl-pending", layout === "cell" && "[inset-block-end:0] [--kl-bw:3px]")} aria-hidden />
      ) : null}
    </ButtonPrimitive>
  );
}

const affix = cn(
  "inline-flex min-w-[calc(var(--kl-ctl)-2*var(--kl-bw))] items-center justify-center self-stretch px-2",
  "ms-1 me-[calc(-1*var(--kl-button-px,14px))] group-data-[size=compact]/button:min-w-[26px]",
  "mt-[calc(-6px-var(--kl-key-y))] mb-[calc(-6px+var(--kl-key-y))] pt-[calc(2*var(--kl-key-y))]",
  "border-s-(length:--kl-k1) border-s-current font-(--kl-weight-display) tabular-nums",
  "has-[kbd]:font-(family-name:--kl-font-mono) has-[kbd]:text-(length:--kl-text-code)/[inherit] has-[kbd]:font-medium",
  "[&.kl-code]:font-(family-name:--kl-font-mono) [&.kl-code]:text-(length:--kl-text-code)/[inherit] [&.kl-code]:font-medium",
);

type ButtonAffixState = Record<string, never>;
const AFFIX_STATE: ButtonAffixState = {};

/** A cell inside the button frame, divided by a keyline: counts, shortcuts, units. Its keyline runs through the
 * label's block padding, so it meets the frame in T-junctions. */
function ButtonAffix({ render, className, style, ...props }: PartProps<"span", ButtonAffixState>): React.ReactElement {
  const own = {
    "data-slot": "button-affix",
    className: resolveClassName(affix, className)(AFFIX_STATE),
    style: resolveStyle(undefined, style)(AFFIX_STATE),
  };
  return useRender({ defaultTagName: "span", render, state: AFFIX_STATE, props: mergeProps<"span">(props, own) });
}

export { Button, ButtonAffix, buttonVariants };
