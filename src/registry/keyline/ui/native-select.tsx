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
      className={cn("kl-field", className)}
    >
      <FieldPrimitive.Label className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
        {label}
      </FieldPrimitive.Label>
      <div
        data-kl-layout={layout}
        data-slot="native-select-frame"
        className="kl-ctl kl-cells kl-field-frame kl-edge relative cursor-pointer in-data-disabled:cursor-not-allowed"
      >
        <span className="kl-slot kl-field-bang" aria-hidden>
          <span>
            <span>!</span>
          </span>
        </span>
        <FieldPrimitive.Control
          render={<select />}
          required={required}
          className={cn(
            "kl-edge-part m-0 w-0 min-w-0 flex-1 cursor-[inherit] appearance-none bg-transparent py-0 outline-0",
            // the caret cell is drawn over the select's end: the text stops before it
            "ps-(--kl-inset) pe-[calc(36px+var(--kl-inset))] text-ellipsis whitespace-nowrap text-inherit",
            "font-(family-name:--kl-font) text-(length:--kl-text-lead)",
            // the OS list follows the scheme of the scope it opens from: the nearest .dark, or where style queries
            // exist, the nearest theme scope (--kl-dark)
            "[color-scheme:light] in-[.dark]:[color-scheme:dark]",
            "[@container_style(--kl-dark:_0)]:[color-scheme:light] [@container_style(--kl-dark:_1)]:[color-scheme:dark]",
            // the placeholder option reads as a placeholder; the options in the list keep the ink
            "has-[>option[value='']:checked]:text-kl-ink-3 [&_option]:text-kl-ink",
            "data-disabled:text-kl-dis",
          )}
          {...start}
          {...(props as object)}
          data-slot="native-select-control"
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
        {/* the caret cell: over the select's end, out of pointer events so a press anywhere in the frame opens the
            list */}
        <span
          data-slot="native-select-icon"
          className="pointer-events-none absolute inset-y-0 end-0 z-1 box-border grid w-9 place-items-center text-kl-ink in-data-disabled:text-kl-dis"
          aria-hidden
        >
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
