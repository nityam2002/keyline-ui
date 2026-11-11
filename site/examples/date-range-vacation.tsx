"use client"

import { useState } from "react"
import { DateRangePicker, countAvailable, type DateRange } from "@/components/keyline/ui/date-range"

const day = (offset: number) => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset)
}
const monday = () => day(((8 - new Date().getDay()) % 7) || 7)
const weekend = (d: Date) => (d.getDay() === 0 || d.getDay() === 6 ? "weekend" : false)

export function VacationRequest() {
  const [range, setRange] = useState<DateRange | null>(null)
  const days = countAvailable(range, weekend)

  return (
    <div className="grid max-w-[360px] gap-3">
      <DateRangePicker
        label="Vacation"
        locale="en-US"
        min={day(1)}
        value={range}
        onValueChange={setRange}
        isDateUnavailable={weekend}
        presets={[{ label: "Next week", range: () => { const from = monday(); return { from, to: new Date(from.getFullYear(), from.getMonth(), from.getDate() + 4) } } }]}
      />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {range ? `${days} working ${days === 1 ? "day" : "days"} off. Toby has the request; you have 11 days left.` : "Choose the first and last day. Weekends don't count."}
      </p>
    </div>
  )
}
