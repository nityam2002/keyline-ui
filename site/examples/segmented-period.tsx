"use client"

import { useState } from "react"
import { Segmented, SegmentedItem } from "@/components/keyline/ui/segmented"

const PERIODS = [
  { value: "today", label: "Today", reams: 340, vs: "Tuesdays usually do 290" },
  { value: "week", label: "This week", reams: 1_810, vs: "112% of target" },
  { value: "month", label: "This month", reams: 6_420, vs: "Stamford's best month was 6,100" },
  { value: "quarter", label: "This quarter", reams: 19_880, vs: "Ahead of Nashua and Utica" },
  { value: "year", label: "Year to date", reams: 71_240, vs: "Top branch in the northeast" },
]

export function SalesByPeriod() {
  const [period, setPeriod] = useState("week")
  const p = PERIODS.find((x) => x.value === period)!

  return (
    <div className="grid gap-4">
      <Segmented aria-label="Period" value={period} onValueChange={setPeriod} className="justify-self-start">
        {PERIODS.map((x) => (
          <SegmentedItem key={x.value} value={x.value}>
            {x.label}
          </SegmentedItem>
        ))}
      </Segmented>
      <p role="status" className="m-0 grid gap-1">
        <span className="text-[28px] leading-none font-semibold tabular-nums">{p.reams.toLocaleString("en-US")} reams</span>
        <span className="text-[14px] text-kl-ink-2">
          Scranton, {p.label.toLowerCase()}. {p.vs}.
        </span>
      </p>
    </div>
  )
}
