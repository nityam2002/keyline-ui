"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { Field } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { resolveClassName } from "../lib/keyline-render";
import { choiceStyles } from "./checkbox";

/*
 * Switch, as Base UI's parts (Switch, also exported as SwitchRoot, and SwitchThumb), and SwitchField, a labelled row
 * built from them. A switch reads on/off from three cues, none of them colour alone:
 *   1. position: the thumb sits in the start half (off) or the end half (on);
 *   2. form: off is a hollow thumb, on is a solid one;
 *   3. glyph: on shows the IEC "on" bar in the half the thumb left (drawn with a border-free block so it survives
 *      forced colours). Off shows nothing there.
 * The thumb is inset 2px from the frame, so it reads as an object, never as half of a divided box.
 */

const root = cn(
  "group/switch relative m-0 box-content inline-block h-(--kl-sw) w-[calc(var(--kl-sw)*2)] flex-none cursor-pointer p-0",
  "border-(length:--kl-k2) border-kl-line bg-kl-cell text-kl-ink [--kl-sw-gap:2px] [--kl-sw:22px]",
  "[[data-kl-density=compact]_&]:[--kl-sw:16px]",
  "hover:not-data-disabled:bg-kl-tint",
  // the foundation's ring keys on a kl- class, and the switch has none: it draws its own
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-(--kl-ring-out) focus-visible:outline-kl-focus focus-visible:outline-solid",
  // the "on" bar, centred in the start half; it appears once the thumb has left (same delay as the thumb's fill)
  "after:absolute after:start-[calc(25%-1px)] after:top-[calc(50%-var(--kl-sw)*0.25)] after:h-[calc(var(--kl-sw)*0.5)]",
  "after:w-0.5 after:bg-current after:opacity-0 after:content-[''] after:[transition:opacity_0s_linear_0s]",
  "data-checked:after:opacity-100 data-checked:after:[transition-delay:calc(var(--kl-stretch-trail)*0.6ms)]",
  "data-disabled:cursor-not-allowed data-disabled:border-kl-dis-line data-disabled:bg-(image:--kl-hatch) data-disabled:text-kl-dis",
  "forced-colors:after:bg-[CanvasText] forced-colors:after:forced-color-adjust-none",
  "forced-colors:data-disabled:after:bg-[GrayText]",
);

/**
 * The binary setting. The thumb STRETCHES between the two halves of the frame (the edge on the travel side leads, the
 * other follows: CSS transitions on the stretch springs' timings). Semantics, keyboard, form value and
 * controlled/uncontrolled state are Base UI Switch's; `onCheckedChange` gets Base UI's event details last. Without
 * children it draws its SwitchThumb.
 */
function Switch({ className, children, ...props }: SwitchPrimitive.Root.Props): React.ReactElement {
  return (
    <SwitchPrimitive.Root className={resolveClassName(root, className)} {...props} data-slot="switch">
      {children ?? <SwitchThumb />}
    </SwitchPrimitive.Root>
  );
}

/** Switch, by Base UI's name for the part. */
const SwitchRoot = Switch;

const thumb = cn(
  "absolute inset-y-(--kl-sw-gap) start-(--kl-sw-gap) end-[calc(50%+var(--kl-sw-gap)/2)] box-border",
  "border-2 border-kl-inverse bg-transparent",
  // turning on: the end edge leads, the start edge trails; turning off is the mirror
  "[transition:inset-inline-start_calc(var(--kl-stretch-trail)*1ms)_var(--kl-ease-out),inset-inline-end_calc(var(--kl-stretch-lead)*1ms)_var(--kl-ease-out),background-color_0s_linear_calc(var(--kl-stretch-lead)*0.35ms)]",
  "data-checked:start-[calc(50%+var(--kl-sw-gap)/2)] data-checked:end-(--kl-sw-gap) data-checked:bg-kl-inverse",
  "data-checked:[transition:inset-inline-start_calc(var(--kl-stretch-lead)*1ms)_var(--kl-ease-out),inset-inline-end_calc(var(--kl-stretch-trail)*1ms)_var(--kl-ease-out),background-color_0s_linear_calc(var(--kl-stretch-lead)*0.35ms)]",
  // KEY: pressing moves the contents 1px, the frame stays
  "group-active/switch:not-data-disabled:translate-y-px",
  "data-disabled:border-kl-dis data-disabled:data-checked:bg-kl-dis",
  "forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:forced-color-adjust-none",
  "forced-colors:data-checked:border-[Highlight] forced-colors:data-checked:bg-[Highlight]",
  "forced-colors:data-disabled:border-[GrayText] forced-colors:data-disabled:data-checked:border-[GrayText]",
  "forced-colors:data-disabled:data-checked:bg-[GrayText]",
);

/** The thumb: hollow while off, solid while on. */
function SwitchThumb({ className, ...props }: SwitchPrimitive.Thumb.Props): React.ReactElement {
  return <SwitchPrimitive.Thumb className={resolveClassName(thumb, className)} {...props} data-slot="switch-thumb" />;
}

/**
 * Label + description + switch on one row; the row is the hit target. `className` goes to the row's Field.Root; every
 * other prop goes to the Switch.
 */
function SwitchField({
  label,
  description,
  className,
  disabled,
  layout = "control",
  ...props
}: Omit<SwitchPrimitive.Root.Props, "className"> & {
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  /** control (default): aligns to a form column. cell: a row inside an enclosing frame (inset text and switch). */ layout?:
    | "control"
    | "cell";
}): React.ReactElement {
  return (
    <Field.Root
      data-slot="switch-field"
      data-kl-layout={layout}
      disabled={disabled}
      className={cn(choiceStyles.root, className)}
    >
      <Field.Label data-slot="switch-field-row" className={choiceStyles.row}>
        <span
          data-slot="switch-field-text"
          className={cn(
            choiceStyles.text,
            "ps-(--kl-inset) pe-0 group-data-[kl-layout=control]/choice:ps-0 group-data-[kl-layout=control]/choice:pe-(--kl-inset)",
          )}
        >
          <span data-slot="switch-field-label" className={choiceStyles.label}>
            {label}
          </span>
          {description ? (
            <Field.Description data-slot="switch-field-description" className={choiceStyles.description}>
              {description}
            </Field.Description>
          ) : null}
        </span>
        <span
          data-slot="switch-field-cell"
          className="grid flex-none place-items-center px-(--kl-inset) group-data-[kl-layout=control]/choice:px-0"
        >
          <Switch disabled={disabled} {...props} />
        </span>
      </Field.Label>
    </Field.Root>
  );
}

export { Switch, SwitchRoot, SwitchThumb, SwitchField };
