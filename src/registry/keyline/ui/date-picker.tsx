"use client";

import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { dockGeometry, scopeProps, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
import { sameDay, sod, type Unavailable } from "../lib/calendar";
import {
  CalendarGlyph,
  calendarStyles,
  gridDay,
  pickerStyles,
  useDayPicker,
  usePart,
  useRefs,
  type Bounds,
  type EmptyState,
} from "./date-range";
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
    <div ref={wrap} data-slot="calendar" className={cn(calendarStyles.root, className)}>
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

/* ------------------------------------------------------------------ parts */

type Layout = "control" | "cell";

/** Base UI's Popover.Root: open state and its event details pass through untouched. */
const DatePickerRoot = Popover.Root;

/** The trigger: a field frame of cells (pass the affix and the value; a Field's ! cell first). `layout="cell"`: a
 * cell of an enclosing frame. The look is DateRangePicker's (`pickerStyles`). */
function DatePickerTrigger({
  layout = "control",
  className,
  ...props
}: Popover.Trigger.Props & { layout?: Layout }): React.ReactElement {
  return (
    <Popover.Trigger
      data-kl-layout={layout}
      className={resolveClassName(pickerStyles.trigger, className)}
      {...props}
      data-slot="date-picker-trigger"
    />
  );
}

/** The calendar glyph's cell at the trigger's start (hidden from assistive tech). Children replace the glyph. */
function DatePickerAffix({ children, ...props }: PartProps<"span", EmptyState>): React.ReactElement {
  return usePart("span", "date-picker-affix", pickerStyles.affix, props, {
    "aria-hidden": true,
    children: children ?? <CalendarGlyph />,
  });
}

/** The value cell: the chosen day, or the placeholder. */
function DatePickerValue({
  placeholder,
  children,
  ...props
}: PartProps<"span", EmptyState> & {
  /** Shown, in the placeholder's ink, while there are no children. */
  placeholder?: React.ReactNode;
}): React.ReactElement {
  return usePart("span", "date-picker-value", pickerStyles.value, props, {
    children:
      children ??
      (placeholder != null ? (
        <span data-slot="date-picker-placeholder" className={pickerStyles.placeholder}>
          {placeholder}
        </span>
      ) : null),
  });
}

type PopupProps = Popover.Popup.Props &
  Pick<Popover.Positioner.Props, "anchor" | "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding"> & {
    /** The frame the popup docks to: `cell` when the trigger has `layout="cell"`. */
    layout?: Layout;
    /** Where the portal renders (defaults to <body>). */
    container?: Popover.Portal.Props["container"];
    /** Props for Base UI's Popover.Portal. */
    portalProps?: Omit<Popover.Portal.Props, "container" | "children">;
  };

/**
 * The calendar's surface: Base UI's Portal, Positioner and Popup in one part, with the positioner's placement props
 * lifted. It docks to the trigger (seven days wide, or the trigger's width when the two are within --kl-snap) and
 * carries the configuration (density, motion, theme, dir) of the place it is written. Focus lands on the grid's day.
 */
function DatePickerPopup({
  layout = "control",
  anchor,
  side,
  align = "start",
  sideOffset,
  alignOffset,
  collisionPadding = 12,
  container,
  portalProps,
  className,
  style,
  initialFocus,
  ref,
  ...props
}: PopupProps): React.ReactElement {
  const dock = dockGeometry(layout);
  const [marker, scope, probe] = useKeylineScope(false, container);
  const own = React.useRef<HTMLDivElement>(null);
  const refs = useRefs(own, ref);
  return (
    <>
      {marker}
      <Popover.Portal container={container} {...portalProps}>
        {probe}
        <Popover.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={sideOffset ?? dock.sideOffset}
          alignOffset={alignOffset ?? dock.alignOffset}
          collisionPadding={collisionPadding}
          {...scopeProps(scope, { className: "kl-positioner" })}
        >
          <Popover.Popup
            ref={refs}
            className={resolveClassName(pickerStyles.popup, className)}
            style={resolveStyle(dock.style, style)}
            initialFocus={initialFocus ?? (() => gridDay(own.current))}
            {...props}
            data-slot="date-picker-popup"
          />
        </Popover.Positioner>
      </Popover.Portal>
    </>
  );
}

/** A row of quick choices under the calendar. */
function DatePickerPresets(props: PartProps<"div", EmptyState>): React.ReactElement {
  return usePart("div", "date-picker-presets", pickerStyles.presets, props);
}

/** One quick choice: a key cell (its label travels under a press). */
function DatePickerPreset({ children, ...props }: PartProps<"button", EmptyState>): React.ReactElement {
  return usePart(
    "button",
    "date-picker-preset",
    pickerStyles.preset,
    { type: "button", ...props },
    {
      children: <span>{children}</span>,
    },
  );
}

/** Closes the popup (DateTimePicker's Done): a key cell at the end of a row. */
function DatePickerClose({ className, children, ...props }: Popover.Close.Props): React.ReactElement {
  return (
    <Popover.Close
      className={resolveClassName(
        "kl-cell kl-key flex-none justify-center px-(--kl-inset) text-[13px] font-(--kl-weight-strong)",
        className,
      )}
      {...props}
      data-slot="date-picker-close"
    >
      <span>{children}</span>
    </Popover.Close>
  );
}

/* ------------------------------------------------------------------ the fields */

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
  layout?: Layout;
  /** Submitted with a form, as YYYY-MM-DD. */
  name?: string;
  container?: Popover.Portal.Props["container"];
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Trigger field (calendar affix · formatted date) + the calendar docked to the field frame, built from the parts. */
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
    <DatePickerRoot open={open} onOpenChange={setOpen}>
      <div data-slot="date-picker" data-kl-layout={layout} className={cn("kl-field", className)}>
        <span className={cn("kl-field-label", layout === "cell" && "kl-sr")} id={id}>
          {label}
        </span>
        <DatePickerTrigger aria-labelledby={`${id} ${id}v`} layout={layout}>
          <DatePickerAffix />
          <DatePickerValue id={`${id}v`} placeholder={placeholder}>
            {value ? fmt.format(value) : null}
          </DatePickerValue>
        </DatePickerTrigger>
        {name ? <input type="hidden" name={name} value={value ? iso(value) : ""} /> : null}
        <DatePickerPopup layout={layout} container={container} aria-labelledby={id}>
          <Calendar value={value} onValueChange={pick} onEscape={() => setOpen(false)} {...cal} />
          {presets.length ? (
            <DatePickerPresets>
              {presets.map((p) => (
                <DatePickerPreset key={p.label} onClick={() => pick(p.date())}>
                  {p.label}
                </DatePickerPreset>
              ))}
            </DatePickerPresets>
          ) : null}
        </DatePickerPopup>
      </div>
    </DatePickerRoot>
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
    layout?: Layout;
    /** Submitted with a form as local "YYYY-MM-DDTHH:MM" (or "" when empty). */
    name?: string;
    required?: boolean;
    disabled?: boolean;
    container?: Popover.Portal.Props["container"];
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
  const id = React.useId();
  // the trigger is what focus lands on, so it carries the description and error
  const rootRef = React.useRef<HTMLDivElement>(null);
  useDescribedByMirror(rootRef, '[data-slot="date-picker-trigger"]');
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
      className={cn("kl-field", className)}
    >
      <DatePickerRoot open={open} onOpenChange={show}>
        <span className={cn("kl-field-label", layout === "cell" && "kl-sr")} id={id}>
          {label}
        </span>
        {/* Field.Validity carries the field's combined state (the invalid prop, Form errors, validate and the
            built-in range/unavailable checks), so the trigger is marked invalid whenever the message shows */}
        <FieldPrimitive.Validity>
          {(fv) => (
            <DatePickerTrigger
              aria-labelledby={`${id} ${id}v`}
              aria-invalid={invalid || fv.validity.valid === false || undefined}
              aria-required={required || undefined}
              disabled={disabled}
              layout={layout}
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
              <DatePickerAffix />
              {/* a long value (a narrow cell, a long locale format) ends in an ellipsis; the trigger's name reads it
                  whole. The gap is the cell's, not a margin on the zone: a <bdi> takes its own direction (LTR for
                  "CET"), so its logical margin would land on the far side in RTL */}
              <DatePickerValue id={`${id}v`} placeholder={placeholder} className="min-w-0 gap-2">
                {value ? (
                  <>
                    <span data-slot="date-time-picker-text" className="min-w-0 truncate">
                      {fmt.format(value)}
                    </span>
                    {zone != null ? (
                      <>
                        {" "}
                        <bdi data-slot="date-time-picker-zone" className="kl-code">
                          {zone}
                        </bdi>
                      </>
                    ) : null}
                  </>
                ) : null}
              </DatePickerValue>
            </DatePickerTrigger>
          )}
        </FieldPrimitive.Validity>
        <FieldPrimitive.Control type="hidden" value={local} onValueChange={() => {}} />
        <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
        <DatePickerPopup layout={layout} container={container} aria-labelledby={id}>
          <Calendar
            value={day}
            onValueChange={pickDay}
            onEscape={() => show(false)}
            {...cal}
            isDateUnavailable={isDateUnavailable}
          />
          {presets.length ? (
            <DatePickerPresets>
              {presets.map((p) => (
                <DatePickerPreset key={p.label} onClick={() => pickPreset(p.date())}>
                  {p.label}
                </DatePickerPreset>
              ))}
            </DatePickerPresets>
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
          {/* the time row: one run of cells, a label cell, the TimeField as a cell (it hugs its parts, so the
                  row's spare room stays after it) and Done. Compact: seven 34px days leave no room for the label
                  cell; the time cell is still named */}
          <div
            data-slot="date-time-picker-time"
            className="kl-cells min-h-(--kl-row) border-t-(length:--kl-k1) border-t-kl-seam *:data-[slot=time-field]:min-w-0"
          >
            <span
              data-slot="date-time-picker-time-label"
              className="kl-cell flex-none text-[13px] font-(--kl-weight-strong) text-kl-ink-2 in-data-[kl-density=compact]:hidden"
              aria-hidden
            >
              {timeLabel}
            </span>
            {slots ? (
              <span
                data-slot="date-time-picker-slot-status"
                className="kl-cell flex-auto text-[15px] font-(--kl-weight-strong) whitespace-nowrap"
                aria-live="polite"
              >
                {!day ? "Choose a day" : heldDay || !value ? "Choose a time" : fmtTime.format(value)}
                {zone != null && day && !heldDay && value ? (
                  <bdi data-slot="date-time-picker-zone" className="kl-code">
                    {zone}
                  </bdi>
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
            <DatePickerClose>{doneLabel}</DatePickerClose>
          </div>
        </DatePickerPopup>
      </DatePickerRoot>
    </FieldPrimitive.Root>
  );
}

/** The slots' grid: cells on the calendar's seams, four rows tall whatever the day offers, scrolling past that. */
const slotsGrid = cn(
  "grid h-[calc(4*var(--kl-day))] grid-cols-[repeat(auto-fill,minmax(max(4.5em,calc(25%-var(--kl-k1))),1fr))]",
  "[align-content:start] gap-(--kl-k1) overflow-y-auto overscroll-contain border-t-(length:--kl-k1) border-t-kl-seam",
  "[scrollbar-width:thin]",
);

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
      <p
        data-slot="date-time-picker-slots"
        className={cn(slotsGrid, "m-0 place-items-center px-(--kl-inset) text-center text-[13px] text-kl-ink-2")}
      >
        {day ? "No times on this day." : "Choose a day to see its times."}
      </p>
    );
  return (
    <RadioGroup
      aria-label={label}
      value={value}
      onValueChange={(t) => onPick(t as string)}
      data-slot="date-time-picker-slots"
      className={slotsGrid}
    >
      {times.map((t) => {
        const r = why(day, t);
        return (
          <Radio.Root
            key={t}
            value={t}
            disabled={!!r}
            aria-label={r ? `${show(t)}, unavailable${typeof r === "string" ? ` (${r})` : ""}` : show(t)}
            data-slot="date-time-picker-slot"
            className={cn(
              calendarStyles.day,
              // each slot draws the seams on its end and foot into the grid gap, so a short last row ends cleanly
              "[box-shadow:var(--kl-k1)_var(--kl-k1)_0_0_var(--kl-line-soft)]",
              "kl-rtl:[box-shadow:calc(-1*var(--kl-k1))_var(--kl-k1)_0_0_var(--kl-line-soft)]",
              "font-(family-name:--kl-font-mono) text-[13px] tabular-nums",
              !r && "kl-sig-ink",
            )}
            data-kl-flood="manual"
            data-kl-on={value === t ? "" : undefined}
            data-unavailable={r ? "" : undefined}
          >
            <span className={calendarStyles.dayLabel}>{show(t)}</span>
          </Radio.Root>
        );
      })}
    </RadioGroup>
  );
}

export {
  Calendar,
  DatePicker,
  DateTimePicker,
  DatePickerRoot,
  DatePickerTrigger,
  DatePickerAffix,
  DatePickerValue,
  DatePickerPopup,
  DatePickerPresets,
  DatePickerPreset,
  DatePickerClose,
  type CalendarProps,
  type DatePickerProps,
  type DateTimePickerProps,
};
