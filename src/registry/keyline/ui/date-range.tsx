"use client";

import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import {
  DayPicker,
  type ClassNames,
  type DayButtonProps,
  type DropdownProps,
  type Matcher,
  type Modifiers,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { dockGeometry, scopeProps, useDomDirection, useKeylineScope } from "../lib/keyline-scope";
import { resolveClassName, resolveStyle, type PartProps } from "../lib/keyline-render";
import { floodFromPointer } from "../lib/keyline-motion";
import { SelectItem, SelectList, SelectPopup, SelectRoot } from "./select";
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

/* ------------------------------------------------------------------ calendar styles */

/*
 * The calendar is react-day-picker's DOM. Every element it renders takes a class from its `classNames` map, so the
 * map carries Keyline's utilities and nothing needs a stylesheet: a month of [‹ prev] [month ▾ · year ▾] [next ›] over
 * a table grid, seams on the table cells, and the day button filling its cell and carrying the flood. --kl-day is the
 * day's size (34px under compact density). The calendar sets Keyline's type and ink itself: on its own it is the
 * outermost Keyline element, and its root carries no foundation class.
 */
const calendarRoot = cn(
  "block w-[calc(7*var(--kl-day))] text-kl-ink [--kl-day:44px] in-data-[kl-density=compact]:[--kl-day:34px]",
  "font-(family-name:--kl-font) text-(length:--kl-fs)/[1.4] tabular-nums antialiased",
);

/** A nav arrow and a month/year cell draw their own ring: neither carries a foundation class. */
const ownRing =
  "focus-visible:outline-(length:--kl-ring) focus-visible:outline-solid focus-visible:outline-kl-focus focus-visible:outline-offset-(--kl-ring-in)";

/** The month and year cells' title. */
const title = "inline-flex min-h-10 items-center gap-1 px-2 text-[15px] font-(--kl-weight-display) whitespace-nowrap";

const nav = cn(
  "grid min-h-10 cursor-pointer place-items-center border-b-(length:--kl-k1) border-b-kl-seam bg-none p-0 text-inherit",
  "hover:not-aria-disabled:bg-kl-tint active:not-aria-disabled:bg-kl-press active:not-aria-disabled:*:translate-y-px",
  "aria-disabled:cursor-default aria-disabled:text-kl-dis",
  ownRing,
);

/** A blank cell before the first or after the last day (outside the month): a day's height, no button. */
const blank = "h-[calc(var(--kl-day)-var(--kl-k1))]";

const classNames: Partial<ClassNames> = {
  root: "",
  months: "",
  month: "grid grid-cols-[var(--kl-day)_minmax(0,1fr)_var(--kl-day)]",
  month_caption: cn(
    "relative flex min-w-0 justify-center border-b-(length:--kl-k1) border-b-kl-seam",
    "border-x-(length:--kl-k1) border-x-kl-line-soft",
  ),
  // the two cells share the whole header between the arrows: each is the target edge to edge
  dropdowns: "flex min-w-0 flex-1",
  caption_label: title,
  button_previous: nav,
  button_next: nav,
  chevron: "",
  month_grid: "col-span-full w-full table-fixed border-separate border-spacing-0",
  weekdays: "",
  weekday: cn(
    "h-[26px] border-b-(length:--kl-k1) border-b-kl-seam p-0 text-center text-kl-ink-2",
    "font-(family-name:--kl-font-mono) text-[11px]/none font-medium not-italic normal-nums",
  ),
  weeks: "",
  week: "",
  // seams on the cells: the soft rule after each but the last of a row, and under each but the last row
  day: cn(
    "border-e-(length:--kl-k1) border-b-(length:--kl-k1) border-e-kl-line-soft border-b-kl-line-soft p-0",
    "last:border-e-0 [tr:last-child>&]:border-b-0",
  ),
  day_button: "",
  hidden: blank,
  outside: blank,
};

/**
 * A day (and a time slot, DateTimePicker's): a flood cell (a press grows it from the press point; on is ink for a
 * chosen day or a range end, yellow inside a range), hatched and struck when unavailable, a lighter yellow while a
 * range is previewed, and a notch pointing on where a range breaks across week rows. It sets no fill or ink of its
 * own beyond hover: the flood's state rules own those. Its label is `dayLabel`.
 */
const dayStyles = cn(
  "group/day kl-flood relative grid h-[calc(var(--kl-day)-var(--kl-k1))] w-full cursor-pointer place-items-center p-0",
  "font-(family-name:--kl-font) text-[15px] font-medium",
  "hover:not-data-in-range:not-data-unavailable:bg-kl-tint",
  "focus-visible:z-2 focus-visible:outline-offset-(--kl-ring-in)",
  "data-unavailable:cursor-not-allowed data-unavailable:bg-(image:--kl-hatch) data-unavailable:text-kl-dis",
  "data-unavailable:data-in-range:bg-[color-mix(in_oklab,var(--kl-yellow)_35%,var(--kl-cell))]",
  "data-unavailable:data-in-range:text-kl-ink-2",
  "data-preview:not-[.kl-sig-ink]:[--kl-fc:color-mix(in_oklab,var(--kl-yellow)_45%,var(--kl-cell))]",
  // row-break rule: a range cut by the frame edge carries a notch pointing in reading direction
  "[&:is([data-cont-next],[data-cont-prev])]:after:absolute [&:is([data-cont-next],[data-cont-prev])]:after:top-[calc(50%-6px)]",
  "[&:is([data-cont-next],[data-cont-prev])]:after:size-0",
  "[&:is([data-cont-next],[data-cont-prev])]:after:border-y-[6px] [&:is([data-cont-next],[data-cont-prev])]:after:border-y-transparent",
  "[&:is([data-cont-next],[data-cont-prev])]:after:border-s-[6px] [&:is([data-cont-next],[data-cont-prev])]:after:border-s-kl-ink",
  "data-cont-next:after:end-0 data-cont-prev:after:start-0",
  "forced-colors:[&:is([data-cont-next],[data-cont-prev])]:after:forced-color-adjust-none",
  "forced-colors:[&:is([data-cont-next],[data-cont-prev])]:after:border-s-[CanvasText]",
  "forced-colors:data-unavailable:text-[GrayText]",
);

/** The day's numeral (or the slot's time): travels 1px under a press, underlined today, struck when unavailable. */
const dayLabel = cn(
  "group-[:active:not([data-unavailable])]/day:translate-y-px",
  "group-data-today/day:border-b-[3px] group-data-today/day:border-b-current group-data-today/day:pb-px group-data-today/day:leading-none",
  "group-data-unavailable/day:line-through group-data-unavailable/day:decoration-[1.5px]",
);

/** The calendar's look, for a component that renders react-day-picker or a day-like cell itself. */
const calendarStyles = { root: calendarRoot, day: dayStyles, dayLabel, classNames };

/** The day cell's button: Keyline's flood, hatch, notch and today mark, read from DayPicker's modifiers. */
function DayButton({ day, modifiers, className, children, ...props }: DayButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const focused = modifiers["focused"];
  React.useEffect(() => {
    if (focused) ref.current?.focus();
  }, [focused]);
  const m = modifiers as Record<string, boolean>;
  const flag = (b: boolean | undefined) => (b ? "" : undefined);
  return (
    <button
      ref={ref}
      {...props}
      // the flood (and its seed under a held press) starts where the day was pressed
      onPointerDown={(e) => {
        props.onPointerDown?.(e);
        if (!m["disabled"]) floodFromPointer(e);
      }}
      aria-current={m["today"] ? "date" : undefined}
      className={cn(dayStyles, m["kl_ink"] && !m["disabled"] && "kl-sig-ink", className)}
      data-kl-flood="manual"
      data-kl-on={flag(m["kl_on"] && !m["disabled"])}
      data-preview={flag(m["kl_preview"])}
      data-unavailable={flag(m["disabled"])}
      data-in-range={flag(m["kl_in"])}
      data-end={flag(m["kl_end"])}
      data-cont-prev={flag(m["kl_cont_prev"])}
      data-cont-next={flag(m["kl_cont_next"])}
      data-today={flag(m["today"])}
    >
      <span className={dayLabel}>{children}</span>
    </button>
  );
}

/**
 * Month and year as cells of the calendar's header, each opening Keyline's Select list docked under it (Base UI
 * Select: typeahead, arrows, Home/End, Escape back to the cell). DayPicker hands over its options and a
 * native-select change handler; the chosen value is passed back in that shape.
 */
function Dropdown({ options = [], value, onChange, disabled, "aria-label": ariaLabel }: DropdownProps) {
  const items = React.useMemo(() => Object.fromEntries(options.map((o) => [String(o.value), o.label])), [options]);
  const choose = (v: string | null) => {
    if (v != null)
      onChange?.({
        target: { value: v },
        currentTarget: { value: v },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };
  // Keyline's Select (its own Field, so inside a DatePicker that is a Form's field it never registers as that
  // field's control); only the trigger is the calendar's: the whole header cell is the button. Day-picker passes
  // every month with the ones out of bounds disabled, so it is a choice only when two can be chosen. The field steps
  // aside (display: contents): its trigger is the cell.
  return (
    <FieldPrimitive.Root
      data-slot="select"
      data-kl-layout="cell"
      disabled={disabled || options.filter((o) => !o.disabled).length < 2}
      className="kl-field contents"
    >
      <SelectRoot<string>
        items={items}
        value={value == null ? null : String(value)}
        onValueChange={choose}
        disabled={disabled || options.filter((o) => !o.disabled).length < 2}
      >
        <SelectPrimitive.Trigger
          aria-label={ariaLabel}
          data-slot="calendar-dropdown"
          className={cn(
            "group/cal-dd m-0 flex min-w-0 flex-auto cursor-pointer items-center justify-center bg-none p-0 pe-2",
            "font-(family-name:--kl-font) text-inherit",
            // the year cell after the month cell: a soft seam between them
            "[:is([data-slot=select]+[data-slot=select])>&]:border-s-(length:--kl-k1)",
            "[:is([data-slot=select]+[data-slot=select])>&]:border-s-kl-line-soft",
            "hover:not-disabled:not-data-popup-open:bg-kl-tint",
            "data-popup-open:bg-kl-inverse data-popup-open:text-kl-on-inverse",
            ownRing,
            "focus-visible:z-1",
            // one choice (bounds inside a single year) is a label, not a list: no caret, nothing to open
            "disabled:cursor-default disabled:pe-0",
            "forced-colors:data-popup-open:bg-[Highlight] forced-colors:data-popup-open:text-[HighlightText]",
            "forced-colors:data-popup-open:forced-color-adjust-none",
          )}
        >
          <SelectPrimitive.Value className={title} />
          <SelectPrimitive.Icon
            className={cn(
              "flex-none text-kl-ink-2 group-disabled/cal-dd:hidden group-data-popup-open/cal-dd:text-inherit",
            )}
          >
            <Chevron orientation="down" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        {/* a narrower minimum and a shorter list than a field's */}
        <SelectPopup layout="cell" className="max-h-[min(var(--available-height),320px)] [--kl-dock-w:9rem]">
          <SelectList>
            {options.map((o) => (
              <SelectItem key={o.value} value={String(o.value)} disabled={o.disabled}>
                {o.label}
              </SelectItem>
            ))}
          </SelectList>
        </SelectPopup>
      </SelectRoot>
    </FieldPrimitive.Root>
  );
}

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
  const startMonth = min ?? new Date(Math.min(y, today.getFullYear()) - 10, 0, 1);
  const endMonth = max ?? new Date(Math.max(y, today.getFullYear()) + 10, 11, 31);
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
        // oxlint-disable-next-line typescript/no-misused-spread -- counts code points, which is the width measure wanted here
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
        const out = min && d < sod(min) ? "before the first date" : max && d > sod(max) ? "after the last date" : "";
        return [
          f.full.format(d),
          label(d, m),
          why ? `unavailable${typeof why === "string" ? ` (${why})` : ""}` : out ? `unavailable (${out})` : "",
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
      className={cn(calendarRoot, className)}
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
          kl_end: (d: Date) => !!shown && (sameDay(d, shown.from) || sameDay(d, shown.to)),
          kl_ink: (d: Date) => !!shown && (sameDay(d, shown.from) || sameDay(d, shown.to)),
          kl_cont_prev: (d: Date) => inR(d) && col(d) === 0 && !!shown && d > shown.from,
          kl_cont_next: (d: Date) => inR(d) && col(d) === 6 && !!shown && d < shown.to,
        }}
        onDayClick={(d, m) => {
          if (m["disabled"]) return;
          if (!anchor) {
            setAnchor(d);
            setEnd(d);
          } else {
            onValueChange(order(anchor, d));
            setAnchor(null);
            setEnd(null);
          }
        }}
        onDayMouseEnter={(d, m) => anchor && !m["disabled"] && setEnd(d)}
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

/* ------------------------------------------------------------------ picker parts */

/*
 * The pickers' look, shared by DateRangePicker's parts here and DatePicker's in date-picker.tsx (each names its own
 * parts and slots):
 *
 *   Stay
 *   ┌────┬───────────────────────────────┬────────┐
 *   │ ▦  │ 12 – 18 Nov 2026               │ 7 days │   trigger: a field frame of cells (affix · value · count)
 *   ├────┴───────────────────────────────┴────────┤
 *   │ calendar …                                   │   popup: docked to the trigger, seven days wide
 *   ├──────────┬───────────────────────────────────┤
 *   │ 7 DAYS   │ 12 – 18 Nov 2026                  │   footer: total · caption
 *   ├──────────┴──────┬────────────────────────────┤
 *   │ This week        │ Next week                  │   presets: a row of key cells
 *   └──────────────────┴────────────────────────────┘
 */
const pickerStyles = {
  /** The trigger: a field frame of cells. Its own edge takes keyboard focus; it answers a press before the popup
   * unfolds, and while open its edge is the plain line (the popup continues it). */
  trigger: cn(
    "kl-ctl kl-cells kl-field-frame kl-edge w-full cursor-pointer p-0 text-start font-(family-name:--kl-font) text-inherit",
    "data-popup-open:not-in-data-invalid:border-kl-line",
    // the old trigger rule lost its pointer to the field's disabled frame rule; a utility would win, so state it here
    "data-disabled:cursor-not-allowed",
    "active:not-data-disabled:not-disabled:bg-kl-press",
  ),
  /** The calendar glyph's affix cell. */
  affix: "kl-field-affix",
  /** The value cell: the chosen day or range, on one line. */
  value: "flex flex-1 items-center px-(--kl-inset) text-[15px] font-(--kl-weight-strong) whitespace-nowrap",
  /** What the value cell says before anything is chosen. */
  placeholder: "font-normal text-kl-ink-3",
  /** The popup: docked to the trigger (dock geometry; no cut), its natural width seven days and its sides. Within
   * --kl-snap of the trigger's width it takes that width and the days share the difference; otherwise it keeps its
   * own and meets the trigger's edge in a T. The calendar inside fills it. */
  popup: cn(
    "kl-attached kl-dock kl-dock-fit grid bg-kl-cell text-kl-ink outline-0",
    "[--kl-day:44px] [--kl-dock-w:calc(7*var(--kl-day)+2*var(--kl-k2))] in-data-[kl-density=compact]:[--kl-day:34px]",
    "*:data-[slot=calendar]:w-auto *:data-[slot=range-calendar]:w-auto",
  ),
  /** A row of quick choices under the calendar. */
  presets: "kl-cells border-t-(length:--kl-k1) border-t-kl-seam",
  /** One quick choice: a key cell sharing the row. */
  preset: "kl-cell kl-key min-h-9 flex-1 justify-center px-1.5 text-[13px] font-(--kl-weight-strong)",
};

type EmptyState = Record<string, never>;
const EMPTY: EmptyState = {};
type Layout = "control" | "cell";

/** A part Keyline renders itself (useRender), with its slot and classes. */
function usePart<Tag extends "div" | "span" | "button">(
  tag: Tag,
  slot: string,
  base: string,
  { render, className, style, ...props }: PartProps<Tag, EmptyState>,
  extra?: Record<string, unknown>,
): React.ReactElement {
  const own = {
    ...extra,
    "data-slot": slot,
    className: resolveClassName(base, className)(EMPTY),
    style: resolveStyle(undefined, style)(EMPTY),
  };
  return useRender({ defaultTagName: tag, render, state: EMPTY, props: mergeProps<Tag>(props as never, own as never) });
}

/** Base UI's Popover.Root: open state and its event details pass through untouched. */
const DateRangeRoot = Popover.Root;

/** The trigger: a field frame of cells (pass the affix, value and count). `layout="cell"`: a cell of an enclosing frame. */
function DateRangeTrigger({
  layout = "control",
  className,
  ...props
}: Popover.Trigger.Props & { layout?: Layout }): React.ReactElement {
  return (
    <Popover.Trigger
      data-kl-layout={layout}
      className={resolveClassName(pickerStyles.trigger, className)}
      {...props}
      data-slot="date-range-trigger"
    />
  );
}

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

/** The calendar glyph's cell at the trigger's start (hidden from assistive tech). Children replace the glyph. */
function DateRangeAffix({ children, ...props }: PartProps<"span", EmptyState>): React.ReactElement {
  return usePart("span", "date-range-affix", pickerStyles.affix, props, {
    "aria-hidden": true,
    children: children ?? <CalendarGlyph />,
  });
}

type ValueProps = PartProps<"span", EmptyState> & {
  /** Shown, in the placeholder's ink, while there are no children. */
  placeholder?: React.ReactNode;
};

/** The value cell: the chosen range, or the placeholder. */
function DateRangeValue({ placeholder, children, ...props }: ValueProps): React.ReactElement {
  return usePart("span", "date-range-value", pickerStyles.value, props, {
    children:
      children ??
      (placeholder != null ? (
        <span data-slot="date-range-placeholder" className={pickerStyles.placeholder}>
          {placeholder}
        </span>
      ) : null),
  });
}

/** The day count at the trigger's end: the number, then its unit in the Code voice. */
function DateRangeCount(props: PartProps<"span", EmptyState>): React.ReactElement {
  return usePart(
    "span",
    "date-range-count",
    "flex flex-none items-baseline gap-[5px] self-center px-2.5 text-[17px] font-(--kl-weight-display)",
    props,
  );
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

/** Focus the grid's focusable day when the popup opens (the chosen day, else today or the first). */
const gridDay = (popup: HTMLElement | null) =>
  popup?.querySelector<HTMLElement>('[role="grid"] [tabindex="0"]') ?? true;

/**
 * The calendar's surface: Base UI's Portal, Positioner and Popup in one part, with the positioner's placement props
 * lifted. It docks to the trigger and carries the configuration (density, motion, theme, dir) of the place it is
 * written. Focus lands on the grid's day.
 */
function DateRangePopup({
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
            data-slot="date-range-popup"
          />
        </Popover.Positioner>
      </Popover.Portal>
    </>
  );
}

/** One callback ref for the part's own ref and the consumer's. */
function useRefs<T>(own: React.RefObject<T | null>, theirs: React.Ref<T> | undefined): React.RefCallback<T> {
  return React.useCallback(
    (el: T | null) => {
      own.current = el;
      if (typeof theirs === "function") theirs(el);
      else if (theirs) theirs.current = el;
    },
    [own, theirs],
  );
}

/** The row under the calendar: the total, then the caption. */
function DateRangeFooter(props: PartProps<"div", EmptyState>): React.ReactElement {
  return usePart("div", "date-range-footer", "kl-cells border-t-(length:--kl-k1) border-t-kl-seam", props);
}

/** The footer's count of days: a Count (`kl-count`) over its unit in the Code voice. */
function DateRangeTotal(props: PartProps<"div", EmptyState>): React.ReactElement {
  return usePart("div", "date-range-total", "grid min-w-[76px] content-center gap-[3px] px-(--kl-inset) py-2", props);
}

/** The footer's caption: the range in words, or what the consumer's `caption` says. */
function DateRangeCaption(props: PartProps<"div", EmptyState>): React.ReactElement {
  return usePart(
    "div",
    "date-range-caption",
    "flex max-w-[232px] items-center px-(--kl-inset) py-1.5 text-[13px] text-kl-ink-2",
    props,
  );
}

/** A row of quick choices under the calendar. */
function DateRangePresets(props: PartProps<"div", EmptyState>): React.ReactElement {
  return usePart("div", "date-range-presets", pickerStyles.presets, props);
}

/** One quick choice: a key cell (its label travels under a press). */
function DateRangePreset({ children, ...props }: PartProps<"button", EmptyState>): React.ReactElement {
  return usePart(
    "button",
    "date-range-preset",
    pickerStyles.preset,
    { type: "button", ...props },
    {
      children: <span>{children}</span>,
    },
  );
}

type DateRangePickerProps = Omit<RangeCalendarProps, "onEscape"> & {
  label: React.ReactNode;
  presets?: { label: string; range: () => DateRange }[];
  caption?: (r: DateRange | null) => React.ReactNode;
  /** control: its own 2px frame. cell: a cell of an enclosing frame (e.g. a toolbar); the label is visually hidden. */
  layout?: Layout;
  container?: Popover.Portal.Props["container"];
};

/** Trigger field + docked calendar panel with presets and a day count, built from the parts above. */
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
  const id = React.useId();
  const n = countAvailable(value, cal.isDateUnavailable);
  return (
    <DateRangeRoot open={open} onOpenChange={setOpen}>
      <div data-slot="date-range" data-kl-layout={layout} className={cn("kl-field", className)}>
        <span className={cn("kl-field-label", layout === "cell" && "kl-sr")} id={id}>
          {label}
        </span>
        {/* named by the label, the range and the day count: everything it shows is in its name */}
        <DateRangeTrigger aria-labelledby={`${id} ${id}v ${id}n`} layout={layout}>
          <DateRangeAffix />
          <DateRangeValue id={`${id}v`} placeholder="Any date">
            {value ? formatRange(value, cal.locale) : null}
          </DateRangeValue>
          {/* the spaces keep the words apart in the text (and so the name); flex layout drops them */}{" "}
          <DateRangeCount id={`${id}n`}>
            <b>{n}</b> <span className="kl-code">{n === 1 ? "day" : "days"}</span>
          </DateRangeCount>
        </DateRangeTrigger>
        <DateRangePopup layout={layout} container={container} aria-labelledby={id}>
          <RangeCalendar
            value={value}
            onValueChange={(r) => {
              onValueChange(r);
              setOpen(false);
            }}
            onEscape={() => setOpen(false)}
            {...cal}
          />
          <DateRangeFooter>
            <DateRangeTotal>
              <span className="kl-count">{n}</span>
              <span className="kl-code">{n === 1 ? "DAY" : "DAYS"}</span>
            </DateRangeTotal>
            <DateRangeCaption>
              {caption ? caption(value) : value ? formatRange(value, cal.locale) : "No range"}
            </DateRangeCaption>
          </DateRangeFooter>
          {presets.length ? (
            <DateRangePresets>
              {presets.map((p) => (
                <DateRangePreset
                  key={p.label}
                  onClick={() => {
                    onValueChange(p.range());
                    setOpen(false);
                  }}
                >
                  {p.label}
                </DateRangePreset>
              ))}
            </DateRangePresets>
          ) : null}
        </DateRangePopup>
      </div>
    </DateRangeRoot>
  );
}

export {
  RangeCalendar,
  DateRangePicker,
  DateRangeRoot,
  DateRangeTrigger,
  DateRangeAffix,
  DateRangeValue,
  DateRangeCount,
  DateRangePopup,
  DateRangeFooter,
  DateRangeTotal,
  DateRangeCaption,
  DateRangePresets,
  DateRangePreset,
  useDayPicker,
  useRefs,
  usePart,
  gridDay,
  calendarStyles,
  pickerStyles,
  CalendarGlyph,
  type Bounds,
  type DateRangePickerProps,
  type EmptyState,
};
