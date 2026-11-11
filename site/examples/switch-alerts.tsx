"use client"

import { useState } from "react"
import { SwitchField } from "@/components/keyline/ui/switch"

export function AlertSettings() {
  const [reorder, setReorder] = useState(true)
  const [late, setLate] = useState(false)

  const on = [reorder && "reorders", late && "late deliveries"].filter(Boolean)

  return (
    <div className="grid max-w-[480px] gap-3">
      <div className="grid gap-1">
        <SwitchField label="Email me when a client reorders" description="One email a day, at 8 AM." checked={reorder} onCheckedChange={setReorder} />
        <SwitchField label="Text me if a delivery runs late" description="Darryl marks it late after 30 minutes." checked={late} onCheckedChange={setLate} />
        <SwitchField label="Weekly sales report" description="Corporate sends this to every branch. Ask Jan to stop it." checked disabled />
      </div>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {on.length ? `You'll hear about ${on.join(" and ")}.` : "Only the weekly report. Nothing else will reach you."}
      </p>
    </div>
  )
}
