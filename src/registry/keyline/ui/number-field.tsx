"use client";

import * as React from "react"
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { Field as FieldPrimitive } from "@base-ui/react/field"

import { cn } from "@/lib/utils"
import { FieldMessages, type FieldParticipantProps } from "./field"

type NumberFieldProps = Omit<React.ComponentProps<typeof NumberFieldPrimitive.Root>, "children" | "className" | "render"> & {
  /** Visible label (visually hidden with layout="cell"). */
  label: React.ReactNode
  /** Unit printed in an affix cell after the number, in the Code voice ("kg", "%", "pallets"). */
  unit?: React.ReactNode
  /** Stepper cells (− and +). Off for a field where stepping makes no sense (an order number, a postcode is not a number field at all). */
  steppers?: boolean
  /** control: its own 2px frame. cell: a cell of an enclosing frame (no border, label visually hidden). */
  layout?: "control" | "cell"
  placeholder?: string
  decrementLabel?: string
  incrementLabel?: string
  className?: string
} & FieldParticipantProps

const Minus = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
    <path d="M3.5 8h9" />
  </svg>
)
const Plus = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
    <path d="M3.5 8h9M8 3.5v9" />
  </svg>
)

/**
 * A number in a field frame, with stepper cells:
 *
 *   Pallets
 *   ┌────┬──────────────────────┬─────┬────┐
 *   │ −  │                   24 │ PLT │ +  │   decrement · input (end-aligned, tabular) · unit · increment
 *   └────┴──────────────────────┴─────┴────┘
 *
 * - It is a Field: the same frame, focus edge, inserted ! cell when invalid, hatch when disabled.
 * - The steppers are key cells (contents travel 1px on press). Base UI repeats while held, and disables
 *   the step that would leave [min, max]: that cell is hatched, the other stays live.
 * - Arrow Up/Down step, Shift+Arrow takes `largeStep`, Alt+Arrow `smallStep`, Page Up/Down the large step,
 *   Home/End jump to min/max. Typing is parsed in the field's locale; the value commits on blur or Enter.
 * - The steppers are not in the Tab order (Base UI): the input is the one stop, the keys do the stepping.
 * - A cell narrower than 176px folds its steppers into one stacked end cell (+ over −), so neighbouring
 *   cells never collide.
 * - Formatting (`format`, `locale`) is Base UI's Intl.NumberFormat; the unit cell is a label, not part of
 *   the value.
 */
function NumberField({ label, unit, description, error, invalid, steppers = true, layout = "control", placeholder, decrementLabel = "Decrease", incrementLabel = "Increase", orientation, validate, validationMode, className, name, disabled, ...props }: NumberFieldProps) {
  return (
    <FieldPrimitive.Root
      data-slot="number-field"
      data-kl-layout={layout}
      data-kl-orientation={orientation}
      name={name}
      invalid={invalid}
      disabled={disabled}
      validate={validate}
      validationMode={validationMode}
      className={cn("kl-field kl-number", className)}
    >
      <FieldPrimitive.Label className={cn("kl-field-label", layout === "cell" && "kl-sr")}>{label}</FieldPrimitive.Label>
      <NumberFieldPrimitive.Root name={name} disabled={disabled} {...props}>
        <NumberFieldPrimitive.Group data-kl-layout={layout} className="kl-ctl kl-cells kl-field-frame kl-edge kl-number-frame">
          <span className="kl-slot kl-field-bang" aria-hidden>
            <span>
              <span>!</span>
            </span>
          </span>
          {steppers ? (
            <NumberFieldPrimitive.Decrement aria-label={decrementLabel} className="kl-cell kl-key kl-number-step">
              <Minus />
            </NumberFieldPrimitive.Decrement>
          ) : null}
          <NumberFieldPrimitive.Input placeholder={placeholder} data-align="end" className="kl-field-input kl-number-input" />
          {unit != null ? (
            <span className="kl-field-affix kl-number-unit">
              {/* isolated, so a unit led by a neutral character ("°C") keeps its order in RTL */}
              <bdi>{unit}</bdi>
            </span>
          ) : null}
          {steppers ? (
            <NumberFieldPrimitive.Increment aria-label={incrementLabel} className="kl-cell kl-key kl-number-step">
              <Plus />
            </NumberFieldPrimitive.Increment>
          ) : null}
        </NumberFieldPrimitive.Group>
      </NumberFieldPrimitive.Root>
      <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
    </FieldPrimitive.Root>
  )
}

export { NumberField, type NumberFieldProps }
