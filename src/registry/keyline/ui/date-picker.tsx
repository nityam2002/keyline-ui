"use client";

import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { dockGeometry, scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { sameDay, sod, type Unavailable } from "../lib/calendar";
import { useDayPicker, type Bounds } from "./date-range";
import { FieldMessages, useDescribedByMirror, type FieldParticipantProps } from "./field";
import { TimeField, timeOutside } from "./time-field";

type CalendarProps = Bounds & {
  value: Date | null;
  onValueChange: (d: Date) => void;
  isDateUnavailable?: Unavailable;
  today?: Date;
  defaultMonth?: Date;
  weekStartsOn?: number;
  locale?: string;
  className?: string;
  /** Escape inside the grid (lets a popover close). */
  onEscape?: () => void;
};

/**
 * Single-date calendar on react-day-picker, with RangeCalendar's look, locale wording and bounds. The
 * chosen day is the current choice among exclusive options, so it floods INK; today is underlined;
 * unavailable days are hatched, disabled and skipped by the arrow keys.
 */
function Calendar({
  value,
  onValueChange,
  isDateUnavailable,
  today = sod(new Date()),
  defaultMonth,
  weekStartsOn = 1,
  locale = "en-GB",
  min,
  max,
  className,
  onEscape,
}: CalendarProps) {
  const startMonth = sod(defaultMonth ?? value ?? today);
  const { wrap, props } = useDayPicker({
    locale,
    weekStartsOn,
    today,
    min,
    max,
    isDateUnavailable,
    anchorMonth: startMonth,
    label: () => "",
  });
  return (
    <div ref={wrap} data-slot="calendar" className={cn("kl-cal", className)}>
      <DayPicker
        {...props}
        mode="single"
        required
        selected={value ?? undefined}
        onSelect={(d) => d && onValueChange(d)}
        defaultMonth={startMonth}
        modifiers={{ kl_ink: () => true, kl_on: (d: Date) => sameDay(d, value) }}
        onDayKeyDown={(_, __, e) => {
          if (e.key !== "Escape" || !onEscape) return;
          e.preventDefault();
          e.stopPropagation();
          onEscape();
        }}
      />
    </div>
  );
}

type DatePickerProps = Omit<CalendarProps, "onEscape" | "value" | "onValueChange"> & {
  /** The chosen day. Controlled with `value` + `onValueChange`, or uncontrolled from `defaultValue`. */
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (d: Date) => void;
  label: React.ReactNode;
  placeholder?: React.ReactNode;
  /** Quick choices shown as a row of cells under the calendar ("Today", "Next Monday"). */
  presets?: { label: string; date: () => Date }[];
  /** control: its own 2px frame. cell: a cell of an enclosing frame; the label is visually hidden. */
  layout?: "control" | "cell";
  /** Submitted with a form, as YYYY-MM-DD. */
  name?: string;
  container?: React.ComponentProps<typeof Popover.Portal>["container"];
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const CalendarGlyph = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="square"
  >
    <path d="M2.5 3.5h11v10h-11zM2.5 7h11M5.5 2v3M10.5 2v3" />
  </svg>
);

/** Trigger field (calendar affix · formatted date) + the calendar docked to the field frame. */
function DatePicker({
  label,
  value: valueProp,
  defaultValue = null,
  onValueChange: onChange,
  placeholder = "Choose a date",
  presets = [],
  layout = "control",
  name,
  container,
  className,
  ...cal
}: DatePickerProps) {
  const [inner, setInner] = React.useState<Date | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : inner;
  const onValueChange = (d: Date) => {
    if (valueProp === undefined) setInner(d);
    onChange?.(d);
  };
  const [open, setOpen] = React.useState(false);
  const dock = dockGeometry(layout);
  const [marker, scope] = useKeylineScope(open, container);
  const popup = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  const fmt = new Intl.DateTimeFormat(cal.locale ?? "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const pick = (d: Date) => {
    onValueChange(d);
    setOpen(false);
  };
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div data-slot="date-picker" data-kl-layout={layout} className={cn("kl-field", className)}>
        {marker}
        <span className={cn("kl-field-label", layout === "cell" && "kl-sr")} id={id}>
          {label}
        </span>
        <Popover.Trigger
          aria-labelledby={`${id} ${id}v`}
          data-kl-layout={layout}
          className="kl-ctl kl-cells kl-field-frame kl-edge kl-dr-trigger"
        >
          <span className="kl-field-affix" aria-hidden>
            <CalendarGlyph />
          </span>
          <span className="kl-dr-value" id={`${id}v`}>
            {value ? fmt.format(value) : <span className="kl-dr-ph">{placeholder}</span>}
          </span>
        </Popover.Trigger>
        {name ? <input type="hidden" name={name} value={value ? iso(value) : ""} /> : null}
      </div>
      <Popover.Portal container={container}>
        <Popover.Positioner
          sideOffset={dock.sideOffset}
          alignOffset={dock.alignOffset}
          align="start"
          collisionPadding={12}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <Popover.Popup
            ref={popup}
            className="kl-attached kl-dock kl-dock-fit kl-dr-panel"
            style={dock.style}
            initialFocus={() => popup.current?.querySelector<HTMLElement>('[role="grid"] [tabindex="0"]') ?? true}
          >
            <Calendar value={value} onValueChange={pick} onEscape={() => setOpen(false)} {...cal} />
            {presets.length ? (
              <div className="kl-cells kl-cal-presets">
                {presets.map((p) => (
                  <button key={p.label} type="button" className="kl-cell kl-key" onClick={() => pick(p.date())}>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

type DateTimePickerProps = Omit<CalendarProps, "onEscape" | "value" | "onValueChange"> &
  FieldParticipantProps & {
    label: React.ReactNode;
    /** The chosen moment (local time). Controlled with `value` + `onValueChange`, or uncontrolled from `defaultValue`. */
    value?: Date | null;
    defaultValue?: Date | null;
    /** Called on every complete change (a day, a time, a preset), and with null when cleared. */
    onValueChange?: (d: Date | null) => void;
    placeholder?: React.ReactNode;
    /** Quick choices under the calendar. A preset whose time is midnight keeps the chosen time; any other time is used as given. */
    presets?: { label: string; date: () => Date }[];
    /** 24 (default) or 12 with a day-period part; also how the trigger prints the time. */
    hourCycle?: 12 | 24;
    minuteStep?: number;
    /** Time given to a day chosen before any time (default "09:00", or `minTime` when that is later). */
    defaultTime?: string;
    /** Earliest and latest time of day ("HH:MM", 24-hour), on every day. The time cell's arrows stay inside;
     *  a typed time outside is invalid (on the time cell and the field) with `rangeMessage`. */
    minTime?: string;
    maxTime?: string;
    rangeMessage?: string;
    /** Offered times ("HH:MM", 24-hour), the same every day or per day. Given, the time row becomes a list
     *  of slots to choose from (a radio group) instead of the typed time cell. */
    slots?: string[] | ((day: Date) => string[]);
    /** A booked or closed time on a day: true, or a short reason ("booked"). With `slots`, the slot is
     *  hatched, disabled and skipped by the arrows, its name ends "unavailable (reason)", and a day with
     *  no slot left is unavailable in the calendar ("fully booked"). Without `slots`, a typed time it
     *  returns true for is invalid with `unavailableMessage`. */
    isTimeUnavailable?: (day: Date, time: string) => string | boolean | undefined;
    unavailableMessage?: string;
    /** Zone affix printed in the time cell and the trigger ("CET"). Values are local times; this is a label. */
    zone?: React.ReactNode;
    timeLabel?: string;
    doneLabel?: string;
    layout?: "control" | "cell";
    /** Submitted with a form as local "YYYY-MM-DDTHH:MM" (or "" when empty). */
    name?: string;
    required?: boolean;
    disabled?: boolean;
    container?: React.ComponentProps<typeof Popover.Portal>["container"];
  };

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const withTime = (d: Date, t: string) => {
  const [h, m] = t.split(":").map(Number);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
};

/**
 * A day and a time of day in one field: the DatePicker's trigger and docked calendar, with a time row
 * (TimeField as a cell, and Done) under the calendar.
 *
 *   Pickup
 *   ┌────┬───────────────────────────────┐
 *   │ ▦  │ Thu 12 Nov 2026, 14:30 CET     │   trigger: affix · date and time
 *   ├────┴───────────────────────────────┤
 *   │ calendar …                         │
 *   ├──────┬─────────────────────┬───────┤
 *   │ Time │ 14 : 30  CET         │ Done  │   time row
 *   └──────┴─────────────────────┴───────┘
 *
 * - Choosing a day keeps the popup open (the time is still to set) and keeps the time already chosen
 *   (or `defaultTime`). Changes apply as they are made; Done, Escape or a press outside closes, and focus
 *   returns to the trigger.
 * - Keyboard: the calendar's grid keys; Tab moves grid → presets → hours → minutes (→ period) → Done.
 *   Delete or Backspace on the closed trigger clears the value (unless `required`).
 * - A time typed before any day is held and given to the day chosen next. A part cleared while editing
 *   leaves the last complete time in place.
 * - Field: Base UI Field.Root; `name` submits local "YYYY-MM-DDTHH:MM"; `required` ("Choose a date and
 *   time."), `validate`, `invalid`, `error` and the Form's server errors show under the frame, with the
 *   ! cell in the trigger.
 */
function DateTimePicker({
  label,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  placeholder = "Choose a date and time",
  presets = [],
  hourCycle = 24,
  minuteStep,
  defaultTime: defaultTimeProp = "09:00",
  minTime,
  maxTime,
  rangeMessage,
  slots,
  isTimeUnavailable,
  unavailableMessage,
  zone,
  timeLabel = "Time",
  doneLabel = "Done",
  layout = "control",
  name,
  required,
  disabled,
  container,
  className,
  invalid,
  error,
  description,
  validate,
  validationMode,
  orientation,
  ...cal
}: DateTimePickerProps) {
  const [inner, setInner] = React.useState<Date | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : inner;
  const set = (d: Date | null) => {
    if (valueProp === undefined) setInner(d);
    onValueChange?.(d);
  };
  const [heldTime, setHeldTime] = React.useState<string | null>(null);
  const time = value ? hhmm(value) : heldTime;
  const defaultTime =
    minTime && defaultTimeProp < minTime ? minTime : maxTime && defaultTimeProp > maxTime ? maxTime : defaultTimeProp;
  const [open, setOpen] = React.useState(false);
  const dock = dockGeometry(layout);
  const [marker, scope] = useKeylineScope(open, container);
  const popup = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  // the trigger is what focus lands on, so it carries the description and error
  const rootRef = React.useRef<HTMLDivElement>(null);
  useDescribedByMirror(rootRef, ".kl-dr-trigger");
  const locale = cal.locale ?? "en-GB";
  // date and time formatted apart and joined with a comma: engines join them differently ("at" in WebKit)
  const fmtDay = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const fmtTime = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: hourCycle === 12 ? "h12" : "h23",
  });
  const showT = (t: string) => fmtTime.format(withTime(new Date(2020, 0, 1), t));
  const fmt = { format: (d: Date) => `${fmtDay.format(d)}, ${fmtTime.format(d)}` };
  const slotsFor = (d: Date) =>
    (typeof slots === "function" ? slots(d) : (slots ?? [])).filter((t) => !timeOutside(t, minTime, maxTime));
  const why = (d: Date, t: string) => isTimeUnavailable?.(d, t);
  // with slots, a day is chosen first and held until one of its free slots is (value stays as it was);
  // the held day is dropped when the popup closes without one
  const [heldDay, setHeldDay] = React.useState<Date | null>(null);
  const day = heldDay ?? value;
  const show = (o: boolean) => {
    setOpen(o);
    if (!o) setHeldDay(null);
  };
  const pickDay = (d: Date) => {
    if (!slots) return set(withTime(d, time ?? defaultTime));
    if (time && slotsFor(d).includes(time) && !why(d, time)) {
      setHeldDay(null);
      set(withTime(d, time));
    } else setHeldDay(d);
  };
  const pickSlot = (t: string) => {
    if (!day) return;
    setHeldDay(null);
    set(withTime(day, t));
  };
  const isDateUnavailable = slots
    ? (d: Date) =>
        cal.isDateUnavailable?.(d) ||
        (slotsFor(d).every((t) => why(d, t)) ? (slotsFor(d).length ? "fully booked" : "no times") : false)
    : cal.isDateUnavailable;
  const pickPreset = (d: Date) => set(d.getHours() || d.getMinutes() ? d : withTime(d, time ?? defaultTime));
  const pickTime = (t: string | null) => {
    if (t == null) return;
    if (value) set(withTime(value, t));
    else setHeldTime(t);
  };
  const local = value ? `${iso(value)}T${hhmm(value)}` : "";
  const check = React.useCallback(
    (v: unknown, all: Record<string, unknown>) => {
      if (required && !v) return "Choose a date and time.";
      if (typeof v === "string" && v && timeOutside(v.slice(11), minTime, maxTime))
        return rangeMessage ?? `Choose a time from ${showT(minTime ?? "00:00")} to ${showT(maxTime ?? "23:59")}.`;
      if (typeof v === "string" && v && isTimeUnavailable) {
        const r = isTimeUnavailable(new Date(+v.slice(0, 4), +v.slice(5, 7) - 1, +v.slice(8, 10)), v.slice(11));
        if (r)
          return (
            unavailableMessage ??
            `${showT(v.slice(11))} is ${typeof r === "string" ? r : "unavailable"}. Choose another time.`
          );
      }
      return validate ? validate(v, all) : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [required, validate, minTime, maxTime, rangeMessage, isTimeUnavailable, unavailableMessage, hourCycle, locale],
  );
  return (
    <FieldPrimitive.Root
      ref={rootRef}
      data-slot="date-time-picker"
      data-kl-layout={layout}
      data-kl-orientation={orientation}
      name={name}
      disabled={disabled}
      invalid={invalid}
      validate={check}
      validationMode={validationMode}
      className={cn("kl-field kl-dtp", className)}
    >
      <Popover.Root open={open} onOpenChange={show}>
        {marker}
        <span className={cn("kl-field-label", layout === "cell" && "kl-sr")} id={id}>
          {label}
        </span>
        {/* Field.Validity carries the field's combined state (the invalid prop, Form errors, validate and the
            built-in range/unavailable checks), so the trigger is marked invalid whenever the message shows */}
        <FieldPrimitive.Validity>
          {(fv) => (
            <Popover.Trigger
              aria-labelledby={`${id} ${id}v`}
              aria-invalid={invalid || fv.validity.valid === false || undefined}
              aria-required={required || undefined}
              disabled={disabled}
              data-kl-layout={layout}
              className="kl-ctl kl-cells kl-field-frame kl-edge kl-dr-trigger"
              onKeyDown={(e) => {
                if ((e.key === "Delete" || e.key === "Backspace") && value && !required && !open) {
                  e.preventDefault();
                  set(null);
                }
              }}
            >
              <span className="kl-slot kl-field-bang" aria-hidden>
                <span>
                  <span>!</span>
                </span>
              </span>
              <span className="kl-field-affix" aria-hidden>
                <CalendarGlyph />
              </span>
              <span className="kl-dr-value" id={`${id}v`}>
                {value ? (
                  <>
                    <span className="kl-dtp-text">{fmt.format(value)}</span>
                    {zone != null ? (
                      <>
                        {" "}
                        <bdi className="kl-code kl-dtp-zone">{zone}</bdi>
                      </>
                    ) : null}
                  </>
                ) : (
                  <span className="kl-dr-ph">{placeholder}</span>
                )}
              </span>
            </Popover.Trigger>
          )}
        </FieldPrimitive.Validity>
        <FieldPrimitive.Control type="hidden" value={local} onValueChange={() => {}} />
        <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
        <Popover.Portal container={container}>
          <Popover.Positioner
            sideOffset={dock.sideOffset}
            alignOffset={dock.alignOffset}
            align="start"
            collisionPadding={12}
            {...scopeProps(scope, { className: "kl-positioner" })}
          >
            <Popover.Popup
              ref={popup}
              aria-labelledby={id}
              className="kl-attached kl-dock kl-dock-fit kl-dr-panel kl-dtp-panel"
              style={dock.style}
              initialFocus={() => popup.current?.querySelector<HTMLElement>('[role="grid"] [tabindex="0"]') ?? true}
            >
              <Calendar
                value={day}
                onValueChange={pickDay}
                onEscape={() => show(false)}
                {...cal}
                isDateUnavailable={isDateUnavailable}
              />
              {presets.length ? (
                <div className="kl-cells kl-cal-presets">
                  {presets.map((p) => (
                    <button key={p.label} type="button" className="kl-cell kl-key" onClick={() => pickPreset(p.date())}>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              {slots ? (
                <Slots
                  day={day}
                  times={day ? slotsFor(day) : []}
                  why={why}
                  value={day && !heldDay && value ? hhmm(value) : null}
                  onPick={pickSlot}
                  show={showT}
                  label={day ? `${timeLabel}, ${fmtDay.format(day)}` : timeLabel}
                />
              ) : null}
              <div className="kl-cells kl-dtp-time">
                <span className="kl-cell kl-dtp-time-label" aria-hidden>
                  {timeLabel}
                </span>
                {slots ? (
                  <span className="kl-cell kl-dtp-slot-status" aria-live="polite">
                    {!day ? "Choose a day" : heldDay || !value ? "Choose a time" : fmtTime.format(value)}
                    {zone != null && day && !heldDay && value ? (
                      <bdi className="kl-code kl-dtp-zone">{zone}</bdi>
                    ) : null}
                  </span>
                ) : (
                  <TimeField
                    layout="cell"
                    label={timeLabel}
                    value={time}
                    onValueChange={pickTime}
                    hourCycle={hourCycle}
                    minuteStep={minuteStep}
                    locale={cal.locale}
                    zone={zone}
                    min={minTime}
                    max={maxTime}
                    rangeMessage={rangeMessage}
                  />
                )}
                <Popover.Close className="kl-cell kl-key kl-dtp-done">
                  <span>{doneLabel}</span>
                </Popover.Close>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </FieldPrimitive.Root>
  );
}

/**
 * The day's offered times as one radio group of cells (Base UI RadioGroup): arrows move and choose,
 * skipping unavailable slots; the chosen slot floods INK like the chosen day. Four rows tall, scrolling
 * past that.
 */
function Slots({
  day,
  times,
  why,
  value,
  onPick,
  show,
  label,
}: {
  day: Date | null;
  times: string[];
  why: (d: Date, t: string) => string | boolean | undefined;
  value: string | null;
  onPick: (t: string) => void;
  show: (t: string) => string;
  label: string;
}) {
  // one fixed height whatever the day offers, so choosing a day never resizes (or flips) the popup
  if (!day || !times.length)
    return (
      <p className="kl-dtp-slots kl-dtp-slots-none">
        {day ? "No times on this day." : "Choose a day to see its times."}
      </p>
    );
  return (
    <RadioGroup aria-label={label} value={value} onValueChange={(t) => onPick(t as string)} className="kl-dtp-slots">
      {times.map((t) => {
        const r = why(day, t);
        return (
          <Radio.Root
            key={t}
            value={t}
            disabled={!!r}
            aria-label={r ? `${show(t)}, unavailable${typeof r === "string" ? ` (${r})` : ""}` : show(t)}
            className={cn("kl-day kl-flood kl-dtp-slot", !r && "kl-sig-ink")}
            data-kl-flood="manual"
            data-kl-on={value === t ? "" : undefined}
            data-unavailable={r ? "" : undefined}
          >
            <span>{show(t)}</span>
          </Radio.Root>
        );
      })}
    </RadioGroup>
  );
}

export { Calendar, DatePicker, DateTimePicker, type DatePickerProps, type DateTimePickerProps };
