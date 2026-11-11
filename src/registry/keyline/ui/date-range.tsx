"use client";

import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { Select as SelectPrimitive } from "@base-ui/react/select";

import {
  DayPicker,
  type ClassNames,
  type DayButtonProps,
  type DropdownProps,
  type Matcher,
  type Modifiers,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import {
  dockGeometry,
  scopeProps,
  useDomDirection,
  useKeylineScope,
} from "../lib/keyline-scope";
import { floodFromPointer } from "../lib/keyline-motion";
import { SelectContent, SelectItem, SelectRoot } from "./select";
import {
  between,
  countAvailable,
  formatRange,
  order,
  sameDay,
  sod,
  type DateRange,
  type Unavailable,
} from "../lib/calendar";

export type { DateRange };
export { formatRange, countAvailable };

type Bounds = {
  /** Earliest and latest choosable day. Navigation stops at their months; days outside are disabled. */
  min?: Date;
  max?: Date;
};

const Chevron = ({
  orientation = "left",
  className,
}: {
  orientation?: "up" | "down" | "left" | "right";
  className?: string;
}) => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="square"
    className={className}
    aria-hidden
  >
    <path
      d={
        {
          left: "m10 4-4 4 4 4",
          right: "m6 4 4 4-4 4",
          up: "m4 10 4-4 4 4",
          down: "m4 6 4 4 4-4",
        }[orientation]
      }
    />
  </svg>
);

/** The day cell's button: Keyline's flood, hatch, notch and today mark, read from DayPicker's modifiers. */
function DayButton({
  day,
  modifiers,
  className,
  children,
  ...props
}: DayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  const m = modifiers as Record<string, boolean>;
  const flag = (b: boolean | undefined) => (b ? "" : undefined);
  return (
    <button
      ref={ref}
      {...props}
      // the flood (and its seed under a held press) starts where the day was pressed
      onPointerDown={(e) => {
        props.onPointerDown?.(e)
        if (!m.disabled) floodFromPointer(e)
      }}
      aria-current={m.today ? "date" : undefined}
      className={cn(
        "kl-day kl-flood",
        m.kl_ink && !m.disabled && "kl-sig-ink",
        className,
      )}
      data-kl-flood="manual"
      data-kl-on={flag(m.kl_on && !m.disabled)}
      data-preview={flag(m.kl_preview)}
      data-unavailable={flag(m.disabled)}
      data-in-range={flag(m.kl_in)}
      data-end={flag(m.kl_end)}
      data-cont-prev={flag(m.kl_cont_prev)}
      data-cont-next={flag(m.kl_cont_next)}
      data-today={flag(m.today)}
    >
      <span>{children}</span>
    </button>
  );
}

/**
 * Month and year as cells of the calendar's header, each opening Keyline's Select list docked under it (Base UI
 * Select: typeahead, arrows, Home/End, Escape back to the cell). DayPicker hands over its options and a
 * native-select change handler; the chosen value is passed back in that shape.
 */
function Dropdown({
  options = [],
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const items = React.useMemo(
    () => Object.fromEntries(options.map((o) => [String(o.value), o.label])),
    [options],
  );
  const choose = (v: string | null) => {
    if (v != null)
      onChange?.({
        target: { value: v },
        currentTarget: { value: v },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };
  // Keyline's Select (its own Field, so inside a DatePicker that is a Form's field it never registers as that
  // field's control); only the trigger is the calendar's: the whole header cell is the button. Day-picker passes
  // every month with the ones out of bounds disabled, so it is a choice only when two can be chosen.
  return (
    <SelectRoot<string>
      layout="cell"
      className="kl-cal-ddf"
      items={items}
      value={value == null ? null : String(value)}
      onValueChange={choose}
      disabled={disabled || options.filter((o) => !o.disabled).length < 2}
    >
      <SelectPrimitive.Trigger aria-label={ariaLabel} className="kl-cal-dd">
        <SelectPrimitive.Value className="kl-cal-title" />
        <SelectPrimitive.Icon className="kl-cal-chev">
          <Chevron orientation="down" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectContent panelClassName="kl-cal-dd-panel">
        {options.map((o) => (
          <SelectItem key={o.value} value={String(o.value)} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}

const classNames: Partial<ClassNames> = {
  root: "kl-cal-root",
  months: "kl-cal-months",
  month: "kl-cal-month",
  month_caption: "kl-cal-head",
  dropdowns: "kl-cal-dds",
  caption_label: "kl-cal-title",
  button_previous: "kl-cal-nav",
  button_next: "kl-cal-nav",
  chevron: "kl-cal-chev",
  month_grid: "kl-cal-grid",
  weekdays: "kl-cal-dow",
  weekday: "kl-cal-wd",
  weeks: "kl-cal-weeks",
  week: "kl-cal-row",
  day: "kl-cal-cell",
  day_button: "",
  hidden: "kl-cal-blank",
  outside: "kl-cal-blank",
};

/**
 * Everything both calendars hand DayPicker: Keyline's class names and day button, Intl wording for any
 * BCP 47 locale (DayPicker's own formatters want a date-fns locale object), month and year dropdowns, the
 * DOM's reading direction (arrow keys follow it), and min/max as navigation bounds plus disabled days.
 */
function useDayPicker({
  locale,
  weekStartsOn,
  today,
  min,
  max,
  isDateUnavailable,
  anchorMonth,
  label,
}: Bounds & {
  locale: string;
  weekStartsOn: number;
  today: Date;
  isDateUnavailable?: Unavailable;
  anchorMonth: Date;
  label: (d: Date, m: Modifiers) => string;
}) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const [dir] = useDomDirection(wrap);
  const f = React.useMemo(
    () => ({
      caption: new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }),
      month: new Intl.DateTimeFormat(locale, { month: "long" }),
      year: new Intl.DateTimeFormat(locale, { year: "numeric" }),
      wdShort: new Intl.DateTimeFormat(locale, { weekday: "short" }),
      wdNarrow: new Intl.DateTimeFormat(locale, { weekday: "narrow" }),
      wdLong: new Intl.DateTimeFormat(locale, { weekday: "long" }),
      full: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    }),
    [locale],
  );
  // ten years either side of what is shown, unless bounded: the year dropdown's span
  const y = anchorMonth.getFullYear();
  const startMonth =
    min ?? new Date(Math.min(y, today.getFullYear()) - 10, 0, 1);
  const endMonth =
    max ?? new Date(Math.max(y, today.getFullYear()) + 10, 11, 31);
  const disabled: Matcher[] = [];
  if (isDateUnavailable) disabled.push((d: Date) => !!isDateUnavailable(d));
  if (min) disabled.push({ before: sod(min) });
  if (max) disabled.push({ after: sod(max) });
  const props = {
    dir,
    lang: locale,
    today,
    weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    startMonth,
    endMonth,
    disabled,
    captionLayout: "dropdown" as const,
    navLayout: "around" as const,
    classNames,
    components: { DayButton, Chevron, Dropdown },
    formatters: {
      formatCaption: (d: Date) => f.caption.format(d),
      formatMonthDropdown: (d: Date) => f.month.format(d),
      formatYearDropdown: (d: Date) => f.year.format(d),
      // "Mon" where it fits a column; locales whose short names are long (ar: "الاثنين") use the narrow form
      formatWeekdayName: (d: Date) => {
        const s = f.wdShort.format(d);
        return [...s].length > 3 ? f.wdNarrow.format(d) : s;
      },
    },
    labels: {
      labelGrid: (d: Date) => f.caption.format(d),
      labelPrevious: () => "Previous month",
      labelNext: () => "Next month",
      labelMonthDropdown: () => "Month",
      labelYearDropdown: () => "Year",
      labelWeekday: (d: Date) => f.wdLong.format(d),
      labelDayButton: (d: Date, m: Modifiers) => {
        const why = isDateUnavailable?.(d);
        const out =
          min && d < sod(min)
            ? "before the first date"
            : max && d > sod(max)
              ? "after the last date"
              : "";
        return [
          f.full.format(d),
          label(d, m),
          why
            ? `unavailable${typeof why === "string" ? ` (${why})` : ""}`
            : out
              ? `unavailable (${out})`
              : "",
        ]
          .filter(Boolean)
          .join(", ");
      },
    },
  };
  return { wrap, props };
}

type RangeCalendarProps = Bounds & {
  value: DateRange | null;
  onValueChange: (r: DateRange) => void;
  isDateUnavailable?: Unavailable;
  today?: Date;
  defaultMonth?: Date;
  weekStartsOn?: number;
  locale?: string;
  className?: string;
  /** Called when the user presses Escape with no pending start (lets a popover close). */
  onEscape?: () => void;
};

/**
 * Keyline range calendar on react-day-picker (the grid, keyboard, focus and month navigation are the
 * library's). The committed range FLOODS yellow, endpoints flood ink. Where the range breaks across week
 * rows, the cut cells carry a notch pointing in reading direction ("continues"). Unavailable days are
 * hatched, disabled and skipped by the arrow keys. A press or Enter sets the start, then the end; moving
 * after the start (pointer or keys) previews the range; Escape drops the pending start.
 */
function RangeCalendar({
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
}: RangeCalendarProps) {
  const [anchor, setAnchor] = React.useState<Date | null>(null);
  const [end, setEnd] = React.useState<Date | null>(null);
  const preview = anchor ? order(anchor, end ?? anchor) : null;
  const shown = preview ?? value;
  const startMonth = sod(defaultMonth ?? value?.from ?? today);
  const inR = (d: Date) => !!shown && between(d, shown.from, shown.to);
  const role = (d: Date) => {
    if (!shown || !inR(d)) return "";
    const r = sameDay(shown.from, shown.to)
      ? "range start and end"
      : sameDay(d, shown.from)
        ? "range start"
        : sameDay(d, shown.to)
          ? "range end"
          : "in range";
    return preview ? `${r}, preview` : r;
  };
  const { wrap, props } = useDayPicker({
    locale,
    weekStartsOn,
    today,
    min,
    max,
    isDateUnavailable,
    anchorMonth: startMonth,
    label: role,
  });
  const col = (d: Date) => (d.getDay() - weekStartsOn + 7) % 7;
  return (
    <div
      ref={wrap}
      data-slot="range-calendar"
      className={cn("kl-cal", className)}
      data-pending={anchor ? "" : undefined}
      onPointerLeave={() => anchor && setEnd(null)}
    >
      <DayPicker
        {...props}
        mode="range"
        selected={shown ?? undefined}
        onSelect={() => {}}
        defaultMonth={startMonth}
        modifiers={{
          kl_in: inR,
          kl_on: inR,
          kl_preview: (d: Date) => !!preview && inR(d),
          kl_end: (d: Date) =>
            !!shown && (sameDay(d, shown.from) || sameDay(d, shown.to)),
          kl_ink: (d: Date) =>
            !!shown && (sameDay(d, shown.from) || sameDay(d, shown.to)),
          kl_cont_prev: (d: Date) =>
            inR(d) && col(d) === 0 && !!shown && d > shown.from,
          kl_cont_next: (d: Date) =>
            inR(d) && col(d) === 6 && !!shown && d < shown.to,
        }}
        onDayClick={(d, m) => {
          if (m.disabled) return;
          if (!anchor) {
            setAnchor(d);
            setEnd(d);
          } else {
            onValueChange(order(anchor, d));
            setAnchor(null);
            setEnd(null);
          }
        }}
        onDayMouseEnter={(d, m) => anchor && !m.disabled && setEnd(d)}
        onDayFocus={(d) => anchor && setEnd(d)}
        onDayKeyDown={(_, __, e) => {
          if (e.key !== "Escape" || !(anchor || onEscape)) return;
          e.preventDefault();
          e.stopPropagation();
          if (anchor) {
            setAnchor(null);
            setEnd(null);
          } else onEscape?.();
        }}
      />
    </div>
  );
}

type DateRangePickerProps = Omit<RangeCalendarProps, "onEscape"> & {
  label: React.ReactNode;
  presets?: { label: string; range: () => DateRange }[];
  caption?: (r: DateRange | null) => React.ReactNode;
  /** control: its own 2px frame. cell: a cell of an enclosing frame (e.g. a toolbar); the label is visually hidden. */
  layout?: "control" | "cell";
  container?: React.ComponentProps<typeof Popover.Portal>["container"];
};

/** Trigger field + docked calendar panel with presets and a day count. */
function DateRangePicker({
  label,
  value,
  onValueChange,
  presets = [],
  caption,
  layout = "control",
  container,
  className,
  ...cal
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const dock = dockGeometry(layout);
  const [marker, scope] = useKeylineScope(open, container);
  const popup = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  const n = countAvailable(value, cal.isDateUnavailable);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div
        data-slot="date-range"
        data-kl-layout={layout}
        className={cn("kl-field", className)}
      >
        {marker}
        <span
          className={cn("kl-field-label", layout === "cell" && "kl-sr")}
          id={id}
        >
          {label}
        </span>
        <Popover.Trigger
          aria-labelledby={`${id} ${id}v`}
          data-kl-layout={layout}
          className="kl-ctl kl-cells kl-field-frame kl-edge kl-dr-trigger"
        >
          <span className="kl-field-affix" aria-hidden>
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
          </span>
          <span className="kl-dr-value" id={`${id}v`}>
            {value ? (
              formatRange(value, cal.locale)
            ) : (
              <span className="kl-dr-ph">Any date</span>
            )}
          </span>
          <span className="kl-dr-n">
            <b>{n}</b>
            <span className="kl-code">{n === 1 ? "day" : "days"}</span>
          </span>
        </Popover.Trigger>
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
            initialFocus={() =>
              popup.current?.querySelector<HTMLElement>(
                '[role="grid"] [tabindex="0"]',
              ) ?? true
            }
          >
            <RangeCalendar
              value={value}
              onValueChange={(r) => {
                onValueChange(r);
                setOpen(false);
              }}
              onEscape={() => setOpen(false)}
              {...cal}
            />
            <div className="kl-cells kl-cal-foot">
              <div className="kl-cal-total">
                <span className="kl-count">{n}</span>
                <span className="kl-code">{n === 1 ? "DAY" : "DAYS"}</span>
              </div>
              <div className="kl-cal-caption">
                {caption
                  ? caption(value)
                  : value
                    ? formatRange(value, cal.locale)
                    : "No range"}
              </div>
            </div>
            {presets.length ? (
              <div className="kl-cells kl-cal-presets">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="kl-cell kl-key"
                    onClick={() => {
                      onValueChange(p.range());
                      setOpen(false);
                    }}
                  >
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

export { RangeCalendar, DateRangePicker, useDayPicker, type Bounds };
