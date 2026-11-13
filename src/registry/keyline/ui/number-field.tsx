"use client";

import * as React from "react";
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { type PartProps, resolveClassName, resolveStyle } from "../lib/keyline-render";
import { FieldMessages, type FieldParticipantProps } from "./field";

/*
 * Number field, as Base UI's parts (NumberFieldRoot, NumberFieldGroup, NumberFieldDecrement, NumberFieldInput,
 * NumberFieldIncrement), Keyline's NumberFieldUnit, and NumberField, the field built from them.
 *
 *   Pallets
 *   ┌────┬──────────────────────┬─────┬────┐
 *   │ −  │                   24 │ PLT │ +  │   decrement · input (end-aligned, tabular) · unit · increment
 *   └────┴──────────────────────┴─────┴────┘
 *
 * The group is a Field frame (kl-field-frame in the theme): the same focus edge, inserted ! cell when invalid and
 * hatch when disabled. The steppers are key cells, as tall as the frame and square in a control; in a cell they keep
 * the row height.
 *
 * NARROW CELLS. A NumberField with layout="cell" measures itself (an inline-size container named kl-nf, safe: its
 * width never comes from its contents) and, narrower than 176px, folds its steppers into one stacked cell at the end
 * (+ over −), so two or three number cells in a narrow panel never run into each other. Both stay visible and
 * clickable; the tab order is unchanged, and the arrows still step.
 */

type Layout = "control" | "cell";

const Minus = () => (
  <svg
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    aria-hidden
  >
    <path d="M3.5 8h9" />
  </svg>
);
const Plus = () => (
  <svg
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    aria-hidden
  >
    <path d="M3.5 8h9M8 3.5v9" />
  </svg>
);

/**
 * Base UI's NumberField.Root: value, `min`/`max`, `step` (`largeStep`, `smallStep`), `format` and `locale`
 * (Intl.NumberFormat), hold-to-repeat, form value (`name`). `onValueChange` gets Base UI's event details last.
 */
function NumberFieldRoot({ className, ...props }: NumberFieldPrimitive.Root.Props): React.ReactElement {
  return (
    <NumberFieldPrimitive.Root className={resolveClassName("", className)} {...props} data-slot="number-field-root" />
  );
}

const group = cn(
  "kl-ctl kl-cells kl-field-frame kl-edge",
  // room for four digits whatever the frame's width; a cell (often one of several in a row) pads less
  "[--kl-number-pad:var(--kl-inset)] data-[kl-layout=cell]:[--kl-number-pad:8px]",
  // a narrow cell: the steppers fold into one stacked end cell
  "[@container_kl-nf_(max-width:176px)]:data-[kl-layout=cell]:grid",
  "[@container_kl-nf_(max-width:176px)]:data-[kl-layout=cell]:grid-cols-[auto_minmax(0,1fr)_auto_var(--kl-row)]",
  "[@container_kl-nf_(max-width:176px)]:data-[kl-layout=cell]:grid-rows-[1fr_1fr]",
);

/** One cell of a narrow cell layout that spans both rows. */
const spans =
  "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:row-[1/span_2]";

/**
 * The frame of cells: the attention cell (inserted at its start, open while the field is invalid), then its children.
 * `layout="cell"`: the frame is a cell of an enclosing frame (no border of its own).
 */
function NumberFieldGroup({
  layout = "control",
  className,
  children,
  ...props
}: NumberFieldPrimitive.Group.Props & { layout?: Layout }): React.ReactElement {
  return (
    <NumberFieldPrimitive.Group
      data-kl-layout={layout}
      className={resolveClassName(group, className)}
      {...props}
      data-slot="number-field-group"
    >
      <span
        className={cn(
          "kl-slot kl-field-bang",
          spans,
          "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:col-start-1",
        )}
        aria-hidden
      >
        <span>
          <span>!</span>
        </span>
      </span>
      {children}
    </NumberFieldPrimitive.Group>
  );
}

const step = cn(
  "kl-cell kl-key min-h-0 w-[calc(var(--kl-ctl)-2*var(--kl-bw,0px))] flex-none cursor-pointer justify-center p-0 text-kl-ink",
  // square as wide as the frame is tall inside its own border; a cell keeps the row height
  "[[data-slot=number-field-group][data-kl-layout=cell]>&]:w-(--kl-row)",
  "active:not-disabled:not-data-disabled:bg-kl-press",
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-in) focus-visible:outline-kl-focus",
  "focus-visible:outline-solid",
  // the step that would leave [min, max] is out of service; the other stays live
  "disabled:cursor-not-allowed disabled:bg-(image:--kl-hatch) disabled:text-kl-dis",
  "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
  // the whole field out of service: the frame is hatched, not each step
  "[[data-slot=number-field-group][data-disabled]>&]:bg-none",
  "forced-colors:disabled:text-[GrayText] forced-colors:data-disabled:text-[GrayText]",
  // narrow cell: both steppers in the end column, each carrying the seam to the value
  "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:col-start-4",
  "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:w-auto",
  "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:border-s-(length:--kl-k1)",
  "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:border-s-kl-line",
  "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:[&_svg]:size-3",
);

/** The − key cell. Base UI repeats while held and disables it at `min`; it is not in the Tab order. */
function NumberFieldDecrement({
  className,
  children,
  ...props
}: NumberFieldPrimitive.Decrement.Props): React.ReactElement {
  return (
    <NumberFieldPrimitive.Decrement
      className={resolveClassName(
        cn(
          step,
          "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:row-start-2",
          "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:border-t-(length:--kl-k1)",
          "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:border-t-kl-seam",
        ),
        className,
      )}
      {...props}
      data-slot="number-field-decrement"
    >
      {children ?? <Minus />}
    </NumberFieldPrimitive.Decrement>
  );
}

/** The + key cell. Base UI repeats while held and disables it at `max`; it is not in the Tab order. */
function NumberFieldIncrement({
  className,
  children,
  ...props
}: NumberFieldPrimitive.Increment.Props): React.ReactElement {
  return (
    <NumberFieldPrimitive.Increment
      className={resolveClassName(
        cn(
          step,
          "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:row-start-1",
        ),
        className,
      )}
      {...props}
      data-slot="number-field-increment"
    >
      {children ?? <Plus />}
    </NumberFieldPrimitive.Increment>
  );
}

/**
 * The input cell: end-aligned with tabular figures, so the digits stay put while the value steps. A number keeps its
 * sign where it belongs in RTL ("-18", not "18-"): the text is laid out as its own paragraph while the alignment
 * still follows the page.
 */
function NumberFieldInput({ className, ...props }: NumberFieldPrimitive.Input.Props): React.ReactElement {
  return (
    <NumberFieldPrimitive.Input
      data-align="end"
      className={resolveClassName(
        cn(
          "kl-field-input box-border min-w-[calc(4ch+2*var(--kl-number-pad,var(--kl-inset)))] px-[var(--kl-number-pad,var(--kl-inset))]",
          "tabular-nums [unicode-bidi:plaintext]",
          spans,
          "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:col-start-2",
          "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:w-full",
          "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:min-w-0",
          "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:border-s-0",
        ),
        className,
      )}
      {...props}
      data-slot="number-field-input"
    />
  );
}

type EmptyState = Record<string, never>;
const EMPTY: EmptyState = {};

/**
 * The unit cell after the input, in the Code voice ("kg", "%", "pallets"). It is a label, not part of the value; the
 * seam between it and the input is the soft one, so the two read as one value. Its content is isolated, so a unit led
 * by a neutral character ("°C") keeps its order in RTL.
 */
function NumberFieldUnit({ render, className, style, children, ...props }: PartProps<"span", EmptyState>) {
  const own = {
    "data-slot": "number-field-unit",
    className: resolveClassName(
      cn(
        "kl-field-affix border-s-(length:--kl-k1) border-s-kl-seam [[data-slot=number-field-input]+&]:border-s-kl-line-soft",
        "[[data-slot=number-field-group][data-disabled]>&]:text-kl-dis",
        spans,
        "[@container_kl-nf_(max-width:176px)]:[[data-slot=number-field-group][data-kl-layout=cell]>&]:col-start-3",
      ),
      className,
    )(EMPTY),
    style: resolveStyle(undefined, style)(EMPTY),
    children: <bdi>{children}</bdi>,
  };
  return useRender({ defaultTagName: "span", render, state: EMPTY, props: mergeProps<"span">(props, own) });
}

/* ------------------------------------------------------------------ the field */

type NumberFieldProps = Omit<NumberFieldPrimitive.Root.Props, "children" | "className" | "render"> & {
  /** Visible label (visually hidden with layout="cell"). */
  label: React.ReactNode;
  /** Unit printed in an affix cell after the number, in the Code voice ("kg", "%", "pallets"). */
  unit?: React.ReactNode;
  /** Stepper cells (− and +). Off for a field where stepping makes no sense (an order number, a postcode is not a number field at all). */
  steppers?: boolean;
  /** control: its own 2px frame. cell: a cell of an enclosing frame (no border, label visually hidden). */
  layout?: Layout;
  placeholder?: string;
  decrementLabel?: string;
  incrementLabel?: string;
  className?: string;
} & FieldParticipantProps;

/**
 * A number in a field frame, with stepper cells, built from the parts above.
 *
 * - Arrow Up/Down step, Shift+Arrow takes `largeStep`, Alt+Arrow `smallStep`, Page Up/Down the large step,
 *   Home/End jump to min/max. Typing is parsed in the field's locale; the value commits on blur or Enter.
 * - The steppers are not in the Tab order (Base UI): the input is the one stop, the keys do the stepping.
 * - It is a Base UI Field: a Form collects the value under `name`, and `validate`, `invalid` and the Form's `errors`
 *   print under the frame.
 */
function NumberField({
  label,
  unit,
  description,
  error,
  invalid,
  steppers = true,
  layout = "control",
  placeholder,
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
  orientation,
  validate,
  validationMode,
  className,
  name,
  disabled,
  ...props
}: NumberFieldProps) {
  return (
    <FieldPrimitive.Root
      data-kl-layout={layout}
      data-kl-orientation={orientation}
      name={name}
      invalid={invalid}
      disabled={disabled}
      validate={validate}
      validationMode={validationMode}
      className={cn("kl-field data-[kl-layout=cell]:@container/kl-nf data-[kl-layout=cell]:min-w-0", className)}
      data-slot="number-field"
    >
      <FieldPrimitive.Label className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
        {label}
      </FieldPrimitive.Label>
      <NumberFieldRoot name={name} disabled={disabled} {...props}>
        <NumberFieldGroup layout={layout}>
          {steppers ? <NumberFieldDecrement aria-label={decrementLabel} /> : null}
          <NumberFieldInput placeholder={placeholder} />
          {unit != null ? <NumberFieldUnit>{unit}</NumberFieldUnit> : null}
          {steppers ? <NumberFieldIncrement aria-label={incrementLabel} /> : null}
        </NumberFieldGroup>
      </NumberFieldRoot>
      <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
    </FieldPrimitive.Root>
  );
}

export {
  NumberField,
  NumberFieldRoot,
  NumberFieldGroup,
  NumberFieldDecrement,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldUnit,
  type NumberFieldProps,
};
