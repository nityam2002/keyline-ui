"use client"

import { useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Meter } from "@/components/keyline/ui/stat"

const MAX = 120
const HIGH = 100

export function WarehouseSpace() {
  const [pallets, setPallets] = useState(88)

  return (
    <div className="grid max-w-[420px] gap-4">
      <Meter label="Warehouse floor, pallets" value={pallets} max={MAX} high={HIGH} />
      <div className="flex flex-wrap gap-3">
        <Button disabled={pallets + 8 > MAX} onClick={() => setPallets(pallets + 8)}>
          Receive 8 pallets
        </Button>
        <Button disabled={pallets === 0} onClick={() => setPallets(Math.max(0, pallets - 8))}>
          Ship 8 pallets
        </Button>
      </div>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {pallets > HIGH
          ? `Over ${HIGH}. The fire marshal wants the aisles clear, so tell Darryl before the next delivery.`
          : pallets + 8 > MAX
            ? "Full."
            : `Room for ${MAX - pallets} more.`}
      </p>
    </div>
  )
}
