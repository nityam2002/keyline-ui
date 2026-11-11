"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Panel, PanelBody, PanelHeader } from "@/components/keyline/ui/panel"
import { Skeleton, SkeletonGroup } from "@/components/keyline/ui/skeleton"
import { Stat } from "@/components/keyline/ui/stat"

export function ClientCard() {
  const [busy, setBusy] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const load = () => {
    setBusy(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setBusy(false), 1400)
  }
  useEffect(() => {
    load()
    return () => clearTimeout(timer.current)
  }, [])

  return (
    <div className="grid max-w-[520px] gap-4">
      <SkeletonGroup label="Loading Lackawanna County" busy={busy}>
        <Panel>
          <PanelHeader title="Lackawanna County" code="ACCT-0418" />
          <PanelBody flush>
            <div className="@container">
              <div className="grid divide-y divide-kl-line @xs:grid-cols-2 @xs:divide-x @xs:divide-y-0">
                <Stat label="Orders this year" value={busy ? <Skeleton shape="value" width="2ch" /> : 31} />
                <Stat label="Spent" value={busy ? <Skeleton shape="value" width="6ch" /> : "$48,200"} />
              </div>
            </div>
          </PanelBody>
          <PanelBody className="grid gap-2 border-t border-kl-line">
            <span className="text-[13px] font-semibold text-kl-ink-2">Notes from Dwight</span>
            {busy ? (
              <Skeleton lines={3} />
            ) : (
              <p className="m-0 text-[14px] leading-relaxed">
                Buys in bulk every quarter. The new purchasing officer prefers phone calls to email and wants the delivery on the loading dock, not at reception.
              </p>
            )}
          </PanelBody>
        </Panel>
      </SkeletonGroup>
      <Button className="justify-self-start" disabled={busy} onClick={load}>
        Reload
      </Button>
    </div>
  )
}
