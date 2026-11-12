"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field";

import { cn } from "@/lib/utils";
import { FieldMessages, type FieldParticipantProps } from "./field";

type OtpSignal = "idle" | "pending" | "done" | "failed";
type OtpRootProps = React.ComponentProps<typeof OTPFieldPrimitive.Root>;

type OtpFieldProps = FieldParticipantProps & {
  /** Visible label (visually hidden with layout="cell"); it names the first slot, and the rest say "Character n of N". */
  label: React.ReactNode;
  /** Number of characters. */
  length: number;
  /** Split the slots into groups, e.g. [3, 3] for "123 456". Must add up to `length`; otherwise one group. */
  groups?: number[];
  value?: string;
  defaultValue?: string;
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
  layout?: "control" | "cell";
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

/**
 * A one-time code in one field frame (Base UI OTP Field inside a Base UI Field): every character is a cell
 * on a shared seam, groups are split by a join cell, and the whole code is one Tab stop's worth of typing:
 * typing advances, Backspace goes back, arrows move, paste and SMS autofill (`one-time-code`) fill every
 * slot. A code reads left to right in every script, so the slots stay in that order in RTL; the ! cell
 * and the message follow the page. A Form collects it by `name`; `validate`, `required` and the Form's
 * `errors` reach it like any Field.
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
  const frame = React.useRef<HTMLDivElement>(null);
  const pending = signal === "pending";
  const failed = signal === "failed";

  // recovery: when a verification fails while the person is still in the field, put the caret back on the
  // first slot (the code stays visible so they can compare it with the message they received)
  const prev = React.useRef(signal);
  React.useEffect(() => {
    if (failed && prev.current !== "failed" && frame.current?.contains(document.activeElement)) {
      const first = frame.current.querySelector<HTMLInputElement>("input.kl-otp-slot");
      first?.focus();
      first?.select();
    }
    prev.current = signal;
  }, [signal, failed]);

  // Base UI describes only its hidden input; mirror its aria-describedby (description, error) onto the
  // first visible slot, so they are announced where focus lands. Base UI sets and changes it after render.
  React.useEffect(() => {
    const el = frame.current;
    const hidden = el?.querySelector<HTMLInputElement>("input[aria-hidden='true']");
    if (!el || !hidden) return;
    const sync = () => {
      const first = el.querySelector<HTMLInputElement>("input.kl-otp-slot");
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
    if (gi > 0) slots.push(<OTPFieldPrimitive.Separator key={`s${gi}`} className="kl-otp-join" render={<span />} />);
    for (let i = 0; i < g; i++, n++) {
      const k = n + 1;
      slots.push(
        <OTPFieldPrimitive.Input
          key={k}
          className="kl-otp-slot"
          aria-label={k === 1 ? undefined : slotLabel(k, length)}
        />,
      );
    }
  });

  return (
    <FieldPrimitive.Root
      data-slot="otp-field"
      data-kl-layout={layout}
      data-kl-orientation={orientation}
      data-signal={signal === "idle" ? undefined : signal}
      name={name}
      disabled={disabled}
      invalid={invalid || failed || undefined}
      validate={validate}
      validationMode={validationMode}
      className={cn("kl-field kl-otp", className)}
      {...(rest as object)}
    >
      <FieldPrimitive.Label className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
        {label}
      </FieldPrimitive.Label>
      <div
        ref={frame}
        data-kl-layout={layout}
        aria-busy={pending || undefined}
        className="kl-ctl kl-cells kl-field-frame kl-edge kl-otp-frame"
        style={{ "--kl-otp-u": length + (split.length - 1) / 2 } as React.CSSProperties}
      >
        <span className="kl-slot kl-field-bang" aria-hidden>
          <span>
            <span>!</span>
          </span>
        </span>
        <OTPFieldPrimitive.Root
          id={id}
          dir="ltr"
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
          className="kl-otp-slots"
        >
          {slots}
        </OTPFieldPrimitive.Root>
        <span className="kl-slot kl-otp-done" data-open={signal === "done" ? "" : undefined} aria-hidden>
          <span>
            <span>
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
        {pending ? <span className="kl-pending" aria-hidden /> : null}
      </div>
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

export { OtpField, type OtpFieldProps, type OtpSignal };
