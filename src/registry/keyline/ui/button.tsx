"use client";

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva("kl-key kl-button", {
  variants: {
    /** control: its own 2px frame. cell: fills a cell of an enclosing frame (no frame, no cut). */
    layout: {
      control: "kl-ctl",
      cell: "kl-button-cell",
    },
    variant: {
      secondary: "",
      primary: "kl-button-primary",
      destructive: "kl-button-destructive",
      quiet: "kl-button-quiet",
    },
    size: {
      default: "",
      compact: "kl-button-compact",
      icon: "kl-button-icon",
    },
  },
  defaultVariants: { layout: "control", variant: "secondary", size: "default" },
})

type Signal = "idle" | "pending" | "done" | "failed"

type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants> & {
    /** pending: a segment runs along the bottom keyline and the button is busy.
     *  done: a ✓ cell is inserted for a moment. failed: a ! cell is inserted at the start. */
    signal?: Signal
  }

function Button({ className, layout, variant, size, signal = "idle", children, disabled, ...props }: ButtonProps) {
  const pending = signal === "pending"
  return (
    <ButtonPrimitive
      data-slot="button"
      data-kl-layout={layout ?? "control"}
      data-signal={signal === "idle" ? undefined : signal}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      focusableWhenDisabled={pending}
      className={cn(buttonVariants({ layout, variant, size }), className)}
      {...props}
    >
      <span className="kl-slot kl-button-fail" data-open={signal === "failed" ? "" : undefined} aria-hidden>
        <span>
          <span>!</span>
        </span>
      </span>
      <span className="kl-button-label">{children}</span>
      <span className="kl-slot kl-button-done" data-open={signal === "done" ? "" : undefined} aria-hidden>
        <span>
          <span>
            <svg className="kl-tick" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square">
              <path pathLength={1} d="m3.5 8.5 3 3 6-7" />
            </svg>
          </span>
        </span>
      </span>
      {pending ? <span className="kl-pending" aria-hidden /> : null}
    </ButtonPrimitive>
  )
}

/** A cell inside the button frame, divided by a keyline: counts, shortcuts, units. */
function ButtonAffix({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="button-affix" className={cn("kl-button-affix", className)} {...props} />
}

export { Button, ButtonAffix, buttonVariants }
