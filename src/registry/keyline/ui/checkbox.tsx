"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { resolveClassName } from "../lib/keyline-render";

/*
 * Checkbox, as Base UI's parts (Checkbox, also exported as CheckboxRoot, and CheckboxIndicator), and CheckboxField,
 * a labelled row built from them:
 *
 *   ┌────┬──────────────────────────────┐
 *   │ ■  │ Lock the warehouse door       │   box cell · label + description; the whole row toggles the box
 *   │    │ Darryl leaves by the dock at 5│
 *   └────┴──────────────────────────────┘
 */

/**
 * The choice row's look: a box cell, then the label and an optional description. CheckboxField, SwitchField,
 * CheckboxGroup's rows and RadioGroup's rows are built from it, and so is a component that draws the row over its
 * own input (Questionnaire). `root` goes on the Base UI Field.Root, which carries `data-kl-layout`: in the `control`
 * layout (a form column) the box sits on the column's edge and the text follows at a 12px gap; without the root (or in
 * the `cell` layout) the box has a 40px cell and the text an inset.
 */
const choiceStyles = {
  root: "group/choice min-w-0",
  row: "group/choice-row flex min-h-(--kl-row) cursor-pointer items-stretch group-data-disabled/choice:cursor-not-allowed",
  box: cn(
    "grid w-10 flex-none place-items-center",
    "group-data-[kl-layout=control]/choice:w-auto group-data-[kl-layout=control]/choice:pe-3",
  ),
  text: "grid min-w-0 flex-1 content-center gap-0.5 py-2 pe-(--kl-inset) group-data-[kl-layout=control]/choice:pe-0",
  label: "text-(length:--kl-text-body)/[1.3] font-(--kl-weight-strong) group-data-disabled/choice:text-kl-dis",
  description: "m-0 text-(length:--kl-text-label)/[1.35] text-kl-ink-2",
};

/**
 * The box's look, for a component that draws it over its own input (Questionnaire). `root` is the box, `indicator`
 * the tick or bar inside it; both read Base UI's state attributes (data-checked, data-indeterminate, data-unchecked,
 * data-disabled).
 */
const checkboxStyles = {
  root: cn(
    "group/checkbox m-0 grid size-[18px] flex-none cursor-pointer place-items-center p-0",
    "border-2 border-current bg-kl-cell text-inherit",
    // the foundation's ring keys on a kl- class, and the box has none: it draws its own
    "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-out) focus-visible:outline-kl-focus focus-visible:outline-solid",
    "data-checked:border-kl-inverse data-checked:bg-kl-inverse data-indeterminate:border-kl-inverse data-indeterminate:bg-kl-inverse",
    // KEY: the box answers the press at once (an empty box darkens; a ticked box's tick travels 1px), whether the
    // press lands on the box or on its choice row
    "active:not-data-disabled:*:translate-y-px active:not-data-disabled:not-data-checked:not-data-indeterminate:bg-kl-press",
    "group-active/choice-row:not-data-disabled:not-data-checked:not-data-indeterminate:bg-kl-press",
    "group-active/choice-row:not-data-disabled:*:translate-y-px",
    "group-hover/choice-row:not-data-disabled:not-data-checked:not-data-indeterminate:bg-kl-tint",
    "data-disabled:cursor-not-allowed data-disabled:bg-(image:--kl-hatch) data-disabled:not-data-checked:border-kl-dis-line",
    "data-disabled:data-checked:border-kl-dis data-disabled:data-checked:bg-kl-dis data-disabled:data-checked:bg-none",
    // on a working-set (yellow) cell the box takes the signal's own foreground, so the tick stays visible in both themes
    "[[data-kl-on]_&:is([data-checked],[data-indeterminate])]:border-kl-on-yellow",
    "[[data-kl-on]_&:is([data-checked],[data-indeterminate])]:bg-kl-on-yellow",
    "forced-colors:data-checked:border-[CanvasText] forced-colors:data-checked:bg-[CanvasText] forced-colors:data-checked:bg-none",
    "forced-colors:data-checked:forced-color-adjust-none forced-colors:data-indeterminate:border-[CanvasText]",
    "forced-colors:data-indeterminate:bg-[CanvasText] forced-colors:data-indeterminate:bg-none",
    "forced-colors:data-indeterminate:forced-color-adjust-none",
  ),
  indicator: cn(
    "block [--kl-tick:var(--kl-on-inverse)] forced-colors:[--kl-tick:Canvas] [[data-kl-on]_&]:[--kl-tick:var(--kl-yellow)]",
    // the tick is a path whose ink is centred in its 12×12 box (a rotated border L is not: its ink sat right of and
    // below the box's centre). Centred means the stroked outline, not the polyline: with a 2.4 stroke, square caps
    // and a miter join the ink spans y 1.08–10.92. Physical: a tick never mirrors in RTL.
    "[--kl-tick-path:url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20d=%27M1.6%206.18%204.6%209.18%2010.4%202.78%27%20fill=%27none%27%20stroke=%27%23000%27%20stroke-width=%272.4%27%20stroke-linecap=%27square%27/%3E%3C/svg%3E)]",
    "data-checked:size-3 data-checked:bg-(--kl-tick)",
    "data-checked:[-webkit-mask:var(--kl-tick-path)_center/100%_100%_no-repeat]",
    "data-checked:[mask:var(--kl-tick-path)_center/100%_100%_no-repeat]",
    "data-indeterminate:h-0 data-indeterminate:w-[9px] data-indeterminate:border-b-[2.5px] data-indeterminate:border-b-(color:--kl-tick)",
    "data-unchecked:hidden",
  ),
};

/**
 * The box: 18px, square, never cut. Checked fills ink with a paper tick; indeterminate draws a bar. Inside a yellow
 * (working-set) cell the tick turns yellow, so the box keeps contrast on both fills. All Base UI Checkbox props pass
 * through (name, value, form participation, parent/child groups); `onCheckedChange` gets Base UI's event details
 * last. Without children it draws its CheckboxIndicator.
 */
function Checkbox({ className, children, ...props }: CheckboxPrimitive.Root.Props): React.ReactElement {
  return (
    <CheckboxPrimitive.Root
      className={resolveClassName(checkboxStyles.root, className)}
      {...props}
      data-slot="checkbox"
    >
      {children ?? <CheckboxIndicator />}
    </CheckboxPrimitive.Root>
  );
}

/** Checkbox, by Base UI's name for the part. */
const CheckboxRoot = Checkbox;

/** The tick (checked) or bar (indeterminate). Kept mounted by default, so the box's contents never jump. */
function CheckboxIndicator({
  className,
  keepMounted = true,
  ...props
}: CheckboxPrimitive.Indicator.Props): React.ReactElement {
  return (
    <CheckboxPrimitive.Indicator
      keepMounted={keepMounted}
      className={resolveClassName(checkboxStyles.indicator, className)}
      {...props}
      data-slot="checkbox-indicator"
    />
  );
}

/**
 * A labelled checkbox row: box cell + label + optional description. The whole row is the hit target, the label is
 * the accessible name, and the description is attached via aria-describedby (Base UI Field). `className` goes to the
 * row's Field.Root; every other prop goes to the Checkbox.
 */
function CheckboxField({
  label,
  description,
  className,
  disabled,
  layout = "control",
  ...props
}: Omit<CheckboxPrimitive.Root.Props, "className"> & {
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  /** control (default): aligns to a form column. cell: a row inside an enclosing frame (40px box cell, inset text). */ layout?:
    | "control"
    | "cell";
}): React.ReactElement {
  return (
    <Field.Root
      data-slot="checkbox-field"
      data-kl-layout={layout}
      disabled={disabled}
      className={cn(choiceStyles.root, className)}
    >
      <Field.Label data-slot="checkbox-field-row" className={choiceStyles.row}>
        <span data-slot="checkbox-field-box" className={choiceStyles.box}>
          <Checkbox disabled={disabled} {...props} />
        </span>
        <span data-slot="checkbox-field-text" className={choiceStyles.text}>
          <span data-slot="checkbox-field-label" className={choiceStyles.label}>
            {label}
          </span>
          {description ? (
            <Field.Description data-slot="checkbox-field-description" className={choiceStyles.description}>
              {description}
            </Field.Description>
          ) : null}
        </span>
      </Field.Label>
    </Field.Root>
  );
}

export { Checkbox, CheckboxRoot, CheckboxIndicator, CheckboxField, checkboxStyles, choiceStyles };
