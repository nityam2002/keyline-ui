"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset";
import { Form as FormPrimitive } from "@base-ui/react/form";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { type PartProps, resolveClassName, resolveStyle } from "../lib/keyline-render";

/*
 * Field, as parts named as Base UI names them (FieldRoot, FieldLabel, FieldControl, FieldDescription, FieldError,
 * FieldValidity, Fieldset, FieldsetLegend, Form), and Keyline's own parts for the frame of cells: FieldFrame,
 * FieldAffix, FieldBar, FormActions and the field group.
 *
 *   Gross weight
 *   ┌────┬────────────────────┬────┐
 *   │ !  │            12,004.0│ kg │   the frame: the ! cell (inserted when invalid) · the control · an affix
 *   └────┴────────────────────┴────┘
 *   ▲ Over 24,000 kg needs two trucks.
 *
 * The construction every field component shares (the field's grid, its label, the frame of cells, the input and affix
 * cells, the ! cell, the frame's invalid and disabled states, and the orientation a Form gives its fields) is the
 * theme's: `kl-field`, `kl-field-label`, `kl-field-frame`, `kl-field-input`, `kl-field-affix` and `kl-field-bang` in
 * theme/foundation.css. Select, Combobox, NumberField and the other field components render the same classes.
 */

type Orientation = "vertical" | "horizontal" | "responsive";
type Layout = "control" | "cell";

/* ------------------------------------------------------------------ the field */

/**
 * Base UI's Field.Root: label, frame, description and error, with Base UI's validation (invalid, validate, match).
 * `orientation`: vertical (label above, the default), horizontal (label in a start column of --kl-form-label,
 * everything else in the control column), responsive (horizontal while the enclosing Form, or any element with
 * `container: kl-form / inline-size`, is at least 560px wide). Without it the field follows its Form's orientation.
 * A field with layout="cell" never goes horizontal.
 */
function FieldRoot({
  className,
  orientation,
  ...props
}: FieldPrimitive.Root.Props & { orientation?: Orientation }): React.ReactElement {
  return (
    <FieldPrimitive.Root
      data-kl-orientation={orientation}
      className={resolveClassName("kl-field", className)}
      {...props}
      data-slot="field"
    />
  );
}

/** FieldRoot, by its short name. */
const Field = FieldRoot;

/** Names the control; Base UI ties it to the control (`for`, or `aria-labelledby` for a non-native control). */
function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props): React.ReactElement {
  return (
    <FieldPrimitive.Label
      className={resolveClassName("kl-field-label", className)}
      {...props}
      data-slot="field-label"
    />
  );
}

type FieldFrameState = { layout: Layout };

const frame = cn(
  "kl-ctl kl-cells kl-field-frame kl-edge",
  // a bar spans the frame: the frame wraps, the bar takes a whole line above or below the input row
  "has-[>[data-slot=field-bar]]:flex-wrap",
  // INPUT GROUP: a Button or Toggle with layout="cell" is a key cell of the frame. It takes the frame's height (not a
  // cell button's 48px), a seam before it and its own inside ring; the frame's edge stays the input's. These rules
  // outrank the cell's own utilities by one attribute (the child's slot).
  "*:data-[slot=toggle]:min-h-0 *:data-[slot=toggle]:flex-none *:data-[slot=toggle]:self-stretch",
  "*:data-[slot=toggle]:data-kl-icon:w-[calc(var(--kl-ctl)-2*var(--kl-bw,2px))] *:data-[slot=toggle]:data-kl-icon:min-w-0",
  "data-[kl-layout=cell]:*:data-[slot=toggle]:data-kl-icon:w-(--kl-row)",
  "*:data-[slot=button]:data-[kl-layout=cell]:min-h-0 *:data-[slot=button]:data-[kl-layout=cell]:flex-none",
  "*:data-[slot=button]:data-[kl-layout=cell]:cursor-pointer *:data-[slot=button]:data-[kl-layout=cell]:self-stretch",
  "*:data-[slot=button]:data-[kl-layout=cell]:data-[size=icon]:w-[calc(var(--kl-ctl)-2*var(--kl-bw,2px))]",
  "*:data-[slot=button]:data-[kl-layout=cell]:data-[size=icon]:min-w-0",
  "data-[kl-layout=cell]:*:data-[slot=button]:data-[kl-layout=cell]:data-[size=icon]:w-(--kl-row)",
);

/**
 * The control frame: a row of cells (affixes, the control, buttons and toggles with `layout="cell"`, bars). The
 * attention cell is inserted at its start and opens while the field is invalid. Its edge is the focus indicator.
 * `layout="cell"`: the frame is a cell of an enclosing frame (no border or cut of its own).
 */
function FieldFrame({
  layout = "control",
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"div", FieldFrameState> & { layout?: Layout }): React.ReactElement {
  const state = React.useMemo(() => ({ layout }), [layout]);
  const own = {
    "data-slot": "field-frame",
    "data-kl-layout": layout,
    className: resolveClassName(frame, className)(state),
    style: resolveStyle(undefined, style)(state),
    children: (
      <>
        <span className="kl-slot kl-field-bang" aria-hidden>
          <span>
            <span>!</span>
          </span>
        </span>
        {children}
      </>
    ),
  };
  return useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(props, own) });
}

/** The text input cell: Base UI's Field.Control. `align="end"` right-aligns a number with tabular figures. */
function FieldControl({
  className,
  align,
  ...props
}: FieldPrimitive.Control.Props & { align?: "start" | "end" }): React.ReactElement {
  return (
    <FieldPrimitive.Control
      data-align={align}
      className={resolveClassName("kl-field-input", className)}
      {...props}
      data-slot="field-control"
    />
  );
}

/** A multi-line control cell: Base UI's Field.Control rendering a <textarea>, resizable in height. */
function FieldTextarea({
  className,
  render,
  ...props
}: Omit<React.ComponentProps<"textarea">, "className" | "style"> &
  Pick<FieldPrimitive.Control.Props, "className" | "style" | "render">): React.ReactElement {
  return (
    <FieldPrimitive.Control
      render={render ?? <textarea />}
      className={resolveClassName("kl-field-input min-h-[72px] w-auto resize-y py-[9px] leading-[1.4]", className)}
      {...(props as FieldPrimitive.Control.Props)}
      data-slot="field-textarea"
    />
  );
}

type FieldBarState = { side: "start" | "end" };

const bar = cn(
  "kl-cells order-1 min-h-[calc(var(--kl-row)-4px)] min-w-0 flex-[1_0_100%] cursor-default bg-kl-cell",
  "border-s-0 border-t-(length:--kl-k1) border-t-kl-seam text-(length:--kl-text-label) text-kl-ink-2",
  "data-[side=start]:-order-1 data-[side=start]:border-t-0 data-[side=start]:border-b-(length:--kl-k1)",
  "data-[side=start]:border-b-kl-seam data-[side=start]:ps-[calc(var(--kl-c,0px)*0.35)]",
  "data-[side=start]:[&+*]:border-s-0",
  "*:data-kl-spacer:flex-1 *:data-kl-spacer:border-s-0 *:data-[slot=field-affix]:min-w-0",
  // a bar's cells never drop under the 24px target (WCAG 2.5.8; compact measured 24x23 with no spacing exception)
  "*:data-[slot=toggle]:min-h-6 *:data-[slot=toggle]:data-kl-icon:w-[max(24px,calc(var(--kl-row)-4px))]",
  "*:data-[slot=button]:data-[kl-layout=cell]:min-h-6 *:data-[slot=toggle]:data-kl-icon:min-w-0",
  "*:data-[slot=button]:data-[kl-layout=cell]:data-[size=icon]:w-[max(24px,calc(var(--kl-row)-4px))]",
  "*:data-[slot=button]:data-[kl-layout=cell]:data-[size=icon]:min-w-0",
);

/**
 * A row across the frame's whole width, above (`side="start"`) or below (`side="end"`) the input row: a textarea's
 * formatting toggles, its character count, a hint. Its children are cells. Buttons inside a frame are Button
 * `layout="cell"` (size "icon" with an aria-label for icon-only); toggles are Toggle `layout="cell"`. They sit beside
 * the input as cells and keep their own focus ring. A child with `data-kl-spacer` takes the room between.
 */
function FieldBar({
  side = "end",
  render,
  className,
  style,
  ...props
}: PartProps<"div", FieldBarState> & { side?: "start" | "end" }): React.ReactElement {
  const state = React.useMemo(() => ({ side }), [side]);
  const own = {
    "data-slot": "field-bar",
    "data-side": side,
    className: resolveClassName(bar, className)(state),
    style: resolveStyle(undefined, style)(state),
  };
  return useRender({ defaultTagName: "div", render, state, props: mergeProps<"div">(props, own) });
}

type EmptyState = Record<string, never>;
const EMPTY: EmptyState = {};

/** A unit, currency or icon cell inside the frame. */
function FieldAffix({ render, className, style, ...props }: PartProps<"span", EmptyState>): React.ReactElement {
  const own = {
    "data-slot": "field-affix",
    className: resolveClassName("kl-field-affix", className)(EMPTY),
    style: resolveStyle(undefined, style)(EMPTY),
  };
  return useRender({ defaultTagName: "span", render, state: EMPTY, props: mergeProps<"span">(props, own) });
}

/** The look of a field's description and error, for a component that renders its own (Questionnaire's step). */
const fieldStyles = {
  description: "m-0 text-(length:--kl-text-label) text-kl-ink-2",
  error: cn(
    "m-0 flex items-baseline gap-2 text-(length:--kl-text-label) font-(--kl-weight-strong) text-kl-red-text",
    "[&>.kl-glyph]:[transform:translateY(1px)]",
  ),
};

/** A line under the frame, read out with the control (Base UI ties it through aria-describedby). */
function FieldDescription({ className, ...props }: FieldPrimitive.Description.Props): React.ReactElement {
  return (
    <FieldPrimitive.Description
      className={resolveClassName(fieldStyles.description, className)}
      {...props}
      data-slot="field-description"
    />
  );
}

/**
 * The field's error. With children it shows them (pair with `match` for a specific check). Without children it shows
 * Base UI's own message: a `validate` result, a native constraint message, or a server error from Form `errors` for
 * this field's name. Either way the attention glyph leads.
 */
function FieldError({ className, children, ...props }: FieldPrimitive.Error.Props): React.ReactElement {
  return (
    <FieldPrimitive.Error
      className={resolveClassName(fieldStyles.error, className)}
      render={(rp) => (
        <div {...rp}>
          <span className="kl-glyph" data-kind="attention" aria-hidden />
          <span>{rp.children}</span>
        </div>
      )}
      {...props}
      {...(children != null ? { children } : null)}
      data-slot="field-error"
    />
  );
}

/** Base UI's Field.Validity: renders its function child with the field's validity state. No element of its own. */
const FieldValidity = FieldPrimitive.Validity;

/* ------------------------------------------------------------------ fieldset */

/** Base UI's Fieldset.Root: a group of fields under one legend, laid out as a field. */
function Fieldset({
  className,
  orientation,
  ...props
}: FieldsetPrimitive.Root.Props & { orientation?: Orientation }): React.ReactElement {
  return (
    <FieldsetPrimitive.Root
      data-kl-orientation={orientation}
      className={resolveClassName("kl-field", className)}
      {...props}
      data-slot="fieldset"
    />
  );
}

/** Base UI's Fieldset.Legend, in the field label's voice. */
function FieldsetLegend({ className, ...props }: FieldsetPrimitive.Legend.Props): React.ReactElement {
  return (
    <FieldsetPrimitive.Legend
      className={resolveClassName("kl-field-label", className)}
      {...props}
      data-slot="fieldset-legend"
    />
  );
}

/* ------------------------------------------------------------------ form */

const form = cn(
  "@container/kl-form grid min-w-0 [align-content:start] gap-5 [--kl-form-gap:16px] [--kl-form-label:11rem]",
  "[[data-kl-density=compact]_&]:gap-3.5 [[data-kl-density=compact]_&]:[--kl-form-gap:12px]",
  "data-[kl-density=compact]:gap-3.5 [[data-kl-density=compact]_&]:[--kl-form-label:10rem]",
  "data-[kl-density=compact]:[--kl-form-gap:12px] data-[kl-density=compact]:[--kl-form-label:10rem]",
);

/**
 * Base UI's Form (submit-time validation, server `errors` keyed by field name, `actionsRef`), laid out as a column of
 * fields. It is the container the responsive orientation measures. While its fields are horizontal, FormActions sits
 * in the control column, under the inputs; mark any other element (a row of checkboxes, a notice about one field)
 * data-kl-span="control" to put it there too.
 */
function Form({
  className,
  orientation = "vertical",
  ...props
}: FormPrimitive.Props & { orientation?: Orientation }): React.ReactElement {
  return (
    <FormPrimitive
      data-kl-form-orientation={orientation}
      className={resolveClassName(form, className)}
      {...props}
      data-slot="form"
    />
  );
}

/** The form's commit row: buttons in reading order, the commit action first. */
function FormActions({ render, className, style, ...props }: PartProps<"div", EmptyState>): React.ReactElement {
  const own = {
    "data-slot": "form-actions",
    className: resolveClassName("flex flex-wrap items-center gap-2", className)(EMPTY),
    style: resolveStyle(undefined, style)(EMPTY),
  };
  return useRender({ defaultTagName: "div", render, state: EMPTY, props: mergeProps<"div">(props, own) });
}

/* ------------------------------------------------------------------ for field components */

/**
 * Base UI describes only a participant's hidden control. A participant whose focusable parts are its own (spin
 * buttons, OTP slots, a picker trigger) mirrors that aria-describedby (description, error) onto them, so they are
 * announced where focus lands. Base UI sets and changes the attribute after render, so it is observed.
 */
function useDescribedByMirror(
  root: React.RefObject<HTMLElement | null>,
  targets: string,
  source = 'input[type="hidden"]',
) {
  React.useEffect(() => {
    const el = root.current;
    const hidden = el?.querySelector<HTMLElement>(source);
    if (!el || !hidden) return;
    const sync = () => {
      const ids = hidden.getAttribute("aria-describedby");
      el.querySelectorAll<HTMLElement>(targets).forEach((t) =>
        ids ? t.setAttribute("aria-describedby", ids) : t.removeAttribute("aria-describedby"),
      );
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(hidden, { attributes: true, attributeFilter: ["aria-describedby"] });
    return () => mo.disconnect();
  }, [root, targets, source]);
}

/**
 * The description and error a single-control component (Select, Combobox, Slider, NumberField) prints under its
 * frame. `error` with `invalid` always shows; `error` alone replaces Base UI's message whenever the field fails a
 * check; no `error` shows Base UI's own (a `validate` result, a native constraint, or the Form's `errors` entry for
 * the field's name). Must sit inside the component's Field.Root. With layout="cell" there is no room under the frame:
 * the messages are visually hidden but still describe the control (the frame's red edge and ! cell are the visible
 * signal).
 */
function FieldMessages({
  description,
  error,
  invalid,
  layout,
}: {
  description?: React.ReactNode;
  error?: React.ReactNode;
  invalid?: boolean;
  layout?: Layout;
}) {
  const sr = layout === "cell" ? "kl-sr" : undefined;
  return (
    <>
      {description ? <FieldDescription className={sr}>{description}</FieldDescription> : null}
      <FieldError className={sr} match={invalid && error != null ? true : undefined}>
        {error ?? undefined}
      </FieldError>
    </>
  );
}

/** The Field.Root props a single-control component passes through. */
type FieldParticipantProps = {
  /** Shows the attention state; pair it with `error`. */
  invalid?: boolean;
  /** Message under the frame. Without it, Base UI's message for the failed check (or the Form's server error) shows. */
  error?: React.ReactNode;
  description?: React.ReactNode;
  /** Base UI Field validation: return a message (or messages) to fail, null to pass. */
  validate?: FieldPrimitive.Root.Props["validate"];
  validationMode?: FieldPrimitive.Root.Props["validationMode"];
  /** Field orientation (see Field). */
  orientation?: Orientation;
};

/* ------------------------------------------------------------------ field group */

/** Several labelled inputs in ONE frame (e.g. L × W × H). Each part is a cell with its own label. */
function FieldGroup({
  className,
  legend,
  children,
  invalid,
  orientation,
  ...props
}: FieldsetPrimitive.Root.Props & {
  legend: React.ReactNode;
  /** Marks the whole group invalid (e.g. a cross-field rule). Parts mark themselves with `invalid`. */ invalid?: boolean;
  orientation?: Orientation;
}): React.ReactElement {
  return (
    <FieldsetPrimitive.Root
      data-invalid={invalid ? "" : undefined}
      data-kl-orientation={orientation}
      className={resolveClassName("kl-field", className)}
      {...props}
      data-slot="field-group"
    >
      <FieldsetPrimitive.Legend className="kl-field-label" data-slot="field-group-legend">
        {legend}
      </FieldsetPrimitive.Legend>
      <div data-slot="field-group-frame" className="kl-ctl kl-cells kl-field-frame">
        {children}
      </div>
    </FieldsetPrimitive.Root>
  );
}

/**
 * One labelled cell of a FieldGroup: a Base UI Field.Root with its label and control. It takes the focus edge (a
 * flush band on the group frame's keylines); the frame does not.
 */
function FieldGroupPart({
  label,
  className,
  inputProps,
  ...props
}: FieldPrimitive.Root.Props & {
  label: string;
  inputProps?: FieldPrimitive.Control.Props;
}): React.ReactElement {
  return (
    <FieldPrimitive.Root
      className={resolveClassName(
        cn(
          "kl-field-part kl-edge group/field-part grid min-w-0 flex-1 grid-rows-[auto_1fr] px-(--kl-inset) pt-[5px] pb-0",
          "data-invalid:bg-[color-mix(in_oklab,var(--kl-red)_10%,var(--kl-cell))]",
        ),
        className,
      )}
      {...props}
      data-slot="field-group-part"
    >
      <FieldPrimitive.Label
        data-slot="field-group-part-label"
        className={cn(
          "font-(family-name:--kl-font-mono) text-(length:--kl-text-code)/[1.2] font-medium text-kl-ink-2 not-italic normal-nums",
          "group-data-invalid/field-part:font-(--kl-weight-strong) group-data-invalid/field-part:text-kl-red-text",
        )}
      >
        {label}
      </FieldPrimitive.Label>
      <FieldPrimitive.Control
        data-slot="field-group-part-control"
        className="kl-field-input w-full px-0 pt-0 pb-1 text-[16px] font-(--kl-weight-strong)"
        {...inputProps}
      />
    </FieldPrimitive.Root>
  );
}

/** Error for a whole group (cross-field rules such as "height exceeds the trailer"). Announced politely. */
function FieldGroupError({
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"p", EmptyState>): React.ReactElement | null {
  const own = {
    "data-slot": "field-group-error",
    role: "alert",
    className: resolveClassName(fieldStyles.error, className)(EMPTY),
    style: resolveStyle(undefined, style)(EMPTY),
    children: (
      <>
        <span className="kl-glyph" data-kind="attention" aria-hidden />
        <span>{children}</span>
      </>
    ),
  };
  const element = useRender({ defaultTagName: "p", render, state: EMPTY, props: mergeProps<"p">(props, own) });
  return children ? element : null;
}

/** The sign between two parts of a group (× by default). Hidden from assistive technology. */
function FieldGroupJoin({
  render,
  className,
  style,
  children = "×",
  ...props
}: PartProps<"span", EmptyState>): React.ReactElement {
  const own = {
    "data-slot": "field-group-join",
    "aria-hidden": true,
    className: resolveClassName(
      "grid w-[22px] flex-none place-items-center text-(length:--kl-text-meta) text-kl-ink-2",
      className,
    )(EMPTY),
    style: resolveStyle(undefined, style)(EMPTY),
    children,
  };
  return useRender({ defaultTagName: "span", render, state: EMPTY, props: mergeProps<"span">(props, own) });
}

export {
  Form,
  FormActions,
  Field,
  FieldRoot,
  FieldLabel,
  FieldFrame,
  FieldControl,
  FieldTextarea,
  FieldAffix,
  FieldBar,
  FieldDescription,
  FieldError,
  FieldValidity,
  Fieldset,
  FieldsetLegend,
  FieldGroup,
  FieldGroupPart,
  FieldGroupJoin,
  FieldGroupError,
  FieldMessages,
  fieldStyles,
  useDescribedByMirror,
  type FieldParticipantProps,
};
