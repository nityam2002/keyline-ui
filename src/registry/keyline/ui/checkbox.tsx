"use client";

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { Field } from "@base-ui/react/field"

import { cn } from "@/lib/utils"

/**
 * The box: 18px, square, never cut. Checked fills ink with a paper tick; indeterminate draws a bar.
 * Inside a yellow (working-set) cell the tick turns yellow, so the box keeps contrast on both fills.
 * All Base UI Checkbox props pass through (name, value, form participation, parent/child groups).
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root data-slot="checkbox" className={cn("kl-check", className)} {...props}>
      <CheckboxPrimitive.Indicator className="kl-check-ind" keepMounted />
    </CheckboxPrimitive.Root>
  )
}

/**
 * A labelled checkbox row: box cell + label + optional description. The whole row is the hit target,
 * the label is the accessible name, and the description is attached via aria-describedby (Base UI Field).
 */
function CheckboxField({
  label,
  description,
  className,
  disabled,
  layout = "control",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & { label: React.ReactNode; description?: React.ReactNode; /** control (default): aligns to a form column. cell: a row inside an enclosing frame (40px box cell, inset text). */ layout?: "control" | "cell" }) {
  return (
    <Field.Root data-slot="checkbox-field" data-kl-layout={layout} disabled={disabled} className={cn("kl-choice", className)}>
      <Field.Label className="kl-choice-row">
        <span className="kl-choice-box">
          <Checkbox disabled={disabled} {...props} />
        </span>
        <span className="kl-choice-text">
          <span className="kl-choice-label">{label}</span>
          {description ? <Field.Description className="kl-choice-desc">{description}</Field.Description> : null}
        </span>
      </Field.Label>
    </Field.Root>
  )
}

export { Checkbox, CheckboxField }
