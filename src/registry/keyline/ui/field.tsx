"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { Fieldset } from "@base-ui/react/fieldset";
import { Form as FormPrimitive } from "@base-ui/react/form";

import { cn } from "@/lib/utils";

type Orientation = "vertical" | "horizontal" | "responsive";

/**
 * Field: label, frame, description and error. Validation comes from Base UI Field (invalid / validate / match).
 * `orientation`: vertical (label above, the default), horizontal (label in a start column of
 * --kl-form-label, everything else in the control column), responsive (horizontal while the enclosing
 * Form, or any element with `container: kl-form / inline-size`, is at least 560px wide). Without it the
 * field follows its Form's orientation. A field with layout="cell" never goes horizontal.
 */
function Field({
  className,
  orientation,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Root> & { orientation?: Orientation }) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      data-kl-orientation={orientation}
      className={cn("kl-field", className)}
      {...props}
    />
  );
}

/**
 * A form: Base UI Form (submit-time validation, server `errors` keyed by field name, `actionsRef`), laid
 * out as a column of fields. It is the container the responsive orientation measures. While its fields are
 * horizontal, FormActions sits in the control column, under the inputs; mark any other element (a row of
 * checkboxes, a notice about one field) data-kl-span="control" to put it there too.
 */
function Form({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof FormPrimitive> & { orientation?: Orientation }) {
  return (
    <FormPrimitive
      data-slot="form"
      data-kl-form-orientation={orientation}
      className={cn("kl-form", className)}
      {...props}
    />
  );
}

/** The form's commit row: buttons in reading order, the commit action first. */
function FormActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="form-actions" className={cn("kl-form-actions", className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof FieldPrimitive.Label>) {
  return <FieldPrimitive.Label data-slot="field-label" className={cn("kl-field-label", className)} {...props} />;
}

/** The control frame. Children are cells: affixes and the input. An attention cell is inserted when invalid. */
function FieldFrame({
  className,
  children,
  layout = "control",
  ...props
}: React.ComponentProps<"div"> & {
  /** cell: the frame is a cell of an enclosing frame (no own border or cut). */ layout?: "control" | "cell";
}) {
  return (
    <div
      data-slot="field-frame"
      data-kl-layout={layout}
      className={cn("kl-ctl kl-cells kl-field-frame kl-edge", className)}
      {...props}
    >
      <span className="kl-slot kl-field-bang" aria-hidden>
        <span>
          <span>!</span>
        </span>
      </span>
      {children}
    </div>
  );
}

function FieldInput({
  className,
  align,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Control> & { align?: "start" | "end" }) {
  return (
    <FieldPrimitive.Control
      data-slot="field-input"
      data-align={align}
      className={cn("kl-field-input", className)}
      {...props}
    />
  );
}

function FieldTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <FieldPrimitive.Control
      render={<textarea />}
      data-slot="field-textarea"
      className={cn("kl-field-input kl-field-textarea", className)}
      {...(props as object)}
    />
  );
}

/**
 * A row across the frame's whole width, above (`side="start"`) or below (`side="end"`) the
 * input row: a textarea's formatting toggles, its character count, a hint. Its children are cells.
 * Buttons inside a frame are Button `layout="cell"` (size "icon" with an aria-label for icon-only);
 * toggles are Toggle `layout="cell"`. They sit beside the input as cells and keep their own focus ring.
 */
function FieldBar({ className, side = "end", ...props }: React.ComponentProps<"div"> & { side?: "start" | "end" }) {
  return <div data-slot="field-bar" data-side={side} className={cn("kl-cells kl-field-bar", className)} {...props} />;
}

/** A unit, currency or icon cell inside the frame. */
function FieldAffix({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="field-affix" className={cn("kl-field-affix", className)} {...props} />;
}

function FieldDescription({ className, ...props }: React.ComponentProps<typeof FieldPrimitive.Description>) {
  return (
    <FieldPrimitive.Description data-slot="field-description" className={cn("kl-field-desc", className)} {...props} />
  );
}

/**
 * The field's error. With children it shows them (pair with `match` for a specific check). Without
 * children it shows Base UI's own message: a `validate` result, a native constraint message, or a
 * server error from Form `errors` for this field's name. Either way the attention glyph leads.
 */
function FieldError({ className, children, ...props }: React.ComponentProps<typeof FieldPrimitive.Error>) {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      className={cn("kl-field-error", className)}
      render={(rp) => (
        <div {...rp}>
          <span className="kl-glyph" data-kind="attention" aria-hidden />
          <span>{rp.children}</span>
        </div>
      )}
      {...props}
      {...(children != null ? { children } : null)}
    />
  );
}

/**
 * The description and error a single-control component (Select, Combobox, Slider, NumberField) prints
 * under its frame. `error` with `invalid` always shows; `error` alone replaces Base UI's message whenever
 * the field fails a check; no `error` shows Base UI's own (a `validate` result, a native constraint, or
 * the Form's `errors` entry for the field's name). Must sit inside the component's Field.Root.
 * With layout="cell" there is no room under the frame: the messages are visually hidden but still
 * describe the control (the frame's red edge and ! cell are the visible signal).
 */
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

function FieldMessages({
  description,
  error,
  invalid,
  layout,
}: {
  description?: React.ReactNode;
  error?: React.ReactNode;
  invalid?: boolean;
  layout?: "control" | "cell";
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
  validate?: React.ComponentProps<typeof FieldPrimitive.Root>["validate"];
  validationMode?: React.ComponentProps<typeof FieldPrimitive.Root>["validationMode"];
  /** Field orientation (see Field). */
  orientation?: Orientation;
};

/** Several labelled inputs in ONE frame (e.g. L × W × H). Each part is a cell with its own label. */
function FieldGroup({
  className,
  legend,
  children,
  invalid,
  orientation,
  ...props
}: React.ComponentProps<typeof Fieldset.Root> & {
  legend: React.ReactNode;
  /** Marks the whole group invalid (e.g. a cross-field rule). Parts mark themselves with `invalid`. */ invalid?: boolean;
  orientation?: Orientation;
}) {
  return (
    <Fieldset.Root
      data-slot="field-group"
      data-invalid={invalid ? "" : undefined}
      data-kl-orientation={orientation}
      className={cn("kl-field kl-field-group", className)}
      {...props}
    >
      <Fieldset.Legend className="kl-field-label">{legend}</Fieldset.Legend>
      <div className="kl-ctl kl-cells kl-field-frame kl-field-group-frame">{children}</div>
    </Fieldset.Root>
  );
}

function FieldGroupPart({
  label,
  className,
  inputProps,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Root> & {
  label: string;
  inputProps?: React.ComponentProps<typeof FieldPrimitive.Control>;
}) {
  return (
    <FieldPrimitive.Root data-slot="field-group-part" className={cn("kl-field-part kl-edge", className)} {...props}>
      <FieldPrimitive.Label className="kl-field-part-label">{label}</FieldPrimitive.Label>
      <FieldPrimitive.Control className="kl-field-input kl-field-part-input" {...inputProps} />
    </FieldPrimitive.Root>
  );
}

/** Error for a whole group (cross-field rules such as "height exceeds the trailer"). Announced politely. */
function FieldGroupError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) return null;
  return (
    <p data-slot="field-group-error" role="alert" className={cn("kl-field-error", className)} {...props}>
      <span className="kl-glyph" data-kind="attention" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

function FieldGroupJoin({ children = "×" }: { children?: React.ReactNode }) {
  return (
    <span className="kl-field-join" aria-hidden>
      {children}
    </span>
  );
}

export {
  Form,
  FormActions,
  Field,
  FieldLabel,
  FieldFrame,
  FieldInput,
  FieldTextarea,
  FieldAffix,
  FieldBar,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldGroupPart,
  FieldGroupJoin,
  FieldGroupError,
  FieldMessages,
  useDescribedByMirror,
  type FieldParticipantProps,
};
