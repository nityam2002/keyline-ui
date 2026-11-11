"use client";

import * as React from "react"
import { Field as FieldPrimitive } from "@base-ui/react/field"

import { cn } from "@/lib/utils"
import { FieldMessages, useDescribedByMirror, type FieldParticipantProps } from "./field"

type TimeFieldProps = FieldParticipantProps & {
  /** Visible label (visually hidden with layout="cell"). Names the group; each part is named too. */
  label: React.ReactNode
  /** "HH:MM", 24-hour, whatever the hour cycle shown. null (or "") is no time. */
  value?: string | null
  defaultValue?: string | null
  /** Called with "HH:MM" (24-hour) once every part holds a value, and with null when one is cleared. */
  onValueChange?: (value: string | null) => void
  /** 24: hours 00–23 (default). 12: hours 01–12 and a day-period part (AM/PM, named by `locale`). */
  hourCycle?: 12 | 24
  /** Names the day periods and decides whether the period comes before the hours (e.g. "ko", "zh"). Default: the runtime's. */
  locale?: string
  /** Arrow keys move minutes by this much (and snap to it). Default 1. */
  minuteStep?: number
  /** Earliest and latest allowed time, "HH:MM" 24-hour. Arrow keys never step outside them (they wrap to the
   *  other bound); a typed time outside them is invalid with `rangeMessage`. */
  min?: string
  max?: string
  /** Error for a time outside min/max. Default "Choose a time from {min} to {max}." in the shown clock. */
  rangeMessage?: string
  /** Form name; the submitted value is "HH:MM", 24-hour (or "" when incomplete). */
  name?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  /** Trailing affix cell in the Code voice: a time zone ("CET"), "local". */
  zone?: React.ReactNode
  /** control: its own 2px frame. cell: a cell of an enclosing frame (no border, label visually hidden). */
  layout?: "control" | "cell"
  hourLabel?: string
  minuteLabel?: string
  /** Accessible name of the day-period part (12-hour). Default "AM/PM". */
  periodLabel?: string
  id?: string
  className?: string
}

type Period = "" | "am" | "pm"
type Parts = [string, string, Period]
type Part = 0 | 1 | 2

const pad = (n: number) => String(n).padStart(2, "0")
const parse = (v: string | null | undefined, cycle: 12 | 24): Parts => {
  const m = v ? /^(\d{1,2}):(\d{1,2})$/.exec(v) : null
  if (!m) return ["", "", ""]
  const h = Math.min(23, +m[1])
  const mi = pad(Math.min(59, +m[2]))
  return cycle === 24 ? [pad(h), mi, ""] : [pad(h % 12 || 12), mi, h < 12 ? "am" : "pm"]
}
/** The 24-hour value the parts make, or null while one is missing. */
const toValue = (p: Parts, cycle: 12 | 24): string | null => {
  if (p[0] === "" || p[1] === "" || +p[0] > (cycle === 12 ? 12 : 23) || (cycle === 12 && (+p[0] < 1 || !p[2]))) return null
  const h = cycle === 24 ? +p[0] : (+p[0] % 12) + (p[2] === "pm" ? 12 : 0)
  return `${pad(h)}:${pad(+p[1])}`
}

/** "HH:MM" as the field shows it: 24-hour as is, 12-hour in the locale's words ("6:00 AM"). */
const showTime = (v: string, cycle: 12 | 24, locale?: string) => {
  if (cycle === 24) return v
  const [h, m] = v.split(":").map(Number)
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(2020, 0, 1, h, m))
}
/** Is "HH:MM" outside [min, max]? (Zero-padded 24-hour strings compare in clock order.) */
const outside = (v: string | null, min?: string, max?: string) => v != null && ((min != null && v < min) || (max != null && v > max))

/** The locale's day-period names and whether it puts them before the hours. */
function dayPeriods(locale?: string): { names: [string, string]; first: boolean } {
  try {
    const f = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hour12: true })
    const parts = (h: number) => f.formatToParts(new Date(2020, 0, 1, h, 30))
    const name = (h: number) => parts(h).find((x) => x.type === "dayPeriod")?.value
    const am = parts(9)
    const first = am.findIndex((x) => x.type === "dayPeriod") < am.findIndex((x) => x.type === "hour")
    return { names: [name(9) ?? "AM", name(21) ?? "PM"], first }
  } catch {
    return { names: ["AM", "PM"], first: false }
  }
}

/**
 * A time of day in one field frame: two spin-button cells (three for a 12-hour clock) and a zone affix.
 *
 *   Pickup
 *   ┌──────┬───┬──────┬─────┐            ┌──────┬───┬──────┬────┬─────┐
 *   │  14  │ : │  30  │ CET │  24-hour   │  02  │ : │  30  │ PM │ CET │  12-hour
 *   └──────┴───┴──────┴─────┘            └──────┴───┴──────┴────┴─────┘
 *
 * - Each part is an input with role="spinbutton" (aria-valuenow/min/max/text), so it is announced as a
 *   spin button with its value, not as a text box. Tab moves through the parts in reading order.
 * - Arrow Up/Down step and WRAP (23 → 00, 12 → 01, 59 → 00): a clock has no end. Page Up/Down move hours
 *   by 6 (3 on a 12-hour clock) and minutes by 10. Home/End go to the first and last value.
 * - Typing: digits only. Hours advance after two digits, or one digit that cannot start a two-digit hour
 *   ("7" is 07; on a 12-hour clock "2" is 02). On a 12-hour clock minutes advance to the period the same
 *   way. The period takes "a" or "p" (or a letter only one of the locale's names has), and the arrows
 *   switch it. Backspace in an empty part returns to the one before. Blur pads ("7" → "07").
 * - The value is always 24-hour "HH:MM", so changing `hourCycle` never changes what is stored or
 *   submitted. On a 12-hour clock the value is complete only once the period is chosen.
 * - Field: the frame, focus edge, ! cell, hatch and messages are Field's. The value reaches Base UI Form
 *   (and FormData) through a hidden Field control named `name`; `required` is checked there ("Enter a time").
 * - RTL: the ! cell and zone follow the page; the time itself stays in clock order (dir="ltr"), with the
 *   period where the locale puts it.
 */
function TimeField({
  label, value, defaultValue = null, onValueChange, hourCycle = 24, locale, minuteStep = 1, min: minT, max: maxT, rangeMessage, name, required, disabled, readOnly, zone, layout = "control",
  hourLabel = "Hours", minuteLabel = "Minutes", periodLabel = "AM/PM", id: idProp, className, invalid, error, description, validate, validationMode, orientation,
}: TimeFieldProps) {
  const autoId = React.useId()
  const id = idProp ?? autoId
  const labelId = `${id}-label`
  const cycle = hourCycle
  const periods = React.useMemo(() => dayPeriods(locale), [locale])
  // the parts as typed (may be one digit while editing); a controlled value re-seeds them when it changes
  const [parts, setParts] = React.useState<Parts>(() => parse(value !== undefined ? value : defaultValue, cycle))
  const lastValue = React.useRef(value)
  const lastCycle = React.useRef(cycle)
  if (cycle !== lastCycle.current) {
    // the same time, shown on the other clock
    const v = value !== undefined ? value : toValue(parts, lastCycle.current)
    lastCycle.current = cycle
    lastValue.current = value
    setParts(parse(v, cycle))
  } else if (value !== undefined && value !== lastValue.current) {
    // a new controlled value re-seeds the parts, unless they already make it (an echo of our own change)
    lastValue.current = value
    if (toValue(parts, cycle) !== (value || null)) setParts(parse(value, cycle))
  }
  // the latest parts, for handlers that run before React re-renders (moving focus on advance fires the
  // hours blur synchronously, inside the same change event; reading `parts` there would undo the change)
  const partsRef = React.useRef(parts)
  partsRef.current = parts
  const refs = [React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null)] as const
  const order: Part[] = cycle === 24 ? [0, 1] : periods.first ? [2, 0, 1] : [0, 1, 2]
  const step = (part: Part, by: 1 | -1) => order[order.indexOf(part) + by]
  const focusPart = (part: Part | undefined) => {
    if (part === undefined) return
    refs[part].current?.focus()
    refs[part].current?.select()
  }
  // A part holding one digit is mid-entry ("2" on the way to "21"): the field keeps its last complete value until the
  // digit is padded (on advance or blur), so nothing is emitted, validated or marked invalid between keystrokes.
  // (typing "21" over "21:30" with min/max emitted "02:30", flashed the ! cell and resized the frame.)
  const midEntry = (p: Parts) => p[0].length === 1 || p[1].length === 1
  const settled = React.useRef<string | null>(toValue(parts, cycle))
  const valueOf = (p: Parts) => (midEntry(p) ? settled.current : toValue(p, cycle))
  const formValue = valueOf(parts) ?? ""
  const lo = cycle === 12 ? 1 : 0
  const hi = cycle === 12 ? 12 : 23

  const commit = (next: Parts) => {
    const before = partsRef.current
    partsRef.current = next
    setParts(next)
    const was = valueOf(before)
    const out = valueOf(next)
    if (!midEntry(next)) settled.current = out
    if (out !== was) onValueChange?.(out)
  }
  const setPart = (part: Part, v: string) => {
    const next: Parts = [...partsRef.current]
    if (part === 2) next[2] = v as Period
    else next[part] = v
    commit(next)
  }

  // a stepped time stays inside min/max: stepping past one bound wraps to the other (as the parts wrap),
  // Home/End and the period land on the nearer bound
  const bound = (next: Parts, dir: 1 | -1 | 0) => {
    const v = toValue(next, cycle)
    if (outside(v, minT, maxT)) {
      const over = maxT != null && v! > maxT
      const to = dir === 1 && over && minT ? minT : dir === -1 && !over && maxT ? maxT : over ? maxT! : minT!
      next = parse(to, cycle)
    }
    commit(next)
  }

  const spin = (part: 0 | 1, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (readOnly || disabled) return
    const min = part === 0 ? lo : 0
    const max = part === 0 ? hi : 59
    const by = part === 0 ? 1 : minuteStep
    const big = part === 0 ? (cycle === 12 ? 3 : 6) : 10
    const cur = partsRef.current[part] === "" ? null : +partsRef.current[part]
    const span = max - min + 1
    const wrap = (x: number) => ((((x - min) % span) + span) % span) + min
    const last = part === 0 ? max : max - (max % by)
    let n: number | null = null
    switch (e.key) {
      case "ArrowUp":
        n = cur == null ? min : wrap(Math.floor(cur / by) * by + by)
        break
      case "ArrowDown":
        n = cur == null ? last : wrap(Math.ceil(cur / by) * by - by)
        break
      case "PageUp":
        n = wrap((cur ?? min) + big)
        break
      case "PageDown":
        n = wrap((cur ?? min) - big)
        break
      case "Home":
        n = min
        break
      case "End":
        n = last
        break
      case "Backspace":
        if (partsRef.current[part] === "" && step(part, -1) !== undefined) {
          e.preventDefault()
          focusPart(step(part, -1))
        }
        return
      default:
        return
    }
    e.preventDefault()
    const next: Parts = [...partsRef.current]
    next[part] = pad(n)
    bound(next, e.key === "ArrowUp" || e.key === "PageUp" ? 1 : e.key === "ArrowDown" || e.key === "PageDown" ? -1 : 0)
    // keep the part selected, so a digit typed after stepping replaces the value instead of appending
    const el = e.currentTarget
    requestAnimationFrame(() => el === document.activeElement && el.select())
  }

  // Typing goes through change events (not keydown), so it works with virtual keyboards and paste. The
  // part keeps its last two digits; when they make no valid value, the last digit starts a new one.
  const type = (part: 0 | 1, raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(-2)
    const min = part === 0 ? lo : 0
    const max = part === 0 ? hi : 59
    const v = digits === "" ? "" : digits.length === 2 && (+digits > max || +digits < min) ? digits.slice(-1) : digits
    // advance once the part is unambiguous; a single digit is padded now ("7" → "07"), because moving
    // focus blurs this part before the change has rendered
    const firstMax = Math.floor(max / 10)
    const after = step(part, 1)
    const advance = after !== undefined && (v.length === 2 || (v.length === 1 && +v > firstMax))
    setPart(part, advance ? pad(+v) : v)
    if (advance) focusPart(after)
  }

  const pad2OnBlur = (part: 0 | 1) => {
    const v = partsRef.current[part]
    if (v.length !== 1) return
    // "0" is no hour on a 12-hour clock: clear it rather than pad it to an invalid 00
    setPart(part, part === 0 && +v < lo ? "" : pad(+v))
  }

  const periodKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (readOnly || disabled) return
    const cur = partsRef.current[2]
    let n: Period | null = null
    switch (e.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "PageUp":
      case "PageDown":
        n = cur === "" ? (e.key === "ArrowDown" || e.key === "PageDown" ? "pm" : "am") : cur === "am" ? "pm" : "am"
        break
      case "Home":
        n = "am"
        break
      case "End":
        n = "pm"
        break
      case "Backspace":
      case "Delete":
        e.preventDefault()
        if (cur === "" && e.key === "Backspace") focusPart(step(2, -1))
        else setPart(2, "")
        return
      default:
        return
    }
    e.preventDefault()
    const next: Parts = [...partsRef.current]
    next[2] = n
    bound(next, 0)
    const el = e.currentTarget
    requestAnimationFrame(() => el === document.activeElement && el.select())
  }
  // typed letters (and virtual keyboards): "a" / "p", or a letter only one of the locale's names contains
  const typePeriod = (raw: string) => {
    if (readOnly || disabled) return
    const shown = partsRef.current[2] === "" ? "" : periods.names[partsRef.current[2] === "am" ? 0 : 1]
    const typed = raw.startsWith(shown) ? raw.slice(shown.length) : raw
    const c = typed.slice(-1).toLocaleLowerCase(locale)
    if (raw === "") return setPart(2, "")
    const [a, p] = periods.names.map((x) => x.toLocaleLowerCase(locale))
    const n: Period | null = c === "a" || (a.includes(c) && !p.includes(c)) ? "am" : c === "p" || (p.includes(c) && !a.includes(c)) ? "pm" : null
    if (n) {
      setPart(2, n)
      const after = step(2, 1)
      if (after !== undefined) focusPart(after)
    }
  }

  const required$ = React.useCallback(
    (v: unknown, all: Record<string, unknown>) => {
      if (required && !v) return "Enter a time."
      if (typeof v === "string" && outside(v, minT, maxT))
        return rangeMessage ?? (minT && maxT ? `Choose a time from ${showTime(minT, cycle, locale)} to ${showTime(maxT, cycle, locale)}.` : minT ? `Choose ${showTime(minT, cycle, locale)} or later.` : `Choose ${showTime(maxT!, cycle, locale)} or earlier.`)
      return validate ? validate(v, all) : null
    },
    [required, validate, minT, maxT, rangeMessage, cycle, locale],
  )

  // A press that focuses a part selects it whole, so the digits typed next replace it. WebKit clears that
  // selection on the mouseup that follows (and puts the caret where the press was, so "14" + "0" would read
  // "104"); the mouseup after a focusing press is cancelled to keep it.
  const justFocused = React.useRef(false)
  const common = {
    role: "spinbutton",
    autoComplete: "off",
    "aria-invalid": invalid || undefined,
    "aria-required": required || undefined,
    disabled,
    readOnly,
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      justFocused.current = true
      e.target.select()
    },
    onMouseUp: (e: React.MouseEvent<HTMLInputElement>) => {
      if (justFocused.current) e.preventDefault()
      justFocused.current = false
    },
    onBlur: () => {
      justFocused.current = false
    },
  }
  const spinProps = (part: 0 | 1) => {
    const v = parts[part]
    return {
      ...common,
      inputMode: "numeric" as const,
      placeholder: "––",
      "aria-label": part === 0 ? hourLabel : minuteLabel,
      "aria-valuemin": part === 0 ? lo : 0,
      "aria-valuemax": part === 0 ? hi : 59,
      "aria-valuenow": v === "" ? undefined : +v,
      "aria-valuetext": v === "" ? "Empty" : pad(+v),
      value: v,
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => spin(part, e),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => type(part, e.target.value),
      onBlur: () => {
        justFocused.current = false
        pad2OnBlur(part)
      },
      className: "kl-field-input kl-time-part",
    }
  }
  const period =
    cycle === 12 ? (
      // the input and a hidden sizer per name share one grid cell, so the cell is as wide as the longer name
      <span className="kl-time-period">
        <input
          ref={refs[2]}
          {...common}
          inputMode="text"
          placeholder="––"
          aria-label={periodLabel}
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={parts[2] === "" ? undefined : parts[2] === "am" ? 0 : 1}
          aria-valuetext={parts[2] === "" ? "Empty" : periods.names[parts[2] === "am" ? 0 : 1]}
          value={parts[2] === "" ? "" : periods.names[parts[2] === "am" ? 0 : 1]}
          onKeyDown={periodKey}
          onChange={(e) => typePeriod(e.target.value)}
          className="kl-field-input kl-time-part kl-time-pm"
        />
        {periods.names.map((n) => (
          <span key={n} className="kl-time-pm kl-time-sizer" aria-hidden>
            {n}
          </span>
        ))}
      </span>
    ) : null

  // the parts are what focus lands on, so they carry the description and error (only the hidden control did)
  const frameRef = React.useRef<HTMLDivElement>(null)
  useDescribedByMirror(frameRef, '[role="spinbutton"]')
  return (
    <FieldPrimitive.Root
      data-slot="time-field"
      data-kl-layout={layout}
      data-kl-orientation={orientation}
      data-kl-cycle={cycle}
      name={name}
      disabled={disabled}
      invalid={invalid}
      validate={required$}
      validationMode={validationMode}
      className={cn("kl-field kl-time", className)}
    >
      <span id={labelId} className={cn("kl-field-label", layout === "cell" && "kl-sr")}>
        {label}
      </span>
      <div ref={frameRef} role="group" aria-labelledby={labelId} data-kl-layout={layout} className="kl-ctl kl-cells kl-field-frame kl-edge kl-time-frame" onClick={(e) => e.target === e.currentTarget && focusPart(order[0])}>
        <span className="kl-slot kl-field-bang" aria-hidden>
          <span>
            <span>!</span>
          </span>
        </span>
        {/* a clock time reads in clock order in every script, so the value is one LTR cell (in RTL the
            ! cell and zone still follow the page; Tab still goes through the parts in clock order) */}
        <span className="kl-time-value" dir="ltr">
          {periods.first ? period : null}
          <input ref={refs[0]} id={id} {...spinProps(0)} />
          <span className="kl-time-join" aria-hidden>
            :
          </span>
          <input ref={refs[1]} {...spinProps(1)} />
          {periods.first ? null : period}
        </span>
        {zone != null ? (
          <span className="kl-field-affix kl-time-zone">
            <bdi>{zone}</bdi>
          </span>
        ) : null}
        <FieldPrimitive.Control type="hidden" value={formValue} onValueChange={() => {}} />
      </div>
      <FieldMessages description={description} error={error} invalid={invalid} layout={layout} />
    </FieldPrimitive.Root>
  )
}

export { TimeField, outside as timeOutside, type TimeFieldProps }
