"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { mergeProps } from "@base-ui/react/merge-props";
import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";
import { type PartProps, resolveClassName, resolveStyle } from "../lib/keyline-render";
import { FieldMessages, type FieldParticipantProps } from "./field";

/*
 * OTP field, as Base UI's parts (OtpFieldRoot, OtpFieldInput, OtpFieldSeparator), Keyline's OtpFieldFrame, and
 * OtpField, the field built from them.
 *
 * One field frame, one cell per character on shared seams, a join cell between groups. The frame is as wide as its
 * code (a code is not a sentence) and never wider than its column. Every part is sized from one scale: the root (the
 * row of slots) is a size container `--kl-otp-u` units wide (one per slot, half per join; set by the frame's
 * `units`), so a slot is exactly 100cqi / u, a join half of that, and the character is half a slot (capped at 22px).
 * Whatever else takes room in the frame (the ! cell when invalid, the ✓ cell when done) shrinks the row, and every slot
 * and its character shrink with it: nothing is pushed past the frame's clipped edge. Below a readable floor (26px a
 * slot) the frame keeps its size and its column overflows: a character is never clipped.
 */

type Layout = "control" | "cell";
type OtpSignal = "idle" | "pending" | "done" | "failed";
type OtpRootProps = OTPFieldPrimitive.Root.Props;

type FrameState = { layout: Layout };

const frame = cn(
  "kl-ctl kl-cells kl-field-frame kl-edge [--kl-otp-floor:26px] [--kl-otp-fs:22px] [--kl-otp-w:44px]",
  "[[data-kl-density=compact]_&]:[--kl-otp-fs:18px] [[data-kl-density=compact]_&]:[--kl-otp-w:34px]",
  // as wide as the code, capped by the column; at the floor (slots at 26px, plus one ! or ✓ cell) the cap gives way,
  // so the column overflows instead of the frame clipping a character
  "w-fit max-w-[max(100%,var(--kl-otp-u,6)*var(--kl-otp-floor)+var(--kl-ctl)+2*var(--kl-bw,2px))]",
  "data-[kl-layout=cell]:w-auto data-[kl-layout=cell]:justify-self-stretch",
  // the slots are always LTR (a code reads left to right): in an RTL frame the ! cell is on their right, so the red
  // seam of an invalid field is their inline end, not their start
  "kl-rtl:[[data-invalid]_&>.kl-field-bang+*]:border-s-0 kl-rtl:[[data-invalid]_&>.kl-field-bang+*]:border-e-(length:--kl-k1)",
  "kl-rtl:[[data-invalid]_&>.kl-field-bang+*]:border-e-kl-red",
);

/**
 * The field frame: the attention cell (inserted at its start, open while the field is invalid), then its children
 * (the OtpFieldRoot, and any signal cells). `units` is the code's width in slots (a join counts half), which sizes
 * every slot. `layout="cell"`: the frame is a cell of an enclosing frame and the code takes the cell's width.
 */
function OtpFieldFrame({
  layout = "control",
  units,
  render,
  className,
  style,
  children,
  ...props
}: PartProps<"div", FrameState> & { layout?: Layout; units?: number }): React.ReactElement {
  const state = React.useMemo(() => ({ layout }), [layout]);
  const own = {
    "data-slot": "otp-field-frame",
    "data-kl-layout": layout,
    className: resolveClassName(frame, className)(state),
    style: resolveStyle(
      units === undefined ? undefined : ({ "--kl-otp-u": units } as React.CSSProperties),
      style,
    )(state),
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

/**
 * Base UI's OTPField.Root: the row of slots, always left to right. Typing advances, Backspace goes back, arrows move,
 * paste and SMS autofill (`one-time-code`) fill every slot. `onValueChange` gets Base UI's event details last.
 */
function OtpFieldRoot({ className, ...props }: OtpRootProps): React.ReactElement {
  return (
    <OTPFieldPrimitive.Root
      dir="ltr"
      className={resolveClassName(
        cn(
          "@container flex w-[calc(var(--kl-otp-u,6)*var(--kl-otp-w,44px))] flex-[0_1_auto] items-stretch",
          "min-w-[calc(var(--kl-otp-u,6)*var(--kl-otp-floor,26px))]",
          // as a cell, the code owns the cell's width: the slots share it, like keys of a row
          "[[data-slot=otp-field-frame][data-kl-layout=cell]>&]:flex-[1_1_auto]",
        ),
        className,
      )}
      {...props}
      data-slot="otp-field-root"
    />
  );
}

const input = cn(
  "m-0 box-border w-[calc(100cqi/var(--kl-otp-u,6))] min-w-0 flex-none appearance-none rounded-none border-0 p-0 outline-none",
  "bg-transparent text-center text-kl-ink caret-kl-focus",
  // the Count voice: strong, tabular, large enough to check against the message that brought the code
  "font-(family-name:--kl-font) text-[length:min(var(--kl-otp-fs,22px),100cqi/var(--kl-otp-u,6)/2)]/none",
  "font-(--kl-weight-strong) not-italic tabular-nums",
  // an empty slot shows where its character goes: a short keyline at the baseline
  "bg-[linear-gradient(var(--kl-line-soft),var(--kl-line-soft))] bg-size-[10px_2px] bg-position-[50%_calc(100%-9px)] bg-no-repeat",
  "data-filled:bg-none [[data-kl-density=compact]_&]:bg-position-[50%_calc(100%-6px)]",
  "[[data-slot=otp-field-input]+&]:border-s-(length:--kl-k1) [[data-slot=otp-field-input]+&]:border-s-kl-seam",
  "[[data-slot=otp-field-separator]+&]:border-s-(length:--kl-k1) [[data-slot=otp-field-separator]+&]:border-s-kl-seam",
  // the slot being typed into: the frame owns focus (its edge); the slot shows position with a commit keyline on its
  // floor, the caret's cell. Hover tints like any field.
  "hover:not-data-disabled:not-data-readonly:bg-kl-tint focus:bg-kl-tint",
  "focus:shadow-[inset_0_calc(-1*var(--kl-ring))_0_var(--kl-focus)]",
  "selection:bg-kl-yellow selection:text-kl-on-yellow",
  // masked: the dot is the Count voice too
  "[&[type=password]]:text-[length:min(var(--kl-otp-fs,22px)+4px,100cqi/var(--kl-otp-u,6)*0.6)] [&[type=password]]:tracking-[0]",
  // pending verification, disabled and read-only: out of service, the code still readable
  "in-data-[signal=pending]:cursor-progress in-data-[signal=pending]:text-kl-ink-2",
  "data-disabled:cursor-not-allowed data-disabled:bg-none data-disabled:text-kl-dis data-readonly:not-data-filled:bg-none",
  "forced-colors:focus:shadow-none forced-colors:focus:outline-2 forced-colors:focus:-outline-offset-4",
  "forced-colors:focus:outline-[Highlight] forced-colors:focus:outline-solid",
);

/** One character's cell. Base UI derives each slot's id from the root's `id` (`{id}-2`, `{id}-3`…). */
function OtpFieldInput({ className, ...props }: OTPFieldPrimitive.Input.Props): React.ReactElement {
  return (
    <OTPFieldPrimitive.Input className={resolveClassName(input, className)} {...props} data-slot="otp-field-input" />
  );
}

/** The join between groups: a drawn dash in its own narrow cell, no seam of its own (the slot after it draws one). */
function OtpFieldSeparator({ className, ...props }: OTPFieldPrimitive.Separator.Props): React.ReactElement {
  return (
    <OTPFieldPrimitive.Separator
      className={resolveClassName(
        cn(
          "box-border grid w-[calc(100cqi/var(--kl-otp-u,6)/2)] flex-none place-items-center",
          "border-s-(length:--kl-k1) border-s-kl-seam",
          "before:h-0.5 before:w-[min(8px,50%)] before:bg-kl-ink-2 before:content-[''] forced-colors:before:bg-[CanvasText]",
        ),
        className,
      )}
      {...props}
      data-slot="otp-field-separator"
    />
  );
}

/* ------------------------------------------------------------------ the field */

type OtpFieldProps = FieldParticipantProps & {
  /** Visible label (visually hidden with layout="cell"); it names the first slot, and the rest say "Character n of N". */
  label: React.ReactNode;
  /** Number of characters. */
  length: number;
  /** Split the slots into groups, e.g. [3, 3] for "123 456". Must add up to `length`; otherwise one group. */
  groups?: number[];
  value?: string;
  defaultValue?: string;
  /** Called with the code and Base UI's event details (the reason, the event). */
  onValueChange?: OtpRootProps["onValueChange"];
  /** Fired once every slot holds a character (and when a complete code is pasted again). Verify here. */
  onValueComplete?: OtpRootProps["onValueComplete"];
  onValueInvalid?: OtpRootProps["onValueInvalid"];
  /** numeric (default) · alpha · alphanumeric (recovery and invite codes) · none. */
  validationType?: OtpRootProps["validationType"];
  normalizeValue?: OtpRootProps["normalizeValue"];
  inputMode?: OtpRootProps["inputMode"];
  /** Mask the characters (a PIN). */
  mask?: boolean;
  /** Submit the owning form as soon as the code is complete. */
  autoSubmit?: boolean;
  /**
   * The verification of a complete code, shown in the frame (Button's signals):
   * pending: a segment runs along the bottom keyline and the slots are read-only (aria-busy);
   * done: a ✓ cell is inserted at the end; failed: the frame turns red, the ! cell is inserted at the start
   * and, if focus was in the field, the caret returns to the first slot with the code still visible.
   * Pair failed with `error` ("That code has expired. Send a new one.").
   */
  signal?: OtpSignal;
  /** Form name; the submitted value is the code (possibly incomplete). */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** control: its own 2px frame. cell: a cell of an enclosing frame (label visually hidden). */
  layout?: Layout;
  /** Announced politely while pending and when done. Default "Checking the code…" and "Code verified." */
  signalText?: { pending?: string; done?: string };
  /** Accessible name of slot n (from 2). Default (n, total) => `Character ${n} of ${total}`. */
  slotLabel?: (n: number, total: number) => string;
  /** id of the first slot (Base UI derives `{id}-2`, `{id}-3`… for the rest). */
  id?: string;
  className?: string;
} & Omit<React.ComponentProps<"div">, "defaultValue" | "onChange" | "children" | "id" | "className" | "dir">;

const sumOk = (groups: number[] | undefined, length: number) =>
  !!groups && groups.length > 1 && groups.every((g) => g > 0) && groups.reduce((a, b) => a + b, 0) === length;

const SLOT = '[data-slot="otp-field-input"]';

/**
 * A one-time code in one field frame (Base UI OTP Field inside a Base UI Field), built from the parts above: every
 * character is a cell on a shared seam, groups are split by a join cell, and the whole code is one Tab stop's worth of
 * typing. A code reads left to right in every script, so the slots stay in that order in RTL; the ! cell and the
 * message follow the page. A Form collects it by `name`; `validate`, `required` and the Form's `errors` reach it like
 * any Field.
 */
function OtpField({
  label,
  length,
  groups,
  value,
  defaultValue,
  onValueChange,
  onValueComplete,
  onValueInvalid,
  validationType,
  normalizeValue,
  inputMode,
  mask,
  autoSubmit,
  signal = "idle",
  signalText,
  name,
  required,
  disabled,
  readOnly,
  layout = "control",
  slotLabel = (n, total) => `Character ${n} of ${total}`,
  invalid,
  error,
  description,
  validate,
  validationMode,
  orientation,
  id,
  className,
  ...rest
}: OtpFieldProps) {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const pending = signal === "pending";
  const failed = signal === "failed";

  // recovery: when a verification fails while the person is still in the field, put the caret back on the
  // first slot (the code stays visible so they can compare it with the message they received)
  const prev = React.useRef(signal);
  React.useEffect(() => {
    if (failed && prev.current !== "failed" && frameRef.current?.contains(document.activeElement)) {
      const first = frameRef.current.querySelector<HTMLInputElement>(SLOT);
      first?.focus();
      first?.select();
    }
    prev.current = signal;
  }, [signal, failed]);

  // Base UI describes only its hidden input; mirror its aria-describedby (description, error) onto the
  // first visible slot, so they are announced where focus lands. Base UI sets and changes it after render.
  React.useEffect(() => {
    const el = frameRef.current;
    const hidden = el?.querySelector<HTMLInputElement>("input[aria-hidden='true']");
    if (!el || !hidden) return;
    const sync = () => {
      const first = el.querySelector<HTMLInputElement>(SLOT);
      const ids = hidden.getAttribute("aria-describedby");
      if (first) ids ? first.setAttribute("aria-describedby", ids) : first.removeAttribute("aria-describedby");
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(hidden, { attributes: true, attributeFilter: ["aria-describedby"] });
    return () => mo.disconnect();
  }, []);

  const split = sumOk(groups, length) ? groups! : [length];
  const slots: React.ReactNode[] = [];
  let n = 0;
  split.forEach((g, gi) => {
    if (gi > 0) slots.push(<OtpFieldSeparator key={`s${gi}`} render={<span />} />);
    for (let i = 0; i < g; i++, n++) {
      const k = n + 1;
      slots.push(<OtpFieldInput key={k} aria-label={k === 1 ? undefined : slotLabel(k, length)} />);
    }
  });

  return (
    <FieldPrimitive.Root
      data-kl-layout={layout}
      data-kl-orientation={orientation}
      data-signal={signal === "idle" ? undefined : signal}
      name={name}
      disabled={disabled}
      invalid={invalid || failed || undefined}
      validate={validate}
      validationMode={validationMode}
      className={cn("kl-field grid-cols-[minmax(0,1fr)] justify-items-start", className)}
      {...(rest as object)}
      data-slot="otp-field"
    >
      <FieldPrimitive.Label className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
        {label}
      </FieldPrimitive.Label>
      <OtpFieldFrame
        ref={frameRef}
        layout={layout}
        units={length + (split.length - 1) / 2}
        aria-busy={pending || undefined}
      >
        <OtpFieldRoot
          id={id}
          length={length}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          onValueComplete={onValueComplete}
          onValueInvalid={onValueInvalid}
          validationType={validationType}
          normalizeValue={normalizeValue}
          inputMode={inputMode}
          mask={mask}
          autoSubmit={autoSubmit}
          required={required}
          disabled={disabled}
          readOnly={readOnly || pending}
        >
          {slots}
        </OtpFieldRoot>
        {/* done: a ✓ cell, inserted at the end, that floods yellow */}
        <span
          data-slot="otp-field-done"
          // closed, it has no seam, even in a disabled frame (whose seams are all drawn)
          className="kl-slot flex-none not-data-open:border-s-transparent"
          data-open={signal === "done" ? "" : undefined}
          aria-hidden
        >
          <span className="flex">
            <span
              className={cn(
                "grid h-full w-[calc(var(--kl-ctl)-2*var(--kl-bw,2px))] place-items-center bg-kl-yellow text-kl-on-yellow",
                "border-s-(length:--kl-k1) border-s-kl-on-yellow",
                "forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:forced-color-adjust-none",
              )}
            >
              <svg
                className="kl-tick"
                viewBox="0 0 16 16"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="square"
              >
                <path pathLength={1} d="m3.5 8.5 3 3 6-7" />
              </svg>
            </span>
          </span>
        </span>
        {/* pending: the frame clips (its cut), so the segment runs on the inside of the bottom keyline, over the slot
            floors */}
        {pending ? <span className="kl-pending bottom-0 z-2 [--kl-bw:3px]" aria-hidden /> : null}
      </OtpFieldFrame>
      <span role="status" className="kl-sr">
        {pending
          ? (signalText?.pending ?? "Checking the code…")
          : signal === "done"
            ? (signalText?.done ?? "Code verified.")
            : ""}
      </span>
      <FieldMessages description={description} error={error} invalid={invalid || failed} layout={layout} />
    </FieldPrimitive.Root>
  );
}

export { OtpField, OtpFieldFrame, OtpFieldRoot, OtpFieldInput, OtpFieldSeparator, type OtpFieldProps, type OtpSignal };
