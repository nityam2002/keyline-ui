"use client";

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { Field } from "@base-ui/react/field"

import { cn } from "@/lib/utils"

/**
 * A binary setting. The thumb STRETCHES between the two halves of the frame (the edge on the travel
 * side leads, the other follows: pure CSS, same timings as the stretch springs). On and off differ in
 * position, form (hollow / solid thumb) and glyph (the "on" bar), never by colour alone. Semantics,
 * keyboard, form value and controlled/uncontrolled state are Base UI Switch's.
 */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root data-slot="switch" className={cn("kl-switch", className)} {...props}>
      <SwitchPrimitive.Thumb className="kl-switch-thumb" />
    </SwitchPrimitive.Root>
  )
}

/** Label + description + switch on one row; the row is the hit target. */
function SwitchField({ label, description, className, disabled, layout = "control", ...props }: React.ComponentProps<typeof SwitchPrimitive.Root> & { label: React.ReactNode; description?: React.ReactNode; /** control (default): aligns to a form column. cell: a row inside an enclosing frame (40px box cell, inset text). */ layout?: "control" | "cell" }) {
  return (
    <Field.Root data-slot="switch-field" data-kl-layout={layout} disabled={disabled} className={cn("kl-choice kl-switch-field", className)}>
      <Field.Label className="kl-choice-row">
        <span className="kl-choice-text">
          <span className="kl-choice-label">{label}</span>
          {description ? <Field.Description className="kl-choice-desc">{description}</Field.Description> : null}
        </span>
        <span className="kl-switch-cell">
          <Switch disabled={disabled} {...props} />
        </span>
      </Field.Label>
    </Field.Root>
  )
}

export { Switch, SwitchField }
