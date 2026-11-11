/* ------------------------------------------------------------------ *
 * CALENDAR LOGIC (pure, no React): range ordering, available-day count, range formatting. The grid,
 * keyboard and month navigation are react-day-picker's (ui/date-range.tsx). Unit-tested in tests/calendar.test.ts.
 * Dates are local calendar days (time is always midnight).
 * ------------------------------------------------------------------ */

export type DateRange = { from: Date; to: Date }
export type Unavailable = (d: Date) => string | boolean | undefined

export const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const sameDay = (a?: Date | null, b?: Date | null) => !!a && !!b && sod(a).getTime() === sod(b).getTime()
export const between = (d: Date, a: Date, b: Date) => d >= (a < b ? a : b) && d <= (a < b ? b : a)
export const order = (a: Date, b: Date): DateRange => (a <= b ? { from: a, to: b } : { from: b, to: a })
export function countAvailable(r: DateRange | null, isUnavailable?: Unavailable) {
  if (!r) return 0
  let n = 0
  for (let d = sod(r.from); d <= r.to; d = addDays(d, 1)) if (!isUnavailable?.(d)) n++
  return n
}

/**
 * "5–9 Nov", "28 Nov – 3 Dec", "28 Dec 2026 – 3 Jan 2027". Locale-aware (Intl formatRange);
 * the year appears only when the endpoints fall in different years.
 */
export function formatRange(r: DateRange | null, locale = "en-GB") {
  if (!r) return ""
  const crossYear = r.from.getFullYear() !== r.to.getFullYear()
  const f = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", ...(crossYear ? { year: "numeric" as const } : null) })
  return sameDay(r.from, r.to) ? f.format(r.from) : f.formatRange(r.from, r.to)
}
