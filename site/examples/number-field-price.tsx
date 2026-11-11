"use client"

import { useState } from "react"
import { NumberField } from "@/components/keyline/ui/number-field"

export function UnitPrice() {
  const [price, setPrice] = useState<number | null>(42)

  return (
    <div className="grid max-w-[320px] gap-3">
      <NumberField
        label="Price per case"
        locale="en-US"
        format={{ style: "currency", currency: "USD" }}
        min={0}
        step={0.5}
        steppers={false}
        value={price}
        onValueChange={setPrice}
      />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {price == null ? "No price yet." : price < 38 ? "Below the floor corporate set. Jan will call." : "Within the price list."}
      </p>
    </div>
  )
}
