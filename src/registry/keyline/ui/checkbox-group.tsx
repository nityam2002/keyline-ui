"use client";

import * as React from "react";
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { type PartProps, resolveClassName, resolveStyle } from "../lib/keyline-render";
import { Checkbox, choiceStyles } from "./checkbox";
import { FieldMessages, type FieldParticipantProps } from "./field";

/*
 * Checkbox group, as parts (CheckboxGroupRoot, Base UI's CheckboxGroup as a fieldset in its own Field; its
 * CheckboxGroupLegend; the CheckboxGroupFrame; CheckboxGroupItem rows) and CheckboxGroup, the field built from them.
 *
 *   Notify me about
 *   ┌───────────────────────────────┬──────┐
 *   │ ▬  All events                 │  2/4 │   parent row (selectAll): mixed, checked or clear; 2px rule under it
 *   ┝━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┿━━━━━━┥
 *   │ ■  Delayed                    │   12 │   rows: box cell · label + description · meta cell
 *   ├───────────────────────────────┼──────┤
 *   │ □  Delivered                  │   48 │
 *   └───────────────────────────────┴──────┘
 */

type Layout = "control" | "cell";
type Orientation = NonNullable<FieldParticipantProps["orientation"]>;

const LayoutContext = React.createContext<Layout>("control");

type CheckboxGroupRootProps = CheckboxGroupPrimitive.Props &
  Pick<FieldPrimitive.Root.Props, "name" | "invalid" | "validate" | "validationMode"> & {
    /** control (default): its own 2px frame, legend above. cell: rows of an enclosing frame; the legend is announced
     * but not shown. */
    layout?: Layout;
    orientation?: Orientation;
  };

/**
 * Base UI's CheckboxGroup, rendered as a fieldset inside its own Base UI Field.Root (the two in one part): `name`,
 * `invalid`, `validate` and `validationMode` go to the field, so Form values, FormData and Form `errors` reach the
 * group; the rest (`value`, `defaultValue`, `onValueChange` with Base UI's event details last, `allValues`,
 * `disabled`) to the group. Lay it out with CheckboxGroupLegend, CheckboxGroupFrame and CheckboxGroupItem rows.
 */
function CheckboxGroupRoot({
  name,
  invalid,
  validate,
  validationMode,
  disabled,
  layout = "control",
  orientation,
  className,
  ...props
}: CheckboxGroupRootProps): React.ReactElement {
  return (
    <LayoutContext.Provider value={layout}>
      <FieldPrimitive.Root
        name={name}
        invalid={invalid}
        validate={validate}
        validationMode={validationMode}
        disabled={disabled}
        className="contents"
      >
        <FieldsetPrimitive.Root
          render={
            <CheckboxGroupPrimitive
              data-kl-layout={layout}
              data-kl-orientation={orientation}
              data-invalid={invalid ? "" : undefined}
              disabled={disabled}
              className={resolveClassName("kl-field", className)}
              {...props}
              data-slot="checkbox-group"
            />
          }
        />
      </FieldPrimitive.Root>
    </LayoutContext.Provider>
  );
}

/** Names the group: Base UI's Fieldset.Legend, in the field label's voice. Visually hidden in the `cell` layout. */
function CheckboxGroupLegend({ className, ...props }: FieldsetPrimitive.Legend.Props): React.ReactElement {
  const layout = React.useContext(LayoutContext);
  return (
    <FieldsetPrimitive.Legend
      className={resolveClassName(
        cn(
          "kl-field-label [[data-disabled]>[data-slot=checkbox-group]>&]:text-kl-ink-2 [[data-slot=checkbox-group][data-disabled]>&]:text-kl-ink-2",
          layout === "cell" && "kl-sr",
        ),
        className,
      )}
      {...props}
      data-slot="checkbox-group-legend"
    />
  );
}

type FrameState = { layout: Layout };

const frame = cn(
  "kl-ctl flex min-w-0 flex-col bg-kl-cell data-[kl-layout=cell]:bg-transparent",
  // no option has meta: the frame says so to its meta cells (a :has() on the frame itself; one in the cells' selector
  // restyles the whole document on any DOM change). An empty cell hides; the parent's count sits undivided.
  "[--kl-cbg-empty:initial] [--kl-cbg-pbs:initial] [--kl-cbg-pmin:initial]",
  "not-has-[[data-slot=checkbox-group-item]:not([data-kl-parent])_[data-slot=checkbox-group-item-meta]:not([data-empty])]:[--kl-cbg-empty:none]",
  "not-has-[[data-slot=checkbox-group-item]:not([data-kl-parent])_[data-slot=checkbox-group-item-meta]:not([data-empty])]:[--kl-cbg-pmin:0px]",
  "not-has-[[data-slot=checkbox-group-item]:not([data-kl-parent])_[data-slot=checkbox-group-item-meta]:not([data-empty])]:[--kl-cbg-pbs:0px]",
  // attention: the frame turns red (a Base UI check, Form errors, or `invalid`); the message is below
  "[[data-slot=checkbox-group][data-invalid]:not([data-disabled])>&]:border-kl-red",
  "[[data-slot=checkbox-group][data-invalid]:not([data-disabled])>&]:[--kl-cut-line:var(--kl-red)]",
  "[[data-invalid]:not([data-disabled])>[data-slot=checkbox-group]>&]:border-kl-red",
  "[[data-invalid]:not([data-disabled])>[data-slot=checkbox-group]>&]:[--kl-cut-line:var(--kl-red)]",
  "[[data-slot=checkbox-group][data-disabled]>&]:border-kl-dis-line",
  "[[data-slot=checkbox-group][data-disabled]>&]:[--kl-cut-line:var(--kl-dis-line)]",
  "[[data-disabled]>[data-slot=checkbox-group]>&]:border-kl-dis-line",
  "[[data-disabled]>[data-slot=checkbox-group]>&]:[--kl-cut-line:var(--kl-dis-line)]",
);

/** The frame of rows: they meet on 1px keylines, and the parent row meets its options on a 2px rule. */
function CheckboxGroupFrame({ render, className, style, ...props }: PartProps<"div", FrameState>): React.ReactElement {
  const layout = React.useContext(LayoutContext);
  const state = React.useMemo(() => ({ layout }), [layout]);
  const own = {
    "data-slot": "checkbox-group-frame",
    "data-kl-layout": layout,
    className: resolveClassName(frame, className)(state),
    style: resolveStyle(undefined, style)(state),
  };
  return useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(props, own) });
}

const item = cn(
  "group/cbg-row min-w-0",
  "[[data-slot=checkbox-group-item]+&]:border-t-(length:--kl-k1) [[data-slot=checkbox-group-item]+&]:border-t-kl-line",
  "[[data-slot=checkbox-group-item][data-kl-parent]+&]:border-t-(length:--kl-k2)",
  "forced-colors:[[data-slot=checkbox-group-item][data-kl-parent]+&]:border-t-[CanvasText]",
);

const row = cn(
  choiceStyles.row,
  "text-kl-ink [[data-slot=checkbox-group-item]:not([data-disabled])>&]:hover:bg-kl-tint",
  "[[data-slot=checkbox-group-item][data-disabled]>&]:cursor-not-allowed",
  "[[data-slot=checkbox-group-item][data-disabled]>&]:bg-(image:--kl-hatch)",
  "[[data-slot=checkbox-group-item][data-disabled]>&]:text-kl-dis",
);

// the column exists only when an OPTION has meta; the parent's count alone sits undivided at the row's end
const meta = cn(
  "flex min-w-(--kl-cbg-meta,64px) flex-none items-center justify-end px-(--kl-inset)",
  "border-s-(length:--kl-k1) border-s-kl-seam font-(--kl-weight-strong) text-kl-ink-2 tabular-nums",
  "group-data-disabled/cbg-row:text-kl-dis [&_.kl-code]:text-(length:--kl-text-meta) [&_.kl-code]:text-inherit",
  "data-empty:[display:var(--kl-cbg-empty,flex)]",
  "[[data-slot=checkbox-group-frame]>[data-kl-parent]_&]:min-w-[var(--kl-cbg-pmin,var(--kl-cbg-meta,64px))]",
  "[[data-slot=checkbox-group-frame]>[data-kl-parent]_&]:border-s-[length:var(--kl-cbg-pbs,var(--kl-k1))]",
);

type CheckboxGroupItemProps = Omit<React.ComponentProps<typeof Checkbox>, "children" | "className"> & {
  label: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  /** Goes to the row (Base UI's Field.Item); a function receives its state. */
  className?: FieldPrimitive.Item.Props["className"];
};

/**
 * One row: box cell · label (+ description) · optional meta cell. The row is Base UI's Field.Item, its label is the
 * whole row (the hit target), and every Checkbox prop (`value`, `parent`, `disabled`) goes to the box.
 */
function CheckboxGroupItem({
  label,
  description,
  meta: metaContent,
  disabled,
  className,
  ...props
}: CheckboxGroupItemProps): React.ReactElement {
  return (
    <FieldPrimitive.Item
      data-kl-parent={props.parent ? "" : undefined}
      disabled={disabled}
      className={resolveClassName(item, className)}
      data-slot="checkbox-group-item"
    >
      <FieldPrimitive.Label data-slot="checkbox-group-item-row" className={row}>
        <span data-slot="checkbox-group-item-box" className={choiceStyles.box}>
          <Checkbox disabled={disabled} {...props} />
        </span>
        <span data-slot="checkbox-group-item-text" className={choiceStyles.text}>
          <span
            data-slot="checkbox-group-item-label"
            className={cn(choiceStyles.label, "group-data-disabled/cbg-row:text-kl-dis")}
          >
            {label}
          </span>
          {description ? (
            <FieldPrimitive.Description
              data-slot="checkbox-group-item-description"
              className={cn(choiceStyles.description, "group-data-disabled/cbg-row:text-kl-dis")}
            >
              {description}
            </FieldPrimitive.Description>
          ) : null}
        </span>
        {metaContent != null ? (
          <span data-slot="checkbox-group-item-meta" className={meta}>
            {metaContent}
          </span>
        ) : (
          <span data-slot="checkbox-group-item-meta" className={meta} data-empty="" aria-hidden />
        )}
      </FieldPrimitive.Label>
    </FieldPrimitive.Item>
  );
}

type CheckboxGroupOption = {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Trailing cell: a count, a price, a code. One row with meta keeps the column on every row. */
  meta?: React.ReactNode;
  disabled?: boolean;
};

type CheckboxGroupProps = Omit<
  CheckboxGroupPrimitive.Props,
  "value" | "defaultValue" | "onValueChange" | "render" | "children" | "className"
> &
  FieldParticipantProps & {
    /** Names the group (a fieldset legend). With layout="cell" it is announced but not shown: the enclosing frame's header names it. */
    legend: React.ReactNode;
    options?: CheckboxGroupOption[];
    value?: string[];
    defaultValue?: string[];
    /** Called with the checked values and Base UI's event details (the reason, the event). */
    onValueChange?: (value: string[], eventDetails: CheckboxGroupPrimitive.ChangeEventDetails) => void;
    /**
     * A parent row that checks or clears every option (Base UI's parent checkbox: mixed while some are
     * checked). true labels it "All"; pass a node to name it ("All carriers"). Its meta cell counts "3/5".
     */
    selectAll?: React.ReactNode;
    /** Form name: Base UI Form values and FormData get the checked values under it. */
    name?: string;
    /** control (default): its own 2px frame, legend above. cell: rows of an enclosing frame (a panel body, a popover). */
    layout?: Layout;
    /** Extra rows (CheckboxGroupItem) after the options, for rows the options shape can't describe. */
    children?: React.ReactNode;
    className?: CheckboxGroupPrimitive.Props["className"];
  };

/**
 * Several independent choices that belong to one question, in one frame, built from the parts above.
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
  layout = "control",
  children,
  allValues: allValuesProp,
  error,
  description,
  invalid,
  ...props
}: CheckboxGroupProps): React.ReactElement {
  const [inner, setInner] = React.useState<string[]>(defaultValue ?? []);
  const current = value ?? inner;
  const allValues = allValuesProp ?? options.map((o) => o.value);
  const checked = current.filter((v) => allValues.includes(v)).length;
  return (
    <CheckboxGroupRoot
      layout={layout}
      invalid={invalid}
      value={current}
      onValueChange={(v, eventDetails) => {
        setInner(v);
        onValueChange?.(v, eventDetails);
      }}
      allValues={allValues}
      {...props}
    >
      <CheckboxGroupLegend>{legend}</CheckboxGroupLegend>
      <CheckboxGroupFrame>
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
      </CheckboxGroupFrame>
      <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
    </CheckboxGroupRoot>
  );
}

export {
  CheckboxGroup,
  CheckboxGroupRoot,
  CheckboxGroupLegend,
  CheckboxGroupFrame,
  CheckboxGroupItem,
  type CheckboxGroupOption,
  type CheckboxGroupProps,
};
