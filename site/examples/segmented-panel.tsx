"use client"

import { useState } from "react"
import { Panel, PanelBody, PanelHeader } from "@/components/keyline/ui/panel"
import { Segmented, SegmentedItem } from "@/components/keyline/ui/segmented"

const BOARD = [
  { rep: "Dwight Schrute", sales: 41, calls: 212 },
  { rep: "Jim Halpert", sales: 33, calls: 148 },
  { rep: "Phyllis Vance", sales: 28, calls: 131 },
  { rep: "Stanley Hudson", sales: 26, calls: 64 },
]

export function Leaderboard() {
  const [by, setBy] = useState<"sales" | "calls">("sales")
  const rows = [...BOARD].sort((a, b) => b[by] - a[by])

  return (
    <Panel className="max-w-[440px]">
      <PanelHeader
        title="This month"
        actions={
          <Segmented layout="cell" size="compact" aria-label="Rank by" value={by} onValueChange={(v) => setBy(v as "sales" | "calls")}>
            <SegmentedItem value="sales">Sales</SegmentedItem>
            <SegmentedItem value="calls">Calls</SegmentedItem>
          </Segmented>
        }
      />
      <PanelBody>
        <ol className="m-0 grid list-none gap-1 p-0 text-[14px]" aria-label={`Ranked by ${by}`}>
          {rows.map((r, i) => (
            <li key={r.rep}>
              <span className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] gap-x-2">
                <span className="font-kl-mono text-kl-ink-3">{i + 1}</span>
                <span className="truncate">{r.rep}</span>
                <span className="tabular-nums text-kl-ink-2">
                  {r[by]} {by}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </PanelBody>
    </Panel>
  )
}
