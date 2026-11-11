"use client"

import { useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Meter } from "@/components/keyline/ui/stat"
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/keyline/ui/panel"

const REPS = [
  { name: "Dwight Schrute", reams: 1_680, target: 1_500 },
  { name: "Jim Halpert", reams: 1_240, target: 1_500 },
  { name: "Phyllis Vance", reams: 1_120, target: 1_200 },
  { name: "Stanley Hudson", reams: 910, target: 1_200 },
]

export function SalesTargets() {
  const [sent, setSent] = useState(false)
  return (
    <Panel>
      <PanelHeader code="Q4" title="Sales targets" description="Reams sold against each rep's target, this quarter." />
      <PanelBody className="grid gap-4">
        {REPS.map((r) => (
          <Meter key={r.name} label={r.name} value={r.reams} max={r.target} />
        ))}
      </PanelBody>
      <PanelFooter>
        <span className="flex flex-1 items-center px-3 text-[13px] text-kl-ink-2" role="status">
          {sent ? "Sent to Jan." : "Updated at 9:00"}
        </span>
        <Button layout="cell" variant="primary" disabled={sent} onClick={() => setSent(true)}>
          Send to corporate
        </Button>
      </PanelFooter>
    </Panel>
  )
}
