"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { FieldMessages, type FieldParticipantProps } from "./field";

type NativeSelectOption = { value: string; label: string; disabled?: boolean };
type NativeSelectGroup = { group: string; options: NativeSelectOption[] };

type NativeSelectProps = Omit<React.ComponentProps<"select">, "multiple" | "size" | "children"> &
  FieldParticipantProps & {
    label: React.ReactNode;
    /** Options (or labelled groups of options). Or pass <option>/<optgroup> children instead. */
    options?: (NativeSelectOption | NativeSelectGroup)[];
    children?: React.ReactNode;
    /** An empty first option. Not selectable again once a value is chosen when `required`. */
    placeholder?: string;
    /** control: its own frame. cell: a cell of an enclosing frame (label visually hidden). */
    layout?: "control" | "cell";
  };

const optionEl = (o: NativeSelectOption) => (
  <option key={o.value} value={o.value} disabled={o.disabled}>
    {o.label}
  </option>
);

/**
 * NativeSelect: the platform's own <select> in a Keyline field frame. For long forms on touch
 * devices, autofill (country, region), and anywhere the OS picker is the better list; Select is the
 * styled listbox for everything else. A Field participant (name, required, validate, Form errors).
 *
 *   ┌─────────────────────────────┬────┐
 *   │ Rotterdam ECT Delta         │ ⌄  │   one frame: the select fills it, the caret cell is drawn
 *   └─────────────────────────────┴────┘   over its end (clicks reach the select)
 *
 * The open list is the operating system's: it follows the page's light or dark scheme, not the theme.
 * Single choice only: a multiple select is a CheckboxGroup or Multiselect here.
 */
function NativeSelect({
  label,
  options,
  children,
  placeholder,
  layout = "control",
  description,
  error,
  invalid,
  validate,
  validationMode,
  orientation,
  className,
  name,
  disabled,
  required,
  ...props
}: NativeSelectProps) {
  // with a placeholder and no value, start on it: a disabled first option is otherwise skipped by the browser
  const start =
    placeholder != null && props.value === undefined && props.defaultValue === undefined ? { defaultValue: "" } : null;
  return (
    <FieldPrimitive.Root
      data-slot="native-select"
      data-kl-layout={layout}
      data-kl-orientation={orientation}
      name={name}
      invalid={invalid}
      disabled={disabled}
      validate={validate}
      validationMode={validationMode}
      className={cn("kl-field kl-nsel", className)}
    >
      <FieldPrimitive.Label className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
        {label}
      </FieldPrimitive.Label>
      <div data-kl-layout={layout} className="kl-ctl kl-cells kl-field-frame kl-edge kl-nsel-frame">
        <span className="kl-slot kl-field-bang" aria-hidden>
          <span>
            <span>!</span>
          </span>
        </span>
        <FieldPrimitive.Control
          render={<select />}
          required={required}
          className="kl-nsel-select kl-edge-part"
          {...start}
          {...(props as object)}
        >
          {placeholder != null ? (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          ) : null}
          {options
            ? options.map((o) =>
                "group" in o ? (
                  <optgroup key={o.group} label={o.group}>
                    {o.options.map(optionEl)}
                  </optgroup>
                ) : (
                  optionEl(o)
                ),
              )
            : children}
        </FieldPrimitive.Control>
        <span className="kl-nsel-caret" aria-hidden>
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="square"
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </span>
      </div>
      <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
    </FieldPrimitive.Root>
  );
}

export { NativeSelect, type NativeSelectProps, type NativeSelectOption, type NativeSelectGroup };
