"use client"

import { useState } from "react"
import { Slider } from "@/components/keyline/ui/slider"

const PAPER = [
  { name: "20 lb copy", price: 42 },
  { name: "24 lb premium", price: 58 },
  { name: "Recycled 20 lb", price: 47 },
  { name: "110 lb cardstock", price: 96 },
  { name: "Resume paper, ivory", price: 74 },
]

export function PriceRange() {
  const [range, setRange] = useState<number[]>([40, 80])
  const [lo = 20, hi = 120] = range
  const shown = PAPER.filter((p) => p.price >= lo && p.price <= hi)

  return (
    <div className="grid max-w-[440px] gap-3">
      <Slider label="Price per case" locale="en-US" format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} min={20} max={120} step={5} value={range} onValueChange={(v) => setRange(v as number[])} />
      <ul className="m-0 grid list-none gap-1 p-0 text-[14px]" aria-label="Paper in range">
        {shown.map((p) => (
          <li key={p.name} className="flex justify-between gap-4">
            <span>{p.name}</span>
            <span className="tabular-nums text-kl-ink-2">${p.price}</span>
          </li>
        ))}
      </ul>
      <p role="status" className="text-[14px] text-kl-ink-2">
        {shown.length ? `${shown.length} of ${PAPER.length} papers.` : "Nothing in that range. Widen it or ask Dwight what's in the warehouse."}
      </p>
    </div>
  )
}
