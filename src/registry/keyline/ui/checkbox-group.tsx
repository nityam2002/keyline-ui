"use client";

import * as React from "react";
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Fieldset } from "@base-ui/react/fieldset";

import { cn } from "@/lib/utils";
import { Checkbox } from "./checkbox";
import { FieldMessages, type FieldParticipantProps } from "./field";

type CheckboxGroupOption = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Trailing cell: a count, a price, a code. One row with meta keeps the column on every row. */
  meta?: React.ReactNode;
  disabled?: boolean;
};

type CheckboxGroupProps = Omit<
  React.ComponentProps<typeof CheckboxGroupPrimitive>,
  "value" | "defaultValue" | "onValueChange" | "render" | "children"
> &
  FieldParticipantProps & {
    /** Names the group (a fieldset legend). With layout="cell" it is announced but not shown: the enclosing frame's header names it. */
    legend: React.ReactNode;
    options?: CheckboxGroupOption[];
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    /**
     * A parent row that checks or clears every option (Base UI's parent checkbox: mixed while some are
     * checked). true labels it "All"; pass a node to name it ("All carriers"). Its meta cell counts "3/5".
     */
    selectAll?: React.ReactNode;
    /** Form name: Base UI Form values and FormData get the checked values under it. */
    name?: string;
    /** control (default): its own 2px frame, legend above. cell: rows of an enclosing frame (a panel body, a popover). */
    layout?: "control" | "cell";
    /** Extra rows (CheckboxGroupItem) after the options, for rows the options shape can't describe. */
    children?: React.ReactNode;
  };

/**
 * Several independent choices that belong to one question, in one frame.
 *
 *   Notify me about
 *   ┌───────────────────────────────┬──────┐
 *   │ ▬  All events                 │  2/4 │   parent row (selectAll): mixed, checked or clear; 2px rule under it
 *   ┝━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━┥
 *   │ ■  Delayed                    │   12 │   rows: box cell · label + description · meta cell
 *   ├───────────────────────────────┼──────┤
 *   │ □  Delivered                  │   48 │
 *   └───────────────────────────────┴──────┘
 *
 * - Behaviour is Base UI CheckboxGroup in a Fieldset in a Field: Tab visits each box, Space toggles, the
 *   parent row checks or clears every enabled option; disabled options keep their state.
 * - Field participant: `name` puts the checked values in Form values and FormData, `validate` and Form
 *   `errors` reach it, and `invalid` + `error` show the attention state (red frame, the message below).
 * - The parent row is the group's summary, so it is divided from its options by a 2px rule (the same
 *   weight a toolbar group's edge has): one unit, then its parts.
 * - Each row's whole width is the hit target (the label wraps the box); long labels wrap inside the row.
 */
function CheckboxGroup({
  legend,
  options = [],
  value,
  defaultValue,
  onValueChange,
  selectAll,
  name,
  layout = "control",
  children,
  allValues: allValuesProp,
  invalid,
  error,
  description,
  validate,
  validationMode,
  orientation,
  disabled,
  className,
  ...props
}: CheckboxGroupProps) {
  const [inner, setInner] = React.useState<string[]>(defaultValue ?? []);
  const current = value ?? inner;
  const allValues = allValuesProp ?? options.map((o) => o.value);
  const checked = current.filter((v) => allValues.includes(v)).length;
  return (
    <FieldPrimitive.Root
      name={name}
      invalid={invalid}
      validate={validate}
      validationMode={validationMode}
      disabled={disabled}
      className="kl-field-host"
    >
      <Fieldset.Root
        data-slot="checkbox-group"
        data-kl-layout={layout}
        data-kl-orientation={orientation}
        data-invalid={invalid ? "" : undefined}
        className={cn("kl-field kl-cbg", className)}
        render={
          <CheckboxGroupPrimitive
            value={current}
            onValueChange={(v) => {
              setInner(v);
              onValueChange?.(v);
            }}
            allValues={allValues}
            disabled={disabled}
            {...props}
          />
        }
      >
        <Fieldset.Legend className={cn("kl-field-label", layout === "cell" && "kl-sr")}>{legend}</Fieldset.Legend>
        <div className="kl-ctl kl-cbg-frame" data-kl-layout={layout}>
          {selectAll != null && selectAll !== false ? (
            <CheckboxGroupItem
              parent
              label={selectAll === true ? "All" : selectAll}
              meta={
                <span className="kl-code">
                  {checked}/{allValues.length}
                </span>
              }
            />
          ) : null}
          {options.map((o) => (
            <CheckboxGroupItem
              key={o.value}
              value={o.value}
              label={o.label}
              description={o.description}
              meta={o.meta}
              disabled={o.disabled}
            />
          ))}
          {children}
        </div>
        <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
      </Fieldset.Root>
    </FieldPrimitive.Root>
  );
}

type CheckboxGroupItemProps = Omit<React.ComponentProps<typeof Checkbox>, "children"> & {
  label: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
};

/**
 * One row of a CheckboxGroup: box cell · label (+ description) · optional meta cell. Use it as a child of
 * CheckboxGroup for custom rows; it takes every Checkbox prop (`value`, `parent`, `disabled`).
 */
function CheckboxGroupItem({ label, description, meta, disabled, className, ...props }: CheckboxGroupItemProps) {
  return (
    <FieldPrimitive.Item
      data-slot="checkbox-group-item"
      data-kl-parent={props.parent ? "" : undefined}
      disabled={disabled}
      className={cn("kl-cbg-row", className)}
    >
      <FieldPrimitive.Label className="kl-choice-row kl-cbg-label">
        <span className="kl-choice-box">
          <Checkbox disabled={disabled} {...props} />
        </span>
        <span className="kl-choice-text">
          <span className="kl-choice-label">{label}</span>
          {description ? (
            <FieldPrimitive.Description className="kl-choice-desc">{description}</FieldPrimitive.Description>
          ) : null}
        </span>
        {meta != null ? (
          <span className="kl-cbg-meta">{meta}</span>
        ) : (
          <span className="kl-cbg-meta" data-empty="" aria-hidden />
        )}
      </FieldPrimitive.Label>
    </FieldPrimitive.Item>
  );
}

export { CheckboxGroup, CheckboxGroupItem, type CheckboxGroupOption };
